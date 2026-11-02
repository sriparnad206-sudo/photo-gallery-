
import 'dotenv/config';
import Database from 'better-sqlite3';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

const source = new Database(
  'server/data/mediavault-safe-backup.sqlite',
  { readonly: true }
);

try {
  // Create PostgreSQL tables
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'User'
        CHECK (role IN ('User', 'Admin')),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS photos (
      id TEXT PRIMARY KEY,
      owner_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      url TEXT NOT NULL,
      likes INTEGER NOT NULL DEFAULT 0,
      date_added TEXT NOT NULL
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS favorites (
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      photo_id TEXT NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
      PRIMARY KEY (user_id, photo_id)
    )
  `;

  const users = source.prepare('SELECT * FROM users').all();
  const photos = source.prepare('SELECT * FROM photos').all();
  const favorites = source.prepare('SELECT * FROM favorites').all();

  for (const u of users) {
    await sql`
      INSERT INTO users
      (id, email, name, password_hash, role, created_at)
      VALUES (
        ${u.id}, ${u.email}, ${u.name},
        ${u.password_hash}, ${u.role}, ${u.created_at}
      )
      ON CONFLICT DO NOTHING
    `;
  }

  for (const p of photos) {
    await sql`
      INSERT INTO photos
      (id, owner_id, title, category, url, likes, date_added)
      VALUES (
        ${p.id}, ${p.owner_id}, ${p.title}, ${p.category},
        ${p.url}, ${p.likes}, ${p.date_added}
      )
      ON CONFLICT DO NOTHING
    `;
  }

  for (const f of favorites) {
    await sql`
      INSERT INTO favorites (user_id, photo_id)
      VALUES (${f.user_id}, ${f.photo_id})
      ON CONFLICT DO NOTHING
    `;
  }

  const userCount = await sql`SELECT COUNT(*)::int AS count FROM users`;
  const photoCount = await sql`SELECT COUNT(*)::int AS count FROM photos`;
  const favoriteCount = await sql`SELECT COUNT(*)::int AS count FROM favorites`;

  console.log('Migration completed!');
  console.log('Users:', userCount[0].count);
  console.log('Photos:', photoCount[0].count);
  console.log('Favorites:', favoriteCount[0].count);

} catch (error) {
  console.error('Migration failed:', error.message);
  process.exitCode = 1;
} finally {
  source.close();
}
