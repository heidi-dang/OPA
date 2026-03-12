import { executeInSandbox } from '../sandbox_local.js';
export async function parsePcap(filePath) {
    // Using tshark in the sandbox to parse the PCAP file
    // Assumes the file is made available inside the sandbox context
    const command = `tshark -r ${filePath} -T fields -e tcp.payload -Y 'http or telnet or ftp'`;
    console.log(`[Tool: parse_pcap] Parsing PCAP via sandbox...`);
    const result = await executeInSandbox(command, 'bash');
    return result;
}
//# sourceMappingURL=pcap.js.map