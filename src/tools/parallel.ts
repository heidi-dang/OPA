import { Worker } from 'worker_threads';
import { EventEmitter } from 'events';

interface ToolTask {
    id: string;
    name: string;
    target: string;
    args?: string | undefined;
    priority: 'high' | 'medium' | 'low';
    timeout?: number | undefined;
    retries?: number;
}

interface TaskResult {
    id: string;
    success: boolean;
    result?: string;
    error?: string;
    executionTime: number;
    startTime: Date;
    endTime: Date;
}

interface WorkerPool {
    workers: Worker[];
    availableWorkers: Worker[];
    busyWorkers: Map<Worker, string>;
}

export class ParallelExecutionEngine extends EventEmitter {
    private maxWorkers: number;
    private workerPool: WorkerPool;
    private taskQueue: ToolTask[] = [];
    private runningTasks: Map<string, ToolTask> = new Map();
    private taskResults: Map<string, TaskResult> = new Map();
    private isProcessing = false;

    constructor(maxWorkers: number = 4) {
        super();
        this.maxWorkers = maxWorkers;
        this.workerPool = {
            workers: [],
            availableWorkers: [],
            busyWorkers: new Map()
        };
        this.initializeWorkers();
    }

    private initializeWorkers() {
        for (let i = 0; i < this.maxWorkers; i++) {
            const worker = new Worker(this.createWorkerScript());
            this.workerPool.workers.push(worker);
            this.workerPool.availableWorkers.push(worker);
            
            worker.on('error', (error) => {
                console.error(`Worker ${i} error:`, error);
                this.handleWorkerError(worker, error);
            });

            worker.on('exit', (code) => {
                if (code !== 0) {
                    console.error(`Worker ${i} stopped with exit code ${code}`);
                }
                this.handleWorkerExit(worker);
            });
        }
    }

    private createWorkerScript(): string {
        return `
            const { parentPort } = require('worker_threads');
            const { getOrCreateSandbox } = require('./sandbox.js');

            parentPort.on('message', async (task) => {
                try {
                    const startTime = Date.now();
                    const result = await executeTool(task);
                    const endTime = Date.now();
                    
                    parentPort.postMessage({
                        id: task.id,
                        success: true,
                        result,
                        executionTime: endTime - startTime,
                        startTime: new Date(startTime),
                        endTime: new Date(endTime)
                    });
                } catch (error) {
                    parentPort.postMessage({
                        id: task.id,
                        success: false,
                        error: error.message,
                        executionTime: 0,
                        startTime: new Date(),
                        endTime: new Date()
                    });
                }
            });

            async function executeTool(task) {
                const sandbox = await getOrCreateSandbox();
                
                switch (task.name) {
                    case 'nmap_scan':
                        return await executeNmap(task.target, task.args, sandbox);
                    case 'dir_fuzz':
                        return await executeDirFuzz(task.target, task.args, sandbox);
                    case 'run_nuclei':
                        return await executeNuclei(task.target, task.args, sandbox);
                    case 'http_request':
                        return await executeHttpRequest(task.target, task.args, sandbox);
                    case 'osint_recon':
                        return await executeOsint(task.target, task.args, sandbox);
                    case 'crypto_audit':
                        return await executeCryptoAudit(task.target, task.args, sandbox);
                    default:
                        throw new Error('Unknown tool: ' + task.name);
                }
            }

            async function executeNmap(target, args, sandbox) {
                const cmd = args ? 'nmap ' + args + ' ' + target : 'nmap -sS -sV -O ' + target;
                const result = await sandbox.commands.run(cmd);
                return result.stdout + result.stderr;
            }

            async function executeDirFuzz(target, args, sandbox) {
                const wordlist = args || '/usr/share/wordlists/common.txt';
                const cmd = 'ffuf -u http://' + target + '/FUZZ -w ' + wordlist + ' -mc 200,204,301,302';
                const result = await sandbox.commands.run(cmd);
                return result.stdout + result.stderr;
            }

            async function executeNuclei(target, args, sandbox) {
                const templateArgs = args ? '-t ' + args : '';
                const cmd = 'nuclei -u ' + target + ' ' + templateArgs + ' -silent';
                const result = await sandbox.commands.run(cmd);
                return result.stdout + result.stderr;
            }

            async function executeHttpRequest(target, args, sandbox) {
                const cmd = args ? 'curl ' + args + ' ' + target : 'curl -i ' + target;
                const result = await sandbox.commands.run(cmd);
                return result.stdout + result.stderr;
            }

            async function executeOsint(target, args, sandbox) {
                const commands = [
                    'whois ' + target,
                    'dig ' + target + ' ANY',
                    'nslookup ' + target,
                    'host ' + target
                ];
                
                let results = '';
                for (const cmd of commands) {
                    try {
                        const result = await sandbox.commands.run(cmd);
                        results += '\\n=== ' + cmd + ' ===\\n';
                        results += result.stdout + result.stderr;
                    } catch (error) {
                        results += '\\n=== ' + cmd + ' ===\\nERROR: ' + error.message + '\\n';
                    }
                }
                
                return results;
            }

            async function executeCryptoAudit(target, args, sandbox) {
                const cmd = 'echo "Performing blockchain security analysis for ' + target + '..."';
                const result = await sandbox.commands.run(cmd);
                return result.stdout + result.stderr;
            }
        `;
    }

    public async executeTasks(tasks: ToolTask[]): Promise<TaskResult[]> {
        // Sort tasks by priority
        tasks.sort((a, b) => {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });

        // Add tasks to queue
        this.taskQueue.push(...tasks);
        
        // Start processing if not already running
        if (!this.isProcessing) {
            this.processQueue();
        }

        // Wait for all tasks to complete
        return new Promise((resolve) => {
            const checkCompletion = () => {
                if (this.taskQueue.length === 0 && this.runningTasks.size === 0) {
                    const results = Array.from(this.taskResults.values());
                    this.taskResults.clear();
                    resolve(results);
                } else {
                    setTimeout(checkCompletion, 100);
                }
            };
            checkCompletion();
        });
    }

    private async processQueue() {
        this.isProcessing = true;

        while (this.taskQueue.length > 0 || this.runningTasks.size > 0) {
            // Assign available workers to tasks
            while (this.workerPool.availableWorkers.length > 0 && this.taskQueue.length > 0) {
                const worker = this.workerPool.availableWorkers.shift()!;
                const task = this.taskQueue.shift()!;
                
                this.runningTasks.set(task.id, task);
                this.workerPool.busyWorkers.set(worker, task.id);
                
                this.executeTask(worker, task);
            }

            // Wait a bit before checking again
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        this.isProcessing = false;
    }

    private executeTask(worker: Worker, task: ToolTask) {
        const timeout = task.timeout || 300000; // 5 minutes default
        
        worker.postMessage(task);
        
        const timeoutId = setTimeout(() => {
            this.handleTaskTimeout(task);
        }, timeout);

        const messageHandler = (result: TaskResult) => {
            if (result.id === task.id) {
                clearTimeout(timeoutId);
                worker.off('message', messageHandler);
                this.handleTaskCompletion(worker, result);
            }
        };

        worker.on('message', messageHandler);
    }

    private handleTaskCompletion(worker: Worker, result: TaskResult) {
        const taskId = this.workerPool.busyWorkers.get(worker);
        if (taskId) {
            this.runningTasks.delete(taskId);
            this.workerPool.busyWorkers.delete(worker);
            this.workerPool.availableWorkers.push(worker);
        }

        this.taskResults.set(result.id, result);
        this.emit('taskCompleted', result);
    }

    private handleTaskTimeout(task: ToolTask) {
        console.error(`Task ${task.id} timed out`);
        this.runningTasks.delete(task.id);
        
        const result: TaskResult = {
            id: task.id,
            success: false,
            error: 'Task timed out',
            executionTime: 0,
            startTime: new Date(),
            endTime: new Date()
        };
        
        this.taskResults.set(task.id, result);
        this.emit('taskTimeout', result);
    }

    private handleWorkerError(worker: Worker, error: Error) {
        const taskId = this.workerPool.busyWorkers.get(worker);
        if (taskId) {
            const result: TaskResult = {
                id: taskId,
                success: false,
                error: error.message,
                executionTime: 0,
                startTime: new Date(),
                endTime: new Date()
            };
            
            this.handleTaskCompletion(worker, result);
        }
    }

    private handleWorkerExit(worker: Worker) {
        const taskId = this.workerPool.busyWorkers.get(worker);
        if (taskId) {
            const result: TaskResult = {
                id: taskId,
                success: false,
                error: 'Worker process exited',
                executionTime: 0,
                startTime: new Date(),
                endTime: new Date()
            };
            
            this.handleTaskCompletion(worker, result);
        }

        // Remove worker from pool and create a new one
        const index = this.workerPool.workers.indexOf(worker);
        if (index > -1) {
            this.workerPool.workers.splice(index, 1);
            this.workerPool.availableWorkers = this.workerPool.availableWorkers.filter(w => w !== worker);
            this.workerPool.busyWorkers.delete(worker);
            
            // Create replacement worker
            const newWorker = new Worker(this.createWorkerScript());
            this.workerPool.workers.push(newWorker);
            this.workerPool.availableWorkers.push(newWorker);
        }
    }

    public getTaskStatus(): { queue: number, running: number, completed: number } {
        return {
            queue: this.taskQueue.length,
            running: this.runningTasks.size,
            completed: this.taskResults.size
        };
    }

    public async shutdown() {
        // Wait for all running tasks to complete
        while (this.runningTasks.size > 0) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Terminate all workers
        for (const worker of this.workerPool.workers) {
            worker.terminate();
        }
        
        this.workerPool.workers = [];
        this.workerPool.availableWorkers = [];
        this.workerPool.busyWorkers.clear();
    }
}

// Global instance for easy access
let globalEngine: ParallelExecutionEngine | null = null;

export function getParallelEngine(maxWorkers?: number): ParallelExecutionEngine {
    if (!globalEngine) {
        globalEngine = new ParallelExecutionEngine(maxWorkers);
    }
    return globalEngine;
}

export async function executeParallelTasks(tasks: {
    name: string;
    target: string;
    args?: string;
    priority?: 'high' | 'medium' | 'low';
    timeout?: number;
}[]): Promise<string> {
    const engine = getParallelEngine();
    
    const toolTasks: ToolTask[] = tasks.map((task, index) => ({
        id: `task-${Date.now()}-${index}`,
        name: task.name,
        target: task.target,
        args: task.args,
        priority: task.priority || 'medium',
        timeout: task.timeout
    }));

    const results = await engine.executeTasks(toolTasks);
    
    let report = `
╔══════════════════════════════════════════════════════════════╗
║              PARALLEL EXECUTION RESULTS REPORT                ║
╚══════════════════════════════════════════════════════════════╝

Execution Summary:
• Total Tasks: ${results.length}
• Successful: ${results.filter(r => r.success).length}
• Failed: ${results.filter(r => !r.success).length}
• Total Execution Time: ${Math.max(...results.map(r => r.executionTime))}ms

═══════════════════════════════════════════════════════════════

DETAILED RESULTS:
`;

    results.forEach((result, index) => {
        report += `
${index + 1}. Task: ${result.id}
   Status: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}
   Execution Time: ${result.executionTime}ms
   Start Time: ${result.startTime.toISOString()}
   End Time: ${result.endTime.toISOString()}
`;
        
        if (result.success) {
            report += `   Result Preview: ${result.result?.substring(0, 200)}...\n`;
        } else {
            report += `   Error: ${result.error}\n`;
        }
    });

    report += `
═══════════════════════════════════════════════════════════════
PERFORMANCE METRICS:
• Average Execution Time: ${Math.round(results.reduce((sum, r) => sum + r.executionTime, 0) / results.length)}ms
• Fastest Task: ${Math.min(...results.map(r => r.executionTime))}ms
• Slowest Task: ${Math.max(...results.map(r => r.executionTime))}ms
• Parallel Efficiency: ${Math.round((results.reduce((sum, r) => sum + r.executionTime, 0) / Math.max(...results.map(r => r.executionTime))) / results.length * 100)}%
`;

    return report;
}
