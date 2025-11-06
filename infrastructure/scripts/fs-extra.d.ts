declare module 'fs-extra' {
  export function readJson(file: string): Promise<any>;
  export function pathExists(path: string): Promise<boolean>;
  export function writeJson(file: string, object: any, options?: { spaces: number }): Promise<void>;
  export function readdir(dir: string): Promise<string[]>;
  export function stat(path: string): Promise<any>;
  export default exports;
}