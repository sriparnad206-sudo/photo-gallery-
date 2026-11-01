import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';
import { db, initializeDatabase } from './db.js';

const app = express();
const port = Number(process.env.PORT || 3001);
const jwtSecret = process.env.JWT_SECRET || 'local-development-secret-change-before-deploying';

if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || !process.env.ADMIN_PASSWORD)) {
  throw new Error('Set JWT_SECRET and ADMIN_PASSWORD before starting in production.');
}

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '4mb' }));

const publicUser = (user) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  role: user.role,
  createdAt: user.created_at,
});

const createToken = (user) => jwt.sign({ sub: user.id }, jwtSecret, { expiresIn: '7d' });

const requireAuth = (req, res, next) => {
  const authorization = req.headers.authorization || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Sign in to continue.' });

  try {
    const { sub } = jwt.verify(token, jwtSecret);
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(sub);
    if (!user) return res.status(401).json({ error: 'Account no longer exists.' });
    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ error: 'Your session has expired. Please sign in again.' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'Admin') return res.status(403).json({ error: 'Admin access required.' });
  return next();
};

const authenticate = async (req, res, requiredRole) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || user.role !== requiredRole || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ error: 'Email or password is incorrect.' });
  }
  return res.json({ token: createToken(user), user: publicUser(user) });
};

const photoRows = (userId, favoritesOnly = false) => {
  const favoritesFilter = favoritesOnly ? 'AND EXISTS (SELECT 1 FROM favorites f WHERE f.user_id = ? AND f.photo_id = p.id)' : '';
  return db.prepare(`
    SELECT p.id, p.title, p.category, p.url, p.likes, p.date_added AS dateAdded,
      owner.id AS ownerId, owner.email AS ownerEmail, owner.name AS ownerName,
      EXISTS (SELECT 1 FROM favorites f WHERE f.user_id = ? AND f.photo_id = p.id) AS isFavorite
    FROM photos p
    LEFT JOIN users owner ON owner.id = p.owner_id
    WHERE 1 = 1 ${favoritesFilter}
    ORDER BY p.date_added DESC, p.rowid DESC
  `).all(...(favoritesOnly ? [userId, userId] : [userId]));
};

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.post('/api/auth/register', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const name = String(req.body.name || '').trim();
  const password = String(req.body.password || '');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Enter a valid email address.' });
  if (name.length < 2 || name.length > 60) return res.status(400).json({ error: 'Name must be between 2 and 60 characters.' });
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' });

  const id = randomUUID();
  const passwordHash = await bcrypt.hash(password, 12);
  try {
    db.prepare('INSERT INTO users (id, email, name, password_hash) VALUES (?, ?, ?, ?)')
      .run(id, email, name, passwordHash);
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') return res.status(409).json({ error: 'An account with this email already exists.' });
    throw error;
  }

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  return res.status(201).json({ token: createToken(user), user: publicUser(user) });
});

app.post('/api/auth/login', (req, res) => authenticate(req, res, 'User'));
app.post('/api/auth/admin/login', (req, res) => authenticate(req, res, 'Admin'));

app.get('/api/auth/me', requireAuth, (req, res) => res.json({ user: publicUser(req.user) }));

app.get('/api/photos', requireAuth, (req, res) => {
  const favoritesOnly = req.query.favorites === 'true';
  return res.json({ photos: photoRows(req.user.id, favoritesOnly) });
});

app.post('/api/photos', requireAuth, (req, res) => {
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
  db.prepare(`
    INSERT INTO photos (id, owner_id, title, category, url, date_added)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, req.user.id, title, category, url, dateAdded);
  return res.status(201).json({ photo: photoRows(req.user.id).find((photo) => photo.id === id) });
});

app.put('/api/photos/:id/favorite', requireAuth, (req, res) => {
  const photo = db.prepare('SELECT id FROM photos WHERE id = ?').get(req.params.id);
  if (!photo) return res.status(404).json({ error: 'Photo not found.' });
  const existing = db.prepare('SELECT 1 FROM favorites WHERE user_id = ? AND photo_id = ?').get(req.user.id, photo.id);
  if (existing) {
    db.prepare('DELETE FROM favorites WHERE user_id = ? AND photo_id = ?').run(req.user.id, photo.id);
  } else {
    db.prepare('INSERT INTO favorites (user_id, photo_id) VALUES (?, ?)').run(req.user.id, photo.id);
  }
  return res.json({ isFavorite: !existing });
});

app.delete('/api/photos/:id', requireAuth, (req, res) => {
  const photo = db.prepare('SELECT owner_id FROM photos WHERE id = ?').get(req.params.id);
  if (!photo) return res.status(404).json({ error: 'Photo not found.' });
  if (req.user.role !== 'Admin' && photo.owner_id !== req.user.id) {
    return res.status(403).json({ error: 'You can only delete photos you uploaded.' });
  }
  db.prepare('DELETE FROM photos WHERE id = ?').run(req.params.id);
  return res.status(204).end();
});

app.get('/api/admin/users', requireAuth, requireAdmin, (req, res) => {
  const users = db.prepare("SELECT * FROM users WHERE role = 'User' ORDER BY created_at DESC").all();
  const photos = db.prepare(`
    SELECT p.id, p.owner_id AS ownerId, p.title, p.category, p.url, p.likes,
      p.date_added AS dateAdded, owner.email AS ownerEmail, owner.name AS ownerName
    FROM photos p LEFT JOIN users owner ON owner.id = p.owner_id
    ORDER BY p.date_added DESC, p.rowid DESC
  `).all();
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

await initializeDatabase();
app.listen(port, '127.0.0.1', () => {
  console.log(`MediaVault API listening on http://127.0.0.1:${port}`);
});