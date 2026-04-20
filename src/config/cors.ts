import type { CorsOptionsDelegate } from 'cors';
import type { Request } from 'express';

import { env } from './env';

const explicitOrigins = env.CORS_ALLOWED_ORIGINS.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

function isLocalOrigin(origin: string) {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);
}

export const corsOptionsDelegate: CorsOptionsDelegate<Request> = (
  requestOrigin,
  callback,
) => {
  if (!requestOrigin) {
    callback(null, { origin: true });
    return;
  }

  const allowed =
    explicitOrigins.includes(requestOrigin) ||
    (env.ALLOW_LOCALHOST_ORIGINS && isLocalOrigin(requestOrigin));

  if (!allowed) {
    callback(new Error(`Origin ${requestOrigin} is not allowed by CORS.`));
    return;
  }

  callback(null, {
    origin: true,
    credentials: true,
  });
};

