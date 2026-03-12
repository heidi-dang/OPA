/**
 * Shared task status types
 */
export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed';

/**
 * Shared task priority types
 */
export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';

/**
 * Base task interface for all tool and agent tasks
 */
export interface BaseTask {
    id: string;
    name: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority | number;
    result?: string;
    error?: string;
    startTime?: Date;
    endTime?: Date;
}

/**
 * Configuration for parallel task execution
 */
export interface ParallelTaskConfig {
    name: string;
    target: string;
    args?: string;
    priority?: TaskPriority;
    timeout?: number;
}
