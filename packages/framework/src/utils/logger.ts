/**
 * Levels of verbosity for the logger.
 * 0: None
 * 1: Error
 * 2: Warn
 * 3: Log
 * 4: Debug
 */
type LoggerVerbosity = 0 | 1 | 2 | 3 | 4;

/**
 * Creates a new Logger instance.
 * @param label - The label to prefix messages with.
 * @returns The logger instance
 */
export function logger(label: string) {
  return new Logger(label, import.meta.env.DEV ? 4 : 1);
}

/**
 * A simple logger utility with configurable verbosity levels.
 * Prefixes messages with a label.
 */
export class Logger {
  private label: string;
  private minVerbosity: LoggerVerbosity;

  /**
   * Creates a new Logger instance.
   * @param label - The label to prefix messages with.
   * @param minVerbosity - The minimum verbosity level required to print messages.
   */
  constructor(label: string, minVerbosity: LoggerVerbosity) {
    this.label = `[${label}]`;
    this.minVerbosity = minVerbosity;
  }

  /**
   * Logs a debug message.
   * Visible if verbosity is >= 4.
   * @param message - The message to log.
   * @param rest - Additional arguments.
   */
  public debug(message: string, ...rest: unknown[]) {
    if (this.minVerbosity >= 4) {
      console.debug(`${this.label} ${message}`, ...rest);
    }
  }

  /**
   * Logs a general message.
   * Visible if verbosity is >= 3.
   * @param message - The message to log.
   * @param rest - Additional arguments.
   */
  public log(message: string, ...rest: unknown[]) {
    if (this.minVerbosity >= 3) {
      console.log(`${this.label} ${message}`, ...rest);
    }
  }

  /**
   * Logs a warning message.
   * Visible if verbosity is >= 2.
   * @param message - The message to log.
   * @param rest - Additional arguments.
   */
  public warn(message: string, ...rest: unknown[]) {
    if (this.minVerbosity >= 2) {
      console.warn(`${this.label} ${message}`, ...rest);
    }
  }

  /**
   * Logs an error message.
   * Visible if verbosity is >= 1.
   * @param message - The message to log.
   * @param rest - Additional arguments.
   */
  public error(message: string, ...rest: unknown[]) {
    if (this.minVerbosity >= 1) {
      console.error(`${this.label} ${message}`, ...rest);
    }
  }
}
