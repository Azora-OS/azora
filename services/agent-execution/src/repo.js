"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTaskRecord = createTaskRecord;
exports.updateTaskRecord = updateTaskRecord;
exports.getTaskRecord = getTaskRecord;
const prismaClient_1 = __importDefault(require("./prismaClient"));
async function createTaskRecord(task) {
    return prismaClient_1.default.task.create({
        data: {
            id: task.id,
            status: task.status,
            payload: task.payload,
            agentId: task.agentId ?? undefined
        }
    });
}
async function updateTaskRecord(id, updates) {
    return prismaClient_1.default.task.update({
        where: { id },
        data: {
            status: updates.status ?? undefined,
            payload: updates.payload ?? undefined,
            agentId: updates.agentId ?? undefined
        }
    });
}
async function getTaskRecord(id) {
    return prismaClient_1.default.task.findUnique({ where: { id } });
}
//# sourceMappingURL=repo.js.map