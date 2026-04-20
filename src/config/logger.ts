import fs from 'node:fs';
import path from 'node:path';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOGS_DIR = path.resolve(process.cwd(), 'logs');
const LOG_FILE_PATH = path.join(LOGS_DIR, 'app.log');
const TERMINAL_MESSAGES = new Set(['Shutting down server.', 'Failed to start server.']);

fs.mkdirSync(LOGS_DIR, { recursive: true });
const logFileStream = fs.createWriteStream(LOG_FILE_PATH, { flags: 'a' });

function write(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(meta ?? {}),
  };

  const output = JSON.stringify(payload);
  logFileStream.write(`${output}\n`);

  const shouldPrintToTerminal =
    level === 'error' || TERMINAL_MESSAGES.has(message);

  if (!shouldPrintToTerminal) {
    return;
  }

  if (level === 'error') {
    console.error(output);
    return;
  }

  console.log(output);
}

export const logger = {
  debug: (message: string, meta?: Record<string, unknown>) =>
    write('debug', message, meta),
  info: (message: string, meta?: Record<string, unknown>) =>
    write('info', message, meta),
  warn: (message: string, meta?: Record<string, unknown>) =>
    write('warn', message, meta),
  error: (message: string, meta?: Record<string, unknown>) =>
    write('error', message, meta),
};

export const morganStream = {
  write: (message: string) =>
    logger.info('http_request', {
      line: message.trim(),
    }),
};
