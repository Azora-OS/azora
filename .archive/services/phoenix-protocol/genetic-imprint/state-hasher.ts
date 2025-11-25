
import * as crypto from 'crypto';

interface FileNode {
  name: string;
  type: 'file' | 'directory';
  content?: string;
  children?: FileNode[];
}

export class StateHasher {
  public hashState(state: FileNode): string {
    const serializedState = JSON.stringify(state);
    const hash = crypto.createHash('sha256');
    hash.update(serializedState);
    return hash.digest('hex');
  }

  public verifyHash(state: FileNode, expectedHash: string): boolean {
    const actualHash = this.hashState(state);
    return actualHash === expectedHash;
  }
}
