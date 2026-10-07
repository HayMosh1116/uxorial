import { getDb } from './db.js';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  try {
    const sql = getDb();
    const schemaPath = path.join(process.cwd(), 'schema.sql');
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    const queries = schemaContent.split(';').map(q => q.trim()).filter(q => q.length > 0);
    for (const query of queries) {
      await sql(query);
    }
    return res.status(200).json({ success: true, message: 'Neon database tables and seed data initialized.' });
  } catch (error) {
    console.error('init-db error:', error);
    return res.status(500).json({ error: error.message });
  }
}
