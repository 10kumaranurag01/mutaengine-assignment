const accessRestriction = (req, res, next) => {
    const allowedApiKey = process.env.X_API_KEY; // Store the allowed X-API key in an environment variable
    const apiKey = req.headers['x-api-key']; // Assuming API key is sent in the request header

    if (!apiKey || apiKey !== allowedApiKey) {
        return res.status(403).json({ message: 'Access forbidden: Invalid or missing X-API key' });
    }

    next();
};

export default accessRestriction;