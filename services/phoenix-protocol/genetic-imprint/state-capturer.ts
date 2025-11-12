
import * as fs from 'fs';
import * as path from 'path';

interface FileNode {
  name: string;
  type: 'file' | 'directory';
  content?: string;
  children?: FileNode[];
}

export class StateCapturer {
  constructor(private readonly basePath: string) {}

  public captureState(): FileNode {
    return this.traverse(this.basePath);
  }

  private traverse(currentPath: string): FileNode {
    const stats = fs.statSync(currentPath);
    const name = path.basename(currentPath);

    if (stats.isDirectory()) {
      const children = fs.readdirSync(currentPath).map(child => {
        return this.traverse(path.join(currentPath, child));
      });
      return { name, type: 'directory', children };
    } else {
      const content = fs.readFileSync(currentPath, 'utf-8');
      return { name, type: 'file', content };
    }
  }
}
