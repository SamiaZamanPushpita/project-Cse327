const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize Database & Patterns Singleton
const db = require('./database/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded materials / files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'UP',
        app: 'Tutor Management System API',
        timestamp: new Date().toISOString(),
        patternsCount: 8
    });
});

// Register API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tutor', require('./routes/tutorRoutes'));
app.use('/api/student', require('./routes/studentRoutes'));
app.use('/api/parent', require('./routes/parentRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/patterns', require('./routes/patternRoutes'));

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// Error Handler
app.use((err, req, res, next) => {
    console.error('Unhandled Server Error:', err);
    res.status(500).json({ success: false, message: 'Internal Server Error', error: err.message });
});

// Start Server
app.listen(PORT, () => {
    console.log(`===================================================`);
    console.log(`🚀 TMS Backend API running on http://localhost:${PORT}`);
    console.log(`📚 Design Patterns Showcase: http://localhost:${PORT}/api/patterns/demonstrate`);
    console.log(`===================================================`);
});

module.exports = app;
