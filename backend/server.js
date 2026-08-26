const http = require('http');
const { Server } = require('socket.io');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

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

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on('join-study-room', (sessionId) => {
    socket.join(`study-session-${sessionId}`);

    console.log(
      `Socket ${socket.id} joined study-session-${sessionId}`
    );
  });

  socket.on('leave-study-room', (sessionId) => {
    socket.leave(`study-session-${sessionId}`);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

app.set('io', io);
