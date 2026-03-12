interface WebSearchConfig {
    query: string;
    engines?: string[];
    maxResults?: number;
    includeCVE?: boolean;
    includeCompanyData?: boolean;
    includeNews?: boolean;
    includeSocial?: boolean;
}
export declare class WebSearchAgent {
    private config;
    constructor(config: WebSearchConfig);
    /**
     * Perform comprehensive web search
     */
    performSearch(): Promise<string>;
    /**
     * Search with specific engine
     */
    private searchWithEngine;
    /**
     * Search for CVEs related to query
     */
    private searchCVEs;
    /**
     * Search for company/organization data
     */
    private searchCompanyData;
    /**
     * Search for news related to query
     */
    private searchNews;
    /**
     * Search social media
     */
    private searchSocial;
    /**
     * Remove duplicate results
     */
    private removeDuplicates;
    /**
     * Generate search report
     */
    private generateSearchReport;
}
/**
 * Get or create web search agent
 */
export declare function getWebSearchAgent(): WebSearchAgent;
/**
 * Perform web search
 */
export declare function webSearch(query: string, options?: Partial<WebSearchConfig>): Promise<string>;
/**
 * Quick web search
 */
export declare function quickWebSearch(query: string): Promise<string>;
/**
 * Security-focused web search
 */
export declare function securityWebSearch(query: string): Promise<string>;
/**
 * Comprehensive intelligence search
 */
export declare function intelligenceSearch(query: string): Promise<string>;
export {};
//# sourceMappingURL=web_search.d.ts.map