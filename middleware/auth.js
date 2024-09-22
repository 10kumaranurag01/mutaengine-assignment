import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
    const JWT_SECRET = process.env.JWT_SECRET;
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

export default authMiddleware;
