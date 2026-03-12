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
        }
    }
};
