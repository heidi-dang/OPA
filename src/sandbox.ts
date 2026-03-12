import { Sandbox } from '@e2b/code-interpreter';

let currentSandbox: Sandbox | null = null;

// Connect to or create an E2B Sandbox for isolated code and tool execution
export async function getOrCreateSandbox(): Promise<Sandbox> {
    if (!currentSandbox) {
        console.log("Initializing secure E2B sandbox environment...");
        // Replace 'OPA_TEMPLATE_ID' with the actual template ID after running `e2b build`
        currentSandbox = await Sandbox.create('OPA_TEMPLATE_ID');
    }
    return currentSandbox;
}

// Helper to execute commands or generated bot scripts safely
export async function executeInSandbox(code: string, language: string = 'python'): Promise<string> {
    const sandbox = await getOrCreateSandbox();
    console.log(`Executing ${language} code in sandbox...`);
    
    try {
        if (language === 'python') {
            const execution = await sandbox.runCode(code);
            return execution.logs.stdout.join('\n') + '\n' + execution.logs.stderr.join('\n');
        } else if (language === 'bash' || language === 'sh') {
            const execution = await sandbox.commands.run(code);
            return execution.stdout + '\n' + execution.stderr;
        } else {
            throw new Error(`Unsupported sandbox language: ${language}`);
        }
    } catch (e: any) {
        return `Execution error:\n${e.message}`;
    }
}

// Clean up sandbox resources when done
export async function closeSandbox() {
    if (currentSandbox) {
        await currentSandbox.kill();
        currentSandbox = null;
    }
}
