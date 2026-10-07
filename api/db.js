import { neon } from '@neondatabase/serverless';

export function getDb() {
  const cs = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (!cs) throw new Error('Missing POSTGRES_URL environment variable. Link your Neon database in Vercel project settings.');
  return neon(cs);
}
