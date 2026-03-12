import { executeInSandbox } from '../sandbox.js';

export async function httpRequest(url: string, method: string = 'GET', headers: Record<string, string> = {}, body: string = ''): Promise<string> {
    // We execute the HTTP request via curl in the sandbox so it comes from the isolated environment.
    let headerArgs = '';
    for (const [key, value] of Object.entries(headers)) {
        headerArgs += `-H "${key}: ${value}" `;
    }
    
    const bodyArg = body ? `-d '${body}' ` : '';
    const command = `curl -s -X ${method} ${headerArgs} ${bodyArg} ${url} -i`;
    console.log(`[Tool: http_request] Sending request safely via sandbox...`);
    
    const result = await executeInSandbox(command, 'bash');
    return result;
}
