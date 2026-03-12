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
export declare class ParallelExecutionEngine extends EventEmitter {
    private maxWorkers;
    private workerPool;
    private taskQueue;
    private runningTasks;
    private taskResults;
    private isProcessing;
    constructor(maxWorkers?: number);
    private initializeWorkers;
    private createWorkerScript;
    executeTasks(tasks: ToolTask[]): Promise<TaskResult[]>;
    private processQueue;
    private executeTask;
    private handleTaskCompletion;
    private handleTaskTimeout;
    private handleWorkerError;
    private handleWorkerExit;
    getTaskStatus(): {
        queue: number;
        running: number;
        completed: number;
    };
    shutdown(): Promise<void>;
}
export declare function getParallelEngine(maxWorkers?: number): ParallelExecutionEngine;
export declare function executeParallelTasks(tasks: {
    name: string;
    target: string;
    args?: string;
    priority?: 'high' | 'medium' | 'low';
    timeout?: number;
}[]): Promise<string>;
export {};
//# sourceMappingURL=parallel.d.ts.map