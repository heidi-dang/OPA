# OPA - Offensive Penetration Agent (Defensive Edition)

> [!IMPORTANT]
> **STRICT DISCLAIMER: FOR EDUCATIONAL AND AUTHORIZED DEFENSIVE TESTING PURPOSES ONLY.**
> This project is designed to aid security researchers and developers in identifying and remediating vulnerabilities in their own infrastructure. Unauthorized use of these tools against third-party systems or networks is strictly prohibited and likely illegal. The authors assume no liability for misuse.

OPA is an **OpenCode Plugin** implemented as a Model Context Protocol (MCP) server. It enables an AI-driven agent to autonomously perform security audits, reconnaissance, and diagnostic tasks within a secure, sandboxed environment.

## 🌟 Key Features

*   **Secure Execution**: All intrusive tools (Nmap, Nuclei, Ffuf) execute inside an isolated **E2B Sandbox** cloud VM.
*   **Crypto Auditing**: Real-time defensive analysis of Ethereum contracts and wallets via Etherscan API.
*   **Wireless Security**: Authorized offline analysis of WPA handshakes using `aircrack-ng`.
*   **ISP Diagnostics**: Detection of port-based traffic shaping and bandwidth throttling.
*   **MCP Integration**: Native support for OpenCode and other MCP-compatible AI desktops.

## 🛠️ Installation & Setup

1.  **Clone the Repo**:
    ```bash
    git clone https://github.com/heidi-dang/OPA.git
    cd OPA
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Variables**:
    Create a `.env` file or export the following:
    ```bash
    export E2B_API_KEY='your_e2b_key'
    export ETHERSCAN_API_KEY='your_etherscan_key'
    ```

4.  **Build**:
    ```bash
    npm run build
    ```

5.  **Register with OpenCode**:
    Add the server to your OpenCode configuration:
    ```json
    {
      "mcpServers": {
        "OPA": {
          "command": "node",
          "args": ["/path/to/OPA/dist/mcp.js"]
        }
      }
    }
    ```

## 📂 Project Structure

*   `src/index.ts`: Tool registry and plugin interface.
*   `src/mcp.ts`: MCP Server entry point.
*   `src/tools/`: Implementation logic for Nmap, Nuclei, Crypto, Wireless, etc.
*   `e2b.Dockerfile`: Blueprint for the secure analysis environment.
*   `install_plugin.sh`: Helper script to install other OpenCode plugins.

## 📜 License
Provided for educational purposes. See [LICENSE](LICENSE) (if applicable) for terms.
