import Database from 'better-sqlite3';

const db = new Database(
  'server/data/mediavault-safe-backup.sqlite',
  { readonly: true }
);

for (const table of ['users', 'photos', 'favorites']) {
  console.log('\nTABLE:', table);

  const columns = db.prepare(`PRAGMA table_info(${table})`).all();

  for (const column of columns) {
    console.log(column.name, '-', column.type);
  }
}

db.close();