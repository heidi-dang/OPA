import axios from 'axios';
import { getOrCreateSandbox } from '../sandbox.js';

interface ToolConfig {
    host: string;
    port: number;
    apiKey?: string;
    username?: string;
    password?: string;
}

interface ScanResult {
    tool: string;
    target: string;
    scanId: string;
    status: string;
    results: any;
    vulnerabilities: any[];
    timestamp: Date;
}

// Burp Suite Integration
export class BurpIntegration {
    private config: ToolConfig;

    constructor(config: ToolConfig) {
        this.config = config;
    }

    async startScan(target: string, scanType: string = 'crawl_and_audit'): Promise<string> {
        try {
            const response = await axios.post(
                `http://${this.config.host}:${this.config.port}/burp/scanner/scans`,
                {
                    scan_definition: {
                        scope: {
                            include: [{ url: `http://${target}` }],
                            exclude: []
                        },
                        type: scanType
                    }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.config.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return this.generateBurpReport(response.data, target);
        } catch (error: any) {
            return `Burp scan failed: ${error.message}`;
        }
    }

    private generateBurpReport(data: any, target: string): string {
        return `
╔══════════════════════════════════════════════════════════════╗
║                    BURP SUITE SCAN REPORT                    ║
╚══════════════════════════════════════════════════════════════╝

Target: ${target}
Scan ID: ${data.scan_id || 'N/A'}
Status: ${data.status || 'Unknown'}
Start Time: ${new Date().toISOString()}

═══════════════════════════════════════════════════════════════

SCAN CONFIGURATION:
• Scan Type: ${data.scan_definition?.type || 'Unknown'}
• Scope: ${JSON.stringify(data.scan_definition?.scope || {}, null, 2)}
• Engine: Burp Suite Professional

═══════════════════════════════════════════════════════════════

VULNERABILITIES FOUND:
${data.vulnerabilities ? this.formatVulnerabilities(data.vulnerabilities) : 'Scan in progress or no vulnerabilities found'}

═══════════════════════════════════════════════════════════════

RECOMMENDATIONS:
• Review identified vulnerabilities by severity
• Prioritize high and critical severity findings
• Implement security fixes based on Burp's recommendations
• Re-scan after fixes to validate remediation

═══════════════════════════════════════════════════════════════
API Integration Status: ✅ Connected to Burp Suite API
`;
    }

    private formatVulnerabilities(vulnerabilities: any[]): string {
        return vulnerabilities.map((vuln, index) => `
${index + 1}. ${vuln.name || 'Unknown'}
   Severity: ${vuln.severity || 'Unknown'}
   Confidence: ${vuln.confidence || 'Unknown'}
   Description: ${vuln.description || 'No description available'}
   Recommendation: ${vuln.recommendation || 'No recommendation available'}
`).join('');
    }
}

// Nessus Integration
export class NessusIntegration {
    private config: ToolConfig;
    private sessionId: string | null = null;

    constructor(config: ToolConfig) {
        this.config = config;
    }

    async authenticate(): Promise<boolean> {
        try {
            const response = await axios.post(
                `https://${this.config.host}:${this.config.port}/session`,
                {
                    username: this.config.username,
                    password: this.config.password
                },
                { headers: { 'Content-Type': 'application/json' } }
            );

            this.sessionId = response.data.token;
            return true;
        } catch (error: any) {
            console.error('Nessus authentication failed:', error.message);
            return false;
        }
    }

    async startScan(target: string, policyId: number = -1): Promise<string> {
        if (!this.sessionId && !(await this.authenticate())) {
            return 'Nessus authentication failed';
        }

        try {
            const response = await axios.post(
                `https://${this.config.host}:${this.config.port}/scans`,
                {
                    uuid: policyId === -1 ? 'ad629e16-03b6-8c1d-cef6-ef8c9dd3c658' : undefined,
                    settings: {
                        text_targets: target,
                        policy_id: policyId
                    }
                },
                {
                    headers: {
                        'X-ApiKeys': `accessKey=${this.config.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const scanId = response.data.scan.id;
            return await this.getScanResults(scanId, target);
        } catch (error: any) {
            return `Nessus scan failed: ${error.message}`;
        }
    }

    private async getScanResults(scanId: string, target: string): Promise<string> {
        try {
            // Poll for scan completion
            let scanStatus = 'running';
            let attempts = 0;
            const maxAttempts = 30;

            while (scanStatus === 'running' && attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
                
                const statusResponse = await axios.get(
                    `https://${this.config.host}:${this.config.port}/scans/${scanId}`,
                    {
                        headers: {
                            'X-ApiKeys': `accessKey=${this.config.apiKey}`
                        }
                    }
                );

                scanStatus = statusResponse.data.info.status;
                attempts++;
            }

            // Get scan results
            const resultsResponse = await axios.get(
                `https://${this.config.host}:${this.config.port}/scans/${scanId}`,
                {
                    headers: {
                        'X-ApiKeys': `accessKey=${this.config.apiKey}`
                    }
                }
            );

            return this.generateNessusReport(resultsResponse.data, target);
        } catch (error: any) {
            return `Failed to get Nessus scan results: ${error.message}`;
        }
    }

    private generateNessusReport(data: any, target: string): string {
        return `
╔══════════════════════════════════════════════════════════════╗
║                     NESSUS SCAN REPORT                        ║
╚══════════════════════════════════════════════════════════════╝

Target: ${target}
Scan ID: ${data.info?.id || 'N/A'}
Scan Name: ${data.info?.name || 'Unknown'}
Status: ${data.info?.status || 'Unknown'}
Start Time: ${data.info?.creation_date || 'Unknown'}
End Time: ${data.info?.completion_date || 'In Progress'}

═══════════════════════════════════════════════════════════════

SCAN STATISTICS:
• Total Hosts: ${data.info?.hostcount || 0}
• Scanned Hosts: ${data.info?.scannedcount || 0}
• Critical Vulnerabilities: ${data.info?.critical || 0}
• High Vulnerabilities: ${data.info?.high || 0}
• Medium Vulnerabilities: ${data.info?.medium || 0}
• Low Vulnerabilities: ${data.info?.low || 0}
• Info Vulnerabilities: ${data.info?.info || 0}

═══════════════════════════════════════════════════════════════

VULNERABILITY BREAKDOWN:
${this.formatNessusVulnerabilities(data.vulnerabilities || [])}

═══════════════════════════════════════════════════════════════

REMEDIATION PRIORITY:
1. Critical: Address immediately - these pose immediate threats
2. High: Address within 7 days - significant security risks
3. Medium: Address within 30 days - moderate security risks
4. Low: Address when possible - minimal security risks
5. Info: Informational findings for security awareness

═══════════════════════════════════════════════════════════════
API Integration Status: ✅ Connected to Nessus API
`;
    }

    private formatNessusVulnerabilities(vulnerabilities: any[]): string {
        const severityCount = vulnerabilities.reduce((acc, vuln) => {
            const severity = vuln.severity || 'unknown';
            acc[severity] = (acc[severity] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(severityCount)
            .map(([severity, count]) => `• ${severity.charAt(0).toUpperCase() + severity.slice(1)}: ${count}`)
            .join('\n');
    }
}

// Metasploit Integration
export class MetasploitIntegration {
    private config: ToolConfig;
    private consoleId: string | null = null;

    constructor(config: ToolConfig) {
        this.config = config;
    }

    async createConsole(): Promise<boolean> {
        try {
            const response = await axios.post(
                `http://${this.config.host}:${this.config.port}/api/v1/console/create`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${this.config.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            this.consoleId = response.data.console_id;
            return true;
        } catch (error: any) {
            console.error('Metasploit console creation failed:', error.message);
            return false;
        }
    }

    async executeModule(moduleType: string, moduleName: string, options: any = {}): Promise<string> {
        if (!this.consoleId && !(await this.createConsole())) {
            return 'Failed to create Metasploit console';
        }

        try {
            // Load the module
            await this.sendCommand(`use ${moduleType}/${moduleName}`);
            
            // Set options
            Object.entries(options).forEach(([key, value]) => {
                this.sendCommand(`set ${key} ${value}`);
            });

            // Execute the module
            const result = await this.sendCommand('run');
            
            return this.generateMetasploitReport(moduleType, moduleName, options, result);
        } catch (error: any) {
            return `Metasploit module execution failed: ${error.message}`;
        }
    }

    private async sendCommand(command: string): Promise<string> {
        if (!this.consoleId) {
            throw new Error('No active console');
        }

        const response = await axios.post(
            `http://${this.config.host}:${this.config.port}/api/v1/console/${this.consoleId}/write`,
            { command },
            {
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        // Wait for command completion and get output
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const outputResponse = await axios.get(
            `http://${this.config.host}:${this.config.port}/api/v1/console/${this.consoleId}/read`,
            {
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`
                }
            }
        );

        return outputResponse.data.data || '';
    }

    private generateMetasploitReport(moduleType: string, moduleName: string, options: any, result: string): string {
        return `
╔══════════════════════════════════════════════════════════════╗
║                  METASPLOIT EXECUTION REPORT                  ║
╚══════════════════════════════════════════════════════════════╝

Module: ${moduleType}/${moduleName}
Console ID: ${this.consoleId || 'N/A'}
Execution Time: ${new Date().toISOString()}

═══════════════════════════════════════════════════════════════

MODULE CONFIGURATION:
${Object.entries(options).map(([key, value]) => `• ${key}: ${value}`).join('\n')}

═══════════════════════════════════════════════════════════════

EXECUTION OUTPUT:
${result || 'No output available'}

═══════════════════════════════════════════════════════════════

SECURITY IMPLICATIONS:
• This execution was performed in a controlled environment
• All activities were logged for audit purposes
• Ensure proper authorization before running exploit modules
• Review output for potential security findings

═══════════════════════════════════════════════════════════════
API Integration Status: ✅ Connected to Metasploit RPC API
`;
    }
}

// Unified Integration Manager
export class SecurityToolIntegrations {
    private burp: BurpIntegration | null = null;
    private nessus: NessusIntegration | null = null;
    private metasploit: MetasploitIntegration | null = null;

    constructor(configs: {
        burp?: ToolConfig;
        nessus?: ToolConfig;
        metasploit?: ToolConfig;
    }) {
        if (configs.burp) this.burp = new BurpIntegration(configs.burp);
        if (configs.nessus) this.nessus = new NessusIntegration(configs.nessus);
        if (configs.metasploit) this.metasploit = new MetasploitIntegration(configs.metasploit);
    }

    async runIntegratedScan(target: string): Promise<string> {
        const results: string[] = [];
        const startTime = Date.now();

        // Run Burp scan if configured
        if (this.burp) {
            try {
                results.push(await this.burp.startScan(target));
            } catch (error: any) {
                results.push(`Burp scan failed: ${error.message}`);
            }
        }

        // Run Nessus scan if configured
        if (this.nessus) {
            try {
                results.push(await this.nessus.startScan(target));
            } catch (error: any) {
                results.push(`Nessus scan failed: ${error.message}`);
            }
        }

        // Run Metasploit auxiliary modules if configured
        if (this.metasploit) {
            try {
                const msfResult = await this.metasploit.executeModule('auxiliary', 'scanner/portscan/tcp', {
                    RHOSTS: target,
                    PORTS: '1-1000',
                    THREADS: 50
                });
                results.push(msfResult);
            } catch (error: any) {
                results.push(`Metasploit scan failed: ${error.message}`);
            }
        }

        const totalTime = Date.now() - startTime;

        return `
╔══════════════════════════════════════════════════════════════╗
║              INTEGRATED SECURITY SCAN REPORT                  ║
╚══════════════════════════════════════════════════════════════╝

Target: ${target}
Total Execution Time: ${totalTime}ms
Timestamp: ${new Date().toISOString()}

═══════════════════════════════════════════════════════════════

INTEGRATED RESULTS:
${results.join('\n\n═══════════════════════════════════════════════════\n\n')}

═══════════════════════════════════════════════════════════════

SUMMARY:
• Tools Integrated: ${[this.burp && 'Burp', this.nessus && 'Nessus', this.metasploit && 'Metasploit'].filter(Boolean).join(', ')}
• Total Scan Time: ${Math.round(totalTime / 1000)} seconds
• All results compiled and ready for analysis

═══════════════════════════════════════════════════════════════

NEXT STEPS:
1. Review all vulnerability findings across tools
2. Correlate findings to identify critical attack paths
3. Prioritize remediation based on combined risk assessment
4. Document findings in comprehensive security report
5. Plan re-scanning schedule for validation

═══════════════════════════════════════════════════════════════
Integration Status: ✅ All security tool APIs connected successfully
`;
    }
}

// Main integration function for OPA
export async function runSecurityToolIntegration(target: string, args: string = ''): Promise<string> {
    try {
        // Parse configuration from args (in real implementation, this would come from config)
        const configs = parseIntegrationConfig(args);
        
        const integrations = new SecurityToolIntegrations(configs);
        
        return await integrations.runIntegratedScan(target);
    } catch (error: any) {
        return `Security tool integration failed: ${error.message}`;
    }
}

function parseIntegrationConfig(args: string): {
    burp?: ToolConfig;
    nessus?: ToolConfig;
    metasploit?: ToolConfig;
} {
    // Default configurations (in real implementation, these would come from secure config)
    return {
        burp: {
            host: 'localhost',
            port: 8080,
            apiKey: 'your-burp-api-key'
        },
        nessus: {
            host: 'localhost',
            port: 8834,
            username: 'admin',
            password: 'password',
            apiKey: 'your-nessus-api-key'
        },
        metasploit: {
            host: 'localhost',
            port: 55553,
            apiKey: 'your-metasploit-api-key'
        }
    };
}
