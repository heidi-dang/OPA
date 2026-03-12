import { spawn, ChildProcess } from 'child_process';
import { promisify } from 'util';
import { exec as execCallback } from 'child_process';
const exec = promisify(execCallback);
class LocalSandbox {
    containerId = null;
    config;
    isRunning = false;
    constructor(config = {}) {
        this.config = {
            dockerImage: config.dockerImage || 'opa-local-sandbox:latest',
            containerName: config.containerName || 'opa-sandbox',
            autoStart: config.autoStart !== false,
            workspace: config.workspace || '/workspace'
        };
    }
    commands = {
        run: async (command) => {
            return await this.executeCommand(command);
        }
    };
    async start() {
        if (this.isRunning) {
            console.log('Local sandbox is already running');
            return;
        }
        try {
            // Check if container already exists
            const { stdout } = await exec(`docker ps -a --filter name=${this.config.containerName} --format "{{.ID}}"`);
            if (stdout.trim()) {
                // Container exists, start it
                console.log(`Starting existing container: ${this.config.containerName}`);
                await exec(`docker start ${this.config.containerName}`);
                this.containerId = stdout.trim();
            }
            else {
                // Create new container
                console.log(`Creating new container from image: ${this.config.dockerImage}`);
                const result = await exec(`docker run -d --name ${this.config.containerName} ` +
                    `-v ${process.cwd()}/workspace:/workspace ` +
                    `--network host ` +
                    `${this.config.dockerImage} ` +
                    `tail -f /dev/null`);
                this.containerId = result.stdout.trim();
            }
            this.isRunning = true;
            console.log('Local sandbox started successfully');
            // Wait a moment for container to be fully ready
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        catch (error) {
            throw new Error(`Failed to start local sandbox: ${error.message}`);
        }
    }
    async stop() {
        if (!this.isRunning || !this.containerId) {
            console.log('Local sandbox is not running');
            return;
        }
        try {
            await exec(`docker stop ${this.config.containerName}`);
            this.isRunning = false;
            console.log('Local sandbox stopped');
        }
        catch (error) {
            console.error(`Failed to stop sandbox: ${error.message}`);
        }
    }
    async close() {
        await this.stop();
    }
    async remove() {
        await this.stop();
        try {
            await exec(`docker rm ${this.config.containerName}`);
            console.log('Local sandbox container removed');
        }
        catch (error) {
            console.error(`Failed to remove sandbox: ${error.message}`);
        }
    }
    async executeCommand(command, cwd) {
        if (!this.isRunning) {
            await this.start();
        }
        try {
            const workDir = cwd || this.config.workspace;
            const dockerCommand = `docker exec ${this.config.containerName} bash -c 'cd ${workDir} && ${command}'`;
            const { stdout, stderr } = await exec(dockerCommand);
            return {
                stdout: stdout || '',
                stderr: stderr || '',
                exitCode: 0
            };
        }
        catch (error) {
            return {
                stdout: '',
                stderr: error.message || 'Command execution failed',
                exitCode: error.code || 1
            };
        }
    }
    async uploadFile(localPath, remotePath) {
        try {
            await exec(`docker cp ${localPath} ${this.config.containerName}:${remotePath}`);
            console.log(`File uploaded: ${localPath} -> ${remotePath}`);
        }
        catch (error) {
            throw new Error(`Failed to upload file: ${error.message}`);
        }
    }
    async downloadFile(remotePath, localPath) {
        try {
            await exec(`docker cp ${this.config.containerName}:${remotePath} ${localPath}`);
            console.log(`File downloaded: ${remotePath} -> ${localPath}`);
        }
        catch (error) {
            throw new Error(`Failed to download file: ${error.message}`);
        }
    }
    async getStatus() {
        if (!this.containerId) {
            return { status: 'not_created' };
        }
        try {
            const { stdout } = await exec(`docker inspect ${this.config.containerName}`);
            const inspectData = JSON.parse(stdout)[0];
            return {
                status: inspectData.State.Status,
                created: inspectData.Created,
                started: inspectData.State.StartedAt,
                image: this.config.dockerImage,
                name: this.config.containerName
            };
        }
        catch (error) {
            return { status: 'error', error: error.message };
        }
    }
    async runCode(code, language = 'bash') {
        let command;
        switch (language.toLowerCase()) {
            case 'python':
            case 'python3':
                command = `python3 << 'EOF'\n${code}\nEOF`;
                break;
            case 'bash':
            case 'sh':
                command = code;
                break;
            case 'node':
            case 'javascript':
                command = `node << 'EOF'\n${code}\nEOF`;
                break;
            default:
                throw new Error(`Unsupported language: ${language}`);
        }
        return await this.executeCommand(command);
    }
}
class E2BSandbox {
    // Keep the existing E2B implementation for backward compatibility
    sandbox = null;
    commands = {
        run: async (command) => {
            return await this.executeCommand(command);
        }
    };
    async start() {
        // Placeholder for E2B connection
        console.log('E2B sandbox connection (placeholder)');
    }
    async stop() {
        // Placeholder for E2B stop
        console.log('E2B sandbox stopped');
    }
    async executeCommand(command, cwd) {
        // Placeholder for E2B command execution
        return {
            stdout: `E2B execution of: ${command}`,
            stderr: '',
            exitCode: 0
        };
    }
    async runCode(code, language = 'python') {
        // Placeholder for E2B code execution
        return {
            stdout: `E2B code execution in ${language}`,
            stderr: '',
            exitCode: 0
        };
    }
    async close() {
        // Placeholder for E2B cleanup
        console.log('E2B sandbox closed');
    }
}
// Factory function to create appropriate sandbox
export function createSandbox(type = 'local', config) {
    switch (type) {
        case 'local':
            return new LocalSandbox(config);
        case 'e2b':
            return new E2BSandbox();
        default:
            throw new Error(`Unsupported sandbox type: ${type}`);
    }
}
// Legacy compatibility
let currentSandbox = null;
export async function getOrCreateSandbox(type = 'local') {
    if (!currentSandbox) {
        console.log(`Initializing ${type} sandbox environment...`);
        currentSandbox = createSandbox(type);
        if (type === 'local') {
            await currentSandbox.start();
        }
        else {
            await currentSandbox.start();
        }
    }
    return currentSandbox;
}
// Helper to execute commands or generated bot scripts safely
export async function executeInSandbox(code, language = 'python') {
    const sandbox = await getOrCreateSandbox();
    console.log(`Executing ${language} code in sandbox...`);
    try {
        const result = await sandbox.runCode(code, language);
        return result.stdout + '\n' + result.stderr;
    }
    catch (e) {
        return `Execution error:\n${e.message}`;
    }
}
// Clean up sandbox resources when done
export async function closeSandbox() {
    if (currentSandbox) {
        await currentSandbox.close();
        currentSandbox = null;
    }
}
// Local sandbox management functions
export async function startLocalSandbox(config) {
    const sandbox = createSandbox('local', config);
    await sandbox.start();
}
export async function stopLocalSandbox() {
    const sandbox = createSandbox('local');
    await sandbox.stop();
}
export async function removeLocalSandbox() {
    const sandbox = createSandbox('local');
    await sandbox.remove();
}
export async function getLocalSandboxStatus() {
    const sandbox = createSandbox('local');
    return await sandbox.getStatus();
}
// Docker management functions
export async function buildLocalSandbox() {
    try {
        console.log('Building local sandbox Docker image...');
        const { stdout, stderr } = await exec('docker build -t opa-local-sandbox:latest -f Dockerfile.local .');
        if (stderr && !stderr.includes('warning')) {
            console.error('Build warnings/errors:', stderr);
        }
        console.log('✅ Local sandbox Docker image built successfully');
    }
    catch (error) {
        throw new Error(`Failed to build Docker image: ${error.message}`);
    }
}
export async function checkDockerAvailability() {
    try {
        await exec('docker --version');
        return true;
    }
    catch {
        return false;
    }
}
// Environment detection
export async function detectEnvironment() {
    const env = process.env.OPA_SANDBOX_ENV?.toLowerCase();
    if (env === 'e2b')
        return 'e2b';
    if (env === 'local')
        return 'local';
    // Auto-detect based on available tools
    if (process.env.E2B_API_KEY)
        return 'e2b';
    if (process.env.DOCKER_AVAILABLE === 'true' || await checkDockerAvailability())
        return 'local';
    return 'unknown';
}
//# sourceMappingURL=sandbox_local.js.map