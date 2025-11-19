export class ElaraLogger {
  constructor(private context: string) {}

  info(message: string, ...args: any[]) {
    console.log(`[${this.context}] INFO: ${message}`, ...args);
  }

  error(message: string, ...args: any[]) {
    console.error(`[${this.context}] ERROR: ${message}`, ...args);
  }

  warn(message: string, ...args: any[]) {
    console.warn(`[${this.context}] WARN: ${message}`, ...args);
  }

  debug(message: string, ...args: any[]) {
    console.debug(`[${this.context}] DEBUG: ${message}`, ...args);
  }

  success(message: string, ...args: any[]) {
    console.log(`[${this.context}] SUCCESS: ${message}`, ...args);
  }
}