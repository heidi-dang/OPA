import { getOrCreateSandbox } from '../sandbox_local.js';
import { ensureSandboxDeployed, getSandboxDeploymentStatus } from './sandbox_deployer.js';
import { webSearch } from './search.js';
/**
 * Intelligent Agent Task Manager that handles sandbox deployment automatically
 */
export class AgentTaskManager {
    config;
    deploymentChecked = false;
    constructor(config = {}) {
        this.config = {
            autoDeploySandbox: config.autoDeploySandbox !== false,
            checkDeploymentBeforeExecution: config.checkDeploymentBeforeExecution !== false,
            fallbackToE2B: config.fallbackToE2B || false,
            deploymentTimeout: config.deploymentTimeout || 300000 // 5 minutes
        };
    }
    /**
     * Execute a task with automatic sandbox deployment
     */
    async executeTask(taskName, taskFunction, target) {
        console.log(`🤖 Executing agent task: ${taskName}`);
        try {
            // Step 1: Ensure sandbox is ready if auto-deployment is enabled
            if (this.config.autoDeploySandbox && this.config.checkDeploymentBeforeExecution) {
                await this.ensureSandboxReady();
            }
            // Step 2: Execute the task
            const startTime = Date.now();
            console.log(`⚡ Starting task execution: ${taskName}`);
            const result = await taskFunction();
            const executionTime = Date.now() - startTime;
            console.log(`✅ Task completed in ${executionTime}ms: ${taskName}`);
            // Step 3: Add execution metadata to result
            const enhancedResult = this.addExecutionMetadata(result, taskName, executionTime);
            return enhancedResult;
        }
        catch (error) {
            console.error(`❌ Task failed: ${taskName}`, error.message);
            // Step 4: Handle deployment-related errors
            if (this.isDeploymentError(error) && this.config.fallbackToE2B) {
                console.log('🔄 Falling back to E2B sandbox...');
                return await this.executeWithE2BFallback(taskName, taskFunction);
            }
            throw error;
        }
    }
    /**
     * Ensure sandbox is deployed and ready
     */
    async ensureSandboxReady() {
        if (this.deploymentChecked) {
            return; // Already checked in this session
        }
        console.log('🔍 Checking sandbox deployment status...');
        const deployed = await ensureSandboxDeployed();
        if (deployed) {
            console.log('✅ Sandbox is ready for task execution');
            this.deploymentChecked = true;
        }
        else {
            throw new Error('Failed to ensure sandbox deployment');
        }
    }
    /**
     * Check if an error is deployment-related
     */
    isDeploymentError(error) {
        const errorMessage = error.message.toLowerCase();
        const deploymentKeywords = [
            'docker',
            'container',
            'sandbox',
            'deployment',
            'image',
            'network',
            'connection'
        ];
        return deploymentKeywords.some(keyword => errorMessage.includes(keyword));
    }
    /**
     * Execute task with E2B fallback
     */
    async executeWithE2BFallback(taskName, taskFunction) {
        try {
            // Force E2B sandbox
            const sandbox = await getOrCreateSandbox('e2b');
            console.log('🔄 Using E2B sandbox for task execution');
            const result = await taskFunction();
            return this.addExecutionMetadata(result, taskName, 0, 'E2B');
        }
        catch (error) {
            throw new Error(`Both local and E2B sandbox execution failed: ${error.message}`);
        }
    }
    /**
     * Add execution metadata to result
     */
    addExecutionMetadata(result, taskName, executionTime, sandboxType = 'Local') {
        const metadata = `
╔══════════════════════════════════════════════════════════════╗
║                    AGENT TASK EXECUTION                        ║
╚══════════════════════════════════════════════════════════════╝

Task: ${taskName}
Sandbox: ${sandboxType}
Execution Time: ${executionTime}ms
Timestamp: ${new Date().toISOString()}

═══════════════════════════════════════════════════════════════

TASK RESULT:
${result}

═══════════════════════════════════════════════════════════════
Execution completed successfully in ${sandboxType} sandbox
`;
        return metadata;
    }
    /**
     * Batch execute multiple tasks
     */
    async executeBatchTasks(tasks) {
        console.log(`🚀 Executing batch of ${tasks.length} tasks`);
        // Sort by priority
        tasks.sort((a, b) => {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            const aPriority = priorityOrder[a.priority || 'medium'];
            const bPriority = priorityOrder[b.priority || 'medium'];
            return bPriority - aPriority;
        });
        const results = [];
        const startTime = Date.now();
        for (const task of tasks) {
            try {
                const result = await this.executeTask(task.name, task.function);
                results.push(`✅ ${task.name}: SUCCESS`);
            }
            catch (error) {
                results.push(`❌ ${task.name}: FAILED - ${error.message}`);
            }
        }
        const totalTime = Date.now() - startTime;
        return `
╔══════════════════════════════════════════════════════════════╗
║                    BATCH TASK EXECUTION                        ║
╚══════════════════════════════════════════════════════════════╝

Total Tasks: ${tasks.length}
Completed: ${results.filter(r => r.includes('SUCCESS')).length}
Failed: ${results.filter(r => r.includes('FAILED')).length}
Total Time: ${totalTime}ms

═══════════════════════════════════════════════════════════════

TASK RESULTS:
${results.join('\n')}

═══════════════════════════════════════════════════════════════
Batch execution completed
`;
    }
    /**
     * Get agent status
     */
    async getAgentStatus() {
        const sandboxStatus = await getSandboxDeploymentStatus();
        return `
╔══════════════════════════════════════════════════════════════╗
║                    AGENT TASK MANAGER STATUS                    ║
╚══════════════════════════════════════════════════════════════╝

Configuration:
• Auto Deploy Sandbox: ${this.config.autoDeploySandbox ? 'Enabled' : 'Disabled'}
• Check Before Execution: ${this.config.checkDeploymentBeforeExecution ? 'Enabled' : 'Disabled'}
• Fallback to E2B: ${this.config.fallbackToE2B ? 'Enabled' : 'Disabled'}
• Deployment Timeout: ${this.config.deploymentTimeout}ms

Status:
• Deployment Checked: ${this.deploymentChecked ? 'Yes' : 'No'}

${sandboxStatus}

═══════════════════════════════════════════════════════════════
Agent is ready for task execution
`;
    }
    /**
     * Perform deep internet research on a topic
     */
    async deepResearch(topic) {
        return await this.executeTask('Deep Internet Research', async () => {
            console.log(`🧠 Performing deep research on: ${topic}`);
            const queries = [
                `${topic} vulnerabilities CVE`,
                `${topic} security best practices`,
                `${topic} exploit requirements`,
                `${topic} recent breaches`
            ];
            let researchNotes = `RESEARCH NOTES FOR: ${topic}\n`;
            researchNotes += '═'.repeat(researchNotes.length) + '\n\n';
            for (const query of queries) {
                const results = await webSearch(query, 3);
                researchNotes += results + '\n';
            }
            return researchNotes;
        }, topic);
    }
    /**
     * Reset deployment check (forces re-check on next execution)
     */
    resetDeploymentCheck() {
        this.deploymentChecked = false;
        console.log('🔄 Deployment check reset - will re-check on next task execution');
    }
}
// Global agent instance
let agentTaskManager = null;
/**
 * Get or create the agent task manager
 */
export function getAgentTaskManager(config) {
    if (!agentTaskManager) {
        agentTaskManager = new AgentTaskManager(config);
    }
    return agentTaskManager;
}
/**
 * Execute a task with automatic sandbox deployment
 */
export async function executeAgentTask(taskName, taskFunction, target) {
    const agent = getAgentTaskManager();
    return await agent.executeTask(taskName, taskFunction, target);
}
/**
 * Execute multiple tasks in batch
 */
export async function executeBatchAgentTasks(tasks) {
    const agent = getAgentTaskManager();
    return await agent.executeBatchTasks(tasks);
}
/**
 * Get agent status
 */
export async function getAgentStatus() {
    const agent = getAgentTaskManager();
    return await agent.getAgentStatus();
}
/**
 * Reset agent deployment check
 */
export function resetAgentDeploymentCheck() {
    const agent = getAgentTaskManager();
    agent.resetDeploymentCheck();
}
//# sourceMappingURL=agent_tasks.js.map