import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';

export const googleLogin = async (req, res) => {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const { token } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const { email, name, sub: googleId } = ticket.getPayload();

        let user = await User.findOne({ googleId });
        if (!user) {
            // Create a new user if they don't exist
            user = new User({ email, name, googleId });
            await user.save();
        }

        const jwtToken = generateToken(user);
        res.json({ token: jwtToken });
    } catch (err) {
        console.error('Google login error:', err); // Log the error for debugging
        res.status(500).json({ error: 'Google login failed', details: err.message });
    }
};
