const Sentry = require('@sentry/node');
const logger = require('./logger');

const SENTRY_DSN = process.env.SENTRY_DSN;

if (SENTRY_DSN) {
  try {
    Sentry.init({
      dsn: SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      tracesSampleRate: 1.0,
    });
    logger.info({ msg: 'Sentry initialized successfully', dsn: SENTRY_DSN });
  } catch (err) {
    logger.warn({ msg: 'Sentry initialization failed', err: err.message });
  }
} else {
  logger.info('Sentry DSN not provided; running without Sentry exception capturing');
}

function captureException(err, context = {}) {
  if (SENTRY_DSN) {
    Sentry.withScope((scope) => {
      if (context.tags) {
        Object.entries(context.tags).forEach(([key, val]) => {
          scope.setTag(key, val);
        });
      }
      if (context.extra) {
        Object.entries(context.extra).forEach(([key, val]) => {
          scope.setExtra(key, val);
        });
      }
      if (context.user) {
        scope.setUser(context.user);
      }
      Sentry.captureException(err);
    });
  }
  
  // Also log structured error via Pino
  logger.error({
    msg: err.message,
    err,
    ...context
  });
}

module.exports = {
  Sentry,
  captureException
};
