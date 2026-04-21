import type { Logger as ViteLogger } from 'vite';

interface LoggerOptions {
  logger: ViteLogger;
  prefix: string;
}

export class Logger {
  private logger: ViteLogger;
  private options = { timestamp: true, environment: this.gray('(server)') };
  private prefix: string;
  constructor({ logger, prefix }: LoggerOptions) {
    this.logger = logger;
    this.prefix = this.yellow(`[${prefix}]`);
  }

  info(message: string) {
    this.logger.info(`${this.prefix} ${message}`, this.options);
  }

  warn(message: string) {
    this.logger.warn(`${this.prefix} ${message}`, this.options);
  }

  error(message: string, error?: any) {
    this.logger.error(`${this.prefix} ${message}`, { ...this.options, error });
  }

  pageReload(file: string) {
    this.logger.info(`${this.green('page reload')} ${this.gray(file)}`, { ...this.options, environment: this.gray('(client)') });
  }

  private gray(text: string) {
    return `\x1b[90m${text}\x1b[0m`;
  }

  private green(text: string) {
    return `\x1b[32m${text}\x1b[0m`;
  }

  private yellow(text: string) {
    return `\x1b[33m${text}\x1b[0m`;
  }
}
