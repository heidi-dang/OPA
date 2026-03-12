interface WindSurfTask {
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
interface WindSurfConfig {
    autoPrivacySetup?: boolean;
    autoSandboxDeployment?: boolean;
    parallelExecution?: boolean;
    maxConcurrentTasks?: number;
    reportingEnabled?: boolean;
    logLevel?: 'debug' | 'info' | 'warn' | 'error';
}
export declare class WindSurfAgent {
    private config;
    private tasks;
    private runningTasks;
    private taskHistory;
    constructor(config?: WindSurfConfig);
    /**
     * Execute complete WindSurf workflow
     */
    executeWindSurfWorkflow(target: string, workflow?: string): Promise<string>;
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
     * Execute full workflow
     */
    private executeFullWorkflow;
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
     * Generate workflow report
     */
    private generateWorkflowReport;
    /**
     * Get status emoji
     */
    private getStatusEmoji;
    /**
     * Get agent status
     */
    private getAgentStatus;
    /**
     * Get current status
     */
    getCurrentStatus(): Promise<string>;
    /**
     * Clear task history
     */
    clearTaskHistory(): void;
    /**
     * Get task history
     */
    getTaskHistory(): WindSurfTask[];
}
/**
 * Get or create WindSurf agent
 */
export declare function getWindSurfAgent(config?: WindSurfConfig): WindSurfAgent;
/**
 * Execute WindSurf workflow
 */
export declare function executeWindSurfWorkflow(target: string, workflow?: string, config?: WindSurfConfig): Promise<string>;
/**
 * Quick privacy setup
 */
export declare function quickPrivacySetup(): Promise<string>;
/**
 * Quick reconnaissance
 */
export declare function quickRecon(target: string): Promise<string>;
/**
 * Quick security analysis
 */
export declare function quickSecurityAnalysis(target: string): Promise<string>;
/**
 * Full intelligence workflow
 */
export declare function fullIntelligenceWorkflow(target: string): Promise<string>;
/**
 * Get WindSurf agent status
 */
export declare function getWindSurfStatus(): Promise<string>;
export {};
//# sourceMappingURL=windsurf_agent.d.ts.map