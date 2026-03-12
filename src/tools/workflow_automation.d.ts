import './nuclei.js';
import './searchsploit.js';
import './nmap.js';
import './pcap.js';
import './report.js';
import './fuzz.js';
import './bot.js';
import './sweep.js';
import './crypto.js';
import './wireless.js';
import './isp.js';
import './mask.js';
interface AutomationGoal {
    id: string;
    name: string;
    description: string;
    category: 'recon' | 'security' | 'privacy' | 'intelligence' | 'exploitation' | 'reporting' | 'complete';
    priority: 'critical' | 'high' | 'medium' | 'low';
    status: 'pending' | 'running' | 'completed' | 'failed';
    progress: number;
    totalSteps: number;
    completedSteps: string[];
    currentStep?: string;
    startTime?: Date;
    endTime?: Date;
    result?: string;
    error?: string;
    artifacts?: string[];
    nextActions?: string[];
}
interface AutomationStrategy {
    name: string;
    description: string;
    goals: string[];
    steps: AutomationStep[];
    parallelExecution: boolean;
    maxConcurrency: number;
    retryAttempts: number;
    timeoutMinutes: number;
}
interface AutomationStep {
    id: string;
    name: string;
    description: string;
    tool: string;
    parameters?: Record<string, any>;
    expectedOutput?: string;
    timeoutMinutes?: number;
    retryOnFailure?: boolean;
    continueOnError?: boolean;
}
interface AutomationResult {
    success: boolean;
    goals: AutomationGoal[];
    completedSteps: AutomationStep[];
    artifacts: string[];
    summary: string;
    duration: number;
    errors: string[];
    recommendations: string[];
    nextActions: string[];
}
export declare class WorkflowAutomationEngine {
    private goals;
    private strategies;
    private executionHistory;
    private maxHistorySize;
    constructor();
    /**
     * Initialize default automation strategies
     */
    private initializeDefaultStrategies;
    /**
     * Execute automation strategy
     */
    executeStrategy(strategyId: string, target?: string, parameters?: Record<string, any>): Promise<AutomationResult>;
    /**
     * Execute individual automation step
     */
    private executeStep;
    /**
     * Update goal progress
     */
    private updateGoalProgress;
    /**
     * Calculate goal status
     */
    private calculateGoalStatus;
    /**
     * Get available strategies
     */
    getAvailableStrategies(): string[];
    /**
     * Get strategy details
     */
    getStrategy(strategyId: string): AutomationStrategy | undefined;
    /**
     * Get execution history
     */
    getExecutionHistory(): AutomationResult[];
    /**
     * Clear execution history
     */
    clearExecutionHistory(): void;
    /**
     * Generate comprehensive automation report
     */
    generateAutomationReport(): string;
}
/**
 * Get or create automation engine
 */
export declare function getAutomationEngine(): WorkflowAutomationEngine;
/**
 * Execute automation strategy
 */
export declare function executeStrategy(strategyId: string, target?: string, parameters?: Record<string, any>): Promise<AutomationResult>;
/**
 * Get available strategies
 */
export declare function getAvailableStrategies(): string[];
/**
 * Get execution history
 */
export declare function getExecutionHistory(): AutomationResult[];
/**
 * Clear execution history
 */
export declare function clearExecutionHistory(): void;
/**
 * Generate automation report
 */
export declare function generateAutomationReport(): string;
/**
 * List available strategies
 */
export declare function listStrategies(): string;
/**
 * Quick automation - complete security assessment
 */
export declare function quickCompleteSecurityAssessment(target: string): Promise<string>;
/**
 * Quick automation - rapid intelligence gathering
 */
export declare function quickRapidIntelligence(target: string): Promise<string>;
/**
 * Quick automation - privacy-first operations
 */
export declare function quickPrivacyFirstOperations(target: string): Promise<string>;
/**
 * Quick automation - bug bounty hunting
 */
export declare function quickBugBountyHunt(target: string): Promise<string>;
export {};
//# sourceMappingURL=workflow_automation.d.ts.map