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
    dnsutils \
    whois \
    host \
    tor \
    torsocks \
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

# Install additional OSINT and blockchain tools
RUN pip3 install web3 requests

# Install OSINT tools
RUN wget https://github.com/projectdiscovery/subfinder/releases/download/v2.6.3/subfinder_2.6.3_linux_amd64.tar.gz \
    && tar -xzvf subfinder_2.6.3_linux_amd64.tar.gz -C /usr/local/bin/ subfinder \
    && rm subfinder_2.6.3_linux_amd64.tar.gz

RUN wget https://github.com/blechschmidt/massdns/releases/download/v0.3/massdns-0.3-linux-x86_64.tar.gz \
    && tar -xzvf massdns-0.3-linux-x86_64.tar.gz -C /usr/local/bin/ massdns \
    && rm massdns-0.3-linux-x86_64.tar.gz

# Install theHarvester for email harvesting
RUN pip3 install theHarvester

# Install sherlock for social media account discovery
RUN pip3 install sherlock

# Install amass for asset discovery
RUN wget https://github.com/OWASP/Amass/releases/download/v4.2.0/amass_linux_amd64_v4.2.0.zip \
    && unzip amass_linux_amd64_v4.2.0.zip -d /tmp/amass \
    && mv /tmp/amass/amass_linux_amd64_v4.2.0/amass /usr/local/bin/ \
    && rm -rf /tmp/amass amass_linux_amd64_v4.2.0.zip

# Install whatweb for technology detection
RUN apt-get update && apt-get install -y whatweb \
    && rm -rf /var/lib/apt/lists/*

# Download a basic SecLists wordlist for dir_fuzz
RUN mkdir -p /usr/share/wordlists \
    && wget https://raw.githubusercontent.com/danielmiessler/SecLists/master/Discovery/Web-Content/common.txt -O /usr/share/wordlists/common.txt

# Switch back to the default e2b user
USER user
