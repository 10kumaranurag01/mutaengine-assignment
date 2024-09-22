import axios from 'axios';


const recaptcha = async (req, res, next) => {
    const { recaptchaToken } = req.body;

    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    const response = await axios.post(`https://www.google.com/recaptcha/api/siteverify`, {}, {
        params: {
            secret: secretKey,
            response: recaptchaToken,
        },
    });

    if (!response.data.success) {
        return res.status(400).json({ error: 'reCAPTCHA failed' });
    }

    next();
};

export default recaptcha;
