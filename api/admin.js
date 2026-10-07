import { getDb } from './db.js';
import { verifyToken } from './auth.js';

export default async function handler(req, res) {
  const sql = getDb();
  const authUser = verifyToken(req.headers.authorization);

  // STRICT BACKEND ACCESS CONTROL: Only admins are allowed
  if (!authUser || authUser.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied: Admin privileges required.' });
  }

  try {
    // GET: Dashboard Stats & All Orders
    if (req.method === 'GET') {
      const orders = await sql`
        SELECT o.*, 
          COALESCE(
            json_agg(
              json_build_object(
                'id', oi.id,
                'product_name', oi.product_name,
                'color', oi.color,
                'size', oi.size,
                'quantity', oi.quantity,
                'unit_price', oi.unit_price,
                'subtotal', oi.subtotal
              )
            ) FILTER (WHERE oi.id IS NOT NULL), '[]'::json
          ) as items
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        GROUP BY o.id
        ORDER BY o.created_at DESC
      `;

      const statsRows = await sql`
        SELECT 
          (SELECT COUNT(*) FROM orders) as total_orders,
          (SELECT COALESCE(SUM(total_amount), 0) FROM orders) as total_revenue,
          (SELECT COUNT(*) FROM orders WHERE order_status = 'Pending') as pending_orders,
          (SELECT COUNT(*) FROM orders WHERE order_status = 'Processing') as processing_orders,
          (SELECT COUNT(*) FROM orders WHERE order_status = 'Delivered') as delivered_orders,
          (SELECT COUNT(*) FROM products) as total_products,
          (SELECT COUNT(*) FROM users WHERE role = 'customer') as total_customers
      `;

      return res.status(200).json({
        stats: statsRows[0],
        orders
      });
    }

    // PATCH: Update Order Status
    if (req.method === 'PATCH') {
      const { orderId, orderStatus, paymentStatus } = req.body;
      if (!orderId) {
        return res.status(400).json({ error: 'Order ID is required' });
      }

      const validStatuses = [
        'Pending',
        'Payment Pending',
        'Payment Confirmed',
        'Processing',
        'Ready for Delivery',
        'Shipped',
        'Delivered',
        'Cancelled'
      ];

      if (orderStatus && !validStatuses.includes(orderStatus)) {
        return res.status(400).json({ error: `Invalid status. Valid: ${validStatuses.join(', ')}` });
      }

      const rows = await sql`
        UPDATE orders 
        SET 
          order_status = COALESCE(${orderStatus || null}, order_status),
          payment_status = COALESCE(${paymentStatus || null}, payment_status),
          updated_at = now()
        WHERE id = ${orderId} OR order_number = ${orderId}
        RETURNING id, order_number, order_status, payment_status, updated_at
      `;

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Order not found' });
      }

      return res.status(200).json({
        success: true,
        message: `Order status updated to ${rows[0].order_status}`,
        order: rows[0]
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Admin API error:', error);
    return res.status(500).json({ error: error.message });
  }
}
