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
import { deploySandboxAsNeeded, getSandboxDeploymentStatus } from './tools/sandbox_deployer.js';
import { getAgentStatus } from './tools/agent_tasks.js';
export declare const OPA_Plugin: {
    name: string;
    description: string;
    systemPrompt: string;
    tools: {
        nmap_scan: {
            description: string;
            execute: typeof nmapScan;
            requiresApproval: boolean;
        };
        dir_fuzz: {
            description: string;
            execute: typeof dirFuzz;
            requiresApproval: boolean;
        };
        run_nuclei: {
            description: string;
            execute: typeof runNuclei;
            requiresApproval: boolean;
        };
        searchsploit_query: {
            description: string;
            execute: typeof searchsploitQuery;
            requiresApproval: boolean;
        };
        http_request: {
            description: string;
            execute: typeof httpRequest;
            requiresApproval: boolean;
        };
        parse_pcap: {
            description: string;
            execute: typeof parsePcap;
            requiresApproval: boolean;
        };
        generate_report: {
            description: string;
            execute: typeof generateReport;
            requiresApproval: boolean;
        };
        fuzz_bypass: {
            description: string;
            execute: typeof fuzzBypass;
            requiresApproval: boolean;
        };
        generate_bot_script: {
            description: string;
            execute: typeof generateBotScript;
            requiresApproval: boolean;
        };
        sweep_local_network: {
            description: string;
            execute: typeof sweepLocalNetwork;
            requiresApproval: boolean;
        };
        crypto_audit: {
            description: string;
            execute: typeof cryptoAudit;
            requiresApproval: boolean;
        };
        analyze_wpa_handshake: {
            description: string;
            execute: typeof analyzeWpaHandshake;
            requiresApproval: boolean;
        };
        diagnose_isp_throttling: {
            description: string;
            execute: typeof diagnoseIspThrottling;
            requiresApproval: boolean;
        };
        osint_recon: {
            description: string;
            execute: typeof osintRecon;
            requiresApproval: boolean;
        };
        parallel_execution: {
            description: string;
            execute: typeof executeParallelTasks;
            requiresApproval: boolean;
        };
        parallel_scan: {
            description: string;
            execute: typeof parallelScan;
            requiresApproval: boolean;
        };
        security_tool_integrations: {
            description: string;
            execute: typeof runSecurityToolIntegration;
            requiresApproval: boolean;
        };
        blockchain_security_audit: {
            description: string;
            execute: typeof blockchainSecurityAudit;
            requiresApproval: boolean;
        };
        deploy_sandbox: {
            description: string;
            execute: typeof deploySandboxAsNeeded;
            requiresApproval: boolean;
        };
        check_sandbox_status: {
            description: string;
            execute: typeof getSandboxDeploymentStatus;
            requiresApproval: boolean;
        };
        ensure_sandbox_deployed: {
            description: string;
            execute: () => Promise<"✅ Sandbox is deployed and running" | "❌ Failed to deploy sandbox">;
            requiresApproval: boolean;
        };
        agent_task_execute: {
            description: string;
            execute: (target: string, args: string) => Promise<string>;
            requiresApproval: boolean;
        };
        agent_status: {
            description: string;
            execute: typeof getAgentStatus;
            requiresApproval: boolean;
        };
        reset_agent_deployment: {
            description: string;
            execute: () => string;
            requiresApproval: boolean;
        };
        mask_ip: {
            description: string;
            execute: typeof maskIp;
            requiresApproval: boolean;
        };
    };
};
//# sourceMappingURL=index.d.ts.map