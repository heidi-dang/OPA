interface SandboxDeploymentConfig {
    autoBuild?: boolean;
    autoStart?: boolean;
    forceRebuild?: boolean;
    containerName?: string;
    dockerImage?: string;
    workspace?: string;
}
interface DeploymentStatus {
    deployed: boolean;
    running: boolean;
    containerId?: string | undefined;
    imageAvailable: boolean;
    dockerAvailable: boolean;
    lastAction?: string;
    errors: string[];
}
export declare class SandboxDeploymentAgent {
    private deploymentConfig;
    private deploymentStatus;
    constructor(config?: SandboxDeploymentConfig);
    /**
     * Automatically deploy the sandbox based on current state
     */
    deploySandbox(): Promise<DeploymentStatus>;
    /**
     * Check Docker availability
     */
    private checkDockerAvailability;
    /**
     * Check if Docker image exists
     */
    private checkDockerImage;
    /**
     * Build Docker image
     */
    private buildDockerImage;
    /**
     * Start the container
     */
    private startContainer;
    /**
     * Verify deployment
     */
    private verifyDeployment;
    /**
     * Get current deployment status
     */
    getDeploymentStatus(): Promise<DeploymentStatus>;
    /**
     * Stop and clean up the sandbox
     */
    cleanup(): Promise<void>;
    /**
     * Restart the sandbox
     */
    restart(): Promise<void>;
    /**
     * Generate deployment report
     */
    generateReport(): string;
}
/**
 * Get or create the deployment agent
 */
export declare function getDeploymentAgent(config?: SandboxDeploymentConfig): SandboxDeploymentAgent;
/**
 * Deploy sandbox automatically (main entry point)
 */
export declare function deploySandboxAsNeeded(config?: SandboxDeploymentConfig): Promise<string>;
/**
 * Check if sandbox deployment is needed
 */
export declare function checkSandboxDeploymentNeeded(): Promise<boolean>;
/**
 * Ensure sandbox is deployed and running
 */
export declare function ensureSandboxDeployed(config?: SandboxDeploymentConfig): Promise<boolean>;
/**
 * Quick deployment status check
 */
export declare function getSandboxDeploymentStatus(): Promise<string>;
export {};
//# sourceMappingURL=sandbox_deployer.d.ts.map