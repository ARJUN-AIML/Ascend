const rateLimit = require('express-rate-limit');

// Strict Anti-Bruteforce for Auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  message: { message: 'Too many authentication attempts. Please try again later.' }
});

// Relaxed general API limit (Dashboard, products)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  message: { message: 'API rate limit exceeded.' }
});

// Dedicated AI routing protection (Isolated from Dashboard)
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 50,
  message: { message: 'AI endpoint limit exceeded.' }
});

module.exports = { authLimiter, apiLimiter, aiLimiter };
