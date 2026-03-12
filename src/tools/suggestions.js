import { getAnonymousAgent, getAnonymousAgentStatus } from './anonymous_agent.js';
import { getPrivacyAgent } from './privacy_security.js';
import { getWebSearchAgent } from './web_search.js';
import { osintRecon } from './osint.js';
import { executeParallelTasks } from './parallel_engine.js';
export class IntelligentSuggestionEngine {
    suggestionHistory = [];
    maxHistorySize = 50;
    /**
     * Generate intelligent suggestions based on context
     */
    async generateSuggestions(context) {
        console.log('🧠 Generating intelligent suggestions...');
        const suggestions = [];
        try {
            // Analyze user intent and context
            const intent = await this.analyzeUserIntent(context);
            // Generate context-aware suggestions
            if (intent === 'recon') {
                suggestions.push(...this.generateReconSuggestions(context));
            }
            else if (intent === 'security') {
                suggestions.push(...this.generateSecuritySuggestions(context));
            }
            else if (intent === 'privacy') {
                suggestions.push(...this.generatePrivacySuggestions(context));
            }
            else if (intent === 'intelligence') {
                suggestions.push(...this.generateIntelligenceSuggestions(context));
            }
            else {
                suggestions.push(...this.generateGeneralSuggestions(context));
            }
            // Add system status suggestions
            suggestions.push(...this.generateSystemSuggestions(context));
            // Store in history
            this.addToHistory(suggestions);
            return suggestions.slice(0, 10); // Return top 10 suggestions
        }
        catch (error) {
            console.error('Suggestion generation failed:', error.message);
            return [{
                    id: 'suggestion-error',
                    title: 'Suggestion Generation Failed',
                    description: `Unable to generate suggestions: ${error.message}`,
                    category: 'troubleshooting',
                    priority: 'high',
                    action: 'retry',
                    reasoning: 'Error in suggestion engine, please try again',
                    estimatedTime: 0
                }];
        }
    }
    /**
     * Analyze user intent based on context
     */
    async analyzeUserIntent(context) {
        // Check current file and selection for clues
        if (context.currentFile) {
            const fileName = context.currentFile.toLowerCase();
            if (fileName.includes('nmap') || fileName.includes('scan') || fileName.includes('recon')) {
                return 'recon';
            }
            else if (fileName.includes('nuclei') || fileName.includes('vulnerability') || fileName.includes('exploit')) {
                return 'security';
            }
            else if (fileName.includes('tor') || fileName.includes('privacy') || fileName.includes('anonym')) {
                return 'privacy';
            }
            else if (fileName.includes('search') || fileName.includes('intelligence') || fileName.includes('osint')) {
                return 'intelligence';
            }
        }
        // Check recent tool usage
        if (context.recentTools) {
            const recentTools = context.recentTools.join(' ').toLowerCase();
            if (recentTools.includes('recon') || recentTools.includes('osint')) {
                return 'recon';
            }
            else if (recentTools.includes('security') || recentTools.includes('nuclei') || recentTools.includes('exploit')) {
                return 'security';
            }
            else if (recentTools.includes('privacy') || recentTools.includes('tor') || recentTools.includes('anonym')) {
                return 'privacy';
            }
            else if (recentTools.includes('search') || recentTools.includes('intelligence')) {
                return 'intelligence';
            }
        }
        // Check system status for context
        if (context.systemStatus) {
            const status = context.systemStatus.toLowerCase();
            if (status.includes('error') || status.includes('failed')) {
                return 'troubleshooting';
            }
            else if (status.includes('running') || status.includes('in progress')) {
                return 'general';
            }
        }
        // Default to general if no clear intent
        return 'general';
    }
    /**
     * Generate reconnaissance suggestions
     */
    generateReconSuggestions(context) {
        return [
            {
                id: 'recon-workflow',
                title: 'Start Anonymous Reconnaissance',
                description: 'Execute complete anonymous reconnaissance workflow with OSINT, network scanning, and intelligence gathering',
                category: 'workflow',
                priority: 'high',
                action: 'execute',
                parameters: { target: context.currentFile || 'target.com', workflow: 'recon' },
                reasoning: 'Based on your context, reconnaissance workflow would provide comprehensive intelligence gathering while maintaining anonymity',
                estimatedTime: 180
            },
            {
                id: 'quick-osint',
                title: 'Quick OSINT on Current Target',
                description: 'Gather open-source intelligence on the current file or selected target',
                category: 'tool',
                priority: 'high',
                action: 'execute',
                parameters: { target: context.currentSelection || 'current target' },
                reasoning: 'Quick OSINT can provide immediate intelligence on your current context',
                estimatedTime: 60
            },
            {
                id: 'network-scan',
                title: 'Scan Current Network',
                description: 'Perform network reconnaissance on the current target network',
                category: 'tool',
                priority: 'medium',
                action: 'execute',
                parameters: { target: 'auto-detect' },
                reasoning: 'Network scanning can identify hosts and services in your current environment',
                estimatedTime: 120
            },
            {
                id: 'parallel-recon',
                title: 'Parallel Reconnaissance',
                description: 'Execute multiple reconnaissance tools in parallel for comprehensive coverage',
                category: 'workflow',
                priority: 'high',
                action: 'execute',
                parameters: { tools: 'osint_recon,nmap_scan,sweep_local_network' },
                reasoning: 'Parallel execution can significantly speed up reconnaissance operations',
                estimatedTime: 300
            }
        ];
    }
    /**
     * Generate security suggestions
     */
    generateSecuritySuggestions(context) {
        return [
            {
                id: 'security-workflow',
                title: 'Start Security Analysis',
                description: 'Execute comprehensive security analysis workflow with vulnerability scanning and assessment',
                category: 'workflow',
                priority: 'high',
                action: 'execute',
                parameters: { target: context.currentFile || 'target.com', workflow: 'security' },
                reasoning: 'Security analysis workflow provides comprehensive vulnerability assessment',
                estimatedTime: 240
            },
            {
                id: 'vulnerability-scan',
                title: 'Quick Vulnerability Scan',
                description: 'Scan for vulnerabilities using nuclei and other security tools',
                category: 'tool',
                priority: 'high',
                action: 'execute',
                parameters: { target: context.currentSelection || 'target.com' },
                reasoning: 'Quick vulnerability scanning can identify immediate security issues',
                estimatedTime: 90
            },
            {
                id: 'nuclei-scan',
                title: 'Nuclei Template Scan',
                description: 'Run nuclei with specific templates for targeted vulnerability assessment',
                category: 'tool',
                priority: 'medium',
                action: 'execute',
                parameters: { target: context.currentSelection || 'target.com', templates: 'cves,exposures' },
                reasoning: 'Template-specific scanning can find particular vulnerability types',
                estimatedTime: 120
            },
            {
                id: 'parallel-security',
                title: 'Parallel Security Analysis',
                description: 'Execute multiple security tools in parallel for comprehensive assessment',
                category: 'workflow',
                priority: 'high',
                action: 'execute',
                parameters: { tools: 'run_nuclei,nmap_scan,searchsploit_query' },
                reasoning: 'Parallel security analysis provides faster, more comprehensive assessment',
                estimatedTime: 360
            }
        ];
    }
    /**
     * Generate privacy suggestions
     */
    generatePrivacySuggestions(context) {
        return [
            {
                id: 'privacy-setup',
                title: 'Setup Complete Anonymity',
                description: 'Configure Tor, proxy, and system hardening for maximum privacy protection',
                category: 'workflow',
                priority: 'critical',
                action: 'execute',
                parameters: { workflow: 'privacy' },
                reasoning: 'Complete privacy setup is essential before any security operations',
                estimatedTime: 300
            },
            {
                id: 'quick-anonymity',
                title: 'Quick Privacy Check',
                description: 'Verify current anonymity level and IP masking status',
                category: 'tool',
                priority: 'high',
                action: 'execute',
                reasoning: 'Quick privacy verification ensures your anonymity is working correctly',
                estimatedTime: 30
            },
            {
                id: 'tor-verification',
                title: 'Verify Tor Connection',
                description: 'Check Tor service status and IP masking effectiveness',
                category: 'tool',
                priority: 'medium',
                action: 'execute',
                reasoning: 'Tor verification ensures your anonymity is properly configured',
                estimatedTime: 60
            },
            {
                id: 'privacy-status',
                title: 'Privacy Status Report',
                description: 'Get comprehensive privacy and anonymity status report',
                category: 'tool',
                priority: 'medium',
                action: 'execute',
                reasoning: 'Privacy status report shows current anonymity level and recommendations',
                estimatedTime: 45
            }
        ];
    }
    /**
     * Generate intelligence suggestions
     */
    generateIntelligenceSuggestions(context) {
        return [
            {
                id: 'intelligence-workflow',
                title: 'Start Intelligence Gathering',
                description: 'Execute comprehensive intelligence gathering workflow with OSINT, web search, and analysis',
                category: 'workflow',
                priority: 'high',
                action: 'execute',
                parameters: { target: context.currentFile || 'target.com', workflow: 'intelligence' },
                reasoning: 'Intelligence workflow provides comprehensive information gathering from multiple sources',
                estimatedTime: 300
            },
            {
                id: 'comprehensive-search',
                title: 'Comprehensive Web Search',
                description: 'Search across multiple engines with CVE, news, and social media integration',
                category: 'tool',
                priority: 'high',
                action: 'execute',
                parameters: { query: context.currentSelection || 'target intelligence', includeCVE: true, includeNews: true },
                reasoning: 'Comprehensive search provides intelligence from multiple sources',
                estimatedTime: 120
            },
            {
                id: 'cve-research',
                title: 'CVE Database Research',
                description: 'Search for vulnerabilities and exploits related to current context',
                category: 'tool',
                priority: 'medium',
                action: 'execute',
                parameters: { query: context.currentSelection || 'vulnerability research' },
                reasoning: 'CVE research helps identify potential security issues',
                estimatedTime: 90
            },
            {
                id: 'threat-intel',
                title: 'Threat Intelligence',
                description: 'Gather threat intelligence and security news',
                category: 'tool',
                priority: 'medium',
                action: 'execute',
                parameters: { query: context.currentSelection || 'cybersecurity threats' },
                reasoning: 'Threat intelligence keeps you informed of current security landscape',
                estimatedTime: 60
            }
        ];
    }
    /**
     * Generate general suggestions
     */
    generateGeneralSuggestions(context) {
        return [
            {
                id: 'system-status',
                title: 'Check System Status',
                description: 'Get comprehensive status of anonymous agent and all systems',
                category: 'tool',
                priority: 'medium',
                action: 'execute',
                reasoning: 'System status provides overview of all components and recommendations',
                estimatedTime: 30
            },
            {
                id: 'task-history',
                title: 'View Task History',
                description: 'Review completed and failed tasks with detailed analytics',
                category: 'tool',
                priority: 'low',
                action: 'execute',
                reasoning: 'Task history helps track progress and identify patterns',
                estimatedTime: 15
            },
            {
                id: 'workflow-suggestions',
                title: 'Workflow Recommendations',
                description: 'Get intelligent workflow suggestions based on current context',
                category: 'configuration',
                priority: 'low',
                action: 'execute',
                reasoning: 'Workflow suggestions help optimize your security operations',
                estimatedTime: 20
            },
            {
                id: 'help-and-docs',
                title: 'Get Help & Documentation',
                description: 'Access comprehensive help documentation and usage examples',
                category: 'tool',
                priority: 'low',
                action: 'execute',
                reasoning: 'Documentation provides detailed guidance for all tools and workflows',
                estimatedTime: 10
            }
        ];
    }
    /**
     * Generate system status suggestions
     */
    generateSystemSuggestions(context) {
        const suggestions = [];
        if (context.systemStatus) {
            if (context.systemStatus.includes('error')) {
                suggestions.push({
                    id: 'troubleshoot-connection',
                    title: 'Troubleshoot Connection Issues',
                    description: 'Diagnose and resolve connection problems with OPA server',
                    category: 'troubleshooting',
                    priority: 'critical',
                    action: 'execute',
                    reasoning: 'Connection issues prevent tool usage and need immediate attention',
                    estimatedTime: 120
                });
            }
            if (context.systemStatus.includes('degraded')) {
                suggestions.push({
                    id: 'performance-optimization',
                    title: 'Optimize Performance',
                    description: 'Improve OPA performance and resource usage',
                    category: 'configuration',
                    priority: 'medium',
                    action: 'execute',
                    reasoning: 'Performance optimization can improve tool execution speed',
                    estimatedTime: 90
                });
            }
            suggestions.push({
                id: 'health-check',
                title: 'System Health Check',
                description: 'Run comprehensive system health and status verification',
                category: 'tool',
                priority: 'medium',
                action: 'execute',
                reasoning: 'Regular health checks ensure optimal system performance',
                estimatedTime: 60
            });
        }
        return suggestions;
    }
    /**
     * Add suggestions to history
     */
    addToHistory(suggestions) {
        this.suggestionHistory.push(...suggestions);
        // Keep only recent suggestions
        if (this.suggestionHistory.length > this.maxHistorySize) {
            this.suggestionHistory = this.suggestionHistory.slice(-this.maxHistorySize);
        }
    }
    /**
     * Get suggestion history
     */
    getSuggestionHistory() {
        return [...this.suggestionHistory];
    }
    /**
     * Clear suggestion history
     */
    clearSuggestionHistory() {
        this.suggestionHistory = [];
        console.log('🧹 Suggestion history cleared');
    }
    /**
     * Format suggestions for display
     */
    formatSuggestions(suggestions) {
        if (suggestions.length === 0) {
            return `
╔════════════════════════════════════════╗
║                    NO SUGGESTIONS AVAILABLE                ║
╚═════════════════════════════════════════════

Try:
• Selecting text in your editor
• Opening different file types
• Running any OPA tool first

═════════════════════════════════════════
`;
        }
        const categorizedSuggestions = suggestions.reduce((acc, suggestion) => {
            if (!acc[suggestion.category]) {
                acc[suggestion.category] = [];
            }
            acc[suggestion.category].push(suggestion);
            return acc;
        }, {});
        return `
╔════════════════════════════════════════╗
║                 INTELLIGENT SUGGESTIONS              ║
╚═══════════════════════════════════════════

${Object.entries(categorizedSuggestions).map(([category, categorySuggestions]) => `
════════════════════════════════════════
${category.toUpperCase()} SUGGESTIONS:
${categorySuggestions.map((suggestion, index) => `
${index + 1}. ${suggestion.title}
   Priority: ${suggestion.priority.toUpperCase()}
   Action: ${suggestion.action}
   Time: ~${suggestion.estimatedTime}s
   ${suggestion.description}
${suggestion.parameters ? `   Parameters: ${JSON.stringify(suggestion.parameters, null, 2)}` : ''}
   Reasoning: ${suggestion.reasoning}
`).join('\n')}
`).join('\n')}

═══════════════════════════════════════════

💡 **How to Use:**
• Click on any suggestion to execute it
• Suggestions are automatically generated based on your current context
• Use arrow keys to navigate between suggestions
• Press Esc to dismiss suggestions

═══════════════════════════════════════════
Generated: ${new Date().toISOString()}
`;
    }
}
// Global suggestion engine instance
let suggestionEngine = null;
/**
 * Get or create suggestion engine
 */
export function getSuggestionEngine() {
    if (!suggestionEngine) {
        suggestionEngine = new IntelligentSuggestionEngine();
    }
    return suggestionEngine;
}
/**
 * Generate intelligent suggestions
 */
export async function generateIntelligentSuggestions(context = {}) {
    const engine = getSuggestionEngine();
    const suggestions = await engine.generateSuggestions(context);
    return engine.formatSuggestions(suggestions);
}
/**
 * Get anonymous agent status
 */
export function getAnonymousAgentStatus() {
    const agent = getAnonymousAgent();
    return agent.getCurrentStatus();
}
/**
 * Get suggestion history
 */
export function getSuggestionHistory() {
    const engine = getSuggestionEngine();
    return engine.getSuggestionHistory();
}
/**
 * Clear suggestion history
 */
export function clearSuggestionHistory() {
    const engine = getSuggestionEngine();
    engine.clearSuggestionHistory();
}
/**
 * Quick suggestions for current context
 */
export async function quickSuggestions() {
    // Create minimal context for quick suggestions
    const context = {};
    const engine = getSuggestionEngine();
    const suggestions = await engine.generateSuggestions(context);
    return engine.formatSuggestions(suggestions);
}
//# sourceMappingURL=suggestions.js.map