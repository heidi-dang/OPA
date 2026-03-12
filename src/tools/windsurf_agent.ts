import { 
    setupPrivacyAndSecurity, 
    quickPrivacyCheck, 
    stopPrivacyServices, 
    getPrivacyStatus 
} from './privacy_security.js';

import { 
    webSearch, 
    securityWebSearch, 
    intelligenceSearch,
    quickWebSearch
} from './web_search.js';
import type { BaseTask, TaskStatus, TaskPriority } from './task_types.js';

import { osintRecon } from './osint.js';
import { executeParallelTasks, parallelScan } from './parallel_engine.js';
import { runSecurityToolIntegration } from './integrations.js';
import { blockchainSecurityAudit } from './blockchain.js';

import { 
    deploySandboxAsNeeded,
    ensureSandboxDeployed,
    getSandboxDeploymentStatus
} from './sandbox_deployer.js';

import { 
    executeAgentTask,
    executeBatchAgentTasks,
    getAgentStatus
} from './agent_tasks.js';

interface WindSurfTask extends BaseTask {
    category: 'privacy' | 'search' | 'recon' | 'security' | 'blockchain' | 'integration' | 'deployment';
}

interface WindSurfConfig {
    autoPrivacySetup?: boolean;
    autoSandboxDeployment?: boolean;
    parallelExecution?: boolean;
    maxConcurrentTasks?: number;
    reportingEnabled?: boolean;
    logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

export class WindSurfAgent {
    private config: WindSurfConfig;
    private tasks: Map<string, WindSurfTask>;
    private runningTasks: Set<string>;
    private taskHistory: WindSurfTask[];

    constructor(config: WindSurfConfig = {}) {
        this.config = {
            autoPrivacySetup: config.autoPrivacySetup !== false,
            autoSandboxDeployment: config.autoSandboxDeployment !== false,
            parallelExecution: config.parallelExecution !== false,
            maxConcurrentTasks: config.maxConcurrentTasks || 3,
            reportingEnabled: config.reportingEnabled !== false,
            logLevel: config.logLevel || 'info',
            ...config
        };
        
        this.tasks = new Map();
        this.runningTasks = new Set();
        this.taskHistory = [];
    }

    /**
     * Execute complete WindSurf workflow
     */
    async executeWindSurfWorkflow(target: string, workflow: string = 'full'): Promise<string> {
        console.log(`🌊 Starting WindSurf workflow: ${workflow} for target: ${target}`);
        
        const workflowStart = new Date();
        let workflowResult = '';

        try {
            // Step 1: Ensure sandbox is deployed
            if (this.config.autoSandboxDeployment) {
                await this.executeTask('sandbox-deployment', {
                    id: 'sandbox-deployment',
                    name: 'Deploy Sandbox',
                    description: 'Ensure local sandbox is deployed and running',
                    category: 'deployment',
                    priority: 'critical',
                    status: 'pending'
                });
            }

            // Step 2: Setup privacy and security
            if (this.config.autoPrivacySetup) {
                await this.executeTask('privacy-setup', {
                    id: 'privacy-setup',
                    name: 'Privacy & Security Setup',
                    description: 'Configure Tor, proxy, and system hardening',
                    category: 'privacy',
                    priority: 'critical',
                    status: 'pending'
                });
            }

            // Step 3: Execute workflow-specific tasks
            switch (workflow) {
                case 'recon':
                    workflowResult = await this.executeReconWorkflow(target);
                    break;
                case 'security':
                    workflowResult = await this.executeSecurityWorkflow(target);
                    break;
                case 'intelligence':
                    workflowResult = await this.executeIntelligenceWorkflow(target);
                    break;
                case 'privacy':
                    workflowResult = await this.executePrivacyWorkflow();
                    break;
                case 'full':
                default:
                    workflowResult = await this.executeFullWorkflow(target);
                    break;
            }

            // Step 4: Generate comprehensive report
            const report = this.generateWorkflowReport(workflow, workflowStart, workflowResult);
            
            return report;

        } catch (error: any) {
            return `❌ WindSurf workflow failed: ${error.message}`;
        }
    }

    /**
     * Execute reconnaissance workflow
     */
    private async executeReconWorkflow(target: string): Promise<string> {
        console.log('🔍 Executing reconnaissance workflow...');
        
        const reconTasks = [
            {
                id: 'osint-recon',
                name: 'OSINT Reconnaissance',
                description: 'Comprehensive open-source intelligence gathering',
                category: 'recon',
                priority: 'high'
            },
            {
                id: 'web-search',
                name: 'Web Search',
                description: 'Search for information about target across multiple engines',
                category: 'search',
                priority: 'high'
            },
            {
                id: 'network-scan',
                name: 'Network Scanning',
                description: 'Scan target network for open ports and services',
                category: 'security',
                priority: 'medium'
            }
        ];

        const results = await this.executeParallelTasks(reconTasks.map(t => ({ ...t, status: 'pending' } as WindSurfTask)));
        return `Reconnaissance workflow completed for ${target}:\n${results}`;
    }

    /**
     * Execute security workflow
     */
    private async executeSecurityWorkflow(target: string): Promise<string> {
        console.log('🛡️ Executing security workflow...');
        
        const securityTasks = [
            {
                id: 'vulnerability-scan',
                name: 'Vulnerability Scanning',
                description: 'Scan for vulnerabilities using nuclei and other tools',
                category: 'security',
                priority: 'high'
            },
            {
                id: 'tool-integration',
                name: 'Security Tool Integration',
                description: 'Integrate with external security tools (Burp, Nessus, Metasploit)',
                category: 'integration',
                priority: 'medium'
            },
            {
                id: 'parallel-scan',
                name: 'Parallel Security Scan',
                description: 'Execute coordinated parallel security scanning',
                category: 'security',
                priority: 'medium'
            }
        ];

        const results = await this.executeParallelTasks(securityTasks.map(t => ({ ...t, status: 'pending' } as WindSurfTask)));
        return `Security workflow completed for ${target}:\n${results}`;
    }

    /**
     * Execute intelligence workflow
     */
    private async executeIntelligenceWorkflow(target: string): Promise<string> {
        console.log('🧠 Executing intelligence workflow...');
        
        const intelligenceTasks = [
            {
                id: 'comprehensive-search',
                name: 'Comprehensive Intelligence Search',
                description: 'Gather intelligence from multiple sources including CVEs, news, social media',
                category: 'search',
                priority: 'high'
            },
            {
                id: 'blockchain-analysis',
                name: 'Blockchain Security Analysis',
                description: 'Analyze blockchain-related security aspects',
                category: 'blockchain',
                priority: 'medium'
            },
            {
                id: 'osint-deep-dive',
                name: 'Deep OSINT Analysis',
                description: 'Advanced open-source intelligence gathering',
                category: 'recon',
                priority: 'medium'
            }
        ];

        const results = await this.executeParallelTasks(intelligenceTasks.map(t => ({ ...t, status: 'pending' } as WindSurfTask)));
        return `Intelligence workflow completed for ${target}:\n${results}`;
    }

    /**
     * Execute privacy workflow
     */
    private async executePrivacyWorkflow(): Promise<string> {
        console.log('🔒 Executing privacy workflow...');
        
        const privacyTasks = [
            {
                id: 'tor-setup',
                name: 'Tor Setup',
                description: 'Configure Tor for complete IP masking',
                category: 'privacy',
                priority: 'critical'
            },
            {
                id: 'proxy-configuration',
                name: 'Proxy Configuration',
                description: 'Setup proxy chains and configuration',
                category: 'privacy',
                priority: 'medium'
            },
            {
                id: 'anonymity-verification',
                name: 'Anonymity Verification',
                description: 'Verify IP masking and anonymity status',
                category: 'privacy',
                priority: 'high'
            }
        ];

        const results = await this.executeParallelTasks(privacyTasks.map(t => ({ ...t, status: 'pending' } as WindSurfTask)));
        return `Privacy workflow completed:\n${results}`;
    }

    /**
     * Execute full workflow
     */
    private async executeFullWorkflow(target: string): Promise<string> {
        console.log('🌊 Executing full WindSurf workflow...');
        
        const fullTasks = [
            // Privacy and Security Setup
            {
                id: 'privacy-security-setup',
                name: 'Privacy & Security Setup',
                description: 'Complete privacy and security configuration',
                category: 'privacy',
                priority: 'critical'
            },
            
            // Intelligence Gathering
            {
                id: 'intelligence-gathering',
                name: 'Intelligence Gathering',
                description: 'Comprehensive intelligence collection',
                category: 'search',
                priority: 'high'
            },
            
            // Reconnaissance
            {
                id: 'reconnaissance',
                name: 'Target Reconnaissance',
                description: 'Complete reconnaissance of target',
                category: 'recon',
                priority: 'high'
            },
            
            // Security Analysis
            {
                id: 'security-analysis',
                name: 'Security Analysis',
                description: 'Comprehensive security analysis',
                category: 'security',
                priority: 'high'
            },
            
            // Tool Integration
            {
                id: 'tool-integration',
                name: 'Security Tool Integration',
                description: 'Integrate with external security tools',
                category: 'integration',
                priority: 'medium'
            },
            
            // Blockchain Analysis (if applicable)
            {
                id: 'blockchain-analysis',
                name: 'Blockchain Security Analysis',
                description: 'Analyze blockchain security aspects',
                category: 'blockchain',
                priority: 'low'
            }
        ];

        const results = await this.executeParallelTasks(fullTasks.map(t => ({ ...t, status: 'pending' } as WindSurfTask)));
        return `Full WindSurf workflow completed for ${target}:\n${results}`;
    }

    /**
     * Execute parallel tasks
     */
    private async executeParallelTasks(tasks: WindSurfTask[]): Promise<string> {
        if (!this.config.parallelExecution) {
            // Execute tasks sequentially
            const results = [];
            for (const task of tasks) {
                const result = await this.executeTask(task.id, task);
                results.push(`${task.name}: ${result}`);
            }
            return results.join('\n');
        }

        // Execute tasks in parallel with concurrency limit
        const parallelTasks = tasks.slice(0, this.config.maxConcurrentTasks!).map(t => ({
            name: t.name,
            target: 'target.com', // Default target for parallel execution
            args: t.description || '',
            priority: (typeof t.priority === 'string' && ['high', 'medium', 'low'].includes(t.priority) ? t.priority : 'medium') as any
        }));

        const results = await executeParallelTasks(parallelTasks);
        return results;
    }

    /**
     * Execute individual task
     */
    private async executeTask(taskId: string, task: WindSurfTask): Promise<string> {
        const existingTask = this.tasks.get(taskId);
        
        if (existingTask && existingTask.status === 'running') {
            return `Task ${taskId} is already running`;
        }

        // Update task status
        const updatedTask: WindSurfTask = {
            ...task,
            status: 'running',
            startTime: new Date()
        };
        
        this.tasks.set(taskId, updatedTask);
        this.runningTasks.add(taskId);

        try {
            let result: string;

            switch (task.category) {
                case 'privacy':
                    result = await this.executePrivacyTask(task);
                    break;
                case 'search':
                    result = await this.executeSearchTask(task);
                    break;
                case 'recon':
                    result = await osintRecon(task.id === 'osint-recon' ? 'target.com' : 'target');
                    break;
                case 'security':
                    result = await runSecurityToolIntegration('target.com', 'nmap'); // Default tool
                    break;
                case 'blockchain':
                    result = await this.executeBlockchainTask(task);
                    break;
                case 'integration':
                    result = await this.executeIntegrationTask(task);
                    break;
                case 'deployment':
                    result = await this.executeDeploymentTask(task);
                    break;
                default:
                    result = `Unknown task category: ${task.category}`;
            }

            // Update task completion
            const completedTask: WindSurfTask = {
                ...updatedTask,
                status: 'completed',
                endTime: new Date(),
                result
            };

            this.tasks.set(taskId, completedTask);
            this.runningTasks.delete(taskId);
            this.taskHistory.push(completedTask);

            return result;

        } catch (error: any) {
            // Update task failure
            const failedTask: WindSurfTask = {
                ...updatedTask,
                status: 'failed',
                endTime: new Date(),
                error: error.message
            };

            this.tasks.set(taskId, failedTask);
            this.runningTasks.delete(taskId);
            this.taskHistory.push(failedTask);

            throw error;
        }
    }

    /**
     * Execute privacy task
     */
    private async executePrivacyTask(task: WindSurfTask): Promise<string> {
        switch (task.id) {
            case 'tor-setup':
                return await setupPrivacyAndSecurity({ torEnabled: true, verifyTorConnection: true });
            case 'proxy-configuration':
                return await setupPrivacyAndSecurity({ proxyEnabled: true });
            case 'anonymity-verification':
                return await quickPrivacyCheck({ torEnabled: true });
            default:
                return `Unknown privacy task: ${task.id}`;
        }
    }

    /**
     * Execute search task
     */
    private async executeSearchTask(task: WindSurfTask): Promise<string> {
        switch (task.id) {
            case 'comprehensive-search':
                return await intelligenceSearch(task.name.includes('CVE') ? 'security vulnerability' : 'target intelligence');
            case 'web-search':
                return await webSearch('target intelligence');
            default:
                return await quickWebSearch('target information');
        }
    }

    /**
     * Execute security task
     */
    private async executeSecurityTask(task: WindSurfTask): Promise<string> {
        switch (task.id) {
            case 'vulnerability-scan':
                return await runSecurityToolIntegration('target.com', 'nuclei');
            case 'tool-integration':
                return await runSecurityToolIntegration('target.com', 'metasploit');
            case 'parallel-scan':
                return await parallelScan('target.com');
            default:
                return await runSecurityToolIntegration('target.com', 'nmap');
        }
    }

    /**
     * Execute blockchain task
     */
    private async executeBlockchainTask(task: WindSurfTask): Promise<string> {
        return await blockchainSecurityAudit('0x1234567890abcdef1234567890abcdef1234567890');
    }

    /**
     * Execute integration task
     */
    private async executeIntegrationTask(task: WindSurfTask): Promise<string> {
        return await runSecurityToolIntegration('target.com', 'burpsuite');
    }

    /**
     * Execute deployment task
     */
    private async executeDeploymentTask(task: WindSurfTask): Promise<string> {
        switch (task.id) {
            case 'privacy-security-setup':
                return await setupPrivacyAndSecurity({ 
                    torEnabled: true, 
                    proxyEnabled: false, 
                    checkAnonymity: true, 
                    openTorBrowser: true, 
                    verifyTorConnection: true 
                });
            default:
                return await deploySandboxAsNeeded();
        }
    }

    /**
     * Generate workflow report
     */
    private generateWorkflowReport(workflow: string, startTime: Date, result: string): string {
        const duration = new Date().getTime() - startTime.getTime();
        const completedTasks = Array.from(this.tasks.values()).filter(task => task.status === 'completed');
        const failedTasks = Array.from(this.tasks.values()).filter(task => task.status === 'failed');

        return `
╔══════════════════════════════════════════════════╗
║                  WINDSURF WORKFLOW REPORT                    ║
╚═════════════════════════════════════════════════════

WORKFLOW: ${workflow.toUpperCase()}
TARGET: Auto-configured
DURATION: ${Math.round(duration / 1000)} seconds
START TIME: ${startTime.toISOString()}

═══════════════════════════════════════════════════

TASK SUMMARY:
• Total Tasks: ${this.tasks.size}
• Completed: ${completedTasks.length}
• Failed: ${failedTasks.length}
• Currently Running: ${this.runningTasks.size}

═════════════════════════════════════════════════════

TASK DETAILS:
${Array.from(this.tasks.values()).map(task => `
• ${task.name} (${typeof task.priority === 'string' ? task.priority.toUpperCase() : task.priority})
  Status: ${this.getStatusEmoji(task.status)}
  Duration: ${task.startTime && task.endTime ? 
    Math.round((task.endTime.getTime() - task.startTime.getTime()) / 1000) + 's' : 
    'N/A'}
  ${task.error ? `Error: ${task.error}` : ''}
  ${task.result ? `Result: ${task.result.substring(0, 100)}...` : ''}
`).join('\n')}

═══════════════════════════════════════════════════

WORKFLOW RECOMMENDATIONS:
• ${failedTasks.length > 0 ? 'Review failed tasks and retry if necessary' : 'All tasks completed successfully'}
• ${this.runningTasks.size > 0 ? 'Monitor running tasks for completion' : 'No tasks currently running'}
• ${completedTasks.length > 0 ? 'Review completed results for next steps' : 'No tasks completed yet'}
• Consider scheduling regular workflow executions for continuous monitoring

═══════════════════════════════════════════════
WindSurf Agent Status: ${this.getAgentStatus()}
Report Generated: ${new Date().toISOString()}
`;
    }

    /**
     * Get status emoji
     */
    private getStatusEmoji(status: string): string {
        const statusMap = {
            pending: '⏳',
            running: '🔄',
            completed: '✅',
            failed: '❌'
        };
        return statusMap[status as keyof typeof statusMap] || '❓';
    }

    /**
     * Get agent status
     */
    private getAgentStatus(): string {
        const totalTasks = this.tasks.size;
        const runningTasks = this.runningTasks.size;
        const completedTasks = Array.from(this.tasks.values()).filter(task => task.status === 'completed').length;
        const failedTasks = Array.from(this.tasks.values()).filter(task => task.status === 'failed').length;

        if (totalTasks === 0) {
            return '🔄 Ready for tasks';
        } else if (failedTasks > 0) {
            return '⚠️ Some tasks failed';
        } else if (runningTasks > 0) {
            return '🔄 Tasks in progress';
        } else {
            return '✅ All tasks completed';
        }
    }

    /**
     * Get current status
     */
    async getCurrentStatus(): Promise<string> {
        const sandboxStatus = await getSandboxDeploymentStatus();
        const privacyStatus = await getPrivacyStatus();
        
        return `
╔══════════════════════════════════════════════════╗
║                  WINDSURF AGENT STATUS                     ║
╚═════════════════════════════════════════════════════

CONFIGURATION:
• Auto Privacy Setup: ${this.config.autoPrivacySetup ? '✅ Enabled' : '❌ Disabled'}
• Auto Sandbox Deployment: ${this.config.autoSandboxDeployment ? '✅ Enabled' : '❌ Disabled'}
• Parallel Execution: ${this.config.parallelExecution ? '✅ Enabled' : '❌ Disabled'}
• Max Concurrent Tasks: ${this.config.maxConcurrentTasks}
• Reporting Enabled: ${this.config.reportingEnabled ? '✅ Enabled' : '❌ Disabled'}
• Log Level: ${this.config.logLevel!.toUpperCase()}

═════════════════════════════════════════════════════

SYSTEM STATUS:
${sandboxStatus}

${privacyStatus}

═══════════════════════════════════════════════════

TASK MANAGER:
• Total Tasks: ${this.tasks.size}
• Running Tasks: ${this.runningTasks.size}
• Completed Tasks: ${Array.from(this.tasks.values()).filter(task => task.status === 'completed').length}
• Failed Tasks: ${Array.from(this.tasks.values()).filter(task => task.status === 'failed').length}

═══════════════════════════════════════════════

AVAILABLE WORKFLOWS:
• recon - Target reconnaissance and intelligence gathering
• security - Security analysis and vulnerability scanning
• intelligence - Comprehensive intelligence collection
• privacy - Privacy and security configuration
• full - Complete end-to-end workflow

═══════════════════════════════════════════════
Status Generated: ${new Date().toISOString()}
`;
    }

    /**
     * Clear task history
     */
    clearTaskHistory(): void {
        this.taskHistory = [];
        this.tasks.clear();
        this.runningTasks.clear();
        console.log('🧹 Task history cleared');
    }

    /**
     * Get task history
     */
    getTaskHistory(): WindSurfTask[] {
        return [...this.taskHistory];
    }
}

// Global WindSurf agent instance
let windSurfAgent: WindSurfAgent | null = null;

/**
 * Get or create WindSurf agent
 */
export function getWindSurfAgent(config?: WindSurfConfig): WindSurfAgent {
    if (!windSurfAgent) {
        windSurfAgent = new WindSurfAgent(config);
    }
    return windSurfAgent;
}

/**
 * Execute WindSurf workflow
 */
export async function executeWindSurfWorkflow(target: string, workflow: string = 'full', config?: WindSurfConfig): Promise<string> {
    const agent = getWindSurfAgent(config);
    return await agent.executeWindSurfWorkflow(target, workflow);
}

/**
 * Quick privacy setup
 */
export async function quickPrivacySetup(): Promise<string> {
    const agent = getWindSurfAgent();
    return await agent.executeWindSurfWorkflow('', 'privacy');
}

/**
 * Quick reconnaissance
 */
export async function quickRecon(target: string): Promise<string> {
    const agent = getWindSurfAgent();
    return await agent.executeWindSurfWorkflow(target, 'recon');
}

/**
 * Quick security analysis
 */
export async function quickSecurityAnalysis(target: string): Promise<string> {
    const agent = getWindSurfAgent();
    return await agent.executeWindSurfWorkflow(target, 'security');
}

/**
 * Full intelligence workflow
 */
export async function fullIntelligenceWorkflow(target: string): Promise<string> {
    const agent = getWindSurfAgent();
    return await agent.executeWindSurfWorkflow(target, 'intelligence');
}

/**
 * Get WindSurf agent status
 */
export async function getWindSurfStatus(): Promise<string> {
    const agent = getWindSurfAgent();
    return await agent.getCurrentStatus();
}
