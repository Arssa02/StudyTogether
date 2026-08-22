const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health',  (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

// Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

app.use('/api/users', require('./routes/users'));
app.use('/api/friends', require('./routes/friends'));
app.use('/api/planned-sessions', require('./routes/plannedSessions'));
app.use('/api/study-sessions', require('./routes/studySessions'));

// to be implemented
// study activity endpoints for study/break tracking

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
