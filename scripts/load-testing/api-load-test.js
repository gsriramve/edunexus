/**
 * EduNexus API Load Testing Script
 *
 * Uses k6 for load testing. Install k6 first:
 * - macOS: brew install k6
 * - Linux: sudo apt install k6
 *
 * Run: k6 run api-load-test.js
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const apiTrend = new Trend('api_response_time');

// Test configuration
export const options = {
  stages: [
    { duration: '30s', target: 10 },  // Ramp up to 10 users
    { duration: '1m', target: 50 },   // Ramp up to 50 users
    { duration: '2m', target: 50 },   // Stay at 50 users
    { duration: '30s', target: 100 }, // Spike to 100 users
    { duration: '1m', target: 100 },  // Stay at 100 users
    { duration: '30s', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    errors: ['rate<0.1'],              // Error rate should be below 10%
    api_response_time: ['p(99)<1000'], // 99% should be below 1s
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:3001/api';
const TENANT_ID = __ENV.TENANT_ID || 'test-tenant';

// Headers for all requests
const headers = {
  'Content-Type': 'application/json',
  'x-tenant-id': TENANT_ID,
};

export default function () {
  group('Health Check', function () {
    const res = http.get(`${BASE_URL}/health`, { headers });
    check(res, {
      'health check status is 200': (r) => r.status === 200,
    });
    errorRate.add(res.status !== 200);
    apiTrend.add(res.timings.duration);
  });

  group('Departments API', function () {
    const res = http.get(`${BASE_URL}/departments`, { headers });
    check(res, {
      'departments status is 200': (r) => r.status === 200,
      'departments returns array': (r) => Array.isArray(JSON.parse(r.body)),
    });
    errorRate.add(res.status !== 200);
    apiTrend.add(res.timings.duration);
  });

  group('Students API', function () {
    const res = http.get(`${BASE_URL}/students?page=1&limit=10`, { headers });
    check(res, {
      'students status is 200': (r) => r.status === 200,
    });
    errorRate.add(res.status !== 200);
    apiTrend.add(res.timings.duration);
  });

  group('Exams API', function () {
    const res = http.get(`${BASE_URL}/exams/upcoming`, { headers });
    check(res, {
      'exams status is 200': (r) => r.status === 200 || r.status === 404,
    });
    errorRate.add(res.status >= 500);
    apiTrend.add(res.timings.duration);
  });

  group('Announcements API', function () {
    const res = http.get(`${BASE_URL}/communication/announcements`, { headers });
    check(res, {
      'announcements status is 200': (r) => r.status === 200 || r.status === 404,
    });
    errorRate.add(res.status >= 500);
    apiTrend.add(res.timings.duration);
  });

  // Small delay between iterations
  sleep(1);
}

// Summary output
export function handleSummary(data) {
  return {
    'load-test-summary.json': JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function textSummary(data, options) {
  const metrics = data.metrics;
  return `
============================================================
                    LOAD TEST SUMMARY
============================================================

Total Requests:      ${metrics.http_reqs.values.count}
Failed Requests:     ${metrics.http_req_failed?.values.passes || 0}
Error Rate:          ${(metrics.errors?.values.rate * 100 || 0).toFixed(2)}%

Response Times:
  - Average:         ${metrics.http_req_duration.values.avg.toFixed(2)}ms
  - Median (p50):    ${metrics.http_req_duration.values['p(50)'].toFixed(2)}ms
  - p90:             ${metrics.http_req_duration.values['p(90)'].toFixed(2)}ms
  - p95:             ${metrics.http_req_duration.values['p(95)'].toFixed(2)}ms
  - p99:             ${metrics.http_req_duration.values['p(99)'].toFixed(2)}ms
  - Max:             ${metrics.http_req_duration.values.max.toFixed(2)}ms

Throughput:          ${metrics.http_reqs.values.rate.toFixed(2)} req/s

Virtual Users:       ${data.root_group.checks?.length || 'N/A'}

============================================================
`;
}
