import { getDb } from './db.js';
import { verifyToken } from './auth.js';

export default async function handler(req, res) {
  const sql = getDb();
  const authUser = verifyToken(req.headers.authorization);

  try {
    // GET: List Orders
    if (req.method === 'GET') {
      if (!authUser) {
        return res.status(401).json({ error: 'Please log in to view your orders' });
      }

      // If Admin: can view all or filtered
      if (authUser.role === 'admin' && req.query.all === 'true') {
        const orders = await sql`
          SELECT o.*, 
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
            ) as items
          FROM orders o
          LEFT JOIN order_items oi ON o.id = oi.order_id
          GROUP BY o.id
          ORDER BY o.created_at DESC
        `;
        return res.status(200).json({ orders });
      }

      // Customer: ONLY get orders belonging to this customer
      const orders = await sql`
        SELECT o.*, 
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
          ) as items
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.user_id = ${authUser.userId}
        GROUP BY o.id
        ORDER BY o.created_at DESC
      `;
      return res.status(200).json({ orders });
    }

    // POST: Create Order (Database checkout)
    if (req.method === 'POST') {
      const {
        customerName,
        customerEmail,
        customerPhone,
        deliveryAddress,
        state,
        paymentMethod,
        items,
        totalAmount
      } = req.body;

      if (!customerName || !customerPhone || !deliveryAddress || !items || items.length === 0) {
        return res.status(400).json({ error: 'Please provide all required delivery details and items' });
      }

      // Generate next order number e.g. LX-1001
      const seqRows = await sql`SELECT nextval('order_number_seq') as num`;
      const orderNumber = `LX-${seqRows[0].num}`;

      // Validate userId exists in users table to prevent stale token FK constraint error
      let userId = null;
      if (authUser && authUser.userId) {
        const userExists = await sql`SELECT id FROM users WHERE id = ${authUser.userId}`;
        if (userExists.length > 0) {
          userId = authUser.userId;
        }
      }

      // Insert Order
      const orderRows = await sql`
        INSERT INTO orders (
          order_number,
          user_id,
          customer_name,
          customer_email,
          customer_phone,
          delivery_address,
          state,
          payment_method,
          total_amount,
          order_status,
          payment_status
        ) VALUES (
          ${orderNumber},
          ${userId},
          ${customerName},
          ${customerEmail || (authUser ? authUser.email : 'guest@luxoral.com')},
          ${customerPhone},
          ${deliveryAddress},
          ${state || 'Lagos'},
          ${paymentMethod || 'Bank Transfer / On Delivery'},
          ${totalAmount},
          'Pending',
          'Payment Pending'
        )
        RETURNING id, order_number, total_amount, order_status, created_at
      `;
      const order = orderRows[0];

      // Insert Order Items and Deduct stock
      for (const item of items) {
        const subtotal = Number(item.price) * Number(item.quantity);
        await sql`
          INSERT INTO order_items (
            order_id,
            product_name,
            color,
            size,
            quantity,
            unit_price,
            subtotal
          ) VALUES (
            ${order.id},
            ${item.name || 'Luxoral Garment'},
            ${item.color || 'Standard'},
            ${item.size || 'M'},
            ${item.quantity},
            ${item.price},
            ${subtotal}
          )
        `;

        // Update product stock if slug/id exists
        if (item.slug) {
          await sql`
            UPDATE products 
            SET stock_quantity = GREATEST(0, stock_quantity - ${item.quantity})
            WHERE slug = ${item.slug}
          `;
        }
      }

      return res.status(201).json({
        success: true,
        orderId: order.id,
        orderNumber: order.order_number,
        totalAmount: order.total_amount,
        status: order.order_status,
        message: 'Order created successfully and saved in database'
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Orders error:', error);
    return res.status(500).json({ error: error.message });
  }
}
