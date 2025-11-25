/**
 * OperationalTransform
 * 
 * Implements Operational Transformation (OT) algorithm for real-time collaborative editing.
 * Handles concurrent edits, resolves conflicts automatically, and maintains consistency.
 */

export type OperationType = 'insert' | 'delete' | 'retain';

export interface Operation {
  type: OperationType;
  position: number;
  content?: string;
  length?: number;
}

export interface TextOperation {
  ops: Operation[];
  baseVersion: number;
  userId: string;
  timestamp: Date;
}

export interface DocumentState {
  content: string;
  version: number;
  history: TextOperation[];
}

export class OperationalTransform {
  private documents: Map<string, DocumentState>;

  constructor() {
    this.documents = new Map();
  }

  /**
   * Initialize a document for collaborative editing
   */
  initDocument(docId: string, initialContent: string = ''): void {
    this.documents.set(docId, {
      content: initialContent,
      version: 0,
      history: []
    });
  }

  /**
   * Apply an operation to a document
   */
  applyOperation(docId: string, operation: TextOperation): { success: boolean; newVersion: number; transformedOp?: TextOperation } {
    const doc = this.documents.get(docId);
    if (!doc) {
      return { success: false, newVersion: -1 };
    }

    // Transform operation against concurrent operations
    let transformedOp = operation;
    for (let i = operation.baseVersion; i < doc.version; i++) {
      const concurrentOp = doc.history[i];
      transformedOp = this.transform(transformedOp, concurrentOp);
    }

    // Apply the transformed operation
    try {
      doc.content = this.applyOps(doc.content, transformedOp.ops);
      doc.version++;
      doc.history.push(transformedOp);

      return {
        success: true,
        newVersion: doc.version,
        transformedOp
      };
    } catch (error) {
      console.error('Failed to apply operation:', error);
      return { success: false, newVersion: doc.version };
    }
  }

  /**
   * Transform two concurrent operations
   */
  private transform(op1: TextOperation, op2: TextOperation): TextOperation {
    const transformedOps: Operation[] = [];
    let i = 0, j = 0;
    let pos1 = 0, pos2 = 0;

    while (i < op1.ops.length || j < op2.ops.length) {
      const o1 = op1.ops[i];
      const o2 = op2.ops[j];

      if (!o1) {
        transformedOps.push(o2);
        j++;
        continue;
      }

      if (!o2) {
        transformedOps.push(o1);
        i++;
        continue;
      }

      // Both operations are inserts at same position
      if (o1.type === 'insert' && o2.type === 'insert' && o1.position === o2.position) {
        // Use userId to determine order (consistent tie-breaking)
        if (op1.userId < op2.userId) {
          transformedOps.push(o1);
          i++;
        } else {
          transformedOps.push({ ...o1, position: o1.position + (o2.content?.length || 0) });
          i++;
        }
      }
      // o1 is insert, o2 is delete
      else if (o1.type === 'insert' && o2.type === 'delete') {
        if (o1.position <= o2.position) {
          transformedOps.push(o1);
          i++;
        } else {
          transformedOps.push({ ...o1, position: o1.position - (o2.length || 0) });
          i++;
        }
      }
      // o1 is delete, o2 is insert
      else if (o1.type === 'delete' && o2.type === 'insert') {
        if (o2.position <= o1.position) {
          transformedOps.push({ ...o1, position: o1.position + (o2.content?.length || 0) });
          i++;
        } else {
          transformedOps.push(o1);
          i++;
        }
      }
      // Both are deletes
      else if (o1.type === 'delete' && o2.type === 'delete') {
        const o1End = o1.position + (o1.length || 0);
        const o2End = o2.position + (o2.length || 0);

        // No overlap
        if (o1End <= o2.position) {
          transformedOps.push(o1);
          i++;
        } else if (o2End <= o1.position) {
          transformedOps.push({ ...o1, position: o1.position - (o2.length || 0) });
          i++;
        }
        // Overlap - adjust delete range
        else {
          const newPos = Math.min(o1.position, o2.position);
          const newLength = Math.max(o1End, o2End) - Math.max(o1.position, o2.position);
          if (newLength > 0) {
            transformedOps.push({ type: 'delete', position: newPos, length: newLength });
          }
          i++;
          j++;
        }
      }
      // Default: retain position
      else {
        if (o1.position < o2.position) {
          transformedOps.push(o1);
          i++;
        } else {
          transformedOps.push(o2);
          j++;
        }
      }
    }

    return {
      ...op1,
      ops: transformedOps,
      baseVersion: op2.baseVersion + 1
    };
  }

  /**
   * Apply operations to text content
   */
  private applyOps(content: string, ops: Operation[]): string {
    let result = content;
    let offset = 0;

    // Sort operations by position
    const sortedOps = [...ops].sort((a, b) => a.position - b.position);

    for (const op of sortedOps) {
      const pos = op.position + offset;

      switch (op.type) {
        case 'insert':
          if (op.content) {
            result = result.slice(0, pos) + op.content + result.slice(pos);
            offset += op.content.length;
          }
          break;

        case 'delete':
          if (op.length) {
            result = result.slice(0, pos) + result.slice(pos + op.length);
            offset -= op.length;
          }
          break;

        case 'retain':
          // No change to content
          break;
      }
    }

    return result;
  }

  /**
   * Create an insert operation
   */
  createInsert(position: number, content: string, userId: string, baseVersion: number): TextOperation {
    return {
      ops: [{ type: 'insert', position, content }],
      baseVersion,
      userId,
      timestamp: new Date()
    };
  }

  /**
   * Create a delete operation
   */
  createDelete(position: number, length: number, userId: string, baseVersion: number): TextOperation {
    return {
      ops: [{ type: 'delete', position, length }],
      baseVersion,
      userId,
      timestamp: new Date()
    };
  }

  /**
   * Get document content
   */
  getDocument(docId: string): DocumentState | null {
    return this.documents.get(docId) || null;
  }

  /**
   * Get document version
   */
  getVersion(docId: string): number {
    return this.documents.get(docId)?.version || -1;
  }

  /**
   * Remove document from memory
   */
  removeDocument(docId: string): void {
    this.documents.delete(docId);
  }

  /**
   * Compose multiple operations into one
   */
  compose(op1: TextOperation, op2: TextOperation): TextOperation {
    const composedOps: Operation[] = [];
    
    // Apply op1 first, then op2
    let content = '';
    content = this.applyOps(content, op1.ops);
    content = this.applyOps(content, op2.ops);

    // Combine operations
    composedOps.push(...op1.ops, ...op2.ops);

    return {
      ops: composedOps,
      baseVersion: op1.baseVersion,
      userId: op1.userId,
      timestamp: new Date()
    };
  }

  /**
   * Invert an operation (for undo)
   */
  invert(operation: TextOperation, docId: string): TextOperation | null {
    const doc = this.documents.get(docId);
    if (!doc) return null;

    const invertedOps: Operation[] = [];

    for (const op of operation.ops) {
      switch (op.type) {
        case 'insert':
          // Invert insert to delete
          invertedOps.push({
            type: 'delete',
            position: op.position,
            length: op.content?.length || 0
          });
          break;

        case 'delete':
          // Invert delete to insert (need original content)
          const deletedContent = doc.content.slice(op.position, op.position + (op.length || 0));
          invertedOps.push({
            type: 'insert',
            position: op.position,
            content: deletedContent
          });
          break;

        case 'retain':
          invertedOps.push(op);
          break;
      }
    }

    return {
      ops: invertedOps,
      baseVersion: operation.baseVersion,
      userId: operation.userId,
      timestamp: new Date()
    };
  }
}
