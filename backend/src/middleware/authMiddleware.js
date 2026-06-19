import jwt from 'jsonwebtoken';
import { getDatabase } from '../config/database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'tailorcv-secret-key-default';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token is missing' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    const db = getDatabase();
    try {
      const user = db.prepare('SELECT id, email, plan, created_at FROM users WHERE id = ?').get(decoded.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      req.user = user;
      next();
    } catch (dbErr) {
      console.error('Database error in auth middleware:', dbErr);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
}
