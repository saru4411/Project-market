// config/logger.js — Centralized structured logger using Pino
'use strict';

const pino = require('pino');

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  // In production: emit JSON; in development: pretty-print
  ...(process.env.NODE_ENV !== 'production' && {
    transport: {
      target: 'pino-pretty',
      options: { colorize: true, translateTime: 'SYS:standard', ignore: 'pid,hostname' }
    }
  }),
  base: {
    service: 'inditrade-gateway',
    env: process.env.NODE_ENV || 'development'
  },
  redact: ['req.headers.authorization', 'body.password', 'body.token']
});

module.exports = logger;
