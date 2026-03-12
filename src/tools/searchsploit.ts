import { executeInSandbox } from '../sandbox.js';

export async function searchsploitQuery(query: string): Promise<string> {
    // Use the local exploit-db search wrapper within the sandbox
    const command = `searchsploit ${query} -j`;
    console.log(`[Tool: searchsploit_query] Querying Exploit-DB: ${command}`);
    
    const result = await executeInSandbox(command, 'bash');
    return result;
}
