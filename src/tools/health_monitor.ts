import { getSandboxDeploymentStatus } from './sandbox_deployer.js';
import { getPrivacyStatus } from './privacy_security.js';
import { getAgentStatus } from './agent_tasks.js';
import { getWindSurfStatus } from './windsurf_agent.js';
import { getAnonymousStatus } from './anonymous_agent.js';

/**
 * System health and status overview
 */
export interface SystemHealth {
    timestamp: Date;
    sandbox: string;
    privacy: string;
    agentManager: string;
    windsurfAgent: string;
    anonymousAgent: string;
    overallStatus: 'healthy' | 'degraded' | 'critical';
}

/**
 * Aggregates status from all OPA components
 */
export async function getSystemHealth(): Promise<SystemHealth> {
    const sandbox = await getSandboxDeploymentStatus();
    const privacy = await getPrivacyStatus();
    const agentManager = await getAgentStatus();
    const windsurfAgent = await getWindSurfStatus();
    const anonymousAgent = await getAnonymousStatus();

    // Determine overall health
    let overallStatus: 'healthy' | 'degraded' | 'critical' = 'healthy';
    
    if (sandbox.includes('❌') || privacy.includes('❌')) {
        overallStatus = 'critical';
    } else if (privacy.includes('⚠️') || !privacy.includes('✅')) {
        overallStatus = 'degraded';
    }

    return {
        timestamp: new Date(),
        sandbox,
        privacy,
        agentManager,
        windsurfAgent,
        anonymousAgent,
        overallStatus
    };
}

/**
 * Formats system health into a readable report
 */
export async function formatHealthReport(): Promise<string> {
    const health = await getSystemHealth();
    
    const statusEmoji = {
        healthy: '✅',
        degraded: '⚠️',
        critical: '❌'
    };

    return `
╔══════════════════════════════════════════════════════════════╗
║                    OPA SYSTEM HEALTH MONITOR                   ║
╚══════════════════════════════════════════════════════════════╝

Overall Status: ${statusEmoji[health.overallStatus]} ${health.overallStatus.toUpperCase()}
Report Time: ${health.timestamp.toISOString()}

═══════════════════════════════════════════════════════════════

[SANDBOX STATUS]
${health.sandbox}

[PRIVACY & ANONYMITY]
${health.privacy}

[TASK MANAGER]
${health.agentManager}

[AGENTS]
• WindSurf: ${health.windsurfAgent.includes('IDLE') ? 'IDLE' : 'BUSY'}
• Anonymous: ${health.anonymousAgent.includes('IDLE') ? 'IDLE' : 'BUSY'}

═══════════════════════════════════════════════════════════════
System is ${health.overallStatus === 'healthy' ? 'operating within normal parameters' : 'experiencing issues - check details above'}
`;
}
