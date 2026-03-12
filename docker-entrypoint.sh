#!/bin/bash

# Local OPA Sandbox Entrypoint Script
# This script initializes the local sandbox environment

set -e

echo "🚀 Initializing OPA Local Sandbox Environment..."

# Create necessary directories
mkdir -p /workspace/{reports,temp,logs,scans,exploits,configs}

# Set up environment variables
export OPA_SANDBOX_MODE="local"
export OPA_WORKSPACE="/workspace"
export OPA_REPORTS_DIR="/workspace/reports"
export OPA_TEMP_DIR="/workspace/temp"
export OPA_LOGS_DIR="/workspace/logs"

# Initialize log files
echo "$(date): OPA Sandbox initialized" > /workspace/logs/sandbox.log
echo "$(date): Environment variables set" >> /workspace/logs/sandbox.log

# Create tool configuration files
cat > /workspace/configs/tools.conf << EOF
# OPA Tool Configuration
nmap_path=/usr/bin/nmap
nuclei_path=/usr/local/bin/nuclei
ffuf_path=/usr/local/bin/ffuf
subfinder_path=/usr/local/bin/subfinder
amass_path=/usr/local/bin/amass
massdns_path=/usr/local/bin/massdns
searchsploit_path=/usr/local/bin/searchsploit
theharvester_path=/usr/bin/theHarvester
sherlock_path=/usr/bin/sherlock
whatweb_path=/usr/bin/whatweb
metasploit_path=/usr/bin/msfconsole
hydra_path=/usr/bin/hydra
sqlmap_path=/usr/bin/sqlmap
nikto_path=/usr/bin/nikto
gobuster_path=/usr/bin/gobuster
dirb_path=/usr/bin/dirb
john_path=/usr/bin/john
hashcat_path=/usr/bin/hashcat
aircrack_path=/usr/bin/aircrack-ng
tshark_path=/usr/bin/tshark
EOF

# Create nuclei templates update script
cat > /workspace/scripts/update-nuclei.sh << EOF
#!/bin/bash
echo "🔄 Updating Nuclei templates..."
nuclei -update-templates
echo "✅ Nuclei templates updated successfully"
EOF
chmod +x /workspace/scripts/update-nuclei.sh

# Create tool verification script
cat > /workspace/scripts/verify-tools.sh << EOF
#!/bin/bash

echo "🔍 Verifying installed tools..."

tools=(
    "nmap"
    "nuclei"
    "ffuf"
    "subfinder"
    "amass"
    "massdns"
    "searchsploit"
    "theHarvester"
    "sherlock"
    "whatweb"
    "msfconsole"
    "hydra"
    "sqlmap"
    "nikto"
    "gobuster"
    "dirb"
    "john"
    "hashcat"
    "aircrack-ng"
    "tshark"
)

failed_tools=()

for tool in "\${tools[@]}"; do
    if command -v "\$tool" &> /dev/null; then
        echo "✅ \$tool is installed"
    else
        echo "❌ \$tool is NOT installed"
        failed_tools+=("\$tool")
    fi
done

if [ \${#failed_tools[@]} -eq 0 ]; then
    echo "🎉 All tools are successfully installed!"
    exit 0
else
    echo "⚠️  Some tools are missing: \${failed_tools[*]}"
    exit 1
fi
EOF
chmod +x /workspace/scripts/verify-tools.sh

# Create workspace cleanup script
cat > /workspace/scripts/cleanup.sh << EOF
#!/bin/bash

echo "🧹 Cleaning up workspace..."

# Clean temporary files
find /workspace/temp -type f -mtime +1 -delete 2>/dev/null || true

# Clean old logs (keep last 7 days)
find /workspace/logs -name "*.log" -mtime +7 -delete 2>/dev/null || true

# Clean old reports (keep last 30 days)
find /workspace/reports -name "*.txt" -mtime +30 -delete 2>/dev/null || true
find /workspace/reports -name "*.html" -mtime +30 -delete 2>/dev/null || true
find /workspace/reports -name "*.json" -mtime +30 -delete 2>/dev/null || true

echo "✅ Workspace cleanup completed"
EOF
chmod +x /workspace/scripts/cleanup.sh

# Create scripts directory
mkdir -p /workspace/scripts

# Create status monitoring script
cat > /workspace/scripts/status.sh << EOF
#!/bin/bash

echo "📊 OPA Sandbox Status Report"
echo "=========================="
echo "Timestamp: \$(date)"
echo "Uptime: \$(uptime)"
echo ""
echo "Disk Usage:"
df -h /workspace
echo ""
echo "Memory Usage:"
free -h
echo ""
echo "Running Processes:"
ps aux | grep -E "(nmap|nuclei|ffuf|subfinder|amass)" | head -10
echo ""
echo "Recent Log Entries:"
tail -20 /workspace/logs/sandbox.log 2>/dev/null || echo "No log entries found"
EOF
chmod +x /workspace/scripts/status.sh

# Set up cron jobs for maintenance
echo "0 2 * * * /workspace/scripts/update-nuclei.sh >> /workspace/logs/nuclei-update.log 2>&1" | crontab -
echo "0 3 * * * /workspace/scripts/cleanup.sh >> /workspace/logs/cleanup.log 2>&1" | crontab -

# Start cron service
service cron start

# Create welcome message
cat > /workspace/.welcome << EOF
🎉 Welcome to OPA Local Sandbox Environment!

📍 Current Directory: /workspace
🛠️  Available Tools:
  • Network Scanning: nmap, masscan
  • Web Testing: nuclei, ffuf, gobuster, dirb, nikto, whatweb
  • OSINT: subfinder, amass, theHarvester, sherlock
  • Exploitation: metasploit, hydra, sqlmap
  • Password Cracking: john, hashcat
  • Wireless: aircrack-ng
  • Forensics: tshark

📁 Directories:
  • /workspace/reports - Generated reports
  • /workspace/temp - Temporary files
  • /workspace/logs - Log files
  • /workspace/scans - Scan results
  • /workspace/exploits - Generated exploits
  • /workspace/scripts - Utility scripts

🔧 Useful Commands:
  • verify-tools - Check all tool installations
  • status.sh - Show sandbox status
  • cleanup.sh - Clean up old files
  • update-nuclei.sh - Update nuclei templates

📖 Documentation: Check the README.md for detailed usage instructions

Happy hacking! 🚀
EOF

# Display welcome message
cat /workspace/.welcome

echo ""
echo "✅ OPA Local Sandbox is ready!"
echo "📍 Working directory: /workspace"
echo "🔧 Run 'verify-tools' to verify all installations"
echo ""

# Execute the provided command or start shell
if [ $# -eq 0 ]; then
    exec /bin/bash
else
    exec "$@"
fi
