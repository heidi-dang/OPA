# 🚀 OPA Plugin - OpenCode Installation & Usage Guide

## 📋 Table of Contents
1. [OpenCode Environment](#opencode-environment)
2. [Installation Methods](#installation-methods)
3. [Plugin Access](#plugin-access)
4. [Usage in OpenCode](#usage-in-opencode)
5. [Available Tools](#available-tools)
6. [Workflows](#workflows)
7. [Configuration](#configuration)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 OpenCode Environment

OpenCode is different from traditional IDEs. Here's how OPA integrates:

### **OpenCode Architecture:**
- **Web-based IDE** - Runs entirely in your browser
- **Extension System** - Uses browser extensions for additional functionality
- **MCP Integration** - Model Context Protocol (MCP) for tool integration
- **No Traditional Tools Panel** - Tools are accessed through MCP

### **How OPA Integrates:**
The OPA plugin uses **MCP (Model Context Protocol)** to integrate with OpenCode:

1. **MCP Server** - Runs locally with the plugin
2. **OpenCode MCP Client** - Connects to the MCP server
3. **Tool Registration** - OPA tools appear as available actions
4. **Context Sharing** - Plugin can access OpenCode's context and files

---

## 🛠️ Installation Methods

### **Method 1: Direct MCP Connection (Recommended)**

#### **Step 1: Start OPA MCP Server**
```bash
# Navigate to OPA directory
cd /path/to/OPA

# Start the MCP server
npm run dev

# The server will start on http://localhost:3000 by default
```

#### **Step 2: Configure OpenCode MCP Connection**
```bash
# In OpenCode, you'll need to configure MCP connection:

1. Open Command Palette (Cmd/Ctrl + Shift + P)
2. Type "MCP" 
3. Select "Add Server Connection"
4. Enter connection details:
   - Name: OPA Plugin
   - Server: http://localhost:3000
   - Auth: None (for local development)
```

#### **Step 3: Verify Connection**
```bash
# Check if OPA tools appear in OpenCode
# They should appear as available actions/tools
```

### **Method 2: OpenCode Extension (Future)**

For future OpenCode extension development:

```typescript
// Extension manifest for OPA
{
  "name": "OPA Security Tools",
  "description": "Offensive Penetration Agent tools for OpenCode",
  "version": "1.0.0",
  "permissions": ["filesystem", "network"],
  "mcp_servers": [{
    "name": "OPA Local Server",
    "url": "http://localhost:3000"
  }]
}
```

---

## 🔌 Plugin Access in OpenCode

### **How OPA Tools Appear:**

Once connected via MCP, OPA tools appear in several ways:

#### **1. Command Palette Access**
```
Cmd/Ctrl + Shift + P → Type "OPA" → Select tool
```

#### **2. Context Menu Actions**
```
Right-click on code/file → "OPA Tools" → Select relevant tool
```

#### **3. Inline Actions**
```
Select text in editor → "OPA" → Quick tool access
```

#### **4. Status Bar Integration**
```
Bottom status bar shows OPA connection status and available tools
```

### **Tool Categories in OpenCode:**
- **🔍 Reconnaissance** - Network scanning, OSINT
- **🛡️ Security Analysis** - Vulnerability scanning, exploitation
- **🔒 Privacy & Anonymity** - Tor setup, IP masking
- **🧠 Intelligence** - Web search, CVE research
- **🕵️ Anonymous Agent** - Orchestrated workflows
- **⚡ Automation** - Parallel execution, task management

---

## 🎯 Usage in OpenCode

### **Basic Tool Usage**
```bash
# In OpenCode, you can access tools through:

# 1. Command Palette
Cmd/Ctrl + Shift + P
Type: "OPA nmap_scan"
Enter target: target.com

# 2. Right-click menu
Right-click on file → "OPA Tools" → "OSINT Recon"
Enter target: target.com

# 3. Inline selection
Select IP address → "OPA" → "Quick Privacy Check"
```

### **Workflow Execution**
```bash
# Execute complete anonymous workflow
Cmd/Ctrl + Shift + P
Type: "OPA anonymous_workflow"
Parameters:
- Target: target.com
- Workflow: anonymous (for maximum anonymity)
```

### **Configuration in OpenCode**
```bash
# Access OPA settings
Cmd/Ctrl + Shift + P
Type: "OPA anonymous_agent_status"

# Configure privacy settings
Cmd/Ctrl + Shift + P  
Type: "OPA setup_privacy_security"
Parameters:
- tor: true
- browser: true
- verify: true
```

---

## 🛠️ Available Tools

### **Quick Access Commands**
| Command | Description | Example |
|---------|-------------|---------|
| `OPA nmap_scan` | Network port scanning | `OPA nmap_scan target.com` |
| `OPA osint_recon` | Intelligence gathering | `OPA osint_recon target.com` |
| `OPA quick_anonymous_setup` | Fast anonymity setup | `OPA quick_anonymous_setup` |
| `OPA anonymous_workflow` | Complete anonymous workflow | `OPA anonymous_workflow target.com anonymous` |
| `OPA check_privacy_status` | Privacy status check | `OPA check_privacy_status` |

### **Advanced Tools**
| Command | Description | Example |
|---------|-------------|---------|
| `OPA security_web_search` | Security-focused search | `OPA security_web_search "vulnerability research"` |
| `OPA intelligence_search` | Comprehensive intelligence | `OPA intelligence_search "target" CVE=true news=true` |
| `OPA run_nuclei` | Vulnerability scanning | `OPA run_nuclei target.com` |
| `OPA execute_parallel_tasks` | Parallel execution | `OPA execute_parallel_tasks` |

### **Parameter Examples**
```bash
# Nmap scan with specific ports
OPA nmap_scan target.com -p 80,443,8080

# OSINT with specific sources
OPA osint_recon target.com sources=linkedin,twitter,github

# Privacy setup with custom configuration
OPA setup_privacy_security tor=true browser=true bridge=obfs4 port=9050

# Intelligence search with filters
OPA intelligence_search "company name" CVE=true news=true social=true max_results=20
```

---

## 🔄 Workflows

### **Predefined Workflows**
```bash
# Anonymous reconnaissance workflow
OPA anonymous_workflow target.com recon

# Full security audit workflow  
OPA anonymous_workflow target.com security

# Intelligence gathering workflow
OPA anonymous_workflow target.com intelligence

# Privacy-only workflow
OPA anonymous_workflow target.com privacy
```

### **Custom Workflow Creation**
```bash
# You can create custom workflows by combining tools:
# Example: Anonymous security assessment
1. quick_anonymous_setup (setup anonymity)
2. intelligence_search "target" (gather intel)  
3. quick_anonymous_recon "target" (anonymous recon)
4. quick_security_analysis "target" (security analysis)
5. generate_report "security assessment" (document findings)
```

---

## ⚙️ Configuration

### **OpenCode MCP Settings**
```json
{
  "opa": {
    "server_url": "http://localhost:3000",
    "auto_connect": true,
    "default_workflow": "anonymous",
    "privacy_first": true,
    "log_level": "info"
  }
}
```

### **Environment Variables**
```bash
# Set OPA configuration
export OPA_SERVER_URL="http://localhost:3000"
export OPA_AUTO_PRIVACY=true
export OPA_DEFAULT_WORKFLOW="anonymous"
```

---

## 🐛 Troubleshooting

### **Common OpenCode Issues**

#### **MCP Connection Problems**
```bash
# Issue: OPA tools not appearing
# Solution 1: Check MCP server
curl http://localhost:3000/health

# Solution 2: Restart OpenCode
# Refresh OpenCode and retry connection

# Solution 3: Check OpenCode MCP settings
# Go to OpenCode Settings → Extensions → MCP → OPA Plugin
```

#### **Tool Execution Issues**
```bash
# Issue: Tool not responding
# Solution: Check server logs
npm run dev 2>&1 | grep ERROR

# Solution: Restart OPA server
npm run dev:restart
```

#### **Performance Issues**
```bash
# Issue: Slow tool execution
# Solution: Check system resources
htop | grep node

# Solution: Optimize OPA configuration
export OPA_PARALLEL_LIMIT=3
export OPA_CACHE_ENABLED=false
```

### **Debug Mode**
```bash
# Enable debug logging
export OPA_LOG_LEVEL=debug
npm run dev

# Check detailed logs
tail -f ~/.opa/logs/debug.log
```

---

## 🚀 Getting Started

### **Your First Security Assessment in OpenCode**

#### **Step 1: Start OPA Server**
```bash
cd /path/to/OPA
npm install
npm run dev
```

#### **Step 2: Connect OpenCode to OPA**
1. Open OpenCode
2. Open Command Palette (Cmd/Ctrl + Shift + P)
3. Type "MCP" 
4. Select "Add Server Connection"
5. Enter: `http://localhost:3000`
6. Connection should establish

#### **Step 3: Verify Tools Available**
1. Open Command Palette
2. Type "OPA" 
3. You should see all OPA tools listed

#### **Step 4: Execute Your First Tool**
```bash
# For maximum anonymity, start with:
OPA quick_anonymous_setup

# Then gather intelligence:
OPA intelligence_search "your-target"

# Check status:
OPA anonymous_agent_status
```

### **Best Practices for OpenCode**

#### **1. Privacy First**
- Always start with `quick_anonymous_setup`
- Verify anonymity before operations
- Use `anonymous_workflow` for complete operations

#### **2. Efficient Workflows**
- Use `execute_parallel_tasks` for multiple operations
- Leverage `intelligence_search` for comprehensive coverage
- Use predefined workflows for common tasks

#### **3. Resource Management**
- Monitor OPA server performance
- Use appropriate parallel execution limits
- Clear task history when needed

#### **4. Documentation**
- Use `generate_report` for findings
- Check `anonymous_agent_status` for system status
- Review tool descriptions in Command Palette

---

## 🎯 OpenCode-Specific Features

### **Context Awareness**
OPA can access:
- **Current file context** - Automatically analyzes open files
- **Project structure** - Understands your codebase
- **Git integration** - Works with version control
- **Multi-file support** - Can operate on multiple files

### **File Integration**
```bash
# Right-click on file in OpenCode
# Select "OPA Tools" → Relevant tool
# Tool will automatically use the file path as target
```

### **Code Intelligence**
```bash
# OPA can analyze your code and suggest relevant tools
OPA security_web_search "vulnerability in nodejs application"

# Provides context-aware recommendations
OPA intelligence_search "your project name" CVE=true
```

---

## 📚 Additional Resources

### **OpenCode Documentation**
- **OpenCode MCP Guide** - Official OpenCode MCP documentation
- **Extension Development** - Building OpenCode extensions
- **MCP Protocol** - Technical specification

### **Community Support**
- **GitHub Repository** - Issues and discussions
- **Discord Community** - Real-time support
- **Documentation** - This guide and API docs

---

## 🎉 Success!

**You now have a complete OPA security platform running in OpenCode!**

### **What You Can Do:**
1. **🔒 Complete Anonymity Setup** with one command
2. **🧠 Comprehensive Intelligence Gathering** from multiple sources  
3. **🛡️ Professional Security Analysis** with 25+ tools
4. **🕵️ Automated Workflows** for complex operations
5. **📊 Real-time Reporting** with detailed analytics

### **Key Advantages in OpenCode:**
- **🔄 Seamless Integration** - Native MCP connection
- **📁 Context Awareness** - Understands your codebase
- **🎯 Tool Discovery** - Easy tool access via Command Palette
- **⚡ Parallel Processing** - Efficient multi-tool execution
- **🛡️ Security-First** - Privacy-enforced operations

**Start your first anonymous security assessment in OpenCode today!** 🚀
