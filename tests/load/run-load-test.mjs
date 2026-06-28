/**
 * NexoGeek Load Test — Prueba de carga progresiva con watchdog
 *
 * Ejecuta: node tests/load/run-load-test.mjs
 * Requiere: backend corriendo en localhost:3001
 */

import autocannon from 'autocannon';

const BASE_URL = 'http://localhost:3001';
const HEALTH_URL = `${BASE_URL}/api/health`;

const ENDPOINTS = [
  { path: '/api/universes', weight: 3 },
  { path: '/api/articles?limit=20', weight: 2 },
  { path: '/api/home', weight: 1 },
  { path: '/api/characters?limit=20', weight: 2 },
  { path: '/api/users/ranking', weight: 2 },
];

const CONCURRENCY_LEVELS = [10, 50, 100, 200, 500, 1000];
const DURATION_SECONDS = 15;

function formatMs(ms) {
  if (ms === undefined || ms === null || ms === 0 || Number.isNaN(ms)) return 'N/A';
  return ms.toFixed(2) + ' ms';
}

// ─── Health monitor ───────────────────────────────────────

async function checkHealth() {
  try {
    const res = await fetch(HEALTH_URL);
    const body = await res.json();
    const data = body?.data || body || {};
    return {
      ok: res.ok && data?.status !== 'unhealthy',
      status: data?.status || 'unknown',
      queue: data?.queue || {},
      circuit: data?.circuit || {},
      memory: data?.memory || {},
    };
  } catch {
    return { ok: false, status: 'down' };
  }
}

function startHealthMonitor() {
  const timeline = [];
  const interval = setInterval(async () => {
    const health = await checkHealth();
    timeline.push({ time: Date.now(), ...health });
  }, 2000);
  return { timeline, stop: () => clearInterval(interval) };
}

// ─── Load test runner ─────────────────────────────────────

async function runTest(connections, duration) {
  const instance = autocannon({
    url: BASE_URL,
    connections,
    duration,
    timeout: 15,
    pipelining: 1,
    headers: { Accept: 'application/json' },
    requests: ENDPOINTS.map((ep) => ({
      path: ep.path,
      method: 'GET',
      headers: { Accept: 'application/json' },
    })),
  });

  autocannon.track(instance, { renderProgressBar: false });

  const result = await new Promise((resolve, reject) => {
    instance.on('done', resolve);
    instance.on('error', reject);
  });

  return result;
}

function printResult(level, result) {
  console.log(`\n${'═'.repeat(70)}`);
  console.log(`  ${level} CONEXIONES SIMULTÁNEAS (${result.duration}s)`);
  console.log(`${'═'.repeat(70)}`);

  const total = result.requests.total || 0;
  const errors =
    (result.errors || 0) +
    (result.non2xx || 0) +
    (result['4xx'] || 0) +
    (result['5xx'] || 0) +
    (result.timeouts || 0);

  console.log(`  Requests totales:     ${total.toLocaleString()}`);
  console.log(`  Requests/segundo:      ${(result.requests.average || 0).toFixed(1)}`);
  console.log(`  Éxitos (2xx):          ${(result['2xx'] || 0).toLocaleString()}`);
  console.log(`  Errores totales:       ${errors.toLocaleString()}`);
  const errRate = total > 0 ? ((errors / total) * 100).toFixed(2) : '0';
  console.log(`  Tasa de error:         ${errRate}%`);

  console.log(`  Latencia avg:          ${formatMs(result.latency.average)}`);
  console.log(`  Latencia p50:          ${formatMs(result.latency.p50)}`);
  console.log(`  Latencia p99:          ${formatMs(result.latency.p99)}`);
  console.log(`  Latencia max:          ${formatMs(result.latency.max)}`);
  console.log(`  Throughput (KB/s):     ${((result.throughput.average || 0) / 1024).toFixed(1)}`);
  console.log(`${'─'.repeat(70)}`);

  return {
    concurrency: level,
    reqPerSec: result.requests.average || 0,
    latencyAvg: result.latency.average,
    latencyP99: result.latency.p99,
    errorRate: parseFloat(errRate),
    success: result['2xx'] || 0,
    errors,
  };
}

// ─── Watchdog ─────────────────────────────────────────────

async function waitForServer(retries = 30) {
  for (let i = 0; i < retries; i++) {
    const h = await checkHealth();
    if (h.ok) return true;
    await sleep(2000);
  }
  return false;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ─── Main ─────────────────────────────────────────────────

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════════╗');
  console.log('║           NEXOGEEK — PRUEBA DE CARGA PROGRESIVA                 ║');
  console.log('║           Worker Pool + Queue + Circuit Breaker                  ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝');
  console.log(`\nObjetivo: ${BASE_URL}/api`);
  console.log(`Duración por nivel: ${DURATION_SECONDS}s`);
  console.log(`Endpoints: ${ENDPOINTS.length}`);
  console.log(`Niveles: ${CONCURRENCY_LEVELS.join(' → ')}`);

  const alive = await waitForServer();
  if (!alive) {
    console.error('\n✗ El backend no responde. Inícialo con: cd server && npx tsx src/index.ts');
    process.exit(1);
  }
  console.log('✓ Backend respondedor');

  const results = [];
  let degradedAt = 0;
  let crashedAt = 0;

  for (const level of CONCURRENCY_LEVELS) {
    console.log(`\n\n▶ Nivel ${level} conexiones — arrancando...`);

    const monitor = startHealthMonitor();

    let result;
    try {
      result = await runTest(level, DURATION_SECONDS);
    } catch (err) {
      console.log(`\n  ✗ CRASH durante prueba: ${err.message}`);
      monitor.stop();

      if (!crashedAt) crashedAt = level;
      results.push({
        concurrency: level, reqPerSec: 0, latencyAvg: null,
        latencyP99: null, errorRate: 100, success: 0, errors: -1, crashed: true,
      });
      continue;
    }

    monitor.stop();
    const summary = printResult(level, result);
    results.push(summary);

    const healthEvents = monitor.timeline.filter((h) => !h.ok || h.status === 'degraded');
    if (healthEvents.length > 0 && !degradedAt) {
      degradedAt = level;
      console.log(`  ⚠ Degradación detectada por health check (${healthEvents.length} eventos)`);
    }

    if (summary.errorRate > 50 && !crashedAt) {
      crashedAt = level;
      console.log(`  ✗ Tasa de error >50% — colapso`);
    }

    await sleep(5000);
  }

  // ─── Resumen final ──────────────────────────────────────
  console.log(`\n\n${'═'.repeat(70)}`);
  console.log(`  RESUMEN FINAL`);
  console.log(`${'═'.repeat(70)}`);
  console.log(
    `  ${'Concur.'.padEnd(8)} ${'Req/s'.padEnd(12)} ${'Lat. avg'.padEnd(12)} ${'Lat. p99'.padEnd(12)} ${'Errores%'.padEnd(10)} Estado`
  );
  console.log(`${'─'.repeat(70)}`);

  for (const r of results) {
    const status = r.crashed
      ? 'CRASH'
      : r.errorRate > 50
        ? 'COLAPSO'
        : r.errorRate > 10
          ? 'DEGRADADO'
          : r.errorRate > 1
            ? 'INESTABLE'
            : 'OK';
    console.log(
      `  ${String(r.concurrency).padEnd(8)} ${r.reqPerSec.toFixed(1).padEnd(12)} ${formatMs(r.latencyAvg).padEnd(12)} ${formatMs(r.latencyP99).padEnd(12)} ${(r.errorRate.toFixed(1) + '%').padEnd(10)} ${status}`
    );
  }

  console.log(`\n${'─'.repeat(70)}`);
  console.log('\n Diagnóstico:');

  const lastStable = [...results].reverse().find((r) => !r.crashed && r.errorRate <= 1);
  if (lastStable) {
    console.log(`  ✓ Estable hasta:  ${lastStable.concurrency} usuarios`);
    console.log(`    ${lastStable.reqPerSec.toFixed(0)} req/s, p99=${formatMs(lastStable.latencyP99)}`);
  }

  if (degradedAt) console.log(`  ⚠ Degradación en: ${degradedAt} usuarios`);
  if (crashedAt) console.log(`  ✗ Colapso en:     ${crashedAt} usuarios`);

  console.log('\n Para llegar a 1000 usuarios concurrentes:');
  console.log('  • Migrar SQLite → PostgreSQL (pool de conexiones nativo)');
  console.log('  • PM2 cluster mode (1 instancia por CPU core)');
  console.log('  • Redis para caché compartida entre instancias');
  console.log('  • CDN (Vercel/Cloudflare) para assets estáticos');
  console.log('  • Balanceador de carga (NGINX) + múltiples instancias');

  console.log('\n Prueba completada.\n');
}

main().catch((err) => {
  console.error('Error fatal:', err);
  process.exit(1);
});
