import Database from 'better-sqlite3';

const db = new Database(
  'server/data/mediavault-safe-backup.sqlite',
  { readonly: true }
);

const photos = db.prepare(
  'SELECT title, category, url FROM photos'
).all();

for (const photo of photos) {
  let type = 'Other';

  if (photo.url.startsWith('data:image/')) {
    type = 'Base64 image';
  } else if (photo.url.startsWith('http')) {
    type = 'Online image URL';
  }

  console.log({
    title: photo.title,
    category: photo.category,
    type
  });
}

db.close();