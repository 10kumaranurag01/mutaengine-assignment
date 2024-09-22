import User from '../models/User.js';
import { generateToken, generateTokenForPasswordReset } from '../utils/jwt.js';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';

// Signup
export const signup = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const user = new User({ name, email, password });
        await user.save();

        // Generate JWT token
        const token = generateToken(user);
        res.status(201).json({ token });
    } catch (err) {
        if (err.code === 11000) { // Duplicate key error (for unique fields)
            return res.status(400).json({ error: 'Email already exists' });
        }
        res.status(500).json({ error: 'Signup failed', details: err.message });
    }
};

// Login
export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const token = generateToken(user);
        res.json({ token });
    } catch (err) {
        res.status(500).json({ error: 'Login failed', details: err.message });
    }
};

// Password Reset (send reset link via email)
export const resetPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Send reset email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const resetToken = generateTokenForPasswordReset(user);
        const resetUrl = `${process.env.FRONTEND_URL}/confirm-reset-password/${resetToken}`; // URl to frontend route

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Password Reset',
            html: `<p>To reset your password, please click the link below:</p>
             <a href=${resetUrl} style="color: blue; text-decoration: underline;">Click here to reset your password</a>
             <p>If the above link doesn't work, please copy and paste this URL into your browser:</p>
             <p>${resetUrl}</p>`
        });

        res.json({ message: 'Reset link sent' });
    } catch (err) {
        res.status(500).json({ error: 'Password reset failed', details: err.message });
    }
};

export const ConfirmResetPassword = async (req, res) => {
    const { newPassword, token } = req.body;

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(404).json({ error: 'Invalid or expired token' });
        }

        user.password = newPassword
        await user.save();

        res.json({ message: 'Password has been reset successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to reset password', details: err.message });
    }
};