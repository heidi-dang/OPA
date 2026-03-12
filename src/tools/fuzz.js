import { executeInSandbox } from '../sandbox.js';
export async function dirFuzz(url, wordlistTemplate = 'common.txt') {
    // Simulated ffuf or gobuster command using a basic wordlist mapped in the sandbox
    const command = `ffuf -w /usr/share/wordlists/${wordlistTemplate} -u ${url}/FUZZ`;
    console.log(`[Tool: dir_fuzz] Sandboxing execution: ${command}`);
    // Execute fuzzing safely inside the isolated E2B sandbox
    const result = await executeInSandbox(command, 'bash');
    return result;
}
//# sourceMappingURL=fuzz.js.map