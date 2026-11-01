import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { initialPhotos } from '../src/data/photos.js';

export let db;

export async function initializeDatabase() {
  const databasePath = resolve(process.env.DATABASE_PATH || 'server/data/mediavault.sqlite');
  mkdirSync(dirname(databasePath), { recursive: true });
  db = new Database(databasePath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'User' CHECK (role IN ('User', 'Admin')),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS photos (
      id TEXT PRIMARY KEY,
      owner_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      url TEXT NOT NULL,
      likes INTEGER NOT NULL DEFAULT 0,
      date_added TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS favorites (
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      photo_id TEXT NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
      PRIMARY KEY (user_id, photo_id)
    );
  `);

  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@mediavault.local').trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';
  const adminId = 'admin';
  const adminHash = await bcrypt.hash(adminPassword, 12);
  db.prepare(`
    INSERT INTO users (id, email, name, password_hash, role)
    VALUES (?, ?, 'Administrator', ?, 'Admin')
    ON CONFLICT(email) DO UPDATE SET
      name = excluded.name,
      password_hash = excluded.password_hash,
      role = 'Admin'
  `).run(adminId, adminEmail, adminHash);

  const photoCount = db.prepare('SELECT COUNT(*) AS count FROM photos').get().count;
  if (photoCount === 0) {
    const insertPhoto = db.prepare(`
      INSERT INTO photos (id, title, category, url, likes, date_added)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const seedPhotos = db.transaction(() => {
      initialPhotos.forEach((photo) => insertPhoto.run(
        photo.id,
        photo.title,
        photo.category,
        photo.url,
        photo.likes,
        photo.dateAdded
      ));
    });
    seedPhotos();
  }
}