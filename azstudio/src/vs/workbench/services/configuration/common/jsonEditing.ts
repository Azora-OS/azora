/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Azora.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import { URI } from '../../../../base/common/uri.js';
import { VSBuffer } from '../../../../base/common/buffer.js';
import { parse } from '../../../../base/common/json.js';
import { IFileService, FileOperationError, FileOperationResult } from '../../../../platform/files/common/files.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.js';

export interface IJSONEditingEdit {
    path: (string | number)[];
    value: any;
}

export interface IJSONEditingService {
    readonly _serviceBrand: undefined;
    write(resource: URI, edits: IJSONEditingEdit[], save: boolean): Promise<void>;
}

export const IJSONEditingService = createDecorator<IJSONEditingService>('jsonEditingService');

class JSONEditingService implements IJSONEditingService {
    declare readonly _serviceBrand: undefined;

    constructor(@IFileService private readonly fileService: IFileService) {}

    async write(resource: URI, edits: IJSONEditingEdit[], save: boolean): Promise<void> {
        const content = await this.readJSON(resource);
        const updated = { ...content };

        for (const edit of edits) {
            this.applyEdit(updated, edit);
        }

        if (save) {
            const serialized = JSON.stringify(updated, null, 2);
            await this.fileService.writeFile(resource, VSBuffer.fromString(serialized));
        }
    }

    private async readJSON(resource: URI): Promise<Record<string, any>> {
        try {
            const fileContents = await this.fileService.readFile(resource);
            const text = fileContents.value.toString() || '{}';
            return (parse(text) as Record<string, any>) ?? {};
        } catch (error) {
            if (error instanceof FileOperationError && error.fileOperationResult === FileOperationResult.FILE_NOT_FOUND) {
                return {};
            }
            throw error;
        }
    }

    private applyEdit(target: Record<string, any>, edit: IJSONEditingEdit): void {
        if (!edit.path.length) {
            throw new Error('JSON edit path cannot be empty');
        }

        let current: any = target;
        for (let i = 0; i < edit.path.length - 1; i++) {
            const segment = edit.path[i];
            const nextSegment = edit.path[i + 1];

            if (typeof segment === 'number') {
                if (!Array.isArray(current)) {
                    current = [];
                }
                if (current[segment] === undefined) {
                    current[segment] = typeof nextSegment === 'number' ? [] : {};
                }
                current = current[segment];
            } else {
                if (typeof current[segment] !== 'object' || current[segment] === null) {
                    current[segment] = typeof nextSegment === 'number' ? [] : {};
                }
                current = current[segment];
            }
        }

        const last = edit.path[edit.path.length - 1];
        if (typeof last === 'number') {
            if (!Array.isArray(current)) {
                current = [];
            }
            if (edit.value === undefined) {
                current.splice(last, 1);
            } else {
                current[last] = edit.value;
            }
        } else {
            if (edit.value === undefined) {
                delete current[last];
            } else {
                current[last] = edit.value;
            }
        }
    }
}

registerSingleton(IJSONEditingService, JSONEditingService, InstantiationType.Delayed);
