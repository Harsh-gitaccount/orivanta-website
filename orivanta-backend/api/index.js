const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const { RateLimiterMemory } = require('rate-limiter-flexible');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// Rate limiting
const rateLimiter = new RateLimiterMemory({
    keyGenerator: (req) => req.ip,
    points: parseInt(process.env.RATE_LIMIT_MAX) || 5,
    duration: parseInt(process.env.RATE_LIMIT_WINDOW) || 900,
});

const rateLimiterMiddleware = async (req, res, next) => {
    try {
        await rateLimiter.consume(req.ip);
        next();
    } catch (rejRes) {
        res.status(429).json({
            success: false,
            message: 'Too many requests. Please try again later.',
            retryAfter: Math.round(rejRes.msBeforeNext / 1000) || 1,
        });
    }
};

// CORS configuration
const corsOptions = {
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};
app.use(cors(corsOptions));

// Body parser
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        service: 'Orivanta Contact Form API',
        version: '1.0.0'
    });
});

// Load contact routes
const contactRoutes = require('./routes/contact');

// Contact form routes
app.use('/api/contact', rateLimiterMiddleware, contactRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error. Please try again later.'
    });
});

// FIXED: 404 handler - use a different approach
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found',
        availableEndpoints: [
            'GET /health',
            'POST /api/contact/submit'
        ]
    });
});

// FIXED: Start server and test email connection
// async function startServer() {
//     try {
//         const server = app.listen(PORT, () => {
//             console.log(`🚀 Server running on port ${PORT}`);
//             console.log(`📧 Email service configured for: ${process.env.EMAIL_TO}`);
//             console.log(`🌐 CORS origins: ${process.env.CORS_ORIGIN}`);
//             console.log(`🔗 Health check: http://localhost:${PORT}/health`);
//             console.log(`📝 Contact API: http://localhost:${PORT}/api/contact/submit`);
//         });

//         // Test email connection after server starts
//         try {
//             const emailService = require('./utils/emailService');
//             await emailService.testConnection();
//         } catch (emailError) {
//             console.error('⚠️  Email service warning:', emailError.message);
//             console.log('📧 Server will continue running, but email functionality may not work');
//             console.log('🔧 Please check your .env file configuration');
//         }

//         // Graceful shutdown
//         process.on('SIGTERM', () => {
//             console.log('SIGTERM received. Shutting down gracefully...');
//             server.close(() => {
//                 console.log('Process terminated');
//             });
//         });

//         process.on('SIGINT', () => {
//             console.log('SIGINT received. Shutting down gracefully...');
//             server.close(() => {
//                 console.log('Process terminated');
//             });
//         });

//     } catch (error) {
//         console.error('❌ Failed to start server:', error);
//         process.exit(1);
//     }
// }


module.exports = app;