export interface PrivacyConfig {
    torEnabled?: boolean;
    proxyEnabled?: boolean;
    checkAnonymity?: boolean;
    openTorBrowser?: boolean;
    verifyTorConnection?: boolean;
    torBridge?: string | undefined;
    socksPort?: number | undefined;
}
export declare class PrivacySecurityAgent {
    private config;
    constructor(config?: PrivacyConfig);
    /**
     * Complete privacy and security setup
     */
    setupPrivacyAndSecurity(): Promise<string>;
    /**
     * Setup Tor service
     */
    private setupTor;
    /**
     * Setup proxy configuration
     */
    private setupProxy;
    /**
     * Get current IP address
     */
    private getCurrentIP;
    /**
     * Get Tor IP address
     */
    private getTorIP;
    /**
     * Open Tor browser
     */
    private openTorBrowser;
    /**
     * Harden system security
     */
    private hardenSystem;
    /**
     * Generate comprehensive privacy report
     */
    private generatePrivacyReport;
    /**
     * Get privacy level based on score
     */
    private getPrivacyLevel;
    /**
     * Quick privacy check
     */
    quickPrivacyCheck(): Promise<string>;
    /**
     * Stop all privacy services
     */
    stopPrivacyServices(): Promise<string>;
}
/**
 * Get or create privacy agent
 */
export declare function getPrivacyAgent(config?: PrivacyConfig): PrivacySecurityAgent;
/**
 * Setup complete privacy and security environment
 */
export declare function setupPrivacyAndSecurity(config?: PrivacyConfig): Promise<string>;
/**
 * Quick privacy check
 */
export declare function quickPrivacyCheck(config?: PrivacyConfig): Promise<string>;
/**
 * Stop privacy services
 */
export declare function stopPrivacyServices(): Promise<string>;
/**
 * Get current privacy status
 */
export declare function getPrivacyStatus(): Promise<string>;
//# sourceMappingURL=privacy_security.d.ts.map