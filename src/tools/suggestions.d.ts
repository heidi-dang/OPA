interface SuggestionContext {
    currentFile?: string;
    currentSelection?: string;
    recentTools?: string[];
    systemStatus?: string;
    userIntent?: 'recon' | 'security' | 'privacy' | 'intelligence' | 'general';
}
interface Suggestion {
    id: string;
    title: string;
    description: string;
    category: 'tool' | 'workflow' | 'configuration' | 'troubleshooting';
    priority: 'critical' | 'high' | 'medium' | 'low';
    action: string;
    parameters?: Record<string, any>;
    reasoning: string;
    estimatedTime?: number;
}
interface SuggestionEngine {
    generateSuggestions(context: SuggestionContext): Promise<Suggestion[]>;
}
export declare class IntelligentSuggestionEngine implements SuggestionEngine {
    private suggestionHistory;
    private maxHistorySize;
    /**
     * Generate intelligent suggestions based on context
     */
    generateSuggestions(context: SuggestionContext): Promise<Suggestion[]>;
    /**
     * Analyze user intent based on context
     */
    private analyzeUserIntent;
    /**
     * Generate reconnaissance suggestions
     */
    private generateReconSuggestions;
    /**
     * Generate security suggestions
     */
    private generateSecuritySuggestions;
    /**
     * Generate privacy suggestions
     */
    private generatePrivacySuggestions;
    /**
     * Generate intelligence suggestions
     */
    private generateIntelligenceSuggestions;
    /**
     * Generate general suggestions
     */
    private generateGeneralSuggestions;
    /**
     * Generate system status suggestions
     */
    private generateSystemSuggestions;
    /**
     * Add suggestions to history
     */
    private addToHistory;
    /**
     * Get suggestion history
     */
    getSuggestionHistory(): Suggestion[];
    /**
     * Clear suggestion history
     */
    clearSuggestionHistory(): void;
    /**
     * Format suggestions for display
     */
    formatSuggestions(suggestions: Suggestion[]): string;
}
/**
 * Get or create suggestion engine
 */
export declare function getSuggestionEngine(): IntelligentSuggestionEngine;
/**
 * Generate intelligent suggestions
 */
export declare function generateIntelligentSuggestions(context?: SuggestionContext): Promise<string>;
/**
 * Get anonymous agent status
 */
export declare function getAnonymousAgentStatus(): string;
/**
 * Get suggestion history
 */
export declare function getSuggestionHistory(): Suggestion[];
/**
 * Clear suggestion history
 */
export declare function clearSuggestionHistory(): void;
/**
 * Quick suggestions for current context
 */
export declare function quickSuggestions(): Promise<string>;
export {};
//# sourceMappingURL=suggestions.d.ts.map