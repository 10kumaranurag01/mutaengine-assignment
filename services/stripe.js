import Stripe from 'stripe';

export const createPaymentIntent = async (req, res) => {
    const { amount } = req.body; // Assuming amount is sent in the request body
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    try {
        // Create a payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount, // Use the amount from the request body
            currency: 'usd',
            payment_method_types: ['card'],
            receipt_email: 'customer@example.com',
        });

        // Send back the client secret to the client
        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (err) {
        console.error('Payment creation error:', err); // Log the error for debugging
        res.status(500).json({ error: 'Payment creation failed', details: err.message });
    }
};
