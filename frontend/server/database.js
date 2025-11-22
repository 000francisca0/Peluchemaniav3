// server/database.js (PROD-ready: DB path via env; ensures dir exists)

import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

// Allow overriding DB file via environment variable, with sane default.
// Example in systemd env: SQLITE_DB_PATH=/var/lib/peluchemania/db/peluchemania.db
const DB_FILE =
  process.env.SQLITE_DB_PATH ||
  path.resolve(process.cwd(), 'peluchemania.db');

// Ensure target directory exists (SQLite will create file if dir exists)
const dir = path.dirname(DB_FILE);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// Verbose helps during first boots/migrations
const db = new (sqlite3.verbose().Database)(DB_FILE, (err) => {
  if (err) {
    console.error('Error al abrir la base de datos:', err.message);
  } else {
    console.log(`Conectado a la base de datos SQLite: ${DB_FILE}`);
  }
});

export { db };
