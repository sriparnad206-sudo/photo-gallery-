import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

try {
  const result = await sql`SELECT version()`;
  console.log('Neon connection successful!');
  console.log(result[0].version);
} catch (error) {
  console.error('Neon connection failed:', error.message);
  process.exitCode = 1;
}