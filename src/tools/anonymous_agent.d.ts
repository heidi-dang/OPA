interface AnonymousTask {
    id: string;
    name: string;
    description: string;
    category: 'privacy' | 'search' | 'recon' | 'security' | 'blockchain' | 'integration' | 'deployment';
    priority: 'critical' | 'high' | 'medium' | 'low';
    status: 'pending' | 'running' | 'completed' | 'failed';
    startTime?: Date;
    endTime?: Date;
    result?: string;
    error?: string;
}
interface AnonymousAgentConfig {
    autoPrivacySetup?: boolean;
    autoSandboxDeployment?: boolean;
    parallelExecution?: boolean;
    maxConcurrentTasks?: number;
    reportingEnabled?: boolean;
    logLevel?: 'debug' | 'info' | 'warn' | 'error';
    enforceAnonymity?: boolean;
    torBrowserIntegration?: boolean;
    secureCommunication?: boolean;
}
export declare class AnonymousAgent {
    private config;
    private tasks;
    private runningTasks;
    private taskHistory;
    constructor(config?: AnonymousAgentConfig);
    /**
     * Execute complete anonymous security workflow
     */
    executeAnonymousWorkflow(target: string, workflow?: string): Promise<string>;
    /**
     * Execute reconnaissance workflow
     */
    private executeReconWorkflow;
    /**
     * Execute security workflow
     */
    private executeSecurityWorkflow;
    /**
     * Execute intelligence workflow
     */
    private executeIntelligenceWorkflow;
    /**
     * Execute privacy workflow
     */
    private executePrivacyWorkflow;
    /**
     * Execute full anonymous workflow
     */
    private executeFullAnonymousWorkflow;
    /**
     * Execute parallel tasks
     */
    private executeParallelTasks;
    /**
     * Execute individual task
     */
    private executeTask;
    /**
     * Execute privacy task
     */
    private executePrivacyTask;
    /**
     * Execute search task
     */
    private executeSearchTask;
    /**
     * Execute security task
     */
    private executeSecurityTask;
    /**
     * Execute blockchain task
     */
    private executeBlockchainTask;
    /**
     * Execute integration task
     */
    private executeIntegrationTask;
    /**
     * Execute deployment task
     */
    private executeDeploymentTask;
    /**
     * Setup secure communication
     */
    private setupSecureCommunication;
    /**
     * Generate anonymous workflow report
     */
    private generateAnonymousReport;
    /**
     * Calculate anonymity level
     */
    private calculateAnonymityLevel;
    /**
     * Get status emoji
     */
    private getStatusEmoji;
    /**
     * Get agent status
     */
    getAgentStatus(): string;
    /**
     * Clear task history
     */
    clearTaskHistory(): void;
    /**
     * Get task history
     */
    getTaskHistory(): AnonymousTask[];
}
/**
 * Get or create anonymous agent
 */
export declare function getAnonymousAgent(config?: AnonymousAgentConfig): AnonymousAgent;
/**
 * Execute anonymous workflow
 */
export declare function executeAnonymousWorkflow(target: string, workflow?: string, config?: AnonymousAgentConfig): Promise<string>;
/**
 * Quick anonymous setup
 */
export declare function quickAnonymousSetup(): Promise<string>;
/**
 * Quick anonymous reconnaissance
 */
export declare function quickAnonymousRecon(target: string): Promise<string>;
/**
 * Full anonymous workflow
 */
export declare function fullAnonymousWorkflow(target: string): Promise<string>;
/**
 * Get anonymous agent status
 */
export declare function getAnonymousStatus(): string;
export {};
//# sourceMappingURL=anonymous_agent.d.ts.map