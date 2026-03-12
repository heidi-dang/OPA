import { executeInSandbox } from '../sandbox.js';

export async function analyzeWpaHandshake(capFilePath: string): Promise<string> {
    console.log(`[Tool: analyze_wpa_handshake] Initiating offline dictionary analysis on ${capFilePath}`);

    // This tool expects the .cap file to be uploaded or accessible within the E2B sandbox.
    // In a fully integrated OpenCode scenario, we would use the E2B SDK to upload the local file to the sandbox first.
    // For this demonstration, we assume the file name/path provided is relative to the sandbox's `/home/user`

    // Uses aircrack-ng with the standard SecLists common.txt we installed in the e2b.Dockerfile
    const command = `aircrack-ng -w /usr/share/wordlists/common.txt "${capFilePath}" | grep -iE 'KEY FOUND|Passphrase not in dictionary'`;
    
    try {
        const result = await executeInSandbox(command, 'bash');
        
        if (result.includes("KEY FOUND")) {
            return `[ALERT] Vulnerable PSK Detected!\n${result.trim()}\nRecommendation: Upgrade WPA2 passphrase complexity immediately.`;
        } else if (result.includes("Passphrase not in dictionary")) {
            return `[INFO] Handshake analysis completed. PSK resisted the common dictionary attack.\n${result.trim()}`;
        } else if (!result.trim()) {
            return `[ERROR] No valid WPA handshakes found in ${capFilePath}, or an error occurred.`;
        }
        
        return result;
    } catch (error: any) {
        return `Failed to execute aircrack-ng analysis: ${error.message}`;
    }
}
