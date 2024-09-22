import Stripe from 'stripe';
import nodemailer from 'nodemailer';
import PDFDocument from 'pdfkit';

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Function to send the invoice via email
function sendInvoiceEmail(paymentIntent, pdfBuffer) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: paymentIntent.receipt_email,
        subject: 'Your Invoice',
        text: `Thank you for your payment. Please find the attached invoice for Payment ID: ${paymentIntent.id}`,
        attachments: [
            {
                filename: 'invoice.pdf',
                content: pdfBuffer,
            },
        ],
    };

    return transporter.sendMail(mailOptions);
}

// Generate invoice as PDF using PDFKit
function createInvoicePDF(paymentIntent) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument();
        let buffers = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
            const pdfData = Buffer.concat(buffers);
            resolve(pdfData);
        });

        // Add content to PDF
        doc.fontSize(25).text('Invoice', { align: 'center' });
        doc.moveDown();
        doc.fontSize(16).text(`Payment ID: ${paymentIntent.id}`);
        doc.text(`Amount: ${paymentIntent.amount / 100} ${paymentIntent.currency.toUpperCase()}`);
        doc.text(`Customer Email: ${paymentIntent.receipt_email}`);
        doc.text(`Description: ${paymentIntent.description || 'N/A'}`);

        doc.end();
    });
}

const stripeWebhook = async (req, res) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('Webhook signature verification failed.', err);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle successful payment intent
    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;

        // Create an invoice as PDF
        const pdfBuffer = await createInvoicePDF(paymentIntent);

        // Send invoice via email
        sendInvoiceEmail(paymentIntent, pdfBuffer)
            .then(() => {
                console.log('Invoice sent successfully!');
                res.status(200).send('Invoice sent');
            })
            .catch((error) => {
                console.error('Error sending email:', error);
                res.status(500).send('Failed to send invoice');
            });
    } else {
        res.status(400).send('Unhandled event type');
    }
}

export default stripeWebhook;