import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

interface SecurityAudit {
    category: string;
    score: number;
    maxScore: number;
    issues: SecurityIssue[];
    recommendations: string[];
    status: 'critical' | 'high' | 'medium' | 'low' | 'pass';
}

interface SecurityIssue {
    severity: 'critical' | 'high' | 'medium' | 'low';
    category: string;
    description: string;
    file: string;
    line?: number | undefined;
    recommendation: string;
    cwe?: string;
    owasp?: string;
}

export class SecurityAuditor {
    private projectRoot: string;
    private auditResults: Map<string, SecurityAudit>;

    constructor(projectRoot: string = process.cwd()) {
        this.projectRoot = projectRoot;
        this.auditResults = new Map();
    }

    /**
     * Perform comprehensive security audit
     */
    async performFullAudit(): Promise<string> {
        console.log('🔍 Starting comprehensive security audit...');
        
        const auditCategories = [
            'Type Safety & TypeScript',
            'Input Validation & Sanitization',
            'Authentication & Authorization',
            'Error Handling & Logging',
            'Data Protection & Privacy',
            'Network Security & Communication',
            'Code Quality & Maintainability',
            'Dependency Security & Vulnerabilities',
            'Sandbox & Execution Security',
            'MCP Integration & API Security',
            'Configuration & Secrets Management'
        ];

        const auditResults: SecurityAudit[] = [];

        for (const category of auditCategories) {
            console.log(`🔍 Auditing: ${category}`);
            const result = await this.auditCategory(category);
            auditResults.push(result);
        }

        // Calculate overall score
        const overallScore = this.calculateOverallScore(auditResults);
        const overallStatus = this.getOverallStatus(overallScore);

        return this.generateAuditReport(auditResults, overallScore, overallStatus);
    }

    /**
     * Audit specific category
     */
    private async auditCategory(category: string): Promise<SecurityAudit> {
        switch (category) {
            case 'Type Safety & TypeScript':
                return await this.auditTypeSafety();
            case 'Input Validation & Sanitization':
                return await this.auditInputValidation();
            case 'Authentication & Authorization':
                return await this.auditAuthentication();
            case 'Error Handling & Logging':
                return await this.auditErrorHandling();
            case 'Data Protection & Privacy':
                return await this.auditDataProtection();
            case 'Network Security & Communication':
                return await this.auditNetworkSecurity();
            case 'Code Quality & Maintainability':
                return await this.auditCodeQuality();
            case 'Dependency Security & Vulnerabilities':
                return await this.auditDependencies();
            case 'Sandbox & Execution Security':
                return await this.auditSandboxSecurity();
            case 'MCP Integration & API Security':
                return await this.auditMcpSecurity();
            case 'Configuration & Secrets Management':
                return await this.auditConfigurationSecurity();
            default:
                return {
                    category,
                    score: 0,
                    maxScore: 100,
                    issues: [],
                    recommendations: ['No audit available for this category'],
                    status: 'pass'
                };
        }
    }

    /**
     * Audit type safety and TypeScript usage
     */
    private async auditTypeSafety(): Promise<SecurityAudit> {
        const issues: SecurityIssue[] = [];
        let scoreDeduction = 0;

        try {
            // Check TypeScript configuration
            const tsConfigPath = join(this.projectRoot, 'tsconfig.json');
            if (statSync(tsConfigPath).isFile()) {
                const tsConfig = JSON.parse(readFileSync(tsConfigPath, 'utf-8'));
                
                // Check for unsafe TypeScript settings
                if (tsConfig.compilerOptions?.strict !== true) {
                    issues.push({
                        severity: 'medium',
                        category: 'Type Safety',
                        description: 'TypeScript strict mode is not enabled',
                        file: 'tsconfig.json',
                        recommendation: 'Enable strict mode for better type safety',
                        cwe: 'CWE-693: Improper Control of Resource Identifiers'
                    });
                    scoreDeduction += 10;
                }

                if (tsConfig.compilerOptions?.noImplicitAny === true) {
                    issues.push({
                        severity: 'high',
                        category: 'Type Safety',
                        description: 'Implicit any is allowed, which reduces type safety',
                        file: 'tsconfig.json',
                        recommendation: 'Disable implicit any for better type safety',
                        cwe: 'CWE-749: Exposed Dangerous Method or Function'
                    });
                    scoreDeduction += 15;
                }

                if (tsConfig.compilerOptions?.allowUnreachableCode === true) {
                    issues.push({
                        severity: 'medium',
                        category: 'Type Safety',
                        description: 'Unreachable code is allowed, which may hide bugs',
                        file: 'tsconfig.json',
                        recommendation: 'Disable allowUnreachableCode for better bug detection',
                        cwe: 'CWE-571: Expression is Always False'
                    });
                    scoreDeduction += 10;
                }
            }

            // Check for unsafe patterns in source files
            const srcDir = join(this.projectRoot, 'src');
            const files = this.getTsFiles(srcDir);
            
            for (const file of files) {
                const content = readFileSync(file, 'utf-8');
                
                // Check for unsafe eval usage
                if (content.includes('eval(') || content.includes('Function(') || content.includes('setTimeout(')) {
                    issues.push({
                        severity: 'critical',
                        category: 'Type Safety',
                        description: 'Unsafe eval() usage detected',
                        file: file.replace(this.projectRoot + '/', ''),
                        line: this.findLineNumber(content, 'eval('),
                        recommendation: 'Remove eval() usage and use safer alternatives',
                        cwe: 'CWE-94: Improper Control of Generation of Code',
                        owasp: 'A03:2021 - Improper Neutralization of Input'
                    });
                    scoreDeduction += 25;
                }

                // Check for any types
                if (content.includes(': any') || content.includes('any[]')) {
                    issues.push({
                        severity: 'high',
                        category: 'Type Safety',
                        description: 'Any type usage detected',
                        file: file.replace(this.projectRoot + '/', ''),
                        line: this.findLineNumber(content, 'any'),
                        recommendation: 'Replace any with specific types',
                        cwe: 'CWE-749: Exposed Dangerous Method or Function',
                        owasp: 'A03:2021 - Improper Neutralization of Input'
                    });
                    scoreDeduction += 15;
                }
            }

        } catch (error: any) {
            issues.push({
                severity: 'medium',
                category: 'Type Safety',
                description: `Error during type safety audit: ${error.message || String(error)}`,
                file: 'N/A',
                recommendation: 'Review audit process and fix any errors'
            });
        }

        return {
            category: 'Type Safety & TypeScript',
            score: Math.max(0, 100 - scoreDeduction),
            maxScore: 100,
            issues,
            recommendations: issues.length > 0 ? 
                issues.map(i => i.recommendation).filter(Boolean) : 
                ['TypeScript configuration is secure'],
            status: issues.length > 0 ? this.getIssueStatus(issues) : 'pass'
        };
    }

    /**
     * Audit input validation and sanitization
     */
    private async auditInputValidation(): Promise<SecurityAudit> {
        const issues: SecurityIssue[] = [];
        let scoreDeduction = 0;

        try {
            const srcDir = join(this.projectRoot, 'src');
            const files = this.getTsFiles(srcDir);

            for (const file of files) {
                const content = readFileSync(file, 'utf-8');

                // Check for user input without validation
                if (content.includes('req.body') || content.includes('req.query') || content.includes('req.params')) {
                    issues.push({
                        severity: 'high',
                        category: 'Input Validation & Sanitization',
                        description: 'Direct use of request body without validation',
                        file: file.replace(this.projectRoot + '/', ''),
                        line: this.findLineNumber(content, 'req.body'),
                        recommendation: 'Validate and sanitize all user inputs',
                        cwe: 'CWE-20: Improper Input Validation',
                        owasp: 'A03:2021 - Improper Neutralization of Input'
                    });
                    scoreDeduction += 20;
                }

                // Check for SQL injection patterns
                if (content.includes('SELECT') || content.includes('INSERT') || content.includes('UPDATE') || content.includes('DELETE')) {
                    const sqlPattern = /(SELECT|INSERT|UPDATE|DELETE)\s+.*\s*(FROM|WHERE|INTO|SET)/i;
                    if (sqlPattern.test(content)) {
                        issues.push({
                            severity: 'critical',
                            category: 'Input Validation & Sanitization',
                            description: 'Potential SQL injection vulnerability',
                            file: file.replace(this.projectRoot + '/', ''),
                            line: this.findLineNumber(content, 'SELECT'),
                            recommendation: 'Use parameterized queries and input validation',
                            cwe: 'CWE-89: SQL Injection',
                            owasp: 'A03:2021 - Improper Neutralization of Input'
                        });
                        scoreDeduction += 30;
                    }
                }

                // Check for command injection
                if (content.includes('exec(') || content.includes('spawn(') || content.includes('child_process')) {
                    issues.push({
                        severity: 'critical',
                        category: 'Input Validation & Sanitization',
                        description: 'Command injection vulnerability',
                        file: file.replace(this.projectRoot + '/', ''),
                        line: this.findLineNumber(content, 'exec('),
                        recommendation: 'Avoid executing user input as commands',
                        cwe: 'CWE-78: OS Command Injection',
                        owasp: 'A03:2021 - Improper Neutralization of Input'
                    });
                    scoreDeduction += 25;
                }

                // Check for XSS patterns
                if (content.includes('innerHTML') || content.includes('outerHTML') || content.includes('document.write')) {
                    const lineNumber = this.findLineNumber(content, 'innerHTML');
                    issues.push({
                        severity: 'high',
                        category: 'Input Validation & Sanitization',
                        description: 'Cross-site scripting (XSS) vulnerability',
                        file: file.replace(this.projectRoot + '/', ''),
                        recommendation: 'Use safe HTML rendering and input sanitization',
                        cwe: 'CWE-79: Cross-site Scripting',
                        owasp: 'A03:2021 - Improper Neutralization of Input',
                        ...(lineNumber ? { line: lineNumber } : {})
                    });
                    scoreDeduction += 20;
                }

                // Check for unsafe eval usage
                if (content.includes('eval(') || content.includes('Function(') || content.includes('setTimeout(')) {
                    const lineNumber = this.findLineNumber(content, 'eval');
                    issues.push({
                        severity: 'critical',
                        category: 'Input Validation & Sanitization',
                        description: 'Dangerous "eval()" use detected',
                        file: file.replace(this.projectRoot + '/', ''),
                        recommendation: 'Use safer alternatives to eval()',
                        cwe: 'CWE-94: Code Injection',
                        owasp: 'A03:2021 - Injection',
                        ...(lineNumber ? { line: lineNumber } : {})
                    });
                    scoreDeduction += 40;
                }

                // Check for Zod validation schema defined but not used
                if (content.includes('.validate(') === false && content.includes('z.object')) {
                    const lineNumber = this.findLineNumber(content, 'z.object');
                    issues.push({
                        severity: 'critical',
                        category: 'Input Validation & Sanitization',
                        description: 'Input validation schema defined but not used',
                        file: file.replace(this.projectRoot + '/', ''),
                        recommendation: 'Ensure all inputs are validated against schemas',
                        cwe: 'CWE-20: Improper Input Validation',
                        owasp: 'A03:2021 - Improper Neutralization of Input',
                        ...(lineNumber ? { line: lineNumber } : {})
                    });
                    scoreDeduction += 25;
                }
            }

        } catch (error: any) {
            issues.push({
                severity: 'medium',
                category: 'Input Validation & Sanitization',
                description: `Error during input validation audit: ${error.message || String(error)}`,
                file: 'N/A',
                recommendation: 'Review audit process and fix any errors'
            });
        }

        return {
            category: 'Input Validation & Sanitization',
            score: Math.max(0, 100 - scoreDeduction),
            maxScore: 100,
            issues,
            recommendations: issues.length > 0 ? 
                ['Implement comprehensive input validation framework'] : 
                ['Input validation appears to be implemented correctly'],
            status: issues.length > 0 ? this.getIssueStatus(issues) : 'pass'
        };
    }

    /**
     * Audit authentication and authorization
     */
    private async auditAuthentication(): Promise<SecurityAudit> {
        const issues: SecurityIssue[] = [];
        let scoreDeduction = 0;

        try {
            const srcDir = join(this.projectRoot, 'src');
            const files = this.getTsFiles(srcDir);

            for (const file of files) {
                const content = readFileSync(file, 'utf-8');

                // Check for hardcoded credentials
                const credentialPatterns = [
                    /password\s*=\s*['"][^'"]+/i,
                    /api[_-]?key\s*=\s*['"][^'"]+/i,
                    /secret\s*=\s*['"][^'"]+/i,
                    /token\s*=\s*['"][^'"]+/i
                ];

                for (const pattern of credentialPatterns) {
                    if (pattern.test(content)) {
                        const lineNumber = this.findLineNumber(content, 'password');
                        issues.push({
                            severity: 'critical',
                            category: 'Authentication & Authorization',
                            description: 'Hardcoded credentials detected',
                            file: file.replace(this.projectRoot + '/', ''),
                            recommendation: 'Remove hardcoded credentials and use secure credential management',
                            cwe: 'CWE-798: Use of Hard-coded Credentials',
                            owasp: 'A07:2021 - Identification and Authentication Failures',
                            ...(lineNumber ? { line: lineNumber } : {})
                        });
                        scoreDeduction += 35;
                    }
                }

                // Check for weak authentication
                if (content.includes('md5(') || content.includes('sha1(')) {
                    const lineNumber = this.findLineNumber(content, 'md5(');
                    issues.push({
                        severity: 'high',
                        category: 'Authentication & Authorization',
                        description: 'Weak hashing algorithm detected',
                        file: file.replace(this.projectRoot + '/', ''),
                        recommendation: 'Use strong hashing algorithms like bcrypt or Argon2',
                        cwe: 'CWE-327: Use of a Broken or Risky Cryptographic Algorithm',
                        owasp: 'A02:2021 - Cryptographic Failures',
                        ...(lineNumber ? { line: lineNumber } : {})
                    });
                    scoreDeduction += 15;
                }

                // Check for JWT without verification
                if (content.includes('jwt.verify') === false || content.includes('jwt.secret')) {
                    const lineNumber = this.findLineNumber(content, 'jwt');
                    issues.push({
                        severity: 'high',
                        category: 'Authentication & Authorization',
                        description: 'JWT without proper verification',
                        file: file.replace(this.projectRoot + '/', ''),
                        recommendation: 'Implement proper JWT verification and secret management',
                        cwe: 'CWE-347: Improper Verification of Cryptographic Signature',
                        owasp: 'A02:2021 - Cryptographic Failures',
                        ...(lineNumber ? { line: lineNumber } : {})
                    });
                    scoreDeduction += 20;
                }

                // Check for potentially weak authentication logic (generic)
                if (content.includes('auth') && !content.includes('jwt') && !content.includes('bcrypt')) {
                    const lineNumber = this.findLineNumber(content, 'auth');
                    issues.push({
                        severity: 'medium',
                        category: 'Authentication & Authorization',
                        description: 'Potentially weak authentication logic',
                        file: file.replace(this.projectRoot + '/', ''),
                        recommendation: 'Use established authentication libraries',
                        cwe: 'CWE-287: Improper Authentication',
                        owasp: 'A07:2021 - Identification and Authentication Failures',
                        ...(lineNumber ? { line: lineNumber } : {})
                    });
                    scoreDeduction += 15;
                }

                // Check for bcrypt hashing without verification
                if (content.includes('verify(') === false && content.includes('bcrypt')) {
                    const lineNumber = this.findLineNumber(content, 'bcrypt');
                    issues.push({
                        severity: 'high',
                        category: 'Authentication & Authorization',
                        description: 'Hashing used without verification',
                        file: file.replace(this.projectRoot + '/', ''),
                        recommendation: 'Implement proper password verification logic',
                        cwe: 'CWE-307: Improper Restriction of Excessive Authentication Attempts',
                        owasp: 'A07:2021 - Identification and Authentication Failures',
                        ...(lineNumber ? { line: lineNumber } : {})
                    });
                    scoreDeduction += 20;
                }
            }

        } catch (error: any) {
            issues.push({
                severity: 'medium',
                category: 'Authentication & Authorization',
                description: `Error during authentication audit: ${error.message || String(error)}`,
                file: 'N/A',
                recommendation: 'Review audit process and fix any errors'
            });
        }

        return {
            category: 'Authentication & Authorization',
            score: Math.max(0, 100 - scoreDeduction),
            maxScore: 100,
            issues,
            recommendations: issues.length > 0 ? 
                ['Implement secure authentication framework'] : 
                ['Authentication appears to be implemented securely'],
            status: issues.length > 0 ? this.getIssueStatus(issues) : 'pass'
        };
    }

    /**
     * Audit error handling and logging
     */
    private async auditErrorHandling(): Promise<SecurityAudit> {
        const issues: SecurityIssue[] = [];
        let scoreDeduction = 0;

        try {
            const srcDir = join(this.projectRoot, 'src');
            const files = this.getTsFiles(srcDir);

            for (const file of files) {
                const content = readFileSync(file, 'utf-8');

                // Check for uncaught exceptions
                if (content.includes('catch (e) {}') || content.includes('catch (e) { console.log(e); }')) {
                    issues.push({
                        severity: 'medium',
                        category: 'Error Handling & Logging',
                        description: 'Generic error handling without proper logging',
                        file: file.replace(this.projectRoot + '/', ''),
                        line: this.findLineNumber(content, 'catch'),
                        recommendation: 'Implement structured error handling with proper logging',
                        cwe: 'CWE-392: Improper Exception Handling'
                    });
                    scoreDeduction += 10;
                }

                // Check for sensitive data in logs
                if (content.includes('console.log(') || content.includes('console.error(')) {
                    const logPattern = /console\.(log|error|warn|info|debug)\s*\([^)]*\)/g;
                    const matches = content.match(logPattern);
                    
                    if (matches && matches.some(match => 
                        match[1] && (match[1].includes('password') || 
                                       match[1].includes('token') || 
                                       match[1].includes('secret') || 
                                       match[1].includes('key')))) {
                        issues.push({
                            severity: 'high',
                            category: 'Error Handling & Logging',
                            description: 'Sensitive data in logs',
                            file: file.replace(this.projectRoot + '/', ''),
                            line: this.findLineNumber(content, 'console.log'),
                            recommendation: 'Remove sensitive data from logs and implement secure logging',
                            cwe: 'CWE-532: Insertion of Sensitive Information into Log File',
                            owasp: 'A09:2021 - Logging and Monitoring Failures'
                        });
                        scoreDeduction += 25;
                    }
                }

                // Check for stack traces in production
                if (content.includes('console.trace(') || content.includes('Error.stack')) {
                    issues.push({
                        severity: 'medium',
                        category: 'Error Handling & Logging',
                        description: 'Stack traces exposed in production',
                        file: file.replace(this.projectRoot + '/', ''),
                        line: this.findLineNumber(content, 'console.trace'),
                        recommendation: 'Remove stack trace exposure in production',
                        cwe: 'CWE-209: Generation of Error Message Containing Sensitive Information',
                        owasp: 'A09:2021 - Logging and Monitoring Failures'
                    });
                    scoreDeduction += 15;
                }
            }

        } catch (error: any) {
            issues.push({
                severity: 'medium',
                category: 'Error Handling & Logging',
                description: `Error during error handling audit: ${error.message || String(error)}`,
                file: 'N/A',
                recommendation: 'Review audit process and fix any errors'
            });
        }

        return {
            category: 'Error Handling & Logging',
            score: Math.max(0, 100 - scoreDeduction),
            maxScore: 100,
            issues,
            recommendations: issues.length > 0 ? 
                ['Implement structured error handling framework'] : 
                ['Error handling appears to be implemented correctly'],
            status: issues.length > 0 ? this.getIssueStatus(issues) : 'pass'
        };
    }

    /**
     * Audit data protection and privacy
     */
    private async auditDataProtection(): Promise<SecurityAudit> {
        const issues: SecurityIssue[] = [];
        let scoreDeduction = 0;

        try {
            const srcDir = join(this.projectRoot, 'src');
            const files = this.getTsFiles(srcDir);

            for (const file of files) {
                const content = readFileSync(file, 'utf-8');

                // Check for PII exposure
                const piiPatterns = [
                    /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, // SSN
                    /\b\d{3}[-.]?\d{2}[-.]?\d{4}\b/g, // SSN
                    /email\s*=\s*['"][^'"]+/i,
                    /phone\s*=\s*['"][^'"]+/i,
                    /credit[_-]?card\s*=\s*['"][^'"]+/i
                ];

                for (const pattern of piiPatterns) {
                    if (pattern.test(content)) {
                        const lineNumber = this.findLineNumber(content, 'email');
                        issues.push({
                            severity: 'critical',
                            category: 'Data Protection & Privacy',
                            description: 'Personally Identifiable Information (PII) exposure',
                            file: file.replace(this.projectRoot + '/', ''),
                            recommendation: 'Remove PII exposure and implement data protection',
                            cwe: 'CWE-359: Exposure of Private Personal Information',
                            owasp: 'A03:2021 - Improper Neutralization of Input',
                            ...(lineNumber ? { line: lineNumber } : {})
                        });
                        scoreDeduction += 30;
                    }
                }

                // Check for data in local storage
                if (content.includes('localStorage.') || content.includes('sessionStorage.')) {
                    issues.push({
                        severity: 'medium',
                        category: 'Data Protection & Privacy',
                        description: 'Sensitive data in client-side storage',
                        file: file.replace(this.projectRoot + '/', ''),
                        line: this.findLineNumber(content, 'localStorage'),
                        recommendation: 'Avoid storing sensitive data in client-side storage',
                        cwe: 'CWE-922: Insecure Storage of Sensitive Information'
                    });
                    scoreDeduction += 15;
                }
            }

        } catch (error: any) {
            issues.push({
                severity: 'medium',
                category: 'Data Protection & Privacy',
                description: `Error during data protection audit: ${error.message || String(error)}`,
                file: 'N/A',
                recommendation: 'Review audit process and fix any errors'
            });
        }

        return {
            category: 'Data Protection & Privacy',
            score: Math.max(0, 100 - scoreDeduction),
            maxScore: 100,
            issues,
            recommendations: issues.length > 0 ? 
                ['Implement comprehensive data protection framework'] : 
                ['Data protection appears to be implemented correctly'],
            status: issues.length > 0 ? this.getIssueStatus(issues) : 'pass'
        };
    }

    /**
     * Audit network security and communication
     */
    private async auditNetworkSecurity(): Promise<SecurityAudit> {
        const issues: SecurityIssue[] = [];
        let scoreDeduction = 0;

        try {
            const srcDir = join(this.projectRoot, 'src');
            const files = this.getTsFiles(srcDir);

            for (const file of files) {
                const content = readFileSync(file, 'utf-8');

                // Check for HTTP without HTTPS
                if (content.includes('http://') && !content.includes('https://')) {
                    issues.push({
                        severity: 'high',
                        category: 'Network Security & Communication',
                        description: 'Insecure HTTP communication',
                        file: file.replace(this.projectRoot + '/', ''),
                        line: this.findLineNumber(content, 'http://'),
                        recommendation: 'Use HTTPS for all communications',
                        cwe: 'CWE-319: Cleartext Transmission of Sensitive Information',
                        owasp: 'A02:2021 - Cryptographic Failures'
                    });
                    scoreDeduction += 20;
                }

                // Check for SSL/TLS issues
                if (content.includes('rejectUnauthorized: true') || content.includes('NODE_TLS_REJECT_UNAUTHORIZED')) {
                    issues.push({
                        severity: 'medium',
                        category: 'Network Security & Communication',
                        description: 'Weak SSL/TLS configuration',
                        file: file.replace(this.projectRoot + '/', ''),
                        line: this.findLineNumber(content, 'rejectUnauthorized'),
                        recommendation: 'Configure proper SSL/TLS settings',
                        cwe: 'CWE-295: Improper Certificate Validation'
                    });
                    scoreDeduction += 10;
                }
            }

        } catch (error: any) {
            issues.push({
                severity: 'medium',
                category: 'Network Security & Communication',
                description: `Error during network security audit: ${error.message || String(error)}`,
                file: 'N/A',
                recommendation: 'Review audit process and fix any errors'
            });
        }

        return {
            category: 'Network Security & Communication',
            score: Math.max(0, 100 - scoreDeduction),
            maxScore: 100,
            issues,
            recommendations: issues.length > 0 ? 
                ['Implement secure communication protocols'] : 
                ['Network security appears to be implemented correctly'],
            status: issues.length > 0 ? this.getIssueStatus(issues) : 'pass'
        };
    }

    /**
     * Audit code quality and maintainability
     */
    private async auditCodeQuality(): Promise<SecurityAudit> {
        const issues: SecurityIssue[] = [];
        let scoreDeduction = 0;

        try {
            const srcDir = join(this.projectRoot, 'src');
            const files = this.getTsFiles(srcDir);

            for (const file of files) {
                const content = readFileSync(file, 'utf-8');

                // Check for code complexity
                const lines = content.split('\n');
                let maxLineLength = 0;
                let complexFunctions = 0;

                for (const line of lines) {
                    maxLineLength = Math.max(maxLineLength, line.length);
                    
                    // Check for complex functions
                    if (line.includes('function') && line.length > 100) {
                        complexFunctions++;
                    }
                }

                if (maxLineLength > 200) {
                    issues.push({
                        severity: 'medium',
                        category: 'Code Quality & Maintainability',
                        description: 'Excessively long code lines detected',
                        file: file.replace(this.projectRoot + '/', ''),
                        recommendation: 'Break down complex functions into smaller, manageable pieces',
                        cwe: 'CWE-398: Indicator of Poor Code Quality'
                    });
                    scoreDeduction += 10;
                }

                if (complexFunctions > 5) {
                    issues.push({
                        severity: 'medium',
                        category: 'Code Quality & Maintainability',
                        description: 'High code complexity detected',
                        file: file.replace(this.projectRoot + '/', ''),
                        recommendation: 'Refactor complex functions and improve code organization',
                        cwe: 'CWE-398: Indicator of Poor Code Quality'
                    });
                    scoreDeduction += 15;
                }
            }

        } catch (error: any) {
            issues.push({
                severity: 'medium',
                category: 'Code Quality & Maintainability',
                description: `Error during code quality audit: ${error.message || String(error)}`,
                file: 'N/A',
                recommendation: 'Review audit process and fix any errors'
            });
        }

        return {
            category: 'Code Quality & Maintainability',
            score: Math.max(0, 100 - scoreDeduction),
            maxScore: 100,
            issues,
            recommendations: issues.length > 0 ? 
                ['Implement code quality standards and refactoring'] : 
                ['Code quality appears to be acceptable'],
            status: issues.length > 0 ? this.getIssueStatus(issues) : 'pass'
        };
    }

    /**
     * Audit dependencies for vulnerabilities
     */
    private async auditDependencies(): Promise<SecurityAudit> {
        const issues: SecurityIssue[] = [];
        let scoreDeduction = 0;

        try {
            // Check package.json for vulnerable dependencies
            const packageJsonPath = join(this.projectRoot, 'package.json');
            if (statSync(packageJsonPath).isFile()) {
                const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
                
                // Check for known vulnerable packages
                const vulnerablePackages = [
                    'request', // Historical vulnerabilities
                    'axios', // Check for latest version
                    'node-fetch', // Various vulnerabilities
                    'lodash', // Prototype pollution
                    'moment', // Potential vulnerabilities
                    'jquery', // XSS vulnerabilities
                    'express', // Various security issues
                    'socket.io' // Security vulnerabilities
                ];

                for (const pkg of vulnerablePackages) {
                    if (packageJson.dependencies && packageJson.dependencies[pkg]) {
                        issues.push({
                            severity: 'medium',
                            category: 'Dependency Security & Vulnerabilities',
                            description: `Potentially vulnerable dependency: ${pkg}`,
                            file: 'package.json',
                            recommendation: `Update ${pkg} to latest secure version`,
                            cwe: 'CWE-1104: Use of Unvalidated Input during Web Page Generation'
                        });
                        scoreDeduction += 10;
                    }
                }

                // Check for missing security packages
                const securityPackages = [
                    'helmet',
                    'bcryptjs',
                    'jsonwebtoken',
                    'express-rate-limit',
                    'cors',
                    'express-validator'
                ];

                for (const pkg of securityPackages) {
                    if (!packageJson.dependencies || !packageJson.dependencies[pkg]) {
                        issues.push({
                            severity: 'low',
                            category: 'Dependency Security & Vulnerabilities',
                            description: `Missing security package: ${pkg}`,
                            file: 'package.json',
                            recommendation: `Add ${pkg} for enhanced security`,
                            cwe: 'CWE-16: Configuration'
                        });
                        scoreDeduction += 5;
                    }
                }
            }

        } catch (error: any) {
            issues.push({
                severity: 'medium',
                category: 'Dependency Security & Vulnerabilities',
                description: `Error during dependency audit: ${error.message || String(error)}`,
                file: 'package.json',
                recommendation: 'Review audit process and fix any errors'
            });
        }

        return {
            category: 'Dependency Security & Vulnerabilities',
            score: Math.max(0, 100 - scoreDeduction),
            maxScore: 100,
            issues,
            recommendations: issues.length > 0 ? 
                ['Update dependencies and add security packages'] : 
                ['Dependencies appear to be secure'],
            status: issues.length > 0 ? this.getIssueStatus(issues) : 'pass'
        };
    }

    /**
     * Audit sandbox and execution security
     */
    private async auditSandboxSecurity(): Promise<SecurityAudit> {
        const issues: SecurityIssue[] = [];
        let scoreDeduction = 0;

        try {
            const srcDir = join(this.projectRoot, 'src');
            const files = this.getTsFiles(srcDir);

            for (const file of files) {
                const content = readFileSync(file, 'utf-8');

                // Check for command injection in sandbox
                if (content.includes('executeInSandbox') || content.includes('sandbox.commands.run')) {
                    const execPattern = /executeInSandbox\s*\(\s*['"][^'"]*\)/g;
                    const matches = content.match(execPattern);
                    
                    if (matches && matches.length > 1) {
                        const command = matches[1];
                        if (command && (command.includes('req.body') || command.includes('userInput'))) {
                            issues.push({
                                severity: 'critical',
                                category: 'Sandbox & Execution Security',
                                description: 'User input passed to sandbox execution',
                                file: file.replace(this.projectRoot + '/', ''),
                                line: this.findLineNumber(content, 'executeInSandbox'),
                                recommendation: 'Validate and sanitize all sandbox inputs',
                                cwe: 'CWE-78: OS Command Injection',
                                owasp: 'A03:2021 - Improper Neutralization of Input'
                            });
                            scoreDeduction += 35;
                        }
                    }
                }

                // Check for file system access
                if (content.includes('fs.') || content.includes('path.join') || content.includes('process.cwd')) {
                    issues.push({
                        severity: 'high',
                        category: 'Sandbox & Execution Security',
                        description: 'File system access from sandbox',
                        file: file.replace(this.projectRoot + '/', ''),
                        line: this.findLineNumber(content, 'fs.'),
                        recommendation: 'Restrict file system access in sandbox',
                        cwe: 'CWE-22: Path Traversal',
                        owasp: 'A01:2021 - Broken Access Control'
                    });
                    scoreDeduction += 25;
                }
            }

        } catch (error: any) {
            issues.push({
                severity: 'medium',
                category: 'Sandbox & Execution Security',
                description: `Error during sandbox security audit: ${error.message || String(error)}`,
                file: 'N/A',
                recommendation: 'Review audit process and fix any errors'
            });
        }

        return {
            category: 'Sandbox & Execution Security',
            score: Math.max(0, 100 - scoreDeduction),
            maxScore: 100,
            issues,
            recommendations: issues.length > 0 ? 
                ['Implement proper sandbox isolation'] : 
                ['Sandbox security appears to be implemented correctly'],
            status: issues.length > 0 ? this.getIssueStatus(issues) : 'pass'
        };
    }

    /**
     * Audit MCP integration and API security
     */
    private async auditMcpSecurity(): Promise<SecurityAudit> {
        const issues: SecurityIssue[] = [];
        let scoreDeduction = 0;

        try {
            const srcDir = join(this.projectRoot, 'src');
            const files = this.getTsFiles(srcDir);

            for (const file of files) {
                const content = readFileSync(file, 'utf-8');

                // Check for MCP security
                if (content.includes('executeInSandbox') && content.includes('req.body')) {
                    issues.push({
                        severity: 'critical',
                        category: 'MCP Integration & API Security',
                        description: 'User input passed to MCP without validation',
                        file: file.replace(this.projectRoot + '/', ''),
                        line: this.findLineNumber(content, 'executeInSandbox'),
                        recommendation: 'Validate all MCP inputs and implement proper security checks',
                        cwe: 'CWE-20: Improper Input Validation',
                        owasp: 'A03:2021 - Improper Neutralization of Input'
                    });
                    scoreDeduction += 30;
                }

                // Check for API key exposure
                if (content.includes('api_key') || content.includes('API_KEY') || content.includes('secret')) {
                    issues.push({
                        severity: 'critical',
                        category: 'MCP Integration & API Security',
                        description: 'API key or secret exposed in code',
                        file: file.replace(this.projectRoot + '/', ''),
                        line: this.findLineNumber(content, 'api_key'),
                        recommendation: 'Remove API keys and use secure key management',
                        cwe: 'CWE-798: Use of Hard-coded Credentials',
                        owasp: 'A02:2021 - Cryptographic Failures'
                    });
                    scoreDeduction += 40;
                }
            }

        } catch (error: any) {
            issues.push({
                severity: 'medium',
                category: 'MCP Integration & API Security',
                description: `Error during MCP security audit: ${error.message || String(error)}`,
                file: 'N/A',
                recommendation: 'Review audit process and fix any errors'
            });
        }

        return {
            category: 'MCP Integration & API Security',
            score: Math.max(0, 100 - scoreDeduction),
            maxScore: 100,
            issues,
            recommendations: issues.length > 0 ? 
                ['Implement proper MCP security framework'] : 
                ['MCP integration appears to be secure'],
            status: issues.length > 0 ? this.getIssueStatus(issues) : 'pass'
        };
    }

    /**
     * Audit configuration and secrets management
     */
    private async auditConfigurationSecurity(): Promise<SecurityAudit> {
        const issues: SecurityIssue[] = [];
        let scoreDeduction = 0;

        try {
            // Check for environment variables
            const envFiles = ['.env', '.env.local', '.env.production', '.env.development'];
            
            for (const envFile of envFiles) {
                const envPath = join(this.projectRoot, envFile);
                if (statSync(envPath).isFile()) {
                    const envContent = readFileSync(envPath, 'utf-8');
                    
                    // Check for secrets in env files
                    const secretPatterns = [
                        /password\s*=\s*.+/i,
                        /api[_-]?key\s*=\s*.+/i,
                        /secret\s*=\s*.+/i,
                        /token\s*=\s*.+/i,
                        /private[_-]?key\s*=\s*.+/i
                    ];

                    for (const pattern of secretPatterns) {
                        if (pattern.test(envContent)) {
                            issues.push({
                                severity: 'critical',
                                category: 'Configuration & Secrets Management',
                                description: 'Secrets in environment files',
                                file: envFile,
                                recommendation: 'Remove secrets from environment files and use secure secret management',
                                cwe: 'CWE-798: Use of Hard-coded Credentials',
                                owasp: 'A05:2021 - Security Misconfiguration'
                            });
                            scoreDeduction += 35;
                        }
                    }
                }
            }

        } catch (error: any) {
            issues.push({
                severity: 'medium',
                category: 'Configuration & Secrets Management',
                description: `Error during configuration audit: ${error.message || String(error)}`,
                file: '.env*',
                recommendation: 'Review audit process and fix any errors'
            });
        }

        return {
            category: 'Configuration & Secrets Management',
            score: Math.max(0, 100 - scoreDeduction),
            maxScore: 100,
            issues,
            recommendations: issues.length > 0 ? 
                ['Implement secure configuration management'] : 
                ['Configuration management appears to be secure'],
            status: issues.length > 0 ? this.getIssueStatus(issues) : 'pass'
        };
    }

    /**
     * Get all TypeScript files in directory
     */
    private getTsFiles(dir: string): string[] {
        try {
            const files = readdirSync(dir);
            return files.filter(file => file.endsWith('.ts') || file.endsWith('.tsx'));
        } catch (error) {
            return [];
        }
    }

    /**
     * Find line number for pattern
     */
    private findLineNumber(content: string, pattern: string): number | undefined {
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line && line.includes(pattern)) {
                return i + 1;
            }
        }
        return undefined;
    }

    /**
     * Get overall status based on issues
     */
    private getIssueStatus(issues: SecurityIssue[]): 'critical' | 'high' | 'medium' | 'low' | 'pass' {
        if (issues.length === 0) {
            return 'pass';
        }

        const hasCritical = issues.some(issue => issue.severity === 'critical');
        const hasHigh = issues.some(issue => issue.severity === 'high');
        const hasMedium = issues.some(issue => issue.severity === 'medium');
        const hasLow = issues.some(issue => issue.severity === 'low');

        if (hasCritical) {
            return 'critical';
        } else if (hasHigh) {
            return 'high';
        } else if (hasMedium) {
            return 'medium';
        } else if (hasLow) {
            return 'low';
        } else {
            return 'pass';
        }
    }

    /**
     * Get overall status based on score
     */
    private getOverallStatus(score: number): 'excellent' | 'good' | 'fair' | 'poor' | 'critical' {
        if (score >= 90) return 'excellent';
        if (score >= 80) return 'excellent'; 
        if (score >= 70) return 'fair';
        if (score >= 50) return 'poor';
        return 'critical';
    }
    private calculateOverallScore(auditResults: SecurityAudit[]): number {
        if (auditResults.length === 0) {
            return 100;
        }

        const totalScore = auditResults.reduce((sum, result) => sum + result.score, 0);
        const maxPossibleScore = auditResults.reduce((sum, result) => sum + result.maxScore, 0);
        
        return Math.round((totalScore / maxPossibleScore) * 100);
    }

    /**
     * Generate comprehensive audit report
     */
    private generateAuditReport(auditResults: SecurityAudit[], overallScore: number, overallStatus: string): string {
        const criticalIssues = auditResults.filter(r => r.status === 'critical').length;
        const highIssues = auditResults.filter(r => r.status === 'high').length;
        const mediumIssues = auditResults.filter(r => r.status === 'medium').length;
        const lowIssues = auditResults.filter(r => r.status === 'low').length;
        const totalIssues = auditResults.reduce((sum, r) => sum + r.issues.length, 0);

        return `
╔═════════════════════════════════════════════╗
║                  COMPREHENSIVE SECURITY AUDIT REPORT          ║
╚═══════════════════════════════════════════

OVERALL ASSESSMENT:
• Security Score: ${overallScore}/100
• Overall Status: ${overallStatus.toUpperCase()}
• Total Issues Found: ${totalIssues}
• Critical Issues: ${criticalIssues}
• High Issues: ${highIssues}
• Medium Issues: ${mediumIssues}
• Low Issues: ${lowIssues}

═════════════════════════════════════════

DETAILED FINDINGS BY CATEGORY:
${auditResults.map(result => `
═══════════════════════════════════
${result.category.toUpperCase()}
═══════════════════════════════════
Score: ${result.score}/${result.maxScore}
Status: ${result.status.toUpperCase()}
Issues Found: ${result.issues.length}

${result.issues.length > 0 ? 
result.issues.map((issue, index) => `
${index + 1}. [${issue.severity.toUpperCase()}] ${issue.description}
   File: ${issue.file}${issue.line ? ':' + issue.line : ''}
   Recommendation: ${issue.recommendation}
   ${issue.cwe ? `CWE: ${issue.cwe}` : ''}
   ${issue.owasp ? `OWASP: ${issue.owasp}` : ''}
`).join('\n') : 'No issues found in this category'}
`).join('\n')}

═════════════════════════════════════

SECURITY RECOMMENDATIONS:
${this.generateRecommendations(auditResults, overallScore)}

═══════════════════════════════════

PRIORITY ACTIONS:
${this.generatePriorityActions(auditResults, overallStatus)}

═══════════════════════════════════
Report Generated: ${new Date().toISOString()}
`;
    }

    /**
     * Generate security recommendations
     */
    private generateRecommendations(auditResults: SecurityAudit[], overallScore: number): string {
        const recommendations = [];

        // Critical issues
        if (overallScore < 70) {
            recommendations.push('🔴 CRITICAL: Address all critical security issues immediately');
        }

        // High-priority recommendations
        if (overallScore < 85) {
            recommendations.push('🟡 HIGH: Implement comprehensive input validation framework');
            recommendations.push('🟡 HIGH: Add proper error handling and logging');
            recommendations.push('🟡 HIGH: Implement secure authentication and authorization');
        }

        // Medium-priority recommendations
        if (overallScore < 95) {
            recommendations.push('🟠 MEDIUM: Enhance code quality and maintainability');
            recommendations.push('🟠 MEDIUM: Update dependencies and add security packages');
            recommendations.push('🟠 MEDIUM: Implement proper sandbox isolation');
        }

        // Low-priority recommendations
        recommendations.push('🟢 LOW: Add comprehensive test coverage');
        recommendations.push('🟢 LOW: Implement security monitoring and alerting');
        recommendations.push('🟢 LOW: Regular security audits and penetration testing');
        recommendations.push('🟢 LOW: Document security architecture and decisions');

        // General recommendations
        recommendations.push('📋 GENERAL: Keep dependencies updated and monitor security advisories');
        recommendations.push('📋 GENERAL: Implement security code review process');
        recommendations.push('📋 GENERAL: Use static analysis tools (SAST, DAST)');
        recommendations.push('📋 GENERAL: Provide security training for development team');

        return recommendations.map(rec => `• ${rec}`).join('\n');
    }

    /**
     * Generate priority actions
     */
    private generatePriorityActions(auditResults: SecurityAudit[], overallStatus: string): string {
        const actions = [];

        if (overallStatus === 'critical') {
            actions.push('🚨 IMMEDIATE: Stop development and address all critical issues');
            actions.push('🚨 IMMEDIATE: Review and fix all hardcoded credentials');
            actions.push('🚨 IMMEDIATE: Implement proper input validation before deployment');
            actions.push('🚨 IMMEDIATE: Conduct security penetration testing');
        } else if (overallStatus === 'high') {
            actions.push('⚠️ HIGH PRIORITY: Schedule security audit within 1 week');
            actions.push('⚠️ HIGH PRIORITY: Update all dependencies to latest secure versions');
            actions.push('⚠️ HIGH PRIORITY: Implement comprehensive error handling');
            actions.push('⚠️ HIGH PRIORITY: Add security testing to CI/CD pipeline');
        } else if (overallStatus === 'medium') {
            actions.push('🟡 MEDIUM PRIORITY: Plan security improvements for next sprint');
            actions.push('🟡 MEDIUM PRIORITY: Refactor complex functions for better maintainability');
            actions.push('🟡 MEDIUM PRIORITY: Add static analysis to build process');
            actions.push('🟡 MEDIUM PRIORITY: Implement security monitoring in production');
        } else {
            actions.push('🟢 LOW PRIORITY: Consider security improvements in future planning');
            actions.push('🟢 LOW PRIORITY: Add security documentation and training');
            actions.push('🟢 LOW PRIORITY: Monitor security best practices and updates');
        }

        return actions.map(action => `• ${action}`).join('\n');
    }
}

// Global security auditor instance
let securityAuditor: SecurityAuditor | null = null;

/**
 * Get or create security auditor
 */
export function getSecurityAuditor(): SecurityAuditor {
    if (!securityAuditor) {
        securityAuditor = new SecurityAuditor();
    }
    return securityAuditor;
}

/**
 * Perform comprehensive security audit
 */
export async function performSecurityAudit(): Promise<string> {
    const auditor = getSecurityAuditor();
    return await auditor.performFullAudit();
}

/**
 * Quick security audit with scoring
 */
export async function quickSecurityAudit(): Promise<string> {
    const auditor = getSecurityAuditor();
    const result = await auditor.performFullAudit();
    
    // Extract key metrics for quick view
    const resultsArray = Array.from(auditor['auditResults'].values());
    if (resultsArray.length === 0) {
        return 'No audit results available';
    }
    
    const criticalCount = resultsArray.filter(r => r.status === 'critical').length;
    const highCount = resultsArray.filter(r => r.status === 'high').length;
    const mediumCount = resultsArray.filter(r => r.status === 'medium').length;
    const lowCount = resultsArray.filter(r => r.status === 'low').length;
    const totalIssues = resultsArray.reduce((sum, r) => sum + r.issues.length, 0);
    
    const overallScore = auditor['calculateOverallScore'](resultsArray);
    
    return `
╔══════════════════════════════════════════╗
║                   QUICK SECURITY AUDIT SUMMARY               ║
╚═══════════════════════════════════════════

🎯 SECURITY SCORE: ${overallScore}/100 🎯
📊 ISSUE BREAKDOWN:
• Critical: ${criticalCount} 🔴
• High: ${highCount} 🟡
• Medium: ${mediumCount} 🟠
• Low: ${lowCount} 🟢
• Total Issues: ${totalIssues}

📋 STATUS: ${overallScore >= 90 ? 'EXCELLENT' : 
                overallScore >= 80 ? 'GOOD' : 
                overallScore >= 70 ? 'FAIR' : 
                overallScore >= 50 ? 'POOR' : 'CRITICAL'}

${totalIssues === 0 ? 
    '✅ No security issues found!' : 
    `🔍 Found ${totalIssues} security issues requiring attention.`}

═════════════════════════════════════════
Quick audit completed: ${new Date().toISOString()}
`;
}
