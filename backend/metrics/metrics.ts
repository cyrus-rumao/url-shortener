import client from "prom-client";

const register = new client.Registry();

// Default Node.js metrics
client.collectDefaultMetrics({
  register,
});

// HTTP request counter
const httpRequestsTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"] as const,
});

// HTTP request duration
const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP request duration in seconds",
  labelNames: ["method", "route", "status_code"] as const,
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
});

// Active requests
const activeRequests = new client.Gauge({
  name: "http_active_requests",
  help: "Currently active HTTP requests",
});

const reqResTime = new client.Histogram({
  name: "http_request_response_time_seconds",
  help: "Time taken to process HTTP requests",
  labelNames: ["method", "route", "status_code"] as const,

  // Buckets are in seconds
  buckets: [
    0.001, // 1ms
    0.05,  // 50ms
    0.1,   // 100ms
    0.2,   // 200ms
    0.4,   // 400ms
    0.5,   // 500ms
    0.8,   // 800ms
    1,     // 1s
    2,     // 2s
    5,     // 5s
    10,    // 10s
    15,    // 15s
  ],
});
register.registerMetric(reqResTime);
register.registerMetric(httpRequestsTotal);
register.registerMetric(httpRequestDuration);
register.registerMetric(activeRequests);

export {
  register,
  httpRequestsTotal,
  httpRequestDuration,
  activeRequests,
  reqResTime
};