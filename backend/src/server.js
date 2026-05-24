import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import billingRoutes from './routes/billingRoutes.js';
import purchaseRoutes from './routes/purchaseRoutes.js';
import rateRoutes from './routes/rateRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';

// Load Environment Variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Seed Default Admin User if DB is empty
const seedAdmin = async () => {
  try {
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount === 0) {
      await User.create({
        name: 'Shop Owner (Admin)',
        email: 'admin@jeweller.com',
        password: 'admin123', // Automatically hashed by User Schema
        role: 'admin',
        branchId: 'main-branch',
      });
      console.log('Seeded default Admin account successfully!');
      console.log('Credentials: admin@jeweller.com / admin123');
    }
  } catch (error) {
    console.error('Failed to seed default Admin account:', error.message);
  }
};

// Seed admin after connection is ready
setTimeout(seedAdmin, 5000);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/rates', rateRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/payments', paymentRoutes);

// Health Check / Root Endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Lite Jewellery ERP API',
    status: 'Healthy',
    timestamp: new Date(),
  });
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Live Rate management endpoints active`);
});
