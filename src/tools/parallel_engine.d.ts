export declare function executeParallelTasks(tasks: {
    name: string;
    target: string;
    args?: string;
    priority?: 'high' | 'medium' | 'low';
    timeout?: number;
}[]): Promise<string>;
export declare function createParallelExecutionPlan(targets: string[], tools: string[]): any[];
export declare function parallelScan(target: string): Promise<string>;
//# sourceMappingURL=parallel_engine.d.ts.map