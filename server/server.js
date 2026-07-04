require('dotenv').config();
require('./utils/telemetry');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const timeout = require('connect-timeout');
const cookieParser = require('cookie-parser');
const csurf = require('csurf');

const app = express();

// CORS must be first so preflight OPTIONS requests get headers and aren't incorrectly blocked by rate limiters
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:3000'];

app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? allowedOrigins : true,
  credentials: true,
}));

// Default Timeout for all routes
app.use(timeout('15s'));
app.use((req, res, next) => {
  if (!req.timedout) next();
});

// Body parsers must be before sanitize
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: false, limit: '2mb' }));

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(mongoSanitize());
app.use(compression());
app.use(cookieParser());

// Health check (Bypass CSRF & Rate Limiters)
app.get('/api/health', (req, res) => res.status(200).json({ status: 'ok', env: process.env.NODE_ENV, timestamp: Date.now() }));

const csrfProtection = csurf({ 
  cookie: { 
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production', 
    sameSite: 'strict' 
  } 
});

// CSRF Token Endpoint
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Apply CSRF to all API routes
app.use('/api', csrfProtection);

// Rate Limiting
const { authLimiter, apiLimiter, aiLimiter } = require('./middleware/rateLimiters');

// Apply independent rate limiters and route-specific timeouts
app.use('/api/auth', timeout('8s'), authLimiter);
app.use('/api/ai', timeout('60s'), aiLimiter);
// We will apply apiLimiter globally to /api, but since /api/auth and /api/ai 
// are already handled above, this acts as the general route fallback.
app.use('/api', apiLimiter);
connectDB();

// Health check moved up
app.get('/', (req, res) => res.send('Ascend API running'));

// Routes
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const aiRoutes = require('./routes/aiRoutes');
const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');
const missionRoutes = require('./routes/missionRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const progressRoutes = require('./routes/progressRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');

app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/users', userRoutes);
app.use('/api/copilot/tasks', taskRoutes);
app.use('/api/copilot/missions', missionRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/feedback', feedbackRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} [${process.env.NODE_ENV}]`));
