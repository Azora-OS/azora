/// <reference types="node" />

declare module './ai-ml-systems-architect';
declare module './ai-ml-systems-architect.js';
declare module './ai-ml-systems-architect.ts';

declare module 'events' {
  class EventEmitter {
    on(event: string | symbol, listener: (...args: any[]) => void): this;
    addListener(event: string | symbol, listener: (...args: any[]) => void): this;
    emit(event: string | symbol, ...args: any[]): boolean;
  }
  export { EventEmitter };
}

declare module 'child_process' {
  export const spawn: any;
}

declare module 'fs' {
  export const readFileSync: any;
  export const writeFileSync: any;
  export const existsSync: any;
  export const mkdirSync: any;
}

declare module 'path' {
  export const join: (...args: any[]) => string;
}

declare const process: any;
declare function require(name: string): any;


