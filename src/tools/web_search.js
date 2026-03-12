import { executeInSandbox } from '../sandbox_local.js';
export class WebSearchAgent {
    config;
    constructor(config) {
        this.config = {
            engines: config.engines || ['google', 'bing', 'duckduckgo'],
            maxResults: config.maxResults || 10,
            includeCVE: config.includeCVE || false,
            includeCompanyData: config.includeCompanyData || false,
            includeNews: config.includeNews || false,
            includeSocial: config.includeSocial || false,
            ...config
        };
    }
    /**
     * Perform comprehensive web search
     */
    async performSearch() {
        console.log(`🔍 Starting web search for: ${this.config.query}`);
        const results = [];
        const searchEngines = this.config.engines;
        try {
            // Search across multiple engines
            for (const engine of searchEngines) {
                console.log(`Searching with ${engine}...`);
                const engineResults = await this.searchWithEngine(engine);
                results.push(...engineResults);
            }
            // Additional specialized searches if requested
            if (this.config.includeCVE) {
                const cveResults = await this.searchCVEs();
                results.push(...cveResults);
            }
            if (this.config.includeCompanyData) {
                const companyResults = await this.searchCompanyData();
                results.push(...companyResults);
            }
            if (this.config.includeNews) {
                const newsResults = await this.searchNews();
                results.push(...newsResults);
            }
            if (this.config.includeSocial) {
                const socialResults = await this.searchSocial();
                results.push(...socialResults);
            }
            // Remove duplicates and sort by relevance
            const uniqueResults = this.removeDuplicates(results);
            const sortedResults = uniqueResults.sort((a, b) => b.relevanceScore - a.relevanceScore);
            // Limit results
            const finalResults = sortedResults.slice(0, this.config.maxResults);
            return this.generateSearchReport(finalResults);
        }
        catch (error) {
            return `❌ Web search failed: ${error.message}`;
        }
    }
    /**
     * Search with specific engine
     */
    async searchWithEngine(engine) {
        const searchCommands = {
            google: `curl -s "https://www.google.com/search?q=${encodeURIComponent(this.config.query)}&num=10" -H "User-Agent: Mozilla/5.0" | grep -oP '<h3[^>]*>[^<]*</h3>' | sed 's/<[^>]*>//g' | head -10`,
            bing: `curl -s "https://www.bing.com/search?q=${encodeURIComponent(this.config.query)}&count=10" -H "User-Agent: Mozilla/5.0" | grep -oP '<h2[^>]*>[^<]*</h2>' | sed 's/<[^>]*>//g' | head -10`,
            duckduckgo: `curl -s "https://duckduckgo.com/html/?q=${encodeURIComponent(this.config.query)}" | grep -oP '<h2[^>]*>[^<]*</h2>' | sed 's/<[^>]*>//g' | head -10`
        };
        const command = searchCommands[engine];
        if (!command) {
            return [];
        }
        try {
            const result = await executeInSandbox(command, 'bash');
            const lines = result.split('\n').filter(line => line.trim());
            return lines.map((line, index) => ({
                title: line.substring(0, 100),
                url: `https://www.${engine}.com/search?q=${encodeURIComponent(this.config.query)}`,
                description: line.substring(0, 200),
                source: engine,
                timestamp: new Date().toISOString(),
                relevanceScore: Math.max(10 - index, 1)
            }));
        }
        catch (error) {
            console.error(`Search with ${engine} failed:`, error.message);
            return [];
        }
    }
    /**
     * Search for CVEs related to query
     */
    async searchCVEs() {
        console.log('🔍 Searching for CVEs...');
        const cveCommand = `
            curl -s "https://cve.circl.lu/api/search/${encodeURIComponent(this.config.query)}" | \
            jq -r '.[] | select(.id) | {id: .id, summary: .summary, score: .score}' | \
            head -5
        `;
        try {
            const result = await executeInSandbox(cveCommand, 'bash');
            const lines = result.split('\n').filter(line => line.trim());
            return lines.map((line, index) => {
                const match = line.match(/id:\s*(CVE-\d+-\d+)/);
                const summaryMatch = line.match(/summary:\s*"([^"]*)"/);
                const scoreMatch = line.match(/score:\s*(\d+)/);
                const cveId = (match && match[1]) ? match[1] : 'Unknown CVE';
                return {
                    title: cveId,
                    url: `https://cve.circl.lu/cve/${cveId}`,
                    description: (summaryMatch && summaryMatch[1]) ? summaryMatch[1] : 'No description',
                    source: 'CVE Database',
                    timestamp: new Date().toISOString(),
                    relevanceScore: (scoreMatch && scoreMatch[1]) ? parseInt(scoreMatch[1]) : 5
                };
            });
        }
        catch (error) {
            console.error('Search failed:', error.message);
            return [];
        }
    }
    /**
     * Search for company/organization data
     */
    async searchCompanyData() {
        console.log('🏢 Searching company data...');
        const companyCommand = `
            curl -s "https://www.google.com/search?q=${encodeURIComponent(this.config.query + ' company profile')}&num=5" | \
            grep -oP '<h3[^>]*>[^<]*</h3>' | \
            sed 's/<[^>]*>//g'
        `;
        try {
            const result = await executeInSandbox(companyCommand, 'bash');
            const lines = result.split('\n').filter(line => line.trim());
            return lines.map((line, index) => ({
                title: line.substring(0, 100),
                url: `https://www.google.com/search?q=${encodeURIComponent(this.config.query + ' company profile')}`,
                description: `Company information for ${this.config.query}`,
                source: 'Company Data',
                timestamp: new Date().toISOString(),
                relevanceScore: Math.max(8 - index, 1)
            }));
        }
        catch (error) {
            console.error('Search failed:', error.message);
            return [];
        }
    }
    /**
     * Search for news related to query
     */
    async searchNews() {
        console.log('📰 Searching news...');
        const newsCommand = `
            curl -s "https://news.google.com/search?q=${encodeURIComponent(this.config.query)}&num=5" | \
            grep -oP '<h3[^>]*>[^<]*</h3>' | \
            sed 's/<[^>]*>//g'
        `;
        try {
            const result = await executeInSandbox(newsCommand, 'bash');
            const lines = result.split('\n').filter(line => line.trim());
            return lines.map((line, index) => ({
                title: line.substring(0, 100),
                url: `https://news.google.com/search?q=${encodeURIComponent(this.config.query)}`,
                description: `Recent news about ${this.config.query}`,
                source: 'News',
                timestamp: new Date().toISOString(),
                relevanceScore: Math.max(7 - index, 1)
            }));
        }
        catch (error) {
            console.error('News search failed:', error.message);
            return [];
        }
    }
    /**
     * Search social media
     */
    async searchSocial() {
        console.log('👥 Searching social media...');
        const socialCommand = `
            curl -s "https://www.google.com/search?q=${encodeURIComponent(this.config.query + ' site:linkedin.com OR site:twitter.com OR site:facebook.com')}&num=5" | \
            grep -oP '<h3[^>]*>[^<]*</h3>' | \
            sed 's/<[^>]*>//g'
        `;
        try {
            const result = await executeInSandbox(socialCommand, 'bash');
            const lines = result.split('\n').filter(line => line.trim());
            return lines.map((line, index) => ({
                title: line.substring(0, 100),
                url: `https://www.google.com/search?q=${encodeURIComponent(this.config.query + ' site:linkedin.com OR site:twitter.com OR site:facebook.com')}`,
                description: `Social media profiles for ${this.config.query}`,
                source: 'Social Media',
                timestamp: new Date().toISOString(),
                relevanceScore: Math.max(6 - index, 1)
            }));
        }
        catch (error) {
            console.error('Social media search failed:', error.message);
            return [];
        }
    }
    /**
     * Remove duplicate results
     */
    removeDuplicates(results) {
        const seen = new Set();
        return results.filter(result => {
            const key = `${result.title}-${result.description}`;
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }
    /**
     * Generate search report
     */
    generateSearchReport(results) {
        return `
╔══════════════════════════════════════════════════════╗
║                    WEB SEARCH RESULTS                          ║
╚═════════════════════════════════════════════════════

QUERY: ${this.config.query}
ENGINES: ${this.config.engines?.join(', ')}
RESULTS FOUND: ${results.length}
MAX RESULTS: ${this.config.maxResults}

═══════════════════════════════════════════════════

TOP RESULTS:
${results.map((result, index) => `
${index + 1}. ${result.title}
   Source: ${result.source}
   URL: ${result.url}
   Description: ${result.description}
   Relevance: ${result.relevanceScore}/10
   Found: ${result.timestamp}
`).join('\n')}

═════════════════════════════════════════════════════

SEARCH ANALYSIS:
• Total Results: ${results.length}
• Average Relevance: ${results.length > 0 ? Math.round(results.reduce((sum, r) => sum + r.relevanceScore, 0) / results.length) : 0}/10
• Best Match: ${results.length > 0 ? results.reduce((best, current) => current.relevanceScore > best.relevanceScore ? current : best).title : 'None'}
• Sources Used: ${this.config.engines?.join(', ')}

═══════════════════════════════════════════════════

RECOMMENDATIONS:
• ${results.length === 0 ? 'Try different search terms or engines' : 'Review top results for relevant information'}
• ${this.config.includeCVE ? 'Check CVE details for security implications' : ''}
• ${this.config.includeCompanyData ? 'Research company background and reputation' : ''}
• ${this.config.includeNews ? 'Monitor recent news for developments' : ''}
• ${this.config.includeSocial ? 'Investigate social media presence and connections' : ''}

═══════════════════════════════════════════════
Report Generated: ${new Date().toISOString()}
`;
    }
}
// Global web search agent instance
let webSearchAgent = null;
/**
 * Get or create web search agent
 */
export function getWebSearchAgent() {
    return webSearchAgent || (webSearchAgent = new WebSearchAgent({}));
}
/**
 * Perform web search
 */
export async function webSearch(query, options = {}) {
    const agent = getWebSearchAgent();
    const config = { query, ...options };
    // Create new agent instance for this search
    const searchAgent = new WebSearchAgent(config);
    return await searchAgent.performSearch();
}
/**
 * Quick web search
 */
export async function quickWebSearch(query) {
    return await webSearch(query, {
        maxResults: 5,
        engines: ['google', 'duckduckgo']
    });
}
/**
 * Security-focused web search
 */
export async function securityWebSearch(query) {
    return await webSearch(query, {
        maxResults: 10,
        engines: ['google', 'bing'],
        includeCVE: true,
        includeNews: true
    });
}
/**
 * Comprehensive intelligence search
 */
export async function intelligenceSearch(query) {
    return await webSearch(query, {
        maxResults: 15,
        engines: ['google', 'bing', 'duckduckgo'],
        includeCVE: true,
        includeCompanyData: true,
        includeNews: true,
        includeSocial: true
    });
}
//# sourceMappingURL=web_search.js.map