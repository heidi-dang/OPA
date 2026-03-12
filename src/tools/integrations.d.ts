interface ToolConfig {
    host: string;
    port: number;
    apiKey?: string;
    username?: string;
    password?: string;
}
export declare class BurpIntegration {
    private config;
    constructor(config: ToolConfig);
    startScan(target: string, scanType?: string): Promise<string>;
    private generateBurpReport;
    private formatVulnerabilities;
}
export declare class NessusIntegration {
    private config;
    private sessionId;
    constructor(config: ToolConfig);
    authenticate(): Promise<boolean>;
    startScan(target: string, policyId?: number): Promise<string>;
    private getScanResults;
    private generateNessusReport;
    private formatNessusVulnerabilities;
}
export declare class MetasploitIntegration {
    private config;
    private consoleId;
    constructor(config: ToolConfig);
    createConsole(): Promise<boolean>;
    executeModule(moduleType: string, moduleName: string, options?: any): Promise<string>;
    private sendCommand;
    private generateMetasploitReport;
}
export declare class SecurityToolIntegrations {
    private burp;
    private nessus;
    private metasploit;
    constructor(configs: {
        burp?: ToolConfig;
        nessus?: ToolConfig;
        metasploit?: ToolConfig;
    });
    runIntegratedScan(target: string): Promise<string>;
}
export declare function runSecurityToolIntegration(target: string, args?: string): Promise<string>;
export {};
//# sourceMappingURL=integrations.d.ts.map