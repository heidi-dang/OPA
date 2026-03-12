import { executeInSandbox } from '../sandbox.js';
export async function nmapScan(target, args = '-T4 -F') {
    // Note: In an actual production environment, a custom E2B template 
    // with standard security tools pre-installed (nmap, ffuf, nuclei) would be used.
    const command = `nmap ${args} ${target}`;
    console.log(`[Tool: nmap_scan] Sandboxing execution: ${command}`);
    // Execute Nmap inside the isolated E2B sandbox
    const result = await executeInSandbox(command, 'bash');
    return result;
}
//# sourceMappingURL=nmap.js.map