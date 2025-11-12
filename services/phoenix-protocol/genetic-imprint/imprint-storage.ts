
import * as fs from 'fs';
import * as path from 'path';

interface FileNode {
  name: string;
  type: 'file' | 'directory';
  content?: string;
  children?: FileNode[];
}

export class ImprintStorage {
  constructor(private readonly storagePath: string) {
    if (!fs.existsSync(storagePath)) {
      fs.mkdirSync(storagePath, { recursive: true });
    }
  }

  public storeImprint(hash: string, state: FileNode): void {
    const imprintPath = path.join(this.storagePath, `${hash}.json`);
    fs.writeFileSync(imprintPath, JSON.stringify(state, null, 2));
  }

  public retrieveImprint(hash: string): FileNode | null {
    const imprintPath = path.join(this.storagePath, `${hash}.json`);
    if (fs.existsSync(imprintPath)) {
      const content = fs.readFileSync(imprintPath, 'utf-8');
      return JSON.parse(content);
    }
    return null;
  }
}
