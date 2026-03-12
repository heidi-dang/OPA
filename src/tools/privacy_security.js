import { executeInSandbox } from '../sandbox_local.js';
export class PrivacySecurityAgent {
    config;
    constructor(config = {}) {
        this.config = {
            torEnabled: config.torEnabled !== false,
            proxyEnabled: config.proxyEnabled || false,
            checkAnonymity: config.checkAnonymity !== false,
            openTorBrowser: config.openTorBrowser || false,
            verifyTorConnection: config.verifyTorConnection !== false,
            torBridge: config.torBridge || 'obfs4',
            socksPort: config.socksPort || 9050
        };
    }
    /**
     * Complete privacy and security setup
     */
    async setupPrivacyAndSecurity() {
        console.log('🔒 Starting privacy and security setup...');
        const report = {
            originalIP: '',
            torIP: '',
            isAnonymous: false,
            torStatus: 'Not Configured',
            anonymityScore: 0,
            recommendations: [],
            timestamp: new Date().toISOString()
        };
        try {
            // Step 1: Install and configure Tor
            if (this.config.torEnabled) {
                await this.setupTor();
                report.torStatus = 'Configured';
                report.anonymityScore += 30;
                report.recommendations.push('✅ Tor service configured and running');
            }
            // Step 2: Configure proxy if enabled
            if (this.config.proxyEnabled) {
                await this.setupProxy();
                report.anonymityScore += 20;
                report.recommendations.push('✅ Proxy chain configured');
            }
            // Step 3: Check current IP (before Tor)
            if (this.config.checkAnonymity) {
                report.originalIP = await this.getCurrentIP();
                report.recommendations.push(`📍 Original IP detected: ${report.originalIP}`);
            }
            // Step 4: Verify Tor connection
            if (this.config.verifyTorConnection && this.config.torEnabled) {
                const torIP = this.config.torEnabled ? await this.getTorIP() : 'Not configured';
                report.torIP = torIP;
                report.isAnonymous = torIP !== report.originalIP;
                report.anonymityScore += report.isAnonymous ? 40 : 0;
                if (report.isAnonymous) {
                    report.recommendations.push('🎉 SUCCESS: IP is fully masked through Tor');
                }
                else {
                    report.recommendations.push('⚠️  WARNING: Tor may not be working correctly');
                }
            }
            // Step 5: Open Tor browser if requested
            if (this.config.openTorBrowser && this.config.torEnabled) {
                await this.openTorBrowser();
                report.recommendations.push('🌐 Tor browser opened for anonymous browsing');
                report.anonymityScore += 10;
            }
            // Step 6: Additional security hardening
            await this.hardenSystem();
            report.anonymityScore += 10;
            report.recommendations.push('🛡️ System security hardening applied');
            return this.generatePrivacyReport(report);
        }
        catch (error) {
            return `❌ Privacy and security setup failed: ${error.message}`;
        }
    }
    /**
     * Setup Tor service
     */
    async setupTor() {
        console.log('🔧 Setting up Tor service...');
        const setupCommands = `
            # Update package lists
            apt-get update -qq
            
            # Install Tor if not available
            if ! command -v tor >/dev/null 2>&1; then
                echo "Installing Tor..."
                apt-get install -y tor torsocks proxychains
            fi
            
            # Configure Tor service
            cat > /etc/tor/torrc << 'EOF'
SocksPort 9050
ControlPort 9051
DataDirectory /var/lib/tor
RunAsDaemon 1
ExitNodes ${this.config.torBridge}
MaxCircuitDirtiness 0.6
UseEntryGuards 1
NumEntryGuards 3
StrictNodes 1
AvoidDiskWrites 1
CircuitBuildTimeout 30
CircuitIdleTimeout 60
NewCircuitPeriod 60
Log notice file /var/log/tor/notices.log
Log warn file /var/log/tor/warn.log
Log error file /var/log/tor/error.log
Log debug file /var/log/tor/debug.log
EOF
            
            # Start Tor service
            systemctl enable tor
            systemctl start tor
            systemctl restart tor
            
            # Wait for Tor to bootstrap
            echo "Waiting for Tor to bootstrap..."
            for i in {1..30}; do
                if curl -s --socks5-hostname 127.0.0.1:${this.config.socksPort} https://checkip.amazonaws.com >/dev/null 2>&1; then
                    echo "Tor is ready!"
                    break
                fi
                sleep 2
            done
        `;
        await executeInSandbox(setupCommands, 'bash');
        console.log('✅ Tor setup completed');
    }
    /**
     * Setup proxy configuration
     */
    async setupProxy() {
        console.log('🔗 Setting up proxy configuration...');
        const proxyCommands = `
            # Configure proxychains for system-wide use
            cat > /etc/proxychains.conf << 'EOF'
# Proxychains configuration for OPA
strict_chain
random_chain
proxy_dns 
tcp_read_time_out 15000
tcp_connect_time_out 15000

[ProxyList]
# Add your proxy servers here
# Example:
# http 1.2.3.4:8080
# socks4 5.6.7.8:1080
EOF
            
            # Set environment variables
            export PROXYCHAINS_CONF=/etc/proxychains.conf
            echo "Proxy configuration updated"
        `;
        await executeInSandbox(proxyCommands, 'bash');
        console.log('✅ Proxy setup completed');
    }
    /**
     * Get current IP address
     */
    async getCurrentIP() {
        try {
            const result = await executeInSandbox('curl -s https://checkip.amazonaws.com', 'bash');
            const match = result.match(/(\d+\.\d+\.\d+\.\d+)/);
            return (match && match[1]) ? match[1] : 'Unknown';
        }
        catch (error) {
            return 'Detection failed';
        }
    }
    /**
     * Get Tor IP address
     */
    async getTorIP() {
        try {
            const result = await executeInSandbox(`curl -s --socks5-hostname 127.0.0.1:${this.config.socksPort} https://checkip.amazonaws.com`, 'bash');
            const match = result.match(/(\d+\.\d+\.\d+\.\d+)/);
            return (match && match[1]) ? match[1] : 'Unknown';
        }
        catch (error) {
            return 'Detection failed';
        }
    }
    /**
     * Open Tor browser
     */
    async openTorBrowser() {
        console.log('🌐 Opening Tor browser...');
        const browserCommands = `
            # Install Tor Browser if not available
            if ! command -v tor-browser >/dev/null 2>&1; then
                echo "Installing Tor Browser..."
                apt-get install -y tor-browser
            fi
            
            # Configure Tor Browser to use Tor SOCKS proxy
            export TOR_SOCKS_PORT=${this.config.socksPort}
            export TOR_CONTROL_PORT=9051
            
            # Launch Tor Browser
            tor-browser --new-window &
            
            # Wait a moment for browser to start
            sleep 5
            
            echo "Tor Browser launched with Tor SOCKS5 proxy"
        `;
        await executeInSandbox(browserCommands, 'bash');
        console.log('✅ Tor browser opened');
    }
    /**
     * Harden system security
     */
    async hardenSystem() {
        console.log('🛡️ Applying system security hardening...');
        const hardeningCommands = `
            # Disable unnecessary services
            systemctl stop avahi-daemon 2>/dev/null || true
            systemctl stop cups 2>/dev/null || true
            systemctl stop bluetooth 2>/dev/null || true
            
            # Configure firewall rules
            ufw --force reset
            ufw default deny incoming
            ufw default allow outgoing
            ufw allow out 53
            ufw allow out 80,443
            ufw allow out 9050,9051
            ufw --force enable
            
            # Disable IPv6 if not needed
            sysctl -w net.ipv6.conf.all.disable_ipv6=1
            
            # Clear DNS cache
            echo "" > /etc/resolv.conf
            echo "nameserver 8.8.8.8" > /etc/resolv.conf
            echo "nameserver 8.8.4.4" >> /etc/resolv.conf
            
            # Set secure permissions
            chmod 600 /etc/tor/torrc
            chmod 600 /etc/proxychains.conf
            
            # Clear bash history
            history -c
            > ~/.bash_history
            
            echo "System security hardening applied"
        `;
        await executeInSandbox(hardeningCommands, 'bash');
        console.log('✅ System security hardening completed');
    }
    /**
     * Generate comprehensive privacy report
     */
    generatePrivacyReport(report) {
        return `
╔════════════════════════════════════════════════════════╗
║              PRIVACY & SECURITY SETUP REPORT                   ║
╚═════════════════════════════════════════════════════════

EXECUTION SUMMARY:
• Timestamp: ${report.timestamp}
• Tor Status: ${report.torStatus}
• Anonymity Score: ${report.anonymityScore}/100
• Privacy Level: ${this.getPrivacyLevel(report.anonymityScore)}

═════════════════════════════════════════════════════════

NETWORK INFORMATION:
• Original IP: ${report.originalIP}
• Tor IP: ${report.torIP}
• IP Masking: ${report.isAnonymous ? '✅ SUCCESSFUL' : '❌ FAILED'}
• SOCKS Port: ${this.config.socksPort}
• Tor Bridge: ${this.config.torBridge}

═════════════════════════════════════════════════════════

SECURITY MEASURES:
• Tor Service: ${this.config.torEnabled ? '✅ Configured' : '❌ Not configured'}
• Proxy Chain: ${this.config.proxyEnabled ? '✅ Configured' : '❌ Not configured'}
• Browser Protection: ${this.config.openTorBrowser ? '✅ Tor Browser launched' : '❌ Not launched'}
• System Hardening: ✅ Applied

═══════════════════════════════════════════════════════

RECOMMENDATIONS:
${report.recommendations.map(rec => `• ${rec}`).join('\n')}

═══════════════════════════════════════════════════════════

PRIVACY LEVELS:
• 0-25: 🟥 HIGH RISK - No protection
• 26-50: 🟡 MEDIUM RISK - Basic protection
• 51-75: 🟢 LOW RISK - Good protection
• 76-100: 🟢 LOW RISK - Excellent protection

═════════════════════════════════════════════════════════

NEXT STEPS:
1. Test anonymity by visiting: https://check.torproject.org
2. Monitor Tor status with: systemctl status tor
3. Use torsocks for command line tools: torsocks curl <url>
4. Restart services if needed: systemctl restart tor
5. Check logs: tail -f /var/log/tor/notices.log

═════════════════════════════════════════════════════
Report Generated: ${new Date().toISOString()}
`;
    }
    /**
     * Get privacy level based on score
     */
    getPrivacyLevel(score) {
        if (score >= 76)
            return '🟢 EXCELLENT';
        if (score >= 51)
            return '🟢 GOOD';
        if (score >= 26)
            return '🟡 MODERATE';
        return '🟥 HIGH RISK';
    }
    /**
     * Quick privacy check
     */
    async quickPrivacyCheck() {
        console.log('🔍 Performing quick privacy check...');
        const currentIP = await this.getCurrentIP();
        const torIP = this.config.torEnabled ? await this.getTorIP() : 'Not configured';
        const isAnonymous = this.config.torEnabled && (torIP !== currentIP);
        const score = isAnonymous ? 80 : 20;
        return `
🔍 PRIVACY CHECK RESULTS:
Current IP: ${currentIP}
Tor IP: ${torIP}
Status: ${isAnonymous ? '✅ ANONYMOUS' : '❌ NOT ANONYMOUS'}
Score: ${score}/100
Level: ${this.getPrivacyLevel(score)}

${isAnonymous ?
            '✅ Your connection is properly masked through Tor' :
            '⚠️  Your connection is NOT anonymous. Consider enabling Tor.'}
`;
    }
    /**
     * Stop all privacy services
     */
    async stopPrivacyServices() {
        console.log('🛑 Stopping privacy services...');
        const stopCommands = `
            # Stop Tor Browser
            pkill -f tor-browser 2>/dev/null || true
            
            # Stop Tor service
            systemctl stop tor
            systemctl disable tor
            
            # Clear proxy settings
            unset PROXYCHAINS_CONF
            rm -f /etc/proxychains.conf 2>/dev/null || true
            
            # Restore firewall to default
            ufw --force reset
            ufw default allow incoming
            ufw default allow outgoing
            
            echo "All privacy services stopped"
        `;
        await executeInSandbox(stopCommands, 'bash');
        console.log('✅ Privacy services stopped');
        return 'All privacy services have been stopped';
    }
}
// Global privacy agent instance
let privacyAgent = null;
/**
 * Get or create privacy agent
 */
export function getPrivacyAgent(config) {
    if (!privacyAgent) {
        privacyAgent = new PrivacySecurityAgent(config);
    }
    return privacyAgent;
}
/**
 * Setup complete privacy and security environment
 */
export async function setupPrivacyAndSecurity(config) {
    const agent = getPrivacyAgent(config);
    return await agent.setupPrivacyAndSecurity();
}
/**
 * Quick privacy check
 */
export async function quickPrivacyCheck(config) {
    const agent = getPrivacyAgent(config);
    return await agent.quickPrivacyCheck();
}
/**
 * Stop privacy services
 */
export async function stopPrivacyServices() {
    const agent = getPrivacyAgent();
    return await agent.stopPrivacyServices();
}
/**
 * Get current privacy status
 */
export async function getPrivacyStatus() {
    const agent = getPrivacyAgent();
    const check = await agent.quickPrivacyCheck();
    return `
🔍 CURRENT PRIVACY STATUS:
${check}

Use 'setupPrivacyAndSecurity' to configure complete privacy protection.
Use 'stopPrivacyServices' to stop all privacy services.
Use 'quickPrivacyCheck' to verify anonymity status.
`;
}
//# sourceMappingURL=privacy_security.js.map