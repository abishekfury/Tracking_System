const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

/* CORS */
app.use(
  cors({
    origin: 'https://clienttracking.netlify.app',
    credentials: true,
  })
);

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* Health */
app.get('/', (req, res) => {
  res.json({ status: 'OK' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'API healthy' });
});

/* Routes */
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/clients', require('./routes/clients'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/workouts', require('./routes/workouts'));
app.use('/api/progress-images', require('./routes/progressImages'));
app.use('/api/diet-plans', require('./routes/dietPlans'));

/* Error Handler */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message });
});

/* 🚀 START SERVER ONLY AFTER DB */
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () =>
      console.log(`Server running on port ${PORT}`)
    );
  } catch (err) {
    process.exit(1);
  }
};

startServer();