export declare class SecurityAuditor {
    private projectRoot;
    private auditResults;
    constructor(projectRoot?: string);
    /**
     * Perform comprehensive security audit
     */
    performFullAudit(): Promise<string>;
    /**
     * Audit specific category
     */
    private auditCategory;
    /**
     * Audit type safety and TypeScript usage
     */
    private auditTypeSafety;
    /**
     * Audit input validation and sanitization
     */
    private auditInputValidation;
    /**
     * Audit authentication and authorization
     */
    private auditAuthentication;
    /**
     * Audit error handling and logging
     */
    private auditErrorHandling;
    /**
     * Audit data protection and privacy
     */
    private auditDataProtection;
    /**
     * Audit network security and communication
     */
    private auditNetworkSecurity;
    /**
     * Audit code quality and maintainability
     */
    private auditCodeQuality;
    /**
     * Audit dependencies for vulnerabilities
     */
    private auditDependencies;
    /**
     * Audit sandbox and execution security
     */
    private auditSandboxSecurity;
    /**
     * Audit MCP integration and API security
     */
    private auditMcpSecurity;
    /**
     * Audit configuration and secrets management
     */
    private auditConfigurationSecurity;
    /**
     * Get all TypeScript files in directory
     */
    private getTsFiles;
    /**
     * Find line number for pattern
     */
    private findLineNumber;
    /**
     * Get overall status based on issues
     */
    private getIssueStatus;
    /**
     * Calculate overall security score
     */
    private calculateOverallScore;
    /**
     * Generate comprehensive audit report
     */
    private generateAuditReport;
    /**
     * Generate security recommendations
     */
    private generateRecommendations;
    /**
     * Generate priority actions
     */
    private generatePriorityActions;
}
/**
 * Get or create security auditor
 */
export declare function getSecurityAuditor(): SecurityAuditor;
/**
 * Perform comprehensive security audit
 */
export declare function performSecurityAudit(): Promise<string>;
/**
 * Quick security audit with scoring
 */
export declare function quickSecurityAudit(): Promise<string>;
//# sourceMappingURL=security_audit.d.ts.map