import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { createProfile, getProfileByEmail, getProfileById } from '../services/dbService.js';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'voicebridge-ai-super-secret-jwt-key-development-2026';
const JWT_EXPIRES_IN = '7d';

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export async function signup(req, res) {
  try {
    const { full_name, email, password, role } = req.validatedData;

    const existingUser = await getProfileByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'An account with this email address already exists. Please log in.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const user = await createProfile({
      id: uuidv4(),
      full_name,
      email,
      password_hash,
      role: role || 'student',
    });

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
      },
    });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to create account.',
    });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.validatedData;

    const user = await getProfileByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials. User with this email does not exist.',
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid password. Please check your credentials and try again.',
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to log in.',
    });
  }
}

export async function getMe(req, res) {
  try {
    const user = req.user;
    return res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    console.error('getMe error:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve user profile.',
    });
  }
}

/**
 * Demo Login Helper to let hackathon evaluators test instantly without manual registration
 */
export async function demoLogin(req, res) {
  try {
    const role = req.body.role === 'admin' ? 'admin' : 'student';
    const email = role === 'admin' ? 'admin.demo@voicebridge.ai' : 'student.demo@voicebridge.ai';
    const fullName = role === 'admin' ? 'Dr. Sarah Connor (Admin)' : 'Alex Rivera (Student)';

    let user = await getProfileByEmail(email);
    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash('DemoPass2026!', salt);
      user = await createProfile({
        id: uuidv4(),
        full_name: fullName,
        email,
        password_hash,
        role,
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: `Signed in as Demo ${role}.`,
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
      },
    });
  } catch (err) {
    console.error('Demo login error:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to initiate demo session.',
    });
  }
}
