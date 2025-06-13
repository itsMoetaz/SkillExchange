const rateLimit = require('express-rate-limit');

const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

const authLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  5, // limit each IP to 5 requests per windowMs
  'Too many authentication attempts, please try again later'
);

const generalLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  100, // limit each IP to 100 requests per windowMs
  'Too many requests from this IP, please try again later'
);

module.exports = {
  authLimiter,
  generalLimiter
};