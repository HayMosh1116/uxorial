import { getDb } from './db.js';
import crypto from 'crypto';

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function generateToken(user) {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    fullName: user.full_name,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7 // 7 days
  };
  const str = JSON.stringify(payload);
  const signature = crypto.createHmac('sha256', process.env.AUTH_SECRET || 'luxoral-secret-2026').update(str).digest('hex');
  return Buffer.from(str).toString('base64') + '.' + signature;
}

export function verifyToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  try {
    const [b64, signature] = token.split('.');
    const str = Buffer.from(b64, 'base64').toString('utf8');
    const expectedSig = crypto.createHmac('sha256', process.env.AUTH_SECRET || 'luxoral-secret-2026').update(str).digest('hex');
    if (signature !== expectedSig) return null;
    const payload = JSON.parse(str);
    if (Date.now() > payload.exp) return null;
    return payload;
  } catch (err) {
    return null;
  }
}

export default async function handler(req, res) {
  const sql = getDb();
  const { action } = req.query;

  try {
    // Current User Profile
    if (req.method === 'GET' && action === 'me') {
      const user = verifyToken(req.headers.authorization);
      if (!user) return res.status(401).json({ error: 'Unauthorized' });

      const rows = await sql`
        SELECT id, email, full_name, phone, role, created_at 
        FROM users WHERE id = ${user.userId}
      `;
      if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
      return res.status(200).json({ user: rows[0] });
    }

    // Register / Signup
    if (req.method === 'POST' && action === 'signup') {
      const { email, password, fullName, phone } = req.body;
      if (!email || !password || !fullName) {
        return res.status(400).json({ error: 'Email, password, and full name are required' });
      }

      const existing = await sql`SELECT id FROM users WHERE email = ${email.toLowerCase().trim()}`;
      if (existing.length > 0) {
        return res.status(400).json({ error: 'An account with this email already exists' });
      }

      const hashed = hashPassword(password);
      const rows = await sql`
        INSERT INTO users (email, password_hash, full_name, phone, role)
        VALUES (${email.toLowerCase().trim()}, ${hashed}, ${fullName.trim()}, ${phone || null}, 'customer')
        RETURNING id, email, full_name, phone, role
      `;
      const newUser = rows[0];
      const token = generateToken(newUser);
      return res.status(201).json({ user: newUser, token });
    }

    // Login
    if (req.method === 'POST' && action === 'login') {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const hashed = hashPassword(password);
      const rows = await sql`
        SELECT id, email, password_hash, full_name, phone, role 
        FROM users WHERE email = ${email.toLowerCase().trim()}
      `;
      if (rows.length === 0 || rows[0].password_hash !== hashed) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const user = rows[0];
      delete user.password_hash;
      const token = generateToken(user);
      return res.status(200).json({ user, token });
    }

    return res.status(400).json({ error: 'Invalid action' });
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(500).json({ error: error.message });
  }
}
