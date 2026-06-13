import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Store database in the root of the backend folder
const dbPath = process.env.DATABASE_PATH || path.resolve(__dirname, '../../tailorcv.db');

let db = null;

export async function getDatabase() {
  if (db) return db;

  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  console.log(`Database connected: ${dbPath}`);
  return db;
}

export async function initDatabase() {
  const database = await getDatabase();
  
  // Create tables if they do not exist
  await database.exec(`
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
