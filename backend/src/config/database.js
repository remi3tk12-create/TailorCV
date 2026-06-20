import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Store database in the root of the backend folder
const dbPath = process.env.DATABASE_PATH || path.resolve(__dirname, '../../tailorcv.db');

let db = null;

export function getDatabase() {
  if (db) return db;

  db = new Database(dbPath);
  console.log(`Database connected (better-sqlite3): ${dbPath}`);
  return db;
}

export function initDatabase() {
  const database = getDatabase();
  
  // Enable foreign keys
  database.pragma('foreign_keys = ON');

  // Create tables if they do not exist
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      plan TEXT DEFAULT 'free', -- 'free' or 'premium'
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS cv_slots (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      job_title TEXT NOT NULL,
      company_name TEXT NOT NULL,
      job_description TEXT,
      original_cv_path TEXT,
      tailored_cv_path TEXT,
      status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'failed'
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
  
  console.log('Database schema initialized.');
}
