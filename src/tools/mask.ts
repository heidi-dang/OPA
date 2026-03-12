import { executeInSandbox } from '../sandbox_local.js';

export async function maskIp(target: string, mode: string = "tor"): Promise<string> {
    console.log(`[Tool: mask_ip] Configuring sandbox anonymity using ${mode}...`);

    if (mode === 'tor' || mode === 'proxy') {
        const command = `
            # Install Tor if not available
            apt-get update -qq && apt-get install -y -qq tor torsocks proxychains > /dev/null 2>&1 || true
            
            # Start Tor service
            service tor start > /dev/null 2>&1 || systemctl start tor > /dev/null 2>&1 || tor &
            
            # Wait for Tor to bootstrap (max 30 seconds)
            for i in {1..30}; do
                if curl -s --socks5-hostname 127.0.0.1:9050 https://checkip.amazonaws.com > /dev/null 2>&1; then
                    break
                fi
                sleep 1
            done
            
            # Get current IP without Tor
            echo "=== Current IP (Direct Connection) ==="
            curl -s https://checkip.amazonaws.com 2>/dev/null || echo "Unable to determine direct IP"
            
            # Get current IP with Tor
            echo ""
            echo "=== Current IP (Via Tor Network) ==="
            curl -s --socks5-hostname 127.0.0.1:9050 https://checkip.amazonaws.com 2>/dev/null || echo "Unable to determine Tor IP"
            
            echo ""
            echo "=== Tor Configuration ==="
            echo "To route traffic through Tor, use one of these methods:"
            echo "1. torsocks <command>  - Routes command through Tor"
            echo "2. curl --socks5-hostname 127.0.0.1:9050 <url>"
            echo "3. proxychains <command> - Routes through proxy chain"
            echo ""
            echo "=== Verification ==="
            echo "Checking Tor connectivity..."
            if curl -s --socks5-hostname 127.0.0.1:9050 https://checkip.amazonaws.com > /dev/null 2>&1; then
                echo "✅ Tor is working correctly"
            else
                echo "⚠️  Tor may not be fully initialized yet"
            fi
        `;
        
        try {
            const result = await executeInSandbox(command, 'bash');
            return `🔒 IP Masking Configuration (${mode.toUpperCase()}):\n${result}\n\n💡 To ensure anonymity for subsequent tools, prepend commands with 'torsocks' or use --socks5-hostname 127.0.0.1:9050`;
        } catch (error: any) {
            return `❌ Failed to configure ${mode} masking: ${error.message}`;
        }
    } else {
        return `❌ Unsupported masking mode: ${mode}. Supported modes: 'tor', 'proxy'`;
    }
}
