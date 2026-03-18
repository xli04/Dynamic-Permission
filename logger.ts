// Added structured JSON logging support
export type LogLevel = "debug" | "info" | "warn" | "error";

type LogRecord = {
  ts: string;
  level: LogLevel;
  message: string;
  service: string;
  context?: Record<string, unknown>;
};

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

export class Logger {
  private readonly minLevel: LogLevel;

  constructor(
    private readonly serviceName: string,
    minLevel: LogLevel = "info",
  ) {
    this.minLevel = minLevel;
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.write("debug", message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.write("info", message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.write("warn", message, context);
  }

  error(message: string, context?: Record<string, unknown>): void {
    this.write("error", message, context);
  }

  private write(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    if (LEVEL_ORDER[level] < LEVEL_ORDER[this.minLevel]) return;

    const record: LogRecord = {
      ts: new Date().toISOString(),
      level,
      message,
      service: this.serviceName,
      context,
    };

    const output = JSON.stringify(record);
    if (level === "error" || level === "warn") {
      process.stderr.write(`${output}\n`);
      return;
    }

    process.stdout.write(`${output}\n`);
  }
}
