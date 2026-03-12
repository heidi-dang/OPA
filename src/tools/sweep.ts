import { executeInSandbox } from '../sandbox.js';

export async function sweepLocalNetwork(): Promise<string> {
    // Uses Nmap within the sandbox to discover live hosts on the local subnets
    // We run a fast ping sweep on common private ranges
    const command = `nmap -sn 192.168.0.0/16 10.0.0.0/8 172.16.0.0/12 -T4 --min-rate 1000 -oG - | awk '/Up$/{print $2}'`;
    console.log(`[Tool: sweep_local_network] Scanning for active local targets...`);
    
    const result = await executeInSandbox(command, 'bash');
    
    if (!result.trim()) {
        return "No local hosts discovered or scanning was blocked.";
    }
    
    return `Discovered Active Local Hosts:\n${result}`;
}
