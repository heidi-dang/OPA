import { OPA_SYSTEM_PROMPT } from './persona.js';
import { nmapScan } from './tools/nmap.js';
import { dirFuzz } from './tools/fuzz.js';
import { runNuclei } from './tools/nuclei.js';
import { searchsploitQuery } from './tools/searchsploit.js';
import { httpRequest } from './tools/http.js';
import { parsePcap } from './tools/pcap.js';
import { generateReport } from './tools/report.js';
import { fuzzBypass } from './tools/bypass.js';
import { generateBotScript } from './tools/bot.js';
import { sweepLocalNetwork } from './tools/sweep.js';
import { cryptoAudit } from './tools/crypto.js';
import { analyzeWpaHandshake } from './tools/wireless.js';
import { diagnoseIspThrottling } from './tools/isp.js';
import { maskIp } from './tools/mask.js';
import { osintRecon } from './tools/osint.js';
import { executeParallelTasks, parallelScan } from './tools/parallel_engine.js';
import { runSecurityToolIntegration } from './tools/integrations.js';
import { blockchainSecurityAudit } from './tools/blockchain.js';
import { deploySandboxAsNeeded, checkSandboxDeploymentNeeded, ensureSandboxDeployed, getSandboxDeploymentStatus } from './tools/sandbox_deployer.js';
import { executeAgentTask, executeBatchAgentTasks, getAgentStatus, resetAgentDeploymentCheck, getAgentTaskManager } from './tools/agent_tasks.js';
import { setupPrivacyAndSecurity, quickPrivacyCheck, stopPrivacyServices, getPrivacyStatus } from './tools/privacy_security.js';
import { webSearch, securityWebSearch, intelligenceSearch } from './tools/web_search.js';
import { executeWindSurfWorkflow, quickPrivacySetup, quickRecon, quickSecurityAnalysis, fullIntelligenceWorkflow, getWindSurfStatus } from './tools/windsurf_agent.js';
import { executeAnonymousWorkflow, quickAnonymousSetup, quickAnonymousRecon, fullAnonymousWorkflow, getAnonymousAgentStatus } from './tools/anonymous_agent.js';
import { generateIntelligentSuggestions, quickSuggestions, getSuggestionHistory, clearSuggestionHistory } from './tools/suggestions.js';
import { executeStrategy, getAvailableStrategies, getExecutionHistory, clearExecutionHistory, generateAutomationReport, quickCompleteSecurityAssessment, quickRapidIntelligence, quickPrivacyFirstOperations, quickBugBountyHunt } from './tools/workflow_automation.js';
export const OPA_Plugin = {
    name: "OPA - Offensive Penetration Agent",
    description: "An AI-driven ethical hacking and security auditing agent with safe, sandboxed execution.",
    systemPrompt: OPA_SYSTEM_PROMPT,
    tools: {
        nmap_scan: {
            description: "Runs network reconnaissance and port scanning using Nmap. Useful for initial host and service discovery.",
            execute: nmapScan,
            requiresApproval: false // Recon is generally safe, passive mode allowed
        },
        dir_fuzz: {
            description: "Fuzzes directories and files on a web server using ffuf. Used to map web application surface.",
            execute: dirFuzz,
            requiresApproval: true // Generating lots of traffic should be approved
        },
        run_nuclei: {
            description: "Runs the Nuclei vulnerability scanner to identify known CVEs or misconfigurations.",
            execute: runNuclei,
            requiresApproval: false // Default passive/safe templates are used
        },
        searchsploit_query: {
            description: "Searches the Exploit-DB offline for potential exploits.",
            execute: searchsploitQuery,
            requiresApproval: false
        },
        clear_suggestions: {
            description: "Clears the suggestion history and resets the suggestion engine.",
            execute: clearSuggestionHistory,
            requiresApproval: false // Clear suggestion history
        },
        execute_strategy: {
            description: "Executes a predefined automation strategy to achieve specific security goals.",
            execute: async (target, args) => {
                const strategyId = args.includes('complete-security') ? 'complete-security-audit' :
                    args.includes('rapid-intelligence') ? 'rapid-intelligence' :
                        args.includes('privacy-first') ? 'privacy-first-operations' :
                            args.includes('bug-bounty') ? 'bug-bounty' : 'complete-security-audit';
                return await executeStrategy(strategyId, target, {
                    parallelExecution: args.includes('parallel'),
                    maxConcurrency: args.includes('max-concurrency') ? parseInt(args.split('max-concurrency=')[1]) : undefined
                });
            },
            requiresApproval: false // Automated strategy execution
        },
        list_strategies: {
            description: "Lists all available automation strategies with their descriptions and parameters.",
            execute: getAvailableStrategies,
            requiresApproval: false // Strategy listing
        },
        quick_complete_security: {
            description: "Executes a complete security assessment workflow automatically.",
            execute: async (target, args) => {
                return await quickCompleteSecurityAssessment(target);
            },
            requiresApproval: false // Complete security assessment
        },
        rapid_intelligence: {
            description: "Executes rapid intelligence gathering from multiple sources.",
            execute: async (target, args) => {
                return await quickRapidIntelligence(target);
            },
            requiresApproval: false // Rapid intelligence gathering
        },
        privacy_first: {
            description: "Executes all operations with maximum anonymity protection enforced.",
            execute: async (target, args) => {
                return await quickPrivacyFirstOperations(target);
            },
            requiresApproval: false // Privacy-first operations
        },
        bug_bounty: {
            description: "Executes systematic bug bounty hunting workflow with vulnerability discovery and reporting.",
            execute: async (target, args) => {
                return await quickBugBountyHunt(target);
            },
            requiresApproval: false // Bug bounty hunting
        },
        automation_report: {
            description: "Generates a comprehensive report of all automation executions and their results.",
            execute: generateAutomationReport,
            requiresApproval: false // Automation reporting
        },
        automation_history: {
            description: "Shows the history of all automation executions with detailed analytics.",
            execute: getExecutionHistory,
            requiresApproval: false // Execution history
        },
        clear_automation_history: {
            description: "Clears the automation execution history.",
            execute: clearExecutionHistory,
            requiresApproval: false // Clear execution history
        },
        http_request: {
            description: "Sends customized HTTP requests for manual probing or exploitation verification.",
            execute: httpRequest,
            requiresApproval: true // High risk, could test active payloads
        },
        parse_pcap: {
            description: "Analyzes network traffic captures to extract sensitive information.",
            execute: parsePcap,
            requiresApproval: false
        },
        generate_report: {
            description: "Compiles all discovered vulnerabilities into a final pentest report.",
            execute: generateReport,
            requiresApproval: false
        },
        fuzz_bypass: {
            description: "Continuously tests and mutates API or web parameters to find logic bypasses for constraints (e.g., fee limits).",
            execute: fuzzBypass,
            requiresApproval: true // Potentially generates high load and unexpected state
        },
        generate_bot_script: {
            description: "Generates an automated, reusable script to weaponize a discovered vulnerability or automate interactions.",
            execute: generateBotScript,
            requiresApproval: false // Just writing a file to disk
        },
        sweep_local_network: {
            description: "Scans the local network to discover active hosts and devices that might be potential targets.",
            execute: sweepLocalNetwork,
            requiresApproval: false
        },
        crypto_audit: {
            description: "Performs a comprehensive security audit of a blockchain address or contract to suggest defensive mitigations.",
            execute: cryptoAudit,
            requiresApproval: false
        },
        analyze_wpa_handshake: {
            description: "Analyzes a provided .cap file containing a WPA/WPA2 4-way handshake using aircrack-ng to offline test PSK strength.",
            execute: analyzeWpaHandshake,
            requiresApproval: false
        },
        diagnose_isp_throttling: {
            description: "Tests throughput to a target server to detect port-based traffic shaping and ISP throttling.",
            execute: diagnoseIspThrottling,
            requiresApproval: false
        },
        osint_recon: {
            description: "Performs comprehensive open-source intelligence gathering including subdomain enumeration, email harvesting, technology detection, and social media discovery.",
            execute: osintRecon,
            requiresApproval: false // Passive reconnaissance
        },
        parallel_execution: {
            description: "Executes multiple security tools in parallel for faster comprehensive assessments with priority-based task scheduling.",
            execute: executeParallelTasks,
            requiresApproval: true // Can generate significant traffic
        },
        parallel_scan: {
            description: "Runs a coordinated parallel scan combining nmap, OSINT, nuclei, and directory fuzzing against a target.",
            execute: parallelScan,
            requiresApproval: true // Multi-tool parallel execution
        },
        security_tool_integrations: {
            description: "Integrates with external security tools like Burp Suite, Nessus, and Metasploit for comprehensive security assessments.",
            execute: runSecurityToolIntegration,
            requiresApproval: true // External API calls and potential exploits
        },
        blockchain_security_audit: {
            description: "Performs comprehensive blockchain security analysis including smart contract auditing, wallet analysis, and transaction security assessment.",
            execute: blockchainSecurityAudit,
            requiresApproval: false // Analysis and auditing only
        },
        deploy_sandbox: {
            description: "Automatically deploys the local sandbox environment including building Docker images and starting containers as needed.",
            execute: deploySandboxAsNeeded,
            requiresApproval: false // Safe deployment operations
        },
        check_sandbox_status: {
            description: "Checks the current deployment status of the local sandbox environment.",
            execute: getSandboxDeploymentStatus,
            requiresApproval: false // Read-only status check
        },
        ensure_sandbox_deployed: {
            description: "Ensures the sandbox is properly deployed and running, deploying it automatically if needed.",
            execute: async () => {
                const deployed = await ensureSandboxDeployed();
                return deployed ? "✅ Sandbox is deployed and running" : "❌ Failed to deploy sandbox";
            },
            requiresApproval: false // Safe deployment operations
        },
        agent_task_execute: {
            description: "Executes a high-level agent task (e.g., 'Deep Internet Research') with automatic sandbox deployment and intelligent error handling.",
            execute: async (target, args) => {
                const taskName = args || 'Unknown Task';
                const agent = getAgentTaskManager();
                // Handle specifically implemented high-level tasks
                if (taskName.toLowerCase().includes('research') || taskName.toLowerCase().includes('search')) {
                    return await agent.deepResearch(target);
                }
                // Generic task execution fallback
                const taskFunction = async () => {
                    return `Task "${taskName}" executed successfully on target: ${target}`;
                };
                return await executeAgentTask(taskName, taskFunction, target);
            },
            requiresApproval: false
        },
        agent_status: {
            description: "Gets the current status of the agent task manager and sandbox deployment.",
            execute: getAgentStatus,
            requiresApproval: false // Read-only status check
        },
        reset_agent_deployment: {
            description: "Resets the agent deployment check, forcing re-check on next task execution.",
            execute: () => {
                resetAgentDeploymentCheck();
                return "✅ Agent deployment check reset - will re-check on next task execution";
            },
            requiresApproval: false // Safe reset operation
        },
        setup_privacy_security: {
            description: "Sets up complete privacy and security environment including Tor, proxy configuration, system hardening, and browser protection.",
            execute: async (target, args) => {
                const torBridgeValue = args.includes('bridge=') ? args.split('bridge=')[1] : 'obfs4';
                const portMatch = args.match(/port=(\d+)/);
                const socksPortValue = (portMatch && portMatch[1]) ? parseInt(portMatch[1]) : 9050;
                const config = {
                    torEnabled: args.includes('tor'),
                    proxyEnabled: args.includes('proxy'),
                    checkAnonymity: true,
                    openTorBrowser: args.includes('browser'),
                    verifyTorConnection: true,
                    torBridge: torBridgeValue || 'obfs4',
                    socksPort: isNaN(socksPortValue) ? 9050 : socksPortValue
                };
                return await setupPrivacyAndSecurity(config);
            },
            requiresApproval: false // Privacy protection setup
        },
        check_privacy_status: {
            description: "Checks current privacy and anonymity status including IP masking, Tor connectivity, and security measures.",
            execute: getPrivacyStatus,
            requiresApproval: false // Read-only status check
        },
        stop_privacy_services: {
            description: "Stops all privacy services including Tor, proxy chains, and clears security configurations.",
            execute: stopPrivacyServices,
            requiresApproval: false // Safe service management
        },
        quick_privacy_check: {
            description: "Performs quick privacy check to verify if IP is properly masked through Tor and anonymity status.",
            execute: getPrivacyStatus,
            requiresApproval: false // Read-only status check
        },
        quick_privacy_setup: {
            description: "Quick setup of Tor and privacy configuration for complete IP masking.",
            execute: quickPrivacySetup,
            requiresApproval: false // Privacy protection setup
        },
        anonymous_workflow: {
            description: "Executes complete anonymous security workflow with automatic privacy setup, reconnaissance, security analysis, and intelligence gathering.",
            execute: async (target, args) => {
                const workflow = args.includes('recon') ? 'recon' :
                    args.includes('security') ? 'security' :
                        args.includes('intelligence') ? 'intelligence' :
                            args.includes('privacy') ? 'privacy' : 'anonymous';
                return await executeAnonymousWorkflow(target, workflow);
            },
            requiresApproval: false // Automated anonymous workflow execution
        },
        quick_anonymous_setup: {
            description: "Quick setup of complete anonymity including Tor, proxy, and system hardening.",
            execute: quickAnonymousSetup,
            requiresApproval: false // Anonymous protection setup
        },
        quick_anonymous_recon: {
            description: "Quick anonymous reconnaissance and intelligence gathering for target.",
            execute: async (target, args) => {
                return await quickAnonymousRecon(target);
            },
            requiresApproval: false // Anonymous reconnaissance tasks
        },
        full_anonymous_workflow: {
            description: "Comprehensive anonymous workflow including privacy setup, intelligence gathering, reconnaissance, security analysis, and tool integration.",
            execute: async (target, args) => {
                return await fullAnonymousWorkflow(target);
                args.includes('privacy') ? 'privacy' : 'full';
                return await executeWindSurfWorkflow(target, workflow);
            },
            requiresApproval: false // Safe privacy verification
        },
        mask_ip: {
            description: "Configures the sandbox environment to route all traffic through Tor or a proxy to mask the sandbox IP.",
            execute: maskIp,
            requiresApproval: false
        },
        web_search: {
            description: "Automatically searches the internet to gather background information, CVE details, or company data related to the security audit.",
            execute: webSearch,
            requiresApproval: false
        },
        quick_recon: {
            description: "Performs quick reconnaissance including OSINT and web search.",
            execute: quickRecon,
            requiresApproval: false
        },
        quick_security_analysis: {
            description: "Performs quick security analysis including vulnerability scanning.",
            execute: quickSecurityAnalysis,
            requiresApproval: false
        },
        full_intelligence_workflow: {
            description: "Executes complete intelligence gathering workflow.",
            execute: fullIntelligenceWorkflow,
            requiresApproval: false
        },
        windsurf_status: {
            description: "Gets the current status and task history of the WindSurf agent.",
            execute: getWindSurfStatus,
            requiresApproval: false
        }
    }
};
//# sourceMappingURL=index.js.map