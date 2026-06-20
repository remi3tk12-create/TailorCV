import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { getDatabase } from '../config/database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'tailorcv-secret-key-default';

export async function signup(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // Simple email regex validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  const db = getDatabase();

  try {
    // Check if user already exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
    if (existingUser) {
      return res.status(409).json({ error: 'Email is already registered' });
    }

    // Hash password and insert
    const userId = crypto.randomUUID();
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const createdAt = new Date().toISOString();
    const plan = 'free'; // default plan is 'free'

    db.prepare(`
      INSERT INTO users (id, email, password_hash, plan, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(userId, email.toLowerCase(), passwordHash, plan, createdAt);

    // Generate JWT token
    const token = jwt.sign({ id: userId, email: email.toLowerCase() }, JWT_SECRET, { expiresIn: '24h' });

    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: userId,
        email: email.toLowerCase(),
        plan,
        createdAt
      }
    });
  } catch (error) {
    console.error('Error during signup:', error);
    return res.status(500).json({ error: 'Internal server error during signup' });
  }
}

export async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const db = getDatabase();

  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

    // Get CV count
    const cvCountRow = db.prepare('SELECT COUNT(*) as count FROM cv_slots WHERE user_id = ?').get(user.id);
    const cvCount = cvCountRow ? cvCountRow.count : 0;

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        plan: user.plan,
        createdAt: user.created_at,
        cvCount
      }
    });
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({ error: 'Internal server error during login' });
  }
}

export async function getProfile(req, res) {
  const db = getDatabase();
  try {
    const cvCountRow = db.prepare('SELECT COUNT(*) as count FROM cv_slots WHERE user_id = ?').get(req.user.id);
    const cvCount = cvCountRow ? cvCountRow.count : 0;

    return res.json({
      id: req.user.id,
      email: req.user.email,
      plan: req.user.plan,
      createdAt: req.user.created_at,
      cvCount
    });
  } catch (error) {
    console.error('Error during getProfile:', error);
    return res.status(500).json({ error: 'Internal server error fetching profile' });
  }
}
