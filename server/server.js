const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

// Load env variables FIRST
dotenv.config();

const app = express();

/* =======================
   CORS (ONLY ONE PLACE)
======================= */
app.use(
  cors({
    origin: 'https://clienttracking.netlify.app',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

/* =======================
   BODY PARSER
======================= */
app.use(express.json());

/* =======================
   STATIC FILES
======================= */
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* =======================
   HEALTH CHECKS
======================= */
app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Tracking System Server running',
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'API healthy' });
});

/* =======================
   ROUTES
======================= */
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/clients', require('./routes/clients'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/workouts', require('./routes/workouts'));
app.use('/api/progress-images', require('./routes/progressImages'));
app.use('/api/diet-plans', require('./routes/dietPlans'));

/* =======================
   ERROR HANDLER
======================= */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
});

/* =======================
   START SERVER AFTER DB
======================= */
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB(); // DB FIRST
    app.listen(PORT, () =>
      console.log(`✅ Server running on port ${PORT}`)
    );
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
