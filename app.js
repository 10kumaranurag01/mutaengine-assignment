import dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env file

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import rootRouter from './routes/index.js';
import logger from './middleware/logger.js';
import accessRestriction from './middleware/accessRestriction.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(logger);
app.use(accessRestriction);

// Routes
app.use('/api/v1', rootRouter);

// MongoDB connection
try {
    await mongoose.connect(process.env.DB_URI);
    console.log('Connected to MongoDB');
}
catch (error) {
    console.log('Error connecting to MongoDB');
}

// Start the server
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
