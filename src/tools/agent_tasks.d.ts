interface AgentTaskConfig {
    autoDeploySandbox?: boolean;
    checkDeploymentBeforeExecution?: boolean;
    fallbackToE2B?: boolean;
    deploymentTimeout?: number;
}
/**
 * Intelligent Agent Task Manager that handles sandbox deployment automatically
 */
export declare class AgentTaskManager {
    private config;
    private deploymentChecked;
    constructor(config?: AgentTaskConfig);
    /**
     * Execute a task with automatic sandbox deployment
     */
    executeTask(taskName: string, taskFunction: () => Promise<string>, target?: string): Promise<string>;
    /**
     * Ensure sandbox is deployed and ready
     */
    private ensureSandboxReady;
    /**
     * Check if an error is deployment-related
     */
    private isDeploymentError;
    /**
     * Execute task with E2B fallback
     */
    private executeWithE2BFallback;
    /**
     * Add execution metadata to result
     */
    private addExecutionMetadata;
    /**
     * Batch execute multiple tasks
     */
    executeBatchTasks(tasks: Array<{
        name: string;
        function: () => Promise<string>;
        priority?: 'high' | 'medium' | 'low';
    }>): Promise<string>;
    /**
     * Get agent status
     */
    getAgentStatus(): Promise<string>;
    /**
     * Perform deep internet research on a topic
     */
    deepResearch(topic: string): Promise<string>;
    /**
     * Reset deployment check (forces re-check on next execution)
     */
    resetDeploymentCheck(): void;
}
/**
 * Get or create the agent task manager
 */
export declare function getAgentTaskManager(config?: AgentTaskConfig): AgentTaskManager;
/**
 * Execute a task with automatic sandbox deployment
 */
export declare function executeAgentTask(taskName: string, taskFunction: () => Promise<string>, target?: string): Promise<string>;
/**
 * Execute multiple tasks in batch
 */
export declare function executeBatchAgentTasks(tasks: Array<{
    name: string;
    function: () => Promise<string>;
    priority?: 'high' | 'medium' | 'low';
}>): Promise<string>;
/**
 * Get agent status
 */
export declare function getAgentStatus(): Promise<string>;
/**
 * Reset agent deployment check
 */
export declare function resetAgentDeploymentCheck(): void;
export {};
//# sourceMappingURL=agent_tasks.d.ts.map