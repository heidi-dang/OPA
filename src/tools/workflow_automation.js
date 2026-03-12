import { executeAnonymousWorkflow, quickAnonymousSetup, quickAnonymousRecon, fullAnonymousWorkflow, getAnonymousAgentStatus } from './anonymous_agent.js';
import { executeWindSurfWorkflow, quickPrivacySetup, quickRecon, quickSecurityAnalysis, fullIntelligenceWorkflow, getWindSurfStatus } from './windsurf_agent.js';
import { generateIntelligentSuggestions, quickSuggestions, getSuggestionHistory, clearSuggestionHistory } from './suggestions.js';
import { osintRecon, executeParallelTasks, parallelScan } from './parallel_engine.js';
import { webSearch, securityWebSearch, intelligenceSearch } from './web_search.js';
import { runNuclei, searchsploitQuery, nmapScan, parsePcap, generateReport, fuzzBypass, generateBotScript, sweepLocalNetwork, cryptoAudit, analyzeWpaHandshake, diagnoseIspThrottling, maskIp } from './osint.js';
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
export class WorkflowAutomationEngine {
    goals;
    strategies;
    executionHistory;
    maxHistorySize = 100;
    constructor() {
        this.goals = new Map();
        this.strategies = new Map();
        this.executionHistory = [];
        this.initializeDefaultStrategies();
    }
    /**
     * Initialize default automation strategies
     */
    initializeDefaultStrategies() {
        // Complete Security Assessment Strategy
        this.strategies.set('complete-security-audit', {
            name: 'Complete Security Assessment',
            description: 'Comprehensive security assessment including reconnaissance, vulnerability scanning, exploitation testing, and reporting',
            goals: [
                {
                    id: 'recon-objective',
                    name: 'Reconnaissance Objective',
                    description: 'Gather comprehensive intelligence about target',
                    category: 'recon',
                    priority: 'critical',
                    status: 'pending',
                    totalSteps: 5,
                    completedSteps: [],
                    progress: 0
                },
                {
                    id: 'vulnerability-assessment',
                    name: 'Vulnerability Assessment',
                    description: 'Identify and analyze security vulnerabilities',
                    category: 'security',
                    priority: 'critical',
                    status: 'pending',
                    totalSteps: 4,
                    completedSteps: [],
                    progress: 0
                },
                {
                    id: 'exploitation-testing',
                    name: 'Exploitation Testing',
                    description: 'Test identified vulnerabilities safely',
                    category: 'security',
                    priority: 'high',
                    status: 'pending',
                    totalSteps: 3,
                    completedSteps: [],
                    progress: 0
                },
                {
                    id: 'report-generation',
                    name: 'Report Generation',
                    description: 'Create comprehensive security assessment report',
                    category: 'reporting',
                    priority: 'medium',
                    status: 'pending',
                    totalSteps: 2,
                    completedSteps: [],
                    progress: 0
                }
            ],
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
                    timeoutMinutes: 45,
                    parallelExecution: true,
                    maxConcurrency: 5
                },
                {
                    id: 'targeted-exploitation',
                    name: 'Targeted Exploitation Testing',
                    description: 'Test specific vulnerabilities with controlled exploitation',
                    tool: 'run_nuclei',
                    parameters: { templates: 'cves,exposures' },
                    timeoutMinutes: 30,
                    retryOnFailure: true,
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
        this.strategies.set('rapid-intelligence', {
            name: 'Rapid Intelligence Gathering',
            description: 'Quick intelligence collection from multiple sources',
            goals: [
                {
                    id: 'osint-collection',
                    name: 'OSINT Collection',
                    description: 'Gather open-source intelligence quickly',
                    category: 'intelligence',
                    priority: 'high',
                    status: 'pending',
                    totalSteps: 3,
                    completedSteps: [],
                    progress: 0
                },
                {
                    id: 'web-search',
                    name: 'Comprehensive Web Search',
                    description: 'Search across multiple engines for intelligence',
                    category: 'intelligence',
                    priority: 'high',
                    status: 'pending',
                    totalSteps: 2,
                    completedSteps: [],
                    progress: 0
                },
                {
                    id: 'threat-analysis',
                    name: 'Threat Analysis',
                    description: 'Analyze current threats and security landscape',
                    category: 'intelligence',
                    priority: 'medium',
                    status: 'pending',
                    totalSteps: 2,
                    completedSteps: [],
                    progress: 0
                }
            ],
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
        this.strategies.set('privacy-first-operations', {
            name: 'Privacy-First Operations',
            description: 'Execute all operations with maximum anonymity protection',
            goals: [
                {
                    id: 'anonymity-enforcement',
                    name: 'Anonymity Enforcement',
                    description: 'Ensure complete anonymity before any operations',
                    category: 'privacy',
                    priority: 'critical',
                    status: 'pending',
                    totalSteps: 1,
                    completedSteps: [],
                    progress: 0
                }
            ],
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
        this.strategies.set('bug-bounty', {
            name: 'Bug Bounty Hunting',
            description: 'Systematic vulnerability discovery for bug bounty programs',
            goals: [
                {
                    id: 'vulnerability-discovery',
                    name: 'Vulnerability Discovery',
                    description: 'Find new vulnerabilities using various techniques',
                    category: 'security',
                    priority: 'high',
                    status: 'pending',
                    totalSteps: 4,
                    completedSteps: [],
                    progress: 0
                },
                {
                    id: 'vulnerability-validation',
                    name: 'Vulnerability Validation',
                    description: 'Validate and document discovered vulnerabilities',
                    category: 'security',
                    priority: 'high',
                    status: 'pending',
                    totalSteps: 3,
                    completedSteps: [],
                    progress: 0
                },
                {
                    id: 'proof-of-concept',
                    name: 'Proof of Concept',
                    description: 'Create working proof of concept for vulnerabilities',
                    category: 'exploitation',
                    priority: 'medium',
                    status: 'pending',
                    totalSteps: 2,
                    completedSteps: [],
                    progress: 0
                },
                {
                    id: 'bounty-report',
                    name: 'Bounty Report Generation',
                    description: 'Create professional bug bounty report',
                    category: 'reporting',
                    priority: 'medium',
                    status: 'pending',
                    totalSteps: 2,
                    completedSteps: [],
                    progress: 0
                }
            ],
            steps: [
                {
                    id: 'comprehensive-scan',
                    name: 'Comprehensive Vulnerability Scan',
                    description: 'Multi-tool vulnerability scanning',
                    tool: 'parallel_scan',
                    parameters: { tools: 'run_nuclei,nmap_scan,searchsploit_query' },
                    timeoutMinutes: 60,
                    parallelExecution: true,
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
    async executeStrategy(strategyId, target = '', parameters = {}) {
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
        const result = {
            success: true,
            goals: strategy.goals.map(goal => ({ ...goal, status: 'running', startTime, progress: 0 })),
            completedSteps: [],
            artifacts: [],
            summary: `Executing ${strategy.name} automation strategy`,
            duration: 0,
            errors: [],
            recommendations: [],
            nextActions: []
        };
        try {
            // Execute all steps in the strategy
            for (const step of strategy.steps) {
                const stepResult = await this.executeStep(step, target, parameters);
                // Update progress
                this.updateGoalProgress(strategy.goals, step.id, stepResult);
                // Add artifacts if any
                if (stepResult.artifacts) {
                    result.artifacts.push(...stepResult.artifacts);
                }
                // Handle step failure
                if (!stepResult.success && step.retryOnFailure) {
                    result.errors.push(`Step ${step.name} failed: ${stepResult.error}`);
                    // Continue with next step if continueOnError is true
                    if (!step.continueOnError) {
                        break;
                    }
                }
            }
            // Mark strategy as completed
            strategy.goals.forEach(goal => {
                goal.status = this.calculateGoalStatus(goal);
                goal.endTime = new Date();
                goal.progress = 100;
            });
            result.duration = new Date().getTime() - startTime.getTime();
            result.summary = `Completed ${strategy.name} strategy in ${result.duration}ms`;
            result.completedSteps = strategy.steps.map(step => ({ ...step, status: 'completed' }));
            return result;
        }
        catch (error) {
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
    async executeStep(step, target, parameters = {}) {
        console.log(`🔄 Executing step: ${step.name}`);
        try {
            let artifacts = [];
            let success = true;
            let error;
            switch (step.tool) {
                case 'quick_anonymous_setup':
                    const result = await quickAnonymousSetup();
                    success = result.includes('✅') || result.includes('completed');
                    if (!success) {
                        error = result;
                    }
                    break;
                case 'full_anonymous_workflow':
                    const result = await fullAnonymousWorkflow(target, 'anonymous');
                    success = result.includes('completed') || result.includes('✅');
                    if (!success) {
                        error = result;
                    }
                    break;
                case 'quick_anonymous_recon':
                    const result = await quickAnonymousRecon(target);
                    success = result.includes('completed') || result.includes('✅');
                    if (!success) {
                        error = result;
                    }
                    break;
                case 'parallel_scan':
                    const tools = step.parameters?.tools || 'run_nuclei,nmap_scan,searchsploit_query';
                    const result = await parallelScan(target);
                    success = result.includes('completed') || result.includes('✅');
                    if (!success) {
                        error = result;
                    }
                    artifacts = [`Parallel scan results for ${target}`];
                    break;
                case 'run_nuclei':
                    const templates = step.parameters?.templates || 'cves,exposures';
                    const result = await runNuclei(target);
                    success = result.includes('completed') || result.includes('✅');
                    if (!success) {
                        error = result;
                    }
                    artifacts = [`Nuclei scan results for ${target}`];
                    break;
                case 'nmap_scan':
                    const result = await nmapScan(target);
                    success = result.includes('completed') || result.includes('✅');
                    if (!success) {
                        error = result;
                    }
                    artifacts = [`Nmap scan results for ${target}`];
                    break;
                case 'searchsploit_query':
                    const query = step.parameters?.query || target;
                    const result = await searchsploitQuery(query);
                    success = result.includes('completed') || result.includes('✅');
                    if (!success) {
                        error = result;
                    }
                    artifacts = [`Exploit search results for ${query}`];
                    break;
                case 'osint_recon':
                    const result = await osintRecon(target);
                    success = result.includes('completed') || result.includes('✅');
                    if (!success) {
                        error = result;
                    }
                    artifacts = [`OSINT results for ${target}`];
                    break;
                case 'intelligence_search':
                    const query = step.parameters?.query || target;
                    const options = step.parameters || {};
                    const result = await intelligenceSearch(query, options);
                    success = result.includes('completed') || result.includes('✅');
                    if (!success) {
                        error = result;
                    }
                    artifacts = [`Intelligence search results for ${query}`];
                    break;
                case 'generate_report':
                    const format = step.parameters?.format || 'detailed';
                    const includeEvidence = step.parameters?.includeEvidence !== false;
                    const result = await generateReport('Automation completed', {
                        format,
                        includeEvidence,
                        findings: 'Multiple tools executed via automation',
                        recommendations: ['Review all generated artifacts']
                    });
                    success = result.includes('completed') || result.includes('✅');
                    if (!success) {
                        error = result;
                    }
                    artifacts = [`Security assessment report generated`];
                    break;
                case 'generate_bot_script':
                    const language = step.parameters?.language || 'python';
                    const includeTemplate = step.parameters?.includeTemplate !== false;
                    const result = await generateBotScript('Automated exploitation script', language);
                    success = result.includes('generated') || result.includes('✅');
                    if (!success) {
                        error = result;
                    }
                    artifacts = [`Bot script generated: ${language}`];
                    break;
                default:
                    return {
                        success: false,
                        error: `Unknown tool: ${step.tool}`
                    };
            }
            // Apply timeout if specified
            if (step.timeoutMinutes) {
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error(`Step ${step.name} timed out after ${step.timeoutMinutes} minutes`)), step.timeoutMinutes * 60 * 1000);
                });
                try {
                    await Promise.race([Promise, timeoutPromise]);
                }
                catch (timeoutError) {
                    success = false;
                    error = `Step ${step.name} timed out`;
                }
            }
            return { success, artifacts, error };
        }
        catch (error) {
            return {
                success: false,
                error: `Step execution error: ${error.message}`
            };
        }
    }
    /**
     * Update goal progress
     */
    updateGoalProgress(goals, stepId, stepResult) {
        goals.forEach(goal => {
            if (goal.id && goal.steps.includes(stepId)) {
                if (stepResult.success) {
                    goal.completedSteps.push(stepId);
                    goal.progress = Math.round((goal.completedSteps.length / goal.totalSteps) * 100);
                }
                if (stepResult.artifacts) {
                    goal.artifacts.push(...stepResult.artifacts);
                }
                if (stepResult.error) {
                    goal.status = 'failed';
                }
            }
        });
    }
    /**
     * Calculate goal status
     */
    calculateGoalStatus(goal) {
        if (goal.status === 'failed') {
            return 'failed';
        }
        else if (goal.completedSteps.length === goal.totalSteps) {
            return 'completed';
        }
        else if (goal.completedSteps.length > 0) {
            return 'running';
        }
        else {
            return 'pending';
        }
    }
    /**
     * Get available strategies
     */
    getAvailableStrategies() {
        return Array.from(this.strategies.keys());
    }
    /**
     * Get strategy details
     */
    getStrategy(strategyId) {
        return this.strategies.get(strategyId);
    }
    /**
     * Get execution history
     */
    getExecutionHistory() {
        return [...this.executionHistory];
    }
    /**
     * Clear execution history
     */
    clearExecutionHistory() {
        this.executionHistory = [];
        console.log('🧹 Automation execution history cleared');
    }
    /**
     * Generate comprehensive automation report
     */
    generateAutomationReport() {
        const history = this.getExecutionHistory();
        if (history.length === 0) {
            return `
╔════════════════════════════════════════╗
║                  AUTOMATION REPORT                        ║
╚═════════════════════════════════════════

NO AUTOMATION HISTORY AVAILABLE

═════════════════════════════════════════

Available Strategies:
${Array.from(this.strategies.keys()).map(id => {
                const strategy = this.strategies.get(id);
                return `• ${strategy.name} - ${strategy.description}`;
            }).join('\n')}

═════════════════════════════════════════

Use 'execute_strategy' to run any available strategy.
Report Generated: ${new Date().toISOString()}
`;
        }
        const report = `
╔══════════════════════════════════════╗
║                  AUTOMATION REPORT                        ║
╚═════════════════════════════════════════

EXECUTION SUMMARY:
• Total Executions: ${history.length}
• Successful Executions: ${history.filter(r => r.success).length}
• Failed Executions: ${history.filter(r => !r.success).length}

═══════════════════════════════════════

RECENT EXECUTIONS:
${history.slice(-5).reverse().map((result, index) => {
            const status = result.success ? '✅' : '❌';
            const duration = result.duration;
            const strategy = this.strategies.get(result.strategyId || 'unknown');
            return `
${index + 1}. ${strategy?.name || 'Unknown Strategy'} ${status} (${Math.round(duration / 1000)}s)
   Target: ${result.goals.map(g => g.id).join(', ') || 'N/A'}
   Artifacts: ${result.artifacts?.length || 0} generated
   ${result.error ? `Error: ${result.error}` : ''}
`;
        }).join('\n')}

═══════════════════════════════════════

RECOMMENDATIONS:
• ${history.filter(r => !r.success).length > 0 ? 'Review failed executions and retry with corrected parameters' : 'All executions successful'}
• ${history.length > 0 ? 'Continue using automation strategies for complex workflows' : 'Start with basic automation strategies'}
• Use 'generateAutomationReport' for detailed analysis

═════════════════════════════════════
Report Generated: ${new Date().toISOString()}
`;
        return report;
    }
}
// Global automation engine instance
let automationEngine = null;
/**
 * Get or create automation engine
 */
export function getAutomationEngine() {
    if (!automationEngine) {
        automationEngine = new WorkflowAutomationEngine();
    }
    return automationEngine;
}
/**
 * Execute automation strategy
 */
export async function executeStrategy(strategyId, target = '', parameters = {}) {
    const engine = getAutomationEngine();
    return await engine.executeStrategy(strategyId, target, parameters);
}
/**
 * Get available strategies
 */
export function getAvailableStrategies() {
    const engine = getAutomationEngine();
    return engine.getAvailableStrategies();
}
/**
 * Get execution history
 */
export function getExecutionHistory() {
    const engine = getAutomationEngine();
    return engine.getExecutionHistory();
}
/**
 * Clear execution history
 */
export function clearExecutionHistory() {
    const engine = getAutomationEngine();
    engine.clearExecutionHistory();
}
/**
 * Generate automation report
 */
export function generateAutomationReport() {
    const engine = getAutomationEngine();
    return engine.generateAutomationReport();
}
/**
 * List available strategies
 */
export function listStrategies() {
    const engine = getAutomationEngine();
    const strategies = engine.getAvailableStrategies();
    return `
╔════════════════════════════════════════╗
║              AVAILABLE AUTOMATION STRATEGIES           ║
╚═════════════════════════════════════════

${strategies.map((id, index) => {
        const strategy = engine.getStrategy(id);
        return `${index + 1}. ${strategy?.name || 'Unknown'} - ${strategy?.description || 'No description available'}`;
    }).join('\n')}

═══════════════════════════════════════

Use 'execute_strategy' with any strategy ID to execute the automation.
Available Strategy IDs: ${strategies.join(', ')}

═════════════════════════════════════
Generated: ${new Date().toISOString()}
`;
}
/**
 * Quick automation - complete security assessment
 */
export async function quickCompleteSecurityAssessment(target) {
    return await executeStrategy('complete-security-audit', target);
}
/**
 * Quick automation - rapid intelligence gathering
 */
export async function quickRapidIntelligence(target) {
    return await executeStrategy('rapid-intelligence', target);
}
/**
 * Quick automation - privacy-first operations
 */
export async function quickPrivacyFirstOperations(target) {
    return await executeStrategy('privacy-first-operations', target);
}
/**
 * Quick automation - bug bounty hunting
 */
export async function quickBugBountyHunt(target) {
    return await executeStrategy('bug-bounty', target);
}
//# sourceMappingURL=workflow_automation.js.map