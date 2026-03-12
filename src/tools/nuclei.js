import { executeInSandbox } from '../sandbox_local.js';
export async function runNuclei(target, templates = 'default') {
    // Determine template flags based on input
    const templateFlag = templates === 'default' ? '' : `-t ${templates}`;
    // Command to run nuclei against the target securely in the sandbox
    const command = `nuclei -u ${target} ${templateFlag} -silent -json-export`;
    console.log(`[Tool: run_nuclei] Sandboxing execution: ${command}`);
    // Parse the JSON output from the sandbox execution
    const result = await executeInSandbox(command, 'bash');
    return result;
}
//# sourceMappingURL=nuclei.js.map