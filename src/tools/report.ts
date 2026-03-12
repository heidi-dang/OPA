import fs from 'fs';
import path from 'path';

export async function generateReport(findings: any[], format: 'markdown' | 'pdf' = 'markdown'): Promise<string> {
    const reportPath = path.resolve(process.cwd(), `OPA_Report_${Date.now()}.${format === 'pdf' ? 'pdf' : 'md'}`);
    
    let content = `# OPA Security Audit Report\n\nGenerated on: ${new Date().toISOString()}\n\n`;
    content += `## Executive Summary\n\nTotal findings: ${findings.length}\n\n`;
    
    content += `## Technical Details\n\n`;
    findings.forEach((finding, index) => {
        content += `### Finding ${index + 1}: ${finding.title || 'Unknown Issue'}\n`;
        content += `- **Severity**: ${finding.severity || 'N/A'}\n`;
        content += `- **Target**: \`${finding.target || 'N/A'}\`\n`;
        content += `- **Description**: ${finding.description || ''}\n`;
        content += `- **Remediation**: ${finding.remediation || ''}\n\n`;
    });

    // Write report out to user workspace
    fs.writeFileSync(reportPath, content, 'utf8');
    
    return `Report generated successfully at: ${reportPath}`;
}
