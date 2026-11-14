import jwt from 'jsonwebtoken';
import { getProfileById } from '../services/dbService.js';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'voicebridge-ai-super-secret-jwt-key-development-2026';

export async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication token required. Please sign in.',
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(403).json({
        success: false,
        error: 'Session token expired or invalid. Please sign in again.',
      });
    }

    const user = await getProfileById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User profile not found.',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(500).json({
      success: false,
      error: 'Internal server error during authentication.',
    });
  }
}
