import { getDb } from './db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const sql = getDb();
    const { email, address, items, totalAmount } = req.body;

    if (!items || items.length === 0) return res.status(400).json({ error: 'Cart is empty' });

    // Verify stock exists for every item first
    for (const item of items) {
      const rows = await sql`
        SELECT name, stock_quantity FROM products WHERE id = ${item.productId}`;
      if (rows.length === 0) return res.status(400).json({ error: `Product ${item.productId} not found` });
      if (rows[0].stock_quantity < item.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for ${rows[0].name}. Only ${rows[0].stock_quantity} left.`
        });
      }
    }

    // Deduct stock
    for (const item of items) {
      await sql`
        UPDATE products SET stock_quantity = stock_quantity - ${item.quantity}
        WHERE id = ${item.productId}`;
    }

    // Create the order
    const orderRows = await sql`
      INSERT INTO orders (customer_email, shipping_address, total_amount, order_status, payment_status)
      VALUES (${email || 'guest@luxoral.com'}, ${JSON.stringify(address || {})}, ${totalAmount}, 'confirmed', 'paid')
      RETURNING id, created_at, total_amount`;
    const order = orderRows[0];

    // Create order items
    for (const item of items) {
      await sql`
        INSERT INTO order_items (order_id, product_id, product_name, color, size, quantity, unit_price)
        VALUES (${order.id}, ${item.productId}, ${item.name}, ${item.color}, ${item.size}, ${item.quantity}, ${item.price})`;
    }

    return res.status(200).json({
      success: true,
      orderId: order.id,
      total: order.total_amount,
      message: 'Order placed successfully!'
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return res.status(500).json({ error: error.message });
  }
}
