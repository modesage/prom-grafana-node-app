# 📊 monitor-app

A lightweight monitoring server built with [Bun](https://bun.sh), [Express](https://expressjs.com/), and [prom-client](https://github.com/siimon/prom-client), integrated with Prometheus and Grafana.

---

## ✨ Getting Started

### 🔧 Install Dependencies

```bash
bun install
```

### ▶️ Run the App

```bash
bun run index.ts
```

> Created using `bun init` with Bun v1.2.17

---

## 🐳 Docker

### 🏐 Build Docker Image

```bash
docker build -t monitor-app-image .
```

### 🌐 Create Docker Network

```bash
docker network create monitoring
```

### 🏃‍♂️ Run the Container

```bash
docker run -p 3000:3000 --network monitoring --name monitor-app -e METRICS_AUTH_TOKEN=<your_token> monitor-app-image
```

### 📊 Run Prometheus with Docker

```bash
docker run -p 9090:9090 -v ./prometheus.yml:/etc/prometheus/prometheus.yml --network monitoring prom/prometheus
```

---

## 📆 Docker Compose

### ⛰️ Run All Services Together

```bash
docker-compose up
```

> Ensure `prometheus.yml` is in the root directory.

---

## 🔥 Load Testing

### 1. 🔰 Baseline Sanity Test

```bash
loadtest -c 10 --rps 100 -t 30 http://localhost:3000
```

* 10 concurrent users
* 100 requests/sec
* Duration: 30 seconds

Ensures app works and metrics are being collected.

---

### 2. 🚦 Sustained Load Test

```bash
loadtest -c 100 --rps 500 -t 60 http://localhost:3000
```

* 100 concurrent users
* 500 requests/sec
* Duration: 1 minute

Simulates real user traffic.

Measures average latency, `active_requests`, CPU, and memory.

---

### 3. 🧱 Stress Test

```bash
loadtest -c 200 --rps 1000 -t 60 http://localhost:3000
```

Pushes system to its limits.

Watch for timeouts, 5xx errors, and degraded performance.

---

### 4. 📈 Spike Test

```bash
loadtest -c 300 --rps 1500 -t 15 http://localhost:3000
```

Short burst of intense traffic.

Tests system resilience to sudden spikes.

---

## 🎯 How to Tune Your System

Start with small values and gradually increase `--rps` and `-c`.

👀 Monitor:

* Latency (response time)
* Error rate (non-200s)
* Server CPU & Memory
* `active_requests` metric

When you see:

* High latency
* Rising active requests
* 5xx errors

💡 You're reaching a performance limit.

---

## 🧐 Grafana Monitoring Tips

Monitor the following metrics:

* `http_request_duration_ms`
* `total_http_requests`
* `active_requests`
* CPU & RAM usage

Correlate load with internal performance in real-time.

---

## 🔐 Securing `/metrics`

Use an environment variable for auth protection:

```bash
export METRICS_AUTH_TOKEN=<your_secure_token>
```

Supported headers:

* **Bearer Token:**

  ```http
  Authorization: Bearer <your_secure_token>
  ```
  
* **Basic Auth:**

  ```http
  Authorization: Basic $(echo -n "token:<your_secure_token>" | base64)
  ```

Only authorized requests will receive metrics.

---

Happy Monitoring! 🚀
