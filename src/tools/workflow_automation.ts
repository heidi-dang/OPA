import { 
    executeAnonymousWorkflow,
    quickAnonymousSetup,
    quickAnonymousRecon,
    fullAnonymousWorkflow,
    getAnonymousStatus
} from './anonymous_agent.js';

import { 
    executeWindSurfWorkflow,
    quickPrivacySetup,
    quickRecon,
    quickSecurityAnalysis,
    fullIntelligenceWorkflow,
    getWindSurfStatus
} from './windsurf_agent.js';

import { 
    generateIntelligentSuggestions,
    quickSuggestions,
    getSuggestionHistory,
    clearSuggestionHistory
} from './suggestions.js';

import { 
    osintRecon,
    executeParallelTasks,
    parallelScan
} from './parallel_engine.js';

import { 
    runNuclei,
    searchsploitQuery,
    nmapScan,
    parsePcap,
    generateReport,
    fuzzBypass,
    generateBotScript,
    sweepLocalNetwork,
    cryptoAudit,
    analyzeWpaHandshake,
    diagnoseIspThrottling,
    maskIp
} from './osint.js';
import './nuclei.js';
import './searchsploit.js';
import './nmap.js';
import './pcap.js';
import './report.js';
import './fuzz.js';
import './bot.js';
import './sweep.js';
import './crypto.js';
import './wireless.js';
import './isp.js';
import './mask.js';

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

import { 
    webSearch,
    securityWebSearch,
    intelligenceSearch,
    quickWebSearch
} from './web_search.js';

import type { BaseTask, TaskStatus, TaskPriority, TaskCategory } from './task_types.js';

interface AutomationGoal {
    id: string;
    name: string;
    description: string;
    category: 'recon' | 'security' | 'privacy' | 'intelligence' | 'exploitation' | 'reporting' | 'complete';
    priority: TaskPriority;
    status: TaskStatus;
    progress: number;
    totalSteps: number;
    completedSteps: string[];
    startTime?: Date;
    endTime?: Date;
    result?: string;
    error?: string;
    artifacts?: string[];
    nextActions?: string[];
}

interface AutomationStrategy {
    name: string;
    description: string;
    goals: AutomationGoal[];
    steps: AutomationStep[];
    parallelExecution: boolean;
    maxConcurrency: number;
    retryAttempts: number;
    timeoutMinutes: number;
}

interface AutomationStep {
    id: string;
    name: string;
    description: string;
    tool: string;
    parameters?: Record<string, any>;
    expectedOutput?: string;
    timeoutMinutes?: number;
    retryOnFailure?: boolean;
    continueOnError?: boolean;
}

interface AutomationResult {
    success: boolean;
    goals: AutomationGoal[];
    completedSteps: AutomationStep[];
    artifacts: string[];
    summary: string;
    duration: number;
    errors: string[];
    recommendations: string[];
    nextActions: string[];
    strategyId?: string;
}

export class WorkflowAutomationEngine {
    private goals: Map<string, AutomationGoal>;
    private strategies: Map<string, AutomationStrategy>;
    private executionHistory: AutomationResult[];
    private maxHistorySize = 100;

    constructor() {
        this.goals = new Map();
        this.strategies = new Map();
        this.executionHistory = [];
        this.initializeDefaultStrategies();
    }

    /**
     * Initialize default automation strategies
     */
    private initializeDefaultStrategies(): void {
        // Complete Security Assessment Strategy
        const securityAssessmentGoals: AutomationGoal[] = [
            {
                id: 'recon-objective',
                name: 'Reconnaissance Objective',
                description: 'Gather comprehensive intelligence about target',
                category: 'recon',
                priority: 'critical' as TaskPriority,
                status: 'pending' as TaskStatus,
                totalSteps: 5,
                completedSteps: [],
                progress: 0
            },
            {
                id: 'vulnerability-assessment',
                name: 'Vulnerability Assessment',
                description: 'Identify and analyze security vulnerabilities',
                category: 'security',
                priority: 'critical' as TaskPriority,
                status: 'pending' as TaskStatus,
                totalSteps: 4,
                completedSteps: [],
                progress: 0
            },
            {
                id: 'exploitation-testing',
                name: 'Exploitation Testing',
                description: 'Test identified vulnerabilities safely',
                category: 'security',
                priority: 'high' as TaskPriority,
                status: 'pending' as TaskStatus,
                totalSteps: 3,
                completedSteps: [],
                progress: 0
            },
            {
                id: 'report-generation',
                name: 'Report Generation',
                description: 'Create comprehensive security assessment report',
                category: 'reporting',
                priority: 'medium' as TaskPriority,
                status: 'pending' as TaskStatus,
                totalSteps: 2,
                completedSteps: [],
                progress: 0
            }
        ];

        this.strategies.set('complete-security-audit', {
            name: 'Complete Security Assessment',
            description: 'Comprehensive security assessment including reconnaissance, vulnerability scanning, exploitation testing, and reporting',
            goals: securityAssessmentGoals,
            steps: [
                {
                    id: 'setup-anonymity',
                    name: 'Setup Complete Anonymity',
                    description: 'Configure Tor, proxy, and system hardening',
                    tool: 'quick_anonymous_setup',
                    parameters: { enforceAnonymity: true, torBrowserIntegration: true },
                    timeoutMinutes: 10,
                    retryOnFailure: true
                },
                {
                    id: 'comprehensive-recon',
                    name: 'Comprehensive Reconnaissance',
                    description: 'Execute multi-source intelligence gathering',
                    tool: 'full_anonymous_workflow',
                    parameters: { workflow: 'recon' },
                    timeoutMinutes: 30,
                    retryOnFailure: true
                },
                {
                    id: 'vulnerability-scan',
                    name: 'Vulnerability Scanning',
                    description: 'Scan for vulnerabilities using multiple tools',
                    tool: 'parallel_scan',
                    parameters: { tools: 'run_nuclei,nmap_scan,searchsploit_query' },
                    timeoutMinutes: 45
                },
                {
                    id: 'targeted-exploitation',
                    name: 'Targeted Exploitation Testing',
                    description: 'Test specific vulnerabilities with controlled exploitation',
                    tool: 'run_nuclei',
                    parameters: { templates: 'cves,exposures' },
                    timeoutMinutes: 30,
                    continueOnError: false
                },
                {
                    id: 'generate-report',
                    name: 'Generate Final Report',
                    description: 'Create comprehensive security assessment report',
                    tool: 'generate_report',
                    parameters: { format: 'detailed', includeEvidence: true },
                    timeoutMinutes: 15
                }
            ],
            parallelExecution: true,
            maxConcurrency: 3,
            retryAttempts: 3,
            timeoutMinutes: 120
        });

        // Rapid Intelligence Gathering Strategy
        const intelligenceGoals: AutomationGoal[] = [
            {
                id: 'osint-collection',
                name: 'OSINT Collection',
                description: 'Gather open-source intelligence quickly',
                category: 'intelligence',
                priority: 'high' as TaskPriority,
                status: 'pending' as TaskStatus,
                totalSteps: 3,
                completedSteps: [],
                progress: 0
            },
            {
                id: 'web-search',
                name: 'Comprehensive Web Search',
                description: 'Search across multiple engines for intelligence',
                category: 'intelligence',
                priority: 'high' as TaskPriority,
                status: 'pending' as TaskStatus,
                totalSteps: 2,
                completedSteps: [],
                progress: 0
            },
            {
                id: 'threat-analysis',
                name: 'Threat Analysis',
                description: 'Analyze current threats and security landscape',
                category: 'intelligence',
                priority: 'medium' as TaskPriority,
                status: 'pending' as TaskStatus,
                totalSteps: 2,
                completedSteps: [],
                progress: 0
            }
        ];

        this.strategies.set('rapid-intelligence', {
            name: 'Rapid Intelligence Gathering',
            description: 'Quick intelligence collection from multiple sources',
            goals: intelligenceGoals,
            steps: [
                {
                    id: 'quick-osint',
                    name: 'Quick OSINT',
                    description: 'Fast open-source intelligence gathering',
                    tool: 'quick_anonymous_recon',
                    timeoutMinutes: 15,
                    retryOnFailure: true
                },
                {
                    id: 'multi-source-search',
                    name: 'Multi-Source Search',
                    description: 'Search web, CVEs, news, and social media',
                    tool: 'intelligence_search',
                    parameters: { includeCVE: true, includeNews: true },
                    timeoutMinutes: 25
                },
                {
                    id: 'threat-monitoring',
                    name: 'Threat Monitoring',
                    description: 'Monitor security threats and advisories',
                    tool: 'security_web_search',
                    parameters: { query: 'cybersecurity threats' },
                    timeoutMinutes: 20
                }
            ],
            parallelExecution: true,
            maxConcurrency: 4,
            retryAttempts: 2,
            timeoutMinutes: 60
        });

        // Privacy-First Operations Strategy
        const privacyGoals: AutomationGoal[] = [
            {
                id: 'anonymity-enforcement',
                name: 'Anonymity Enforcement',
                description: 'Ensure complete anonymity before any operations',
                category: 'privacy',
                priority: 'critical' as TaskPriority,
                status: 'pending' as TaskStatus,
                totalSteps: 1,
                completedSteps: [],
                progress: 0
            }
        ];

        this.strategies.set('privacy-first-operations', {
            name: 'Privacy-First Operations',
            description: 'Execute all operations with maximum anonymity protection enforced',
            goals: privacyGoals,
            steps: [
                {
                    id: 'mandatory-anonymity',
                    name: 'Mandatory Anonymity Setup',
                    description: 'Setup complete anonymity with verification',
                    tool: 'quick_anonymous_setup',
                    parameters: { enforceAnonymity: true, torBrowserIntegration: true, verifyTorConnection: true },
                    timeoutMinutes: 15,
                    retryOnFailure: true,
                    continueOnError: false
                }
            ],
            parallelExecution: false,
            maxConcurrency: 1,
            retryAttempts: 5,
            timeoutMinutes: 60
        });

        // Bug Bounty Strategy
        const bugBountyGoals: AutomationGoal[] = [
            {
                id: 'vulnerability-discovery',
                name: 'Vulnerability Discovery',
                description: 'Find new vulnerabilities using various techniques',
                category: 'security',
                priority: 'high' as TaskPriority,
                status: 'pending' as TaskStatus,
                totalSteps: 4,
                completedSteps: [],
                progress: 0
            },
            {
                id: 'vulnerability-validation',
                name: 'Vulnerability Validation',
                description: 'Validate and document discovered vulnerabilities',
                category: 'security',
                priority: 'high' as TaskPriority,
                status: 'pending' as TaskStatus,
                totalSteps: 3,
                completedSteps: [],
                progress: 0
            },
            {
                id: 'proof-of-concept',
                name: 'Proof of Concept',
                description: 'Create working proof of concept for vulnerabilities',
                category: 'exploitation',
                priority: 'medium' as TaskPriority,
                status: 'pending' as TaskStatus,
                totalSteps: 2,
                completedSteps: [],
                progress: 0
            },
            {
                id: 'bounty-report',
                name: 'Bounty Report Generation',
                description: 'Create professional bug bounty submission report',
                category: 'reporting',
                priority: 'medium' as TaskPriority,
                status: 'pending' as TaskStatus,
                totalSteps: 2,
                completedSteps: [],
                progress: 0
            }
        ];

        this.strategies.set('bug-bounty', {
            name: 'Bug Bounty Hunting',
            description: 'Systematic vulnerability discovery for bug bounty programs',
            goals: bugBountyGoals,
            steps: [
                {
                    id: 'comprehensive-scan',
                    name: 'Comprehensive Vulnerability Scan',
                    description: 'Multi-tool vulnerability scanning',
                    tool: 'parallel_scan',
                    parameters: { tools: 'run_nuclei,nmap_scan,searchsploit_query' },
                    timeoutMinutes: 60,
                    maxConcurrency: 6
                },
                {
                    id: 'targeted-analysis',
                    name: 'Targeted Vulnerability Analysis',
                    description: 'Deep analysis of specific vulnerabilities',
                    tool: 'run_nuclei',
                    parameters: { templates: 'cves,exposures' },
                    timeoutMinutes: 45
                },
                {
                    id: 'poc-development',
                    name: 'POC Development',
                    description: 'Develop proof of concept exploits',
                    tool: 'generate_bot_script',
                    parameters: { language: 'python', includeTemplate: 'exploitation' },
                    timeoutMinutes: 30
                },
                {
                    id: 'bounty-report-gen',
                    name: 'Generate Bounty Report',
                    description: 'Create comprehensive bug bounty submission',
                    tool: 'generate_report',
                    parameters: { format: 'bounty', includeEvidence: true, includeScreenshots: true },
                    timeoutMinutes: 20
                }
            ],
            parallelExecution: true,
            maxConcurrency: 4,
            retryAttempts: 3,
            timeoutMinutes: 180
        });
    }

    /**
     * Execute automation strategy
     */
    async executeStrategy(strategyId: string, target: string = '', parameters: Record<string, any> = {}): Promise<AutomationResult> {
        console.log(`🚀 Starting automation strategy: ${strategyId} for target: ${target}`);
        
        const strategy = this.strategies.get(strategyId);
        
        if (!strategy) {
            return {
                success: false,
                goals: [],
                completedSteps: [],
                artifacts: [],
                summary: `Strategy '${strategyId}' not found`,
                duration: 0,
                errors: ['Unknown strategy'],
                recommendations: ['Available strategies: ' + Array.from(this.strategies.keys()).join(', ')],
                nextActions: ['List available strategies using list_strategies()']
            };
        }

        const startTime = new Date();
        const result: AutomationResult = {
            success: true,
            goals: strategy.goals.map(goal => ({ ...goal, status: 'running' as TaskStatus, startTime })),
            completedSteps: [],
            artifacts: [],
            summary: `Executing ${strategy.name} strategy`,
            duration: 0,
            errors: [],
            recommendations: [],
            nextActions: [],
            strategyId
        };

        try {
            // Execute all steps in strategy
            for (const step of strategy.steps) {
                const stepResult = await this.executeStep(step, target, parameters);
                
                // Update progress
                this.updateGoalProgress(result.goals, step.id, stepResult);
                
                // Add artifacts if any
                if (stepResult.artifacts) {
                    result.artifacts.push(...stepResult.artifacts);
                }
                
                // Handle step failure
                if (!stepResult.success && step.continueOnError !== true) {
                    result.errors.push(`Step ${step.name} failed: ${stepResult.error}`);
                    break;
                }
            }

            // Mark strategy as completed
            result.goals.forEach(goal => {
                goal.status = this.calculateGoalStatus(goal);
                goal.endTime = new Date();
                goal.progress = 100;
            });

            result.duration = new Date().getTime() - startTime.getTime();
            result.summary = `Completed ${strategy.name} strategy in ${result.duration}ms`;
            result.completedSteps = strategy.steps.map(step => ({ ...step, status: 'completed' as TaskStatus }));

            return result;

        } catch (error: any) {
            return {
                success: false,
                goals: [],
                completedSteps: [],
                artifacts: [],
                summary: `Strategy execution failed: ${error.message}`,
                duration: 0,
                errors: [error.message],
                recommendations: ['Check strategy configuration and system resources'],
                nextActions: ['Retry with corrected parameters']
            };
        }
    }

    /**
     * Execute individual automation step
     */
    private async executeStep(step: AutomationStep, target: string, parameters: Record<string, any> = {}): Promise<{ success: boolean; artifacts?: string[]; error?: string }> {
        console.log(`🔄 Executing step: ${step.name}`);
        
        try {
            let artifacts: string[] = [];
            let success = true;
            let error: string | undefined;

            switch (step.tool) {
                case 'quick_anonymous_setup':
                    const quickSetupResult = await quickAnonymousSetup();
                    success = quickSetupResult.includes('✅') || quickSetupResult.includes('completed');
                    if (!success) {
                        error = quickSetupResult;
                    }
                    break;

                case 'full_anonymous_workflow':
                    const workflowResult = await fullAnonymousWorkflow(target, 'recon');
                    success = workflowResult.includes('✅') || workflowResult.includes('completed');
                    if (!success) {
                        error = workflowResult;
                    }
                    artifacts = [`Recon results for ${target}`];
                    break;

                case 'quick_anonymous_recon':
                    const reconResult = await quickAnonymousRecon(target);
                    success = reconResult.includes('✅') || reconResult.includes('completed');
                    if (!success) {
                        error = reconResult;
                    }
                    artifacts = [`Anonymous recon results for ${target}`];
                    break;

                case 'parallel_scan':
                    const scanResult = await parallelScan(target);
                    success = scanResult.includes('✅') || scanResult.includes('completed');
                    if (!success) {
                        error = scanResult;
                    }
                    artifacts = [`Parallel scan results for ${target}`];
                    break;

                case 'run_nuclei':
                    const nucleiResult = await runNuclei(target);
                    success = nucleiResult.includes('✅') || nucleiResult.includes('completed');
                    if (!success) {
                        error = nucleiResult;
                    }
                    artifacts = [`Nuclei scan results for ${target}`];
                    break;

                case 'nmap_scan':
                    const nmapResult = await nmapScan(target);
                    success = nmapResult.includes('✅') || nmapResult.includes('completed');
                    if (!success) {
                        error = nmapResult;
                    }
                    artifacts = [`Nmap scan results for ${target}`];
                    break;

                case 'searchsploit_query':
                    const exploitResult = await searchsploitQuery(target);
                    success = exploitResult.includes('✅') || exploitResult.includes('completed');
                    if (!success) {
                        error = exploitResult;
                    }
                    artifacts = [`Exploit search results for ${target}`];
                    break;

                case 'generate_report':
                    const reportResult = await generateReport('Automation completed', { 
                        format: step.parameters?.format || 'detailed', 
                        includeEvidence: step.parameters?.includeEvidence !== false,
                        findings: 'Multiple tools executed via automation',
                        recommendations: ['Review all generated artifacts'] 
                    });
                    success = reportResult.includes('✅') || reportResult.includes('completed');
                    if (!success) {
                        error = reportResult;
                    }
                    artifacts = [`Security assessment report generated`];
                    break;

                case 'generate_bot_script':
                    const language = step.parameters?.language || 'python';
                    const botResult = await generateBotScript('Automated exploitation script', language);
                    success = botResult.includes('generated') || botResult.includes('✅');
                    if (!success) {
                        error = botResult;
                    }
                    artifacts = [`Bot script generated: ${language}`];
                    break;

                case 'intelligence_search':
                    const query = step.parameters?.query || target;
                    const options = step.parameters || {};
                    const intelResult = await intelligenceSearch(query, options);
                    success = intelResult.includes('✅') || intelResult.includes('completed');
                    if (!success) {
                        error = intelResult;
                    }
                    artifacts = [`Intelligence search results for ${query}`];
                    break;

                case 'security_web_search':
                    const query = step.parameters?.query || 'cybersecurity threats';
                    const securityResult = await securityWebSearch(query);
                    success = securityResult.includes('✅') || securityResult.includes('completed');
                    if (!success) {
                        error = securityResult;
                    }
                    artifacts = [`Security search results for ${query}`];
                    break;

                case 'quick_web_search':
                    const query = step.parameters?.query || target;
                    const quickResult = await quickWebSearch(query);
                    success = quickResult.includes('✅') || quickResult.includes('completed');
                    if (!success) {
                        error = quickResult;
                    }
                    artifacts = [`Quick search results for ${query}`];
                    break;

                default:
                    success = false;
                    error = `Unknown tool: ${step.tool}`;
                    break;
            }

            // Apply timeout if specified
            if (step.timeoutMinutes && success) {
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error(`Step ${step.name} timed out after ${step.timeoutMinutes} minutes`)), step.timeoutMinutes * 60 * 1000);
                });

                try {
                    await Promise.race([Promise.resolve(), timeoutPromise]);
                } catch (timeoutError) {
                    success = false;
                    error = `Step ${step.name} timed out`;
                }
            }

            return { success, artifacts, error };

        } catch (error: any) {
            return {
                success: false,
                error: `Step execution error: ${error.message}`
            };
        }
    }

    /**
     * Update goal progress
     */
    private updateGoalProgress(goals: AutomationGoal[], stepId: string, stepResult: { success: boolean; artifacts?: string[]; error?: string }): void {
        goals.forEach(goal => {
            if (goal.id && goal.completedSteps.includes(stepId)) {
                if (stepResult.success) {
                    goal.completedSteps.push(stepId);
                    goal.progress = Math.round((goal.completedSteps.length / goal.totalSteps) * 100);
                }
                
                if (stepResult.artifacts) {
                    if (!goal.artifacts) {
                        goal.artifacts = [];
                    }
                    goal.artifacts.push(...stepResult.artifacts);
                }
                
                if (stepResult.error) {
                    goal.status = 'failed' as TaskStatus;
                }
            }
        });
    }

    /**
     * Calculate goal status
     */
    private calculateGoalStatus(goal: AutomationGoal): TaskStatus {
        if (goal.status === 'failed') {
            return 'failed' as TaskStatus;
        } else if (goal.completedSteps.length === goal.totalSteps) {
            return 'completed' as TaskStatus;
        } else if (goal.completedSteps.length > 0) {
            return 'running' as TaskStatus;
        } else {
            return 'pending' as TaskStatus;
        }
    }

    /**
     * Get available strategies
     */
    getAvailableStrategies(): string[] {
        return Array.from(this.strategies.keys());
    }

    /**
     * Get strategy details
     */
    getStrategy(strategyId: string): AutomationStrategy | undefined {
        return this.strategies.get(strategyId);
    }

    /**
     * Get execution history
     */
    getExecutionHistory(): AutomationResult[] {
        return [...this.executionHistory];
    }

    /**
     * Clear execution history
     */
    clearExecutionHistory(): void {
        this.executionHistory = [];
        console.log('🧹 Automation execution history cleared');
    }
}

// Global automation engine instance
let automationEngine: WorkflowAutomationEngine | null = null;

/**
 * Get or create automation engine
 */
export function getAutomationEngine(): WorkflowAutomationEngine {
    if (!automationEngine) {
        automationEngine = new WorkflowAutomationEngine();
    }
    return automationEngine;
}

/**
 * Execute automation strategy
 */
export async function executeStrategy(strategyId: string, target: string = '', parameters: Record<string, any> = {}): Promise<AutomationResult> {
    const engine = getAutomationEngine();
    return await engine.executeStrategy(strategyId, target, parameters);
}

/**
 * Get available strategies
 */
export function getAvailableStrategies(): string[] {
    const engine = getAutomationEngine();
    return engine.getAvailableStrategies();
}

/**
 * Get execution history
 */
export function getExecutionHistory(): AutomationResult[] {
    const engine = getAutomationEngine();
    return engine.getExecutionHistory();
}

/**
 * Clear execution history
 */
export function clearExecutionHistory(): void {
    const engine = getAutomationEngine();
    engine.clearExecutionHistory();
}

/**
 * Generate comprehensive automation report
 */
export function generateAutomationReport(): string {
    const engine = getAutomationEngine();
    const history = engine.getExecutionHistory();
    
    if (history.length === 0) {
        return `
╔════════════════════════════════╗
║                  AUTOMATION REPORT                        ║
╚═══════════════════════════════

NO AUTOMATION HISTORY AVAILABLE

═══════════════════════════════════

Available Strategies:
${engine.getAvailableStrategies().map(id => {
    const strategy = engine.getStrategy(id);
    return `• ${strategy.name} - ${strategy.description}`;
}).join('\n')}

═══════════════════════════════════

Use 'execute_strategy' to run any available strategy.
Report Generated: ${new Date().toISOString()}
`;
    }

    const totalExecutions = history.length;
    const successfulExecutions = history.filter(r => r.success).length;
    const failedExecutions = history.filter(r => !r.success).length;

    const report = `
╔════════════════════════════════╗
║                  AUTOMATION REPORT                        ║
╚═════════════════════════════════

EXECUTION SUMMARY:
• Total Executions: ${totalExecutions}
• Successful Executions: ${successfulExecutions}
• Failed Executions: ${failedExecutions}

═════════════════════════════════

RECENT EXECUTIONS:
${history.slice(-5).reverse().map((result, index) => {
    const strategy = engine.getStrategy(result.strategyId || 'unknown');
    return `
${index + 1}. ${strategy?.name || 'Unknown Strategy'} ${result.success ? '✅' : '❌'} (${Math.round(result.duration / 1000)}s)
   Target: ${result.goals.map(g => g.id).join(', ') || 'N/A'}
   Artifacts: ${result.artifacts?.length || 0} generated
   ${result.errors.length > 0 ? `Errors: ${result.errors.join(', ')}` : ''}
`;
}).join('\n')}

═══════════════════════════════════

RECOMMENDATIONS:
• ${failedExecutions > 0 ? 'Review failed executions and retry with corrected parameters' : 'All executions successful'}
• ${totalExecutions > 0 ? 'Continue using automation strategies for complex workflows' : 'Start using automation strategies for efficiency'}
• Use 'generateAutomationReport' for detailed analysis and progress tracking
• Use 'list_strategies' to see all available automation strategies

═════════════════════════════════
Report Generated: ${new Date().toISOString()}
`;
    
    return report;
}

/**
 * List available strategies
 */
export function listStrategies(): string {
    const engine = getAutomationEngine();
    const strategies = engine.getAvailableStrategies();
    
    return `
╔══════════════════════════════════╗
║              AVAILABLE AUTOMATION STRATEGIES           ║
╚═════════════════════════════════

${strategies.map((id, index) => {
    const strategy = engine.getStrategy(id);
    return `${index + 1}. ${strategy?.name || 'Unknown'} - ${strategy?.description || 'No description available'}`;
}).join('\n')}

═══════════════════════════════════

STRATEGY EXECUTION EXAMPLES:
• execute_strategy target.com complete-security-audit
• execute_strategy target.com rapid-intelligence
• execute_strategy target.com privacy-first-operations
• execute_strategy target.com bug-bounty

═══════════════════════════════════
Generated: ${new Date().toISOString()}
`;
}

/**
 * Quick automation - complete security assessment
 */
export async function quickCompleteSecurityAssessment(target: string): Promise<AutomationResult> {
    return await executeStrategy('complete-security-audit', target);
}

/**
 * Quick automation - rapid intelligence gathering
 */
export async function quickRapidIntelligence(target: string): Promise<AutomationResult> {
    return await executeStrategy('rapid-intelligence', target);
}

/**
 * Quick automation - privacy-first operations
 */
export async function quickPrivacyFirstOperations(target: string): Promise<AutomationResult> {
    return await executeStrategy('privacy-first-operations', target);
}

/**
 * Quick automation - bug bounty hunting
 */
export async function quickBugBountyHunt(target: string): Promise<AutomationResult> {
    return await executeStrategy('bug-bounty', target);
}
