export class AppError extends Error {
  public readonly extensions: {
    code: string;
    statusCode: number;
    details?: unknown;
  };

  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode = 500,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
    this.extensions = {
      code,
      statusCode,
      ...(details === undefined ? {} : { details }),
    };
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super('NOT_FOUND', message, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super('UNAUTHORIZED', message, 401);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super('CONFLICT', message, 409);
  }
}
