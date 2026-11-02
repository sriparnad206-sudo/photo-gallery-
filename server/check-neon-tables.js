import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

const result = await sql`
  SELECT
    (SELECT COUNT(*)::int FROM users) AS users,
    (SELECT COUNT(*)::int FROM photos) AS photos,
    (SELECT COUNT(*)::int FROM favorites) AS favorites
`;

console.log('Neon database verification:');
console.log(result[0]);