import { getOrCreateSandbox } from '../sandbox_local.js';

interface ToolTask {
    id: string;
    name: string;
    target: string;
    args?: string;
    priority: 'high' | 'medium' | 'low';
    timeout?: number;
}

interface TaskResult {
    id: string;
    name?: string;
    target?: string;
    success: boolean;
    result?: string;
    error?: string;
    executionTime: number;
    startTime: Date;
    endTime: Date;
}

export async function executeParallelTasks(tasks: {
    name: string;
    target: string;
    args?: string;
    priority?: 'high' | 'medium' | 'low';
    timeout?: number;
}[]): Promise<string> {
    const startTime = Date.now();
    const results: TaskResult[] = [];
    
    // Sort tasks by priority
    tasks.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const aPriority = a.priority || 'medium';
        const bPriority = b.priority || 'medium';
        return priorityOrder[bPriority] - priorityOrder[aPriority];
    });

    // Execute tasks in parallel batches based on priority
    const highPriorityTasks = tasks.filter(t => t.priority === 'high');
    const mediumPriorityTasks = tasks.filter(t => t.priority === 'medium' || !t.priority);
    const lowPriorityTasks = tasks.filter(t => t.priority === 'low');

    // Execute high priority tasks first
    if (highPriorityTasks.length > 0) {
        const highResults = await executeTaskBatch(highPriorityTasks, 'high');
        results.push(...highResults);
    }

    // Execute medium priority tasks
    if (mediumPriorityTasks.length > 0) {
        const mediumResults = await executeTaskBatch(mediumPriorityTasks, 'medium');
        results.push(...mediumResults);
    }

    // Execute low priority tasks
    if (lowPriorityTasks.length > 0) {
        const lowResults = await executeTaskBatch(lowPriorityTasks, 'low');
        results.push(...lowResults);
    }

    const totalTime = Date.now() - startTime;

    // Generate comprehensive report
    let report = `
╔══════════════════════════════════════════════════════════════╗
║              PARALLEL EXECUTION RESULTS REPORT                ║
╚══════════════════════════════════════════════════════════════╝

Execution Summary:
• Total Tasks: ${results.length}
• Successful: ${results.filter(r => r.success).length}
• Failed: ${results.filter(r => !r.success).length}
• Total Execution Time: ${totalTime}ms

═══════════════════════════════════════════════════════════════

DETAILED RESULTS:
`;

    results.forEach((result, index) => {
        report += `
${index + 1}. Task: ${result.id}
   Tool: ${result.name}
   Target: ${result.target}
   Status: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}
   Execution Time: ${result.executionTime}ms
   Start Time: ${result.startTime.toISOString()}
   End Time: ${result.endTime.toISOString()}
`;
        
        if (result.success) {
            const preview = result.result?.substring(0, 200) || '';
            report += `   Result Preview: ${preview}${result.result && result.result.length > 200 ? '...' : ''}\n`;
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
• Parallel Efficiency: ${Math.round((results.reduce((sum, r) => sum + r.executionTime, 0) / totalTime) * 100)}%
`;

    return report;
}

async function executeTaskBatch(tasks: any[], priority: string): Promise<TaskResult[]> {
    const maxConcurrency = priority === 'high' ? 2 : priority === 'medium' ? 3 : 4;
    const results: TaskResult[] = [];
    
    // Process tasks in batches
    for (let i = 0; i < tasks.length; i += maxConcurrency) {
        const batch = tasks.slice(i, i + maxConcurrency);
        const batchPromises = batch.map(task => executeSingleTask(task));
        const batchResults = await Promise.allSettled(batchPromises);
        
        batchResults.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                results.push(result.value);
            } else {
                results.push({
                    id: batch[index].name + '-' + Date.now(),
                    success: false,
                    error: result.reason?.message || 'Unknown error',
                    executionTime: 0,
                    startTime: new Date(),
                    endTime: new Date()
                });
            }
        });
    }
    
    return results;
}

async function executeSingleTask(task: any): Promise<TaskResult> {
    const startTime = new Date();
    const startTimestamp = Date.now();
    
    try {
        const sandbox = await getOrCreateSandbox();
        let result = '';
        
        switch (task.name) {
            case 'nmap_scan':
                result = await executeNmap(task.target, task.args, sandbox);
                break;
            case 'dir_fuzz':
                result = await executeDirFuzz(task.target, task.args, sandbox);
                break;
            case 'run_nuclei':
                result = await executeNuclei(task.target, task.args, sandbox);
                break;
            case 'http_request':
                result = await executeHttpRequest(task.target, task.args, sandbox);
                break;
            case 'osint_recon':
                result = await executeOsint(task.target, task.args, sandbox);
                break;
            case 'crypto_audit':
                result = await executeCryptoAudit(task.target, task.args, sandbox);
                break;
            case 'searchsploit_query':
                result = await executeSearchsploit(task.target, task.args, sandbox);
                break;
            case 'parse_pcap':
                result = await executePcap(task.target, task.args, sandbox);
                break;
            default:
                throw new Error(`Unknown tool: ${task.name}`);
        }
        
        const endTime = new Date();
        const executionTime = Date.now() - startTimestamp;
        
        return {
            id: `${task.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: task.name,
            target: task.target,
            success: true,
            result,
            executionTime,
            startTime,
            endTime
        };
        
    } catch (error: any) {
        const endTime = new Date();
        const executionTime = Date.now() - startTimestamp;
        
        return {
            id: `${task.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: task.name,
            target: task.target,
            success: false,
            error: error.message || 'Unknown error',
            executionTime,
            startTime,
            endTime
        };
    }
}

async function executeNmap(target: string, args: string, sandbox: any): Promise<string> {
    const cmd = args ? `nmap ${args} ${target}` : `nmap -sS -sV -O ${target}`;
    const result = await sandbox.commands.run(cmd);
    return result.stdout + result.stderr;
}

async function executeDirFuzz(target: string, args: string, sandbox: any): Promise<string> {
    const wordlist = args || '/usr/share/wordlists/common.txt';
    const cmd = `ffuf -u http://${target}/FUZZ -w ${wordlist} -mc 200,204,301,302`;
    const result = await sandbox.commands.run(cmd);
    return result.stdout + result.stderr;
}

async function executeNuclei(target: string, args: string, sandbox: any): Promise<string> {
    const templateArgs = args ? '-t ' + args : '';
    const cmd = `nuclei -u ${target} ${templateArgs} -silent`;
    const result = await sandbox.commands.run(cmd);
    return result.stdout + result.stderr;
}

async function executeHttpRequest(target: string, args: string, sandbox: any): Promise<string> {
    const cmd = args ? `curl ${args} ${target}` : `curl -i ${target}`;
    const result = await sandbox.commands.run(cmd);
    return result.stdout + result.stderr;
}

async function executeOsint(target: string, args: string, sandbox: any): Promise<string> {
    // Basic OSINT commands
    const commands = [
        `whois ${target}`,
        `dig ${target} ANY`,
        `nslookup ${target}`,
        `host ${target}`
    ];
    
    let results = '';
    for (const cmd of commands) {
        try {
            const result = await sandbox.commands.run(cmd);
            results += `\n=== ${cmd} ===\n`;
            results += result.stdout + result.stderr;
        } catch (error: any) {
            results += `\n=== ${cmd} ===\nERROR: ${error.message}\n`;
        }
    }
    
    return results;
}

async function executeCryptoAudit(target: string, args: string, sandbox: any): Promise<string> {
    // Simulated crypto audit
    const cmd = `echo "Performing blockchain security analysis for ${target}..."`;
    const result = await sandbox.commands.run(cmd);
    return result.stdout + result.stderr;
}

async function executeSearchsploit(target: string, args: string, sandbox: any): Promise<string> {
    const cmd = args ? `searchsploit ${args} ${target}` : `searchsploit ${target}`;
    const result = await sandbox.commands.run(cmd);
    return result.stdout + result.stderr;
}

async function executePcap(target: string, args: string, sandbox: any): Promise<string> {
    const cmd = args ? `tshark ${args} -r ${target}` : `tshark -r ${target}`;
    const result = await sandbox.commands.run(cmd);
    return result.stdout + result.stderr;
}

// Utility function to create parallel execution plans
export function createParallelExecutionPlan(targets: string[], tools: string[]): any[] {
    const plan: any[] = [];
    
    targets.forEach(target => {
        tools.forEach(tool => {
            plan.push({
                name: tool,
                target: target,
                priority: 'medium'
            });
        });
    });
    
    return plan;
}

// Utility function for targeted parallel scans
export async function parallelScan(target: string): Promise<string> {
    const tasks = [
        { name: 'nmap_scan', target, priority: 'high' as const, args: '-sS -sV -O' },
        { name: 'osint_recon', target, priority: 'medium' as const },
        { name: 'run_nuclei', target, priority: 'medium' as const, args: '-t cves' },
        { name: 'dir_fuzz', target, priority: 'low' as const }
    ];
    
    return await executeParallelTasks(tasks);
}
