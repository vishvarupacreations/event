require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const seedDB = require('./data/seed');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/campusconnect';

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:5173'], credentials: true }));
app.use(express.json({ limit: '10mb' }));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', require('./routes/events'));
app.use('/api/registrations', require('./routes/registrations'));
app.use('/api/payments', require('./routes/payment'));
app.use('/api/admin', require('./routes/admin'));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) =>
  res.json({ status: 'ok', message: 'CampusConnect API is running 🚀', time: new Date() })
);

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

// ─── Database & Server Start ──────────────────────────────────────────────────
async function startServer() {
  try {
    console.log('📡 Attempting to connect to MongoDB...');
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Connected to MongoDB');
    await seedDB();
  } catch (err) {
    console.warn('\n⚠️ MongoDB Connection Failed. Switching to Demo Mode (In-Memory Fallback)...');
    console.warn('   (Make sure MongoDB is running on localhost:27017 for persistent data)\n');
    
    process.env.DEMO_MODE = 'true';
    const { initDB } = require('./data/db');
    await initDB(); 
  }

  app.listen(PORT, () => {
    console.log(`\n🚀 CampusConnect Backend running on http://localhost:${PORT}`);
    console.log(`\n🔑 Demo Credentials:`);
    console.log(`   Student:   student@demo.com / Password123`);
    console.log(`   Organizer: organizer@demo.com / Password123`);
    console.log(`   Admin:     admin@demo.com / Password123`);
  });
}

startServer();
