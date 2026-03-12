import { Sandbox } from '@e2b/code-interpreter';
export declare function getOrCreateSandbox(): Promise<Sandbox>;
export declare function executeInSandbox(code: string, language?: string): Promise<string>;
export declare function closeSandbox(): Promise<void>;
//# sourceMappingURL=sandbox.d.ts.map