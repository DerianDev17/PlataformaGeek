import { parentPort } from 'worker_threads';
import Database from 'better-sqlite3';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '..', '..', 'nexogeek.db');

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.pragma('query_only = true');
db.pragma('busy_timeout = 10000');

parentPort.on('message', ({ id, sql, params, method }) => {
  try {
    const stmt = db.prepare(sql);
    let result;
    if (method === 'all') {
      result = params ? stmt.all(...params) : stmt.all();
    } else if (method === 'get') {
      result = params ? stmt.get(...params) : stmt.get();
    } else if (method === 'run') {
      result = params ? stmt.run(...params) : stmt.run();
    }
    parentPort.postMessage({ id, result });
  } catch (error) {
    parentPort.postMessage({ id, error: error.message });
  }
});
