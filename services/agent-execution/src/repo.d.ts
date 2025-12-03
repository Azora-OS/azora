import { TaskRecord } from './persistence';
export declare function createTaskRecord(task: TaskRecord): Promise<any>;
export declare function updateTaskRecord(id: string, updates: Partial<TaskRecord>): Promise<any>;
export declare function getTaskRecord(id: string): Promise<any>;
//# sourceMappingURL=repo.d.ts.map