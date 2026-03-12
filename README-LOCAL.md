# OPA Local Sandbox Documentation

## Overview

The OPA (Offensive Penetration Agent) Local Sandbox provides a complete, self-contained environment for security testing and penetration testing. It includes all necessary tools and dependencies pre-installed in a Docker container, ensuring consistent and reproducible testing environments.

## Features

### 🔧 Pre-installed Security Tools

- **Network Scanning**: nmap, masscan
- **Web Application Testing**: nuclei, ffuf, gobuster, dirb, nikto, whatweb
- **OSINT**: subfinder, amass, theHarvester, sherlock
- **Exploitation**: metasploit-framework, hydra, sqlmap
- **Password Cracking**: john, hashcat
- **Wireless**: aircrack-ng
- **Forensics**: tshark, wireshark
- **Blockchain**: web3, slither-analyzer

### 🚀 Key Capabilities

- **Isolated Environment**: Complete isolation from host system
- **Parallel Execution**: Multi-threaded tool execution with priority scheduling
- **Comprehensive Reporting**: Detailed reports with security recommendations
- **Tool Integration**: Seamless integration with external security tools
- **Blockchain Security**: Smart contract auditing and wallet analysis

## Quick Start

### Prerequisites

- Docker (>= 20.10)
- Docker Compose (optional)
- Node.js (>= 16)
- npm (>= 8)

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd OPA
   ```

2. **Run the setup script**:
   ```bash
   chmod +x setup-local.sh
   ./setup-local.sh
   ```

3. **Start the sandbox**:
   ```bash
   ./scripts/sandbox.sh start
   ```

4. **Verify installation**:
   ```bash
   ./scripts/sandbox.sh status
   ./scripts/test.sh
   ```

## Usage

### Sandbox Management

The `scripts/sandbox.sh` script provides easy sandbox management:

```bash
./scripts/sandbox.sh start      # Start the sandbox
./scripts/sandbox.sh stop       # Stop the sandbox
./scripts/sandbox.sh restart    # Restart the sandbox
./scripts/sandbox.sh status     # Check sandbox status
./scripts/sandbox.sh logs       # View sandbox logs
./scripts/sandbox.sh shell      # Open shell in sandbox
./scripts/sandbox.sh clean      # Clean up sandbox
./scripts/sandbox.sh rebuild    # Rebuild sandbox image
```

### Development Environment

Start the development environment:

```bash
./scripts/dev.sh
```

This will:
1. Start the sandbox if not running
2. Build the TypeScript project
3. Start the OPA MCP server

### Running Tests

```bash
./scripts/test.sh
```

## Configuration

### Environment Variables

Create a `.env.local` file:

```bash
# OPA Local Sandbox Configuration
OPA_SANDBOX_ENV=local
OPA_WORKSPACE=./workspace
OPA_REPORTS_DIR=./workspace/reports
OPA_TEMP_DIR=./workspace/temp
OPA_LOGS_DIR=./workspace/logs

# Docker Configuration
DOCKER_IMAGE=opa-local-sandbox:latest
CONTAINER_NAME=opa-sandbox

# Tool Configuration
NMAP_TIMEOUT=300
NUCLEI_TIMEOUT=600
FFUF_TIMEOUT=300
```

### Tool Configuration

Edit `workspace/configs/opa.conf` to customize tool behavior:

```ini
# OPA Tool Configuration
timeout.default=300
timeout.nmap=600
timeout.nuclei=900
timeout.ffuf=300

# Parallel execution limits
parallel.max_workers=4
parallel.high_priority_workers=2
parallel.medium_priority_workers=3
parallel.low_priority_workers=4

# Security settings
security.require_approval=true
security.safe_mode=true
security.log_level=info
```

## Available Tools

### Network Scanning

```bash
# Port scanning
nmap -sS -sV -O target.com

# Comprehensive scan
nmap -p 1-65535 -sV -sC -A target.com

# UDP scanning
nmap -sU -sV target.com
```

### Web Application Testing

```bash
# Vulnerability scanning
nuclei -u target.com

# Directory fuzzing
ffuf -u http://target.com/FUZZ -w /usr/share/wordlists/common.txt

# Technology detection
whatweb target.com
```

### OSINT

```bash
# Subdomain enumeration
subfinder -d target.com

# Asset discovery
amass enum -d target.com

# Email harvesting
theHarvester -d target.com -l 500 -b all

# Social media discovery
sherlock target
```

### Exploitation

```bash
# Start Metasploit
msfconsole

# Password spraying
hydra -l admin -P passwords.txt ssh://target.com

# SQL injection testing
sqlmap -u "http://target.com/page?id=1" --dbs
```

## Workspace Structure

```
workspace/
├── reports/          # Generated reports
├── temp/            # Temporary files
├── logs/            # Log files
│   ├── sandbox/     # Sandbox logs
│   ├── tools/       # Tool execution logs
│   └── scans/       # Scan logs
├── scans/           # Scan results
├── exploits/        # Generated exploits
├── configs/         # Configuration files
└── scripts/         # Utility scripts
```

## MCP Integration

### Available Tools

The OPA plugin provides the following MCP tools:

1. **osint_recon** - Open-source intelligence gathering
2. **parallel_execution** - Multi-tool parallel execution
3. **parallel_scan** - Coordinated parallel scanning
4. **security_tool_integrations** - External tool integration
5. **blockchain_security_audit** - Blockchain security analysis

### Example Usage

```javascript
// OSINT reconnaissance
const osintResult = await opa_osint_recon("target.com");

// Parallel scan
const scanResult = await opa_parallel_scan("target.com");

// Blockchain security audit
const blockchainResult = await opa_blockchain_security_audit("0x123...");
```

## Security Considerations

### Safe Execution

- All tools run in isolated Docker containers
- No direct access to host system
- Configurable timeouts and resource limits
- Approval required for potentially dangerous operations

### Data Protection

- Temporary files are automatically cleaned up
- Sensitive data is not persisted
- Logs are rotated and encrypted
- Network access can be restricted

### Compliance

- All activities are logged for audit purposes
- Tools are used in accordance with licenses
- Responsible disclosure guidelines followed
- Legal compliance checks implemented

## Troubleshooting

### Common Issues

1. **Docker daemon not running**
   ```bash
   sudo systemctl start docker
   ```

2. **Permission denied**
   ```bash
   sudo usermod -aG docker $USER
   # Log out and log back in
   ```

3. **Port conflicts**
   ```bash
   # Stop conflicting services or change ports
   ./scripts/sandbox.sh clean
   ./scripts/sandbox.sh start
   ```

4. **Build failures**
   ```bash
   # Rebuild the image
   ./scripts/sandbox.sh rebuild
   ```

### Debug Mode

Enable debug logging:

```bash
export OPA_LOG_LEVEL=debug
./scripts/dev.sh
```

### Log Analysis

View detailed logs:

```bash
# Sandbox logs
./scripts/sandbox.sh logs

# Tool execution logs
tail -f workspace/logs/tools/*.log

# Scan logs
tail -f workspace/logs/scans/*.log
```

## Performance Optimization

### Resource Limits

Configure resource limits in `Dockerfile.local`:

```dockerfile
# Limit memory usage
--memory="4g"

# Limit CPU usage
--cpus="2"

# Limit disk usage
--storage-opt="size=20G"
```

### Parallel Execution

Optimize parallel execution settings:

```ini
# Increase worker count for faster execution
parallel.max_workers=8

# Adjust timeouts for complex scans
timeout.nuclei=1800
timeout.nmap=900
```

### Caching

Enable caching for repeated operations:

```bash
# Cache nuclei templates
docker exec opa-sandbox nuclei -update-templates

# Cache wordlists
docker exec opa-sandbox ffuf -w /usr/share/wordlists/big.txt
```

## Advanced Usage

### Custom Tools

Add custom tools to the sandbox:

1. **Modify Dockerfile.local**:
   ```dockerfile
   RUN apt-get install -y custom-tool
   ```

2. **Rebuild the image**:
   ```bash
   ./scripts/sandbox.sh rebuild
   ```

3. **Update tool configuration**:
   ```ini
   custom_tool.timeout=300
   custom_tool.args=--default-args
   ```

### Network Configuration

Configure network settings:

```bash
# Host networking (default)
docker run --network host

# Isolated networking
docker run --network sandbox-net

# Custom DNS
docker run --dns=8.8.8.8 --dns=8.8.4.4
```

### Volume Mounting

Mount additional volumes:

```bash
docker run -v /path/to/data:/workspace/data \
           -v /path/to/tools:/opt/custom-tools \
           opa-local-sandbox:latest
```

## Integration with External Tools

### Burp Suite Integration

```javascript
// Configure Burp integration
const burpConfig = {
    host: 'localhost',
    port: 8080,
    apiKey: 'your-api-key'
};

const burpResult = await opa_security_tool_integrations(target.com, burpConfig);
```

### Nessus Integration

```javascript
// Configure Nessus integration
const nessusConfig = {
    host: 'localhost',
    port: 8834,
    username: 'admin',
    password: 'password',
    apiKey: 'your-api-key'
};

const nessusResult = await opa_security_tool_integrations(target.com, nessusConfig);
```

### Metasploit Integration

```javascript
// Configure Metasploit integration
const metasploitConfig = {
    host: 'localhost',
    port: 55553,
    apiKey: 'your-api-key'
};

const metasploitResult = await opa_security_tool_integrations(target.com, metasploitConfig);
```

## Contributing

### Development Setup

1. **Clone the repository**
2. **Run setup script**: `./setup-local.sh`
3. **Start development**: `./scripts/dev.sh`
4. **Run tests**: `./scripts/test.sh`

### Adding New Tools

1. **Update Dockerfile.local** with tool installation
2. **Create tool wrapper** in `src/tools/`
3. **Register tool** in `src/index.ts`
4. **Add tests** in `scripts/test.sh`
5. **Update documentation**

### Code Style

- Use TypeScript for all new code
- Follow existing naming conventions
- Add comprehensive error handling
- Include detailed logging
- Write unit tests

## Support

### Getting Help

- **Documentation**: Check this README and inline comments
- **Issues**: Create GitHub issues for bugs and feature requests
- **Community**: Join our Discord/Slack for community support
- **Email**: Contact support@opa-security.com

### Reporting Issues

When reporting issues, include:

1. **System information**: OS, Docker version, Node.js version
2. **Error messages**: Complete error output
3. **Steps to reproduce**: Detailed reproduction steps
4. **Expected behavior**: What you expected to happen
5. **Actual behavior**: What actually happened

### Feature Requests

Feature requests should include:

1. **Use case**: How you would use the feature
2. **Requirements**: Specific requirements for the feature
3. **Priority**: How important this feature is to you
4. **Alternatives**: Any alternative solutions you've considered

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Changelog

### Version 1.0.0

- Initial release
- Complete local sandbox environment
- Pre-installed security tools
- MCP integration
- Parallel execution engine
- OSINT framework
- Security tool integrations
- Blockchain security module

---

**Happy hacking with OPA! 🚀**

Remember to use these tools responsibly and only on systems you have permission to test.
