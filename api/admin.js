import { getDb } from './db.js';

export default async function handler(req, res) {
  const sql = getDb();

  try {
    if (req.method === 'GET') {
      const products = await sql`SELECT * FROM products ORDER BY name ASC`;
      const orders = await sql`SELECT * FROM orders ORDER BY created_at DESC LIMIT 20`;
      const counts = await sql`
        SELECT
          (SELECT COUNT(*) FROM products) AS total_products,
          (SELECT COUNT(*) FROM orders) AS total_orders,
          (SELECT COALESCE(SUM(total_amount), 0) FROM orders) AS total_revenue,
          (SELECT COUNT(*) FROM products WHERE stock_quantity <= 10) AS low_stock_count`;
      return res.status(200).json({ stats: counts[0], products, orders });
    }

    if (req.method === 'PATCH') {
      const { productId, stockQuantity, price, isActive } = req.body;
      if (!productId) return res.status(400).json({ error: 'Missing productId' });
      await sql`
        UPDATE products SET
          stock_quantity = COALESCE(${stockQuantity ?? null}, stock_quantity),
          price = COALESCE(${price ?? null}, price),
          is_active = COALESCE(${isActive ?? null}, is_active)
        WHERE id = ${productId}`;
      return res.status(200).json({ success: true, message: 'Product updated.' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
