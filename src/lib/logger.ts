type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogPayload {
  level: LogLevel;
  message: string;
  timestamp: string;
  meta?: Record<string, unknown>;
}

/**
 * Emits a structured log line. Production info/debug is silent;
 * warn/error still go to stderr so hosting logs capture failures.
 */
function write(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
  const payload: LogPayload = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(meta ? { meta } : {}),
  };
  const isProd = process.env.NODE_ENV === 'production';
  if (isProd && (level === 'debug' || level === 'info')) {
    return;
  }
  const line = JSON.stringify(payload);
  if (level === 'error') {
    console.error(line);
    return;
  }
  if (level === 'warn') {
    console.warn(line);
    return;
  }
  console.info(line);
}

/** Structured application logger. Never call console.log from feature code. */
export const logger = {
  debug(message: string, meta?: Record<string, unknown>): void {
    write('debug', message, meta);
  },
  info(message: string, meta?: Record<string, unknown>): void {
    write('info', message, meta);
  },
  warn(message: string, meta?: Record<string, unknown>): void {
    write('warn', message, meta);
  },
  error(message: string, meta?: Record<string, unknown>): void {
    write('error', message, meta);
  },
};
