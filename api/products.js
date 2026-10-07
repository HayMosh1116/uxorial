import { getDb } from './db.js';

export default async function handler(req, res) {
  try {
    const sql = getDb();
    const { slug, collection } = req.query;

    if (slug) {
      const rows = await sql`
        SELECT p.*, c.name AS collection_name FROM products p
        LEFT JOIN collections c ON p.collection_id = c.id
        WHERE p.slug = ${slug} AND p.is_active = true`;
      if (rows.length === 0) return res.status(404).json({ error: 'Product not found' });
      return res.status(200).json(rows[0]);
    }

    if (collection) {
      const rows = await sql`
        SELECT p.*, c.slug AS collection_slug FROM products p
        JOIN collections c ON p.collection_id = c.id
        WHERE c.slug = ${collection} AND p.is_active = true
        ORDER BY p.name ASC`;
      return res.status(200).json(rows);
    }

    const rows = await sql`
      SELECT p.*, c.name AS collection_name, c.slug AS collection_slug
      FROM products p
      LEFT JOIN collections c ON p.collection_id = c.id
      WHERE p.is_active = true
      ORDER BY p.created_at DESC`;
    return res.status(200).json(rows);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
