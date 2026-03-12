import { getOrCreateSandbox } from '../sandbox_local.js';
/**
 * Automatically searches the internet to gather background information,
 * CVE details, or company data related to the security audit.
 */
export async function webSearch(query, limit = 5) {
    const sandbox = await getOrCreateSandbox();
    try {
        console.log(`🔍 Searching internet for: ${query}`);
        // Attempt to use ddgr (DuckDuckGo CLI) in the sandbox
        // If not available, we'll use a simulated search for now
        // In a real environment, we'd ensure ddgr is in the Dockerfile
        const searchCmd = `ddgr --json -n ${limit} "${query}"`;
        try {
            const result = await sandbox.commands.run(searchCmd);
            if (result.stdout) {
                const results = JSON.parse(result.stdout);
                return formatSearchResults(results, query);
            }
        }
        catch (e) {
            console.warn('ddgr not found or failed, using simulated search results');
        }
        // Simulated results if tool is missing
        return simulateSearch(query);
    }
    catch (error) {
        return `Web search failed: ${error.message}`;
    }
}
function formatSearchResults(results, query) {
    let output = `\nINTERNET SEARCH RESULTS FOR: ${query}\n`;
    output += '═'.repeat(output.length) + '\n\n';
    results.forEach((res, i) => {
        output += `${i + 1}. ${res.title}\n`;
        output += `   URL: ${res.url}\n`;
        output += `   Snippet: ${res.abstract || 'No description available'}\n\n`;
    });
    return output;
}
function simulateSearch(query) {
    // Generate helpful simulation based on common security queries
    let result = `\n[SIMULATED] INTERNET SEARCH RESULTS FOR: ${query}\n`;
    result += '═'.repeat(result.length) + '\n\n';
    if (query.toLowerCase().includes('cve')) {
        result += `1. CVE-2023-XXXX: Critical Remote Code Execution in target software\n`;
        result += `   URL: https://nvd.nist.gov/vuln/detail/CVE-2023-XXXX\n`;
        result += `   Snippet: A flaw was found in the handling of specific HTTP headers...\n\n`;
    }
    else {
        result += `1. Security Assessment of ${query}\n`;
        result += `   URL: https://security-blog.example.com/analysis/${query.replace(/\s+/g, '-')}\n`;
        result += `   Snippet: Recent findings show common misconfigurations in ${query} deployments...\n\n`;
    }
    result += `2. ${query} Deployment Guide & Security Best Practices\n`;
    result += `   URL: https://docs.example.com/${query.replace(/\s+/g, '_')}\n`;
    result += `   Snippet: Best practices for securing ${query} include disabling unused features and using TLS 1.3...\n\n`;
    result += `Note: This is a placeholder result because 'ddgr' was not confirmed in the sandbox environment.`;
    return result;
}
//# sourceMappingURL=search.js.map