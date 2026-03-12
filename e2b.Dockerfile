# Use the official E2B base image
FROM e2b-dev/code-interpreter:latest

# Install base dependencies and common security tools
USER root
RUN apt-get update && apt-get install -y \
    wget \
    curl \
    git \
    build-essential \
    nmap \
    tshark \
    jq \
    python3-pip \
    libcap-dev \
    aircrack-ng \
    iperf3 \
    && rm -rf /var/lib/apt/lists/*

# Install ffuf (Fuzz Faster U Fool)
RUN wget https://github.com/ffuf/ffuf/releases/download/v2.1.0/ffuf_2.1.0_linux_amd64.tar.gz \
    && tar -xzvf ffuf_2.1.0_linux_amd64.tar.gz -C /usr/local/bin/ ffuf \
    && rm ffuf_2.1.0_linux_amd64.tar.gz

# Install Nuclei
RUN wget https://github.com/projectdiscovery/nuclei/releases/download/v3.2.0/nuclei_3.2.0_linux_amd64.zip \
    && unzip nuclei_3.2.0_linux_amd64.zip -d /usr/local/bin/ nuclei \
    && rm nuclei_3.2.0_linux_amd64.zip

# Update Nuclei templates
RUN nuclei -update-templates

# Install Exploit-DB (searchsploit)
RUN git clone https://github.com/offensive-security/exploitdb.git /opt/exploitdb \
    && ln -sf /opt/exploitdb/searchsploit /usr/local/bin/searchsploit

# Install Slither (for Crypto Auditing simulated support)
RUN pip3 install slither-analyzer

# Download a basic SecLists wordlist for dir_fuzz
RUN mkdir -p /usr/share/wordlists \
    && wget https://raw.githubusercontent.com/danielmiessler/SecLists/master/Discovery/Web-Content/common.txt -O /usr/share/wordlists/common.txt

# Switch back to the default e2b user
USER user
