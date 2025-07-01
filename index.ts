import express from "express";
import type { Request, Response, NextFunction } from "express";
import client from "prom-client";

const requestCounter = new client.Counter({
    name: 'total_http_requests',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code']
});

const activeRequestsGauge = new client.Gauge({
    name: 'active_requests',
    help: 'Number of active requests being served',
});

const httpRequestDurationMilliseconds = new client.Histogram({
    name: 'http_request_duration_ms',
    help: 'Duration of HTTP requests in ms',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.1, 5, 15, 50, 100, 300, 500, 1000, 3000, 5000]
});

function requestCountMiddleware(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    activeRequestsGauge.inc();

    res.on("finish", () => {
        const duration = Date.now() - startTime;

        const route =
            req.route?.path ||
            req.baseUrl ||
            (res.statusCode === 404 ? "__not_found__" : "unknown");

        const labels = {
            method: req.method,
            route,
            status_code: res.statusCode.toString()
        };

        requestCounter.inc(labels);
        httpRequestDurationMilliseconds.observe(labels, duration);
        activeRequestsGauge.dec();
    });

    next();
}

const app = express();
const METRICS_AUTH_TOKEN = process.env.METRICS_AUTH_TOKEN;

app.get("/metrics", async (req: Request, res: Response): Promise<void> => {
  const auth = req.headers.authorization;
  const expectedBearer = `Bearer ${METRICS_AUTH_TOKEN}`;
  const expectedBasic = `Basic ${Buffer.from(`skin:${METRICS_AUTH_TOKEN}`).toString("base64")}`;

  if (auth !== expectedBearer && auth !== expectedBasic) {
    console.warn("Unauthorized access to /metrics");
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const metrics = await client.register.metrics();
  res.set("Content-Type", client.register.contentType);
  res.end(metrics);
});

app.use(requestCountMiddleware);

app.get("/", (req, res) => {
    res.json({ message: "Hi There" });
});

app.get("/cpu", async (req, res) => {
    await new Promise(resolve => setTimeout(resolve, 10000));
    for (let i = 0; i < 1000000; i++) Math.random();
    res.json({ message: "cpu" });
});

app.get("/users", (req, res) => {
    res.json({ message: "user" });
});

app.use((req, res) => {
    res.status(404).json({ error: "Not found" });
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
