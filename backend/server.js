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

// Additional routes (to be implemented)
app.use('/api/users', require('./routes/users'));
// app.use('/api/sessions', require('./routes/sessions'));
// app.use('/api/participation', require('./routes/participation'));
// app.use('/api/activity', require('./routes/activity'));
// app.use('/api/friends', require('./routes/friends'));
// app.use('/api/calendar', require('./routes/calendar'));

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
