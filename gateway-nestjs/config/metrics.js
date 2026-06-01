// config/metrics.js — Prometheus monitoring configuration
'use strict';

const client = require('prom-client');

// Enable default metrics collection (CPU, Memory, event loop lag, etc.)
client.collectDefaultMetrics({ register: client.register });

// 1. HTTP Request Counter
const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests processed',
  labelNames: ['method', 'route', 'status_code']
});

// 2. HTTP Request Latency Histogram
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10] // latency ranges
});

/**
 * Express middleware to track request duration and count.
 */
function metricsMiddleware(req, res, next) {
  const start = process.hrtime();
  
  res.on('finish', () => {
    const diff = process.hrtime(start);
    const durationInSeconds = diff[0] + diff[1] / 1e9;
    
    // Normalize route to avoid high cardinality (metric bloat)
    let route = req.baseUrl + (req.route ? req.route.path : req.path);
    if (!req.route) {
      route = route.replace(/\/p\d+/, '/:id').replace(/\/\d+/, '/:id');
    }

    const labels = {
      method: req.method,
      route: route || req.path,
      status_code: String(res.statusCode)
    };

    try {
      httpRequestCounter.labels(labels.method, labels.route, labels.status_code).inc();
      httpRequestDuration.labels(labels.method, labels.route, labels.status_code).observe(durationInSeconds);
    } catch (e) {
      // safe monitoring fallback
    }
  });

  next();
}

module.exports = {
  register: client.register,
  metricsMiddleware
};
