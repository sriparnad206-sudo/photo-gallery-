
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';
import { neon } from '@neondatabase/serverless';

const app = express();

if (!process.env.DATABASE_URL || !process.env.JWT_SECRET) {
  throw new Error('Set DATABASE_URL and JWT_SECRET in your environment variables.');
}

const sql = neon(process.env.DATABASE_URL);
const jwtSecret = process.env.JWT_SECRET;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '4mb' }));

const publicUser = (user) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  role: user.role,
  createdAt: user.created_at,
});

const createToken = (user) =>
  jwt.sign({ sub: user.id }, jwtSecret, { expiresIn: '7d' });

const requireAuth = async (req, res, next) => {
  const authorization = req.headers.authorization || '';
  const token = authorization.startsWith('Bearer ')
    ? authorization.slice(7)
    : null;

  if (!token) return res.status(401).json({ error: 'Sign in to continue.' });

  let sub;
  try {
    ({ sub } = jwt.verify(token, jwtSecret));
  } catch {
    return res.status(401).json({ error: 'Your session has expired. Please sign in again.' });
  }

  try {
    const rows = await sql`SELECT * FROM users WHERE id = ${sub} LIMIT 1`;
    if (!rows.length) return res.status(401).json({ error: 'Account no longer exists.' });
    req.user = rows[0];
    return next();
  } catch (error) {
    return next(error);
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  return next();
};

const authenticate = async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const rows = await sql`SELECT * FROM users WHERE LOWER(email) = ${email} LIMIT 1`;
  const user = rows[0];

  if (!user || user.role !== req.requiredRole ||
      !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ error: 'Email or password is incorrect.' });
  }

  return res.json({ token: createToken(user), user: publicUser(user) });
};

const photoRows = async (userId, favoritesOnly = false) => {
  if (favoritesOnly) {
    return sql`
      SELECT p.id, p.title, p.category, p.url, p.likes,
        p.date_added AS "dateAdded",
        owner.id AS "ownerId", owner.email AS "ownerEmail",
        owner.name AS "ownerName",
        EXISTS (
          SELECT 1 FROM favorites f
          WHERE f.user_id = ${userId} AND f.photo_id = p.id
        ) AS "isFavorite"
      FROM photos p
      LEFT JOIN users owner ON owner.id = p.owner_id
      WHERE EXISTS (
        SELECT 1 FROM favorites f
        WHERE f.user_id = ${userId} AND f.photo_id = p.id
      )
      ORDER BY p.date_added DESC, p.id DESC
    `;
  }

  return sql`
    SELECT p.id, p.title, p.category, p.url, p.likes,
      p.date_added AS "dateAdded",
      owner.id AS "ownerId", owner.email AS "ownerEmail",
      owner.name AS "ownerName",
      EXISTS (
        SELECT 1 FROM favorites f
        WHERE f.user_id = ${userId} AND f.photo_id = p.id
      ) AS "isFavorite"
    FROM photos p
    LEFT JOIN users owner ON owner.id = p.owner_id
    ORDER BY p.date_added DESC, p.id DESC
  `;
};

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.post('/api/auth/register', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const name = String(req.body.name || '').trim();
  const password = String(req.body.password || '');

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Enter a valid email address.' });
  }
  if (name.length < 2 || name.length > 60) {
    return res.status(400).json({ error: 'Name must be between 2 and 60 characters.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  }

  const id = randomUUID();
  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const rows = await sql`
      INSERT INTO users (id, email, name, password_hash)
      VALUES (${id}, ${email}, ${name}, ${passwordHash})
      RETURNING *
    `;
    const user = rows[0];
    return res.status(201).json({ token: createToken(user), user: publicUser(user) });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }
    throw error;
  }
});

app.post('/api/auth/login', async (req, res) => {
  req.requiredRole = 'User';
  return authenticate(req, res);
});

app.post('/api/auth/admin/login', async (req, res) => {
  req.requiredRole = 'Admin';
  return authenticate(req, res);
});

app.get('/api/auth/me', requireAuth, (req, res) =>
  res.json({ user: publicUser(req.user) })
);

app.get('/api/photos', requireAuth, async (req, res) => {
  const favoritesOnly = req.query.favorites === 'true';
  return res.json({ photos: await photoRows(req.user.id, favoritesOnly) });
});

app.post('/api/photos', requireAuth, async (req, res) => {
  const title = String(req.body.title || '').trim();
  const category = String(req.body.category || '').trim();
  const url = String(req.body.url || '');

  if (!title || title.length > 120 || !category || category.length > 60) {
    return res.status(400).json({ error: 'Enter a title and category within the allowed length.' });
  }
  if (!/^data:image\/(png|jpeg|webp|gif);base64,/i.test(url) || url.length > 3_000_000) {
    return res.status(400).json({ error: 'Upload a supported image smaller than 2 MB.' });
  }

  const id = randomUUID();
  const dateAdded = new Date().toISOString().slice(0, 10);

  await sql`
    INSERT INTO photos (id, owner_id, title, category, url, date_added)
    VALUES (${id}, ${req.user.id}, ${title}, ${category}, ${url}, ${dateAdded})
  `;

  const photos = await photoRows(req.user.id);
  return res.status(201).json({ photo: photos.find((photo) => photo.id === id) });
});

app.put('/api/photos/:id/favorite', requireAuth, async (req, res) => {
  const photo = await sql`SELECT id FROM photos WHERE id = ${req.params.id} LIMIT 1`;
  if (!photo.length) return res.status(404).json({ error: 'Photo not found.' });

  const existing = await sql`
    SELECT 1 FROM favorites
    WHERE user_id = ${req.user.id} AND photo_id = ${req.params.id}
  `;

  if (existing.length) {
    await sql`
      DELETE FROM favorites
      WHERE user_id = ${req.user.id} AND photo_id = ${req.params.id}
    `;
  } else {
    await sql`
      INSERT INTO favorites (user_id, photo_id)
      VALUES (${req.user.id}, ${req.params.id})
      ON CONFLICT DO NOTHING
    `;
  }

  return res.json({ isFavorite: !existing.length });
});

app.delete('/api/photos/:id', requireAuth, async (req, res) => {
  const photos = await sql`
    SELECT owner_id FROM photos WHERE id = ${req.params.id} LIMIT 1
  `;
  const photo = photos[0];

  if (!photo) return res.status(404).json({ error: 'Photo not found.' });

  if (req.user.role !== 'Admin' && photo.owner_id !== req.user.id) {
    return res.status(403).json({ error: 'You can only delete photos you uploaded.' });
  }

  await sql`DELETE FROM photos WHERE id = ${req.params.id}`;
  return res.status(204).end();
});

app.get('/api/admin/users', requireAuth, requireAdmin, async (req, res) => {
  const users = await sql`
    SELECT * FROM users
    WHERE role = 'User'
    ORDER BY created_at DESC
  `;

  const photos = await sql`
    SELECT p.id, p.owner_id AS "ownerId", p.title, p.category,
      p.url, p.likes, p.date_added AS "dateAdded",
      owner.email AS "ownerEmail", owner.name AS "ownerName"
    FROM photos p
    LEFT JOIN users owner ON owner.id = p.owner_id
    ORDER BY p.date_added DESC, p.id DESC
  `;

  return res.json({
    users: users.map((user) => ({
      ...publicUser(user),
      photos: photos.filter((photo) => photo.ownerId === user.id),
    })),
    unassignedPhotos: photos.filter((photo) => !photo.ownerId),
    photoCount: photos.length,
  });
});

app.use((error, req, res, next) => {
  console.error(error);
  if (res.headersSent) return next(error);
  return res.status(500).json({ error: 'An unexpected server error occurred.' });
});

export default app;
