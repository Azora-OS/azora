
import * as fs from 'fs';
import * as path from 'path';

interface FileNode {
  name: string;
  type: 'file' | 'directory';
  content?: string;
  children?: FileNode[];
}

export class Sequencer {
  constructor(private readonly basePath: string) {
    if (!fs.existsSync(basePath)) {
      fs.mkdirSync(basePath, { recursive: true });
    }
  }

  public sequence(node: FileNode): void {
    this.reconstruct(this.basePath, node);
  }

  private reconstruct(currentPath: string, node: FileNode): void {
    const newPath = path.join(currentPath, node.name);
    if (node.type === 'directory') {
      if (!fs.existsSync(newPath)) {
        fs.mkdirSync(newPath, { recursive: true });
      }
      if (node.children) {
        for (const child of node.children) {
          this.reconstruct(newPath, child);
        }
      }
    } else {
        if(node.content){
        fs.writeFileSync(newPath, node.content, 'utf-8');
        }
    }
  }
}
