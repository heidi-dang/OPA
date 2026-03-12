import { executeInSandbox } from '../sandbox.js';
export async function searchsploitQuery(query) {
    // Use the local exploit-db search wrapper within the sandbox
    const command = `searchsploit ${query} -j`;
    console.log(`[Tool: searchsploit_query] Querying Exploit-DB: ${command}`);
    const result = await executeInSandbox(command, 'bash');
    return result;
}
//# sourceMappingURL=searchsploit.js.map