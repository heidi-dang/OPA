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
    };
};
//# sourceMappingURL=index.d.ts.map