interface LocalSandboxConfig {
    dockerImage?: string;
    containerName?: string;
    autoStart?: boolean;
    workspace?: string;
}
interface CommandResult {
    stdout: string;
    stderr: string;
    exitCode: number;
}
export interface SandboxInterface {
    start(): Promise<void>;
    stop(): Promise<void>;
    executeCommand(command: string, cwd?: string): Promise<CommandResult>;
    runCode(code: string, language?: string): Promise<CommandResult>;
    close(): Promise<void>;
    commands: {
        run(command: string): Promise<CommandResult>;
    };
}
export declare function createSandbox(type?: 'local' | 'e2b', config?: LocalSandboxConfig): SandboxInterface;
export declare function getOrCreateSandbox(type?: 'local' | 'e2b'): Promise<SandboxInterface>;
export declare function executeInSandbox(code: string, language?: string): Promise<string>;
export declare function closeSandbox(): Promise<void>;
export declare function startLocalSandbox(config?: LocalSandboxConfig): Promise<void>;
export declare function stopLocalSandbox(): Promise<void>;
export declare function removeLocalSandbox(): Promise<void>;
export declare function getLocalSandboxStatus(): Promise<any>;
export declare function buildLocalSandbox(): Promise<void>;
export declare function checkDockerAvailability(): Promise<boolean>;
export declare function detectEnvironment(): Promise<'local' | 'e2b' | 'unknown'>;
export {};
//# sourceMappingURL=sandbox_local.d.ts.map