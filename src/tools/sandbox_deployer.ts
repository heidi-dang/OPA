import { buildLocalSandbox, startLocalSandbox, getLocalSandboxStatus, checkDockerAvailability } from '../sandbox_local.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

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

export class SandboxDeploymentAgent {
    private deploymentConfig: SandboxDeploymentConfig;
    private deploymentStatus: DeploymentStatus;

    constructor(config: SandboxDeploymentConfig = {}) {
        this.deploymentConfig = {
            autoBuild: config.autoBuild !== false,
            autoStart: config.autoStart !== false,
            forceRebuild: config.forceRebuild || false,
            containerName: config.containerName || 'opa-sandbox',
            dockerImage: config.dockerImage || 'opa-local-sandbox:latest',
            workspace: config.workspace || './workspace'
        };

        this.deploymentStatus = {
            deployed: false,
            running: false,
            imageAvailable: false,
            dockerAvailable: false,
            errors: [],
            lastAction: ''
        };
    }

    /**
     * Automatically deploy the sandbox based on current state
     */
    async deploySandbox(): Promise<DeploymentStatus> {
        console.log('🚀 Starting automatic sandbox deployment...');
        
        try {
            // Step 1: Check Docker availability
            await this.checkDockerAvailability();
            
            // Step 2: Check if Docker image exists
            await this.checkDockerImage();
            
            // Step 3: Build image if needed
            if (this.deploymentConfig.autoBuild && (!this.deploymentStatus.imageAvailable || this.deploymentConfig.forceRebuild)) {
                await this.buildDockerImage();
            }
            
            // Step 4: Start container if needed
            if (this.deploymentConfig.autoStart && !this.deploymentStatus.running) {
                await this.startContainer();
            }
            
            // Step 5: Verify deployment
            await this.verifyDeployment();
            
            console.log('✅ Sandbox deployment completed successfully!');
            return this.deploymentStatus;
            
        } catch (error: any) {
            console.error('❌ Sandbox deployment failed:', error.message);
            this.deploymentStatus.errors!.push(error.message);
            throw error;
        }
    }

    /**
     * Check Docker availability
     */
    private async checkDockerAvailability(): Promise<void> {
        console.log('🔍 Checking Docker availability...');
        
        const dockerAvailable = await checkDockerAvailability();
        this.deploymentStatus.dockerAvailable = dockerAvailable;
        
        if (!dockerAvailable) {
            throw new Error('Docker is not available. Please install and start Docker.');
        }
        
        console.log('✅ Docker is available');
    }

    /**
     * Check if Docker image exists
     */
    private async checkDockerImage(): Promise<void> {
        console.log('🔍 Checking Docker image availability...');
        
        try {
            const { stdout } = await execAsync(`docker images --format "{{.Repository}}:{{.Tag}}" | grep "^${this.deploymentConfig.dockerImage}$"`);
            this.deploymentStatus.imageAvailable = stdout.trim() === this.deploymentConfig.dockerImage;
            
            if (this.deploymentStatus.imageAvailable) {
                console.log('✅ Docker image is available');
            } else {
                console.log('⚠️ Docker image not found, will build if autoBuild is enabled');
            }
        } catch (error) {
            this.deploymentStatus.imageAvailable = false;
            console.log('⚠️ Docker image not found, will build if autoBuild is enabled');
        }
    }

    /**
     * Build Docker image
     */
    private async buildDockerImage(): Promise<void> {
        console.log('🔨 Building Docker image...');
        this.deploymentStatus.lastAction = 'Building Docker image';
        
        try {
            await buildLocalSandbox();
            this.deploymentStatus.imageAvailable = true;
            console.log('✅ Docker image built successfully');
        } catch (error: any) {
            throw new Error(`Failed to build Docker image: ${error.message}`);
        }
    }

    /**
     * Start the container
     */
    private async startContainer(): Promise<void> {
        console.log('🚀 Starting sandbox container...');
        this.deploymentStatus.lastAction = 'Starting container';
        
        try {
            await startLocalSandbox({
                containerName: this.deploymentConfig.containerName!,
                dockerImage: this.deploymentConfig.dockerImage!,
                workspace: this.deploymentConfig.workspace!
            });
            
            this.deploymentStatus.running = true;
            console.log('✅ Container started successfully');
        } catch (error: any) {
            throw new Error(`Failed to start container: ${error.message}`);
        }
    }

    /**
     * Verify deployment
     */
    private async verifyDeployment(): Promise<void> {
        console.log('🔍 Verifying deployment...');
        
        try {
            const status = await getLocalSandboxStatus();
            
            if (status.status === 'running' || status.status === 'created') {
                this.deploymentStatus.deployed = true;
                this.deploymentStatus.running = status.status === 'running';
                this.deploymentStatus.containerId = status.containerId || 'unknown';
                console.log('✅ Deployment verified successfully');
            } else {
                throw new Error(`Deployment verification failed: container status is ${status.status}`);
            }
        } catch (error: any) {
            throw new Error(`Deployment verification failed: ${error.message}`);
        }
    }

    /**
     * Get current deployment status
     */
    async getDeploymentStatus(): Promise<DeploymentStatus> {
        try {
            // Update status with current information
            this.deploymentStatus.dockerAvailable = await checkDockerAvailability();
            await this.checkDockerImage();
            
            if (this.deploymentStatus.imageAvailable) {
                const status = await getLocalSandboxStatus();
                this.deploymentStatus.deployed = status.status !== 'not_created';
                this.deploymentStatus.running = status.status === 'running';
                this.deploymentStatus.containerId = status.containerId;
            }
            
            return this.deploymentStatus;
        } catch (error: any) {
            this.deploymentStatus.errors.push(error.message);
            return this.deploymentStatus;
        }
    }

    /**
     * Stop and clean up the sandbox
     */
    async cleanup(): Promise<void> {
        console.log('🧹 Cleaning up sandbox deployment...');
        
        try {
            const { stdout } = await execAsync(`docker ps -a --filter name=${this.deploymentConfig.containerName!} --format "{{.ID}}"`);
            
            if (stdout.trim()) {
                await execAsync(`docker stop ${this.deploymentConfig.containerName!}`);
                await execAsync(`docker rm ${this.deploymentConfig.containerName!}`);
                console.log('✅ Container stopped and removed');
            }
            
            this.deploymentStatus.deployed = false;
            this.deploymentStatus.running = false;
            this.deploymentStatus.containerId = undefined;
            
        } catch (error: any) {
            console.error('⚠️ Cleanup warning:', error.message);
            this.deploymentStatus.errors.push(error.message);
        }
    }

    /**
     * Restart the sandbox
     */
    async restart(): Promise<void> {
        console.log('🔄 Restarting sandbox...');
        
        await this.cleanup();
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for cleanup
        await this.deploySandbox();
    }

    /**
     * Generate deployment report
     */
    generateReport(): string {
        const status = this.deploymentStatus;
        
        return `
╔══════════════════════════════════════════════════════════════╗
║                 SANDBOX DEPLOYMENT REPORT                      ║
╚══════════════════════════════════════════════════════════════╝

Deployment Status: ${status.deployed ? '✅ DEPLOYED' : '❌ NOT DEPLOYED'}
Running Status: ${status.running ? '✅ RUNNING' : '❌ STOPPED'}
Docker Available: ${status.dockerAvailable ? '✅ YES' : '❌ NO'}
Image Available: ${status.imageAvailable ? '✅ YES' : '❌ NO'}

═══════════════════════════════════════════════════════════════

CONFIGURATION:
• Container Name: ${this.deploymentConfig.containerName}
• Docker Image: ${this.deploymentConfig.dockerImage}
• Workspace: ${this.deploymentConfig.workspace}
• Auto Build: ${this.deploymentConfig.autoBuild ? 'Enabled' : 'Disabled'}
• Auto Start: ${this.deploymentConfig.autoStart ? 'Enabled' : 'Disabled'}
• Force Rebuild: ${this.deploymentConfig.forceRebuild ? 'Enabled' : 'Disabled'}

═══════════════════════════════════════════════════════════════

CONTAINER INFORMATION:
${status.containerId ? `• Container ID: ${status.containerId}` : '• Container ID: Not available'}
• Last Action: ${status.lastAction || 'No actions performed'}

═══════════════════════════════════════════════════════════════

ERRORS:
${(status.errors && status.errors.length > 0) ? status.errors.map(error => `• ${error}`).join('\n') : 'No errors reported'}

═══════════════════════════════════════════════════════════════

RECOMMENDATIONS:
${!status.dockerAvailable ? '• Install and start Docker' : ''}
${!status.imageAvailable ? '• Build the Docker image using buildLocalSandbox()' : ''}
${!status.deployed ? '• Deploy the sandbox using deploySandbox()' : ''}
${!status.running && status.deployed ? '• Start the container using startContainer()' : ''}
${(status.errors && status.errors.length > 0) ? '• Review and resolve reported errors' : '• Sandbox deployment is healthy'}

═══════════════════════════════════════════════════════════════
Report Generated: ${new Date().toISOString()}
`;
    }
}

// Global deployment agent instance
let deploymentAgent: SandboxDeploymentAgent | null = null;

/**
 * Get or create the deployment agent
 */
export function getDeploymentAgent(config?: SandboxDeploymentConfig): SandboxDeploymentAgent {
    if (!deploymentAgent) {
        deploymentAgent = new SandboxDeploymentAgent(config);
    }
    return deploymentAgent;
}

/**
 * Deploy sandbox automatically (main entry point)
 */
export async function deploySandboxAsNeeded(config?: SandboxDeploymentConfig): Promise<string> {
    const agent = getDeploymentAgent(config);
    
    try {
        await agent.deploySandbox();
        return agent.generateReport();
    } catch (error: any) {
        return `Sandbox deployment failed: ${error.message}\n\n${agent.generateReport()}`;
    }
}

/**
 * Check if sandbox deployment is needed
 */
export async function checkSandboxDeploymentNeeded(): Promise<boolean> {
    const agent = getDeploymentAgent();
    const status = await agent.getDeploymentStatus();
    
    return !status.deployed || !status.running || !status.imageAvailable;
}

/**
 * Ensure sandbox is deployed and running
 */
export async function ensureSandboxDeployed(config?: SandboxDeploymentConfig): Promise<boolean> {
    const agent = getDeploymentAgent(config);
    const status = await agent.getDeploymentStatus();
    
    if (!status.deployed || !status.running) {
        try {
            await agent.deploySandbox();
            return true;
        } catch (error) {
            console.error('Failed to ensure sandbox deployment:', error);
            return false;
        }
    }
    
    return true;
}

/**
 * Quick deployment status check
 */
export async function getSandboxDeploymentStatus(): Promise<string> {
    const agent = getDeploymentAgent();
    const status = await agent.getDeploymentStatus();
    
    return `
Sandbox Status: ${status.deployed ? 'Deployed' : 'Not Deployed'}
Running: ${status.running ? 'Yes' : 'No'}
Docker: ${status.dockerAvailable ? 'Available' : 'Not Available'}
Image: ${status.imageAvailable ? 'Available' : 'Not Available'}
${status.errors.length > 0 ? `Errors: ${status.errors.length}` : ''}
`;
}
