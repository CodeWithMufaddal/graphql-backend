type LogLevel = 'debug' | 'info' | 'warn' | 'error';

function write(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(meta ?? {}),
  };

  const output = JSON.stringify(payload);

  if (level === 'error') {
    console.error(output);
    return;
  }

  if (level === 'warn') {
    console.warn(output);
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

