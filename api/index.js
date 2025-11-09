import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes from server folder
import authRoutes from '../server/routes/auth.js';
import userRoutes from '../server/routes/users.js';
import patientRoutes from '../server/routes/patients.js';
import doctorRoutes from '../server/routes/doctors.js';
import surgeonRoutes from '../server/routes/surgeons.js';
import nurseRoutes from '../server/routes/nurses.js';
import departmentRoutes from '../server/routes/departments.js';
import appointmentRoutes from '../server/routes/appointments.js';
import visitRoutes from '../server/routes/visits.js';
import wardRoutes from '../server/routes/wards.js';
import bedRoutes from '../server/routes/beds.js';
import ipdRecordRoutes from '../server/routes/ipd-records.js';
import dashboardRoutes from '../server/routes/dashboard.js';
import labTestRoutes from '../server/routes/labTests.js';
import radiologyRoutes from '../server/routes/radiology.js';
import theatreRoutes from '../server/routes/theatres.js';
import theatreProcedureRoutes from '../server/routes/theatre-procedures.js';
import prescriptionRoutes from '../server/routes/prescriptions.js';
import medicineRoutes from '../server/routes/medicines.js';
import billingRoutes from '../server/routes/billing.js';
import serviceRoutes from '../server/routes/services.js';
import stockRoutes from '../server/routes/stock.js';
import dispensingRoutes from '../server/routes/dispensing.js';
import directDispensingRoutes from '../server/routes/directDispensing.js';
import requisitionRoutes from '../server/routes/requisitions.js';
import itemPricingRoutes from '../server/routes/itemPricing.js';
import itemReceivingRoutes from '../server/routes/itemReceiving.js';
import incomingItemsRoutes from '../server/routes/incomingItems.js';
import corpsesRoutes from '../server/routes/corpses.js';
import cabinetRoutes from '../server/routes/cabinets.js';
import releaseRoutes from '../server/routes/releases.js';
import errorHandler from '../server/middleware/errorHandler.js';

const app = express();

// MongoDB Connection with caching for serverless
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb && mongoose.connection.readyState === 1) {
    console.log('Using cached database connection');
    return cachedDb;
  }

  try {
    console.log('Creating new database connection...');
    mongoose.set('strictQuery', false);
    const db = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    cachedDb = db;
    console.log('MongoDB Connected Successfully');
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// CORS Configuration - Allow all origins for Vercel
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  optionsSuccessStatus: 200,
}));

// Handle preflight requests
app.options('*', cors());

// Security Middleware (relaxed for Vercel)
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Data sanitization
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());
app.use(compression());

// Connect to database before handling requests
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    console.error('Database connection middleware error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Database connection failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Hospital Management API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    mongoStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// API Routes - All routes should have /api prefix
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/surgeons', surgeonRoutes);
app.use('/api/nurses', nurseRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/wards', wardRoutes);
app.use('/api/beds', bedRoutes);
app.use('/api/ipd-records', ipdRecordRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/lab-tests', labTestRoutes);
app.use('/api/radiology', radiologyRoutes);
app.use('/api/theatres', theatreRoutes);
app.use('/api/theatre-procedures', theatreProcedureRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/dispensing', dispensingRoutes);
app.use('/api/direct-dispensing', directDispensingRoutes);
app.use('/api/requisitions', requisitionRoutes);
app.use('/api/item-pricing', itemPricingRoutes);
app.use('/api/item-receiving', itemReceivingRoutes);
app.use('/api/incoming-items', incomingItemsRoutes);
app.use('/api/corpses', corpsesRoutes);
app.use('/api/cabinets', cabinetRoutes);
app.use('/api/releases', releaseRoutes);

// 404 handler
app.use('/api/*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `API route ${req.originalUrl} not found`,
  });
});

// Error handling middleware
app.use(errorHandler);

// Export for Vercel serverless
export default app;