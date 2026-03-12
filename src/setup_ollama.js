import { exec } from 'child_process';
import util from 'util';
const execAsync = util.promisify(exec);
/**
 * Checks if Ollama is installed and running, then pulls a standard model
 * suited for defensive security analysis, code review, and log parsing.
 */
export async function setupLocalDefensiveModel(modelName = 'llama3') {
    console.log(`[Setup] Checking if Ollama is installed and running...`);
    try {
        await execAsync('ollama --version');
    }
    catch (error) {
        return "Error: Ollama is not installed or not running in the environment. Please install Ollama from https://ollama.com first.";
    }
    console.log(`[Setup] Checking if defensive analysis model '${modelName}' is available locally...`);
    try {
        const { stdout } = await execAsync('ollama list');
        if (!stdout.includes(modelName)) {
            console.log(`[Setup] Model '${modelName}' not found. Downloading... (This may take a several minutes)`);
            // Pulls the model locally
            await execAsync(`ollama pull ${modelName}`);
            console.log(`[Setup] Model '${modelName}' successfully downloaded.`);
            // Note: To automatically add this to OpenCode's available model list,
            // you would typically append this model's signature to the OpenCode config file
            // (e.g., ~/.opencode/models.json), depending on OpenCode's specific architecture.
            return `Success: Ollama is running and model '${modelName}' is ready for defensive security analysis.`;
        }
        else {
            return `Success: Ollama is running and model '${modelName}' is already available.`;
        }
    }
    catch (error) {
        return `Error interacting with Ollama: ${error.message}`;
    }
}
//# sourceMappingURL=setup_ollama.js.map