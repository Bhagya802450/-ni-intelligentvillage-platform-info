// Rate limiting middleware powered by Redis Token Bucket / Sliding Window
const redisService = require('../services/redisService');

async function rateLimiter(req, res, next) {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  const maxRequests = 120; // 120 req/min
  const windowMs = 60 * 1000;

  try {
    const rateCheck = await redisService.checkRateLimit(`ratelimit:${ip}`, maxRequests, windowMs);

    res.setHeader('X-RateLimit-Limit', rateCheck.limit);
    res.setHeader('X-RateLimit-Remaining', rateCheck.remaining);
    res.setHeader('X-RateLimit-Reset', rateCheck.resetTime);
    res.setHeader('X-RateLimit-Engine', 'Redis-v7');

    if (!rateCheck.allowed) {
      return res.status(429).json({
        success: false,
        engine: "Redis Rate Limiter",
        message: "Too many requests to HP-ASN Gateway. Rate limit exceeded (120 req/min). Please slow down.",
        resetAt: rateCheck.resetTime
      });
    }

    next();
  } catch (err) {
    // Fail open if rate limiter fails
    next();
  }
}

module.exports = rateLimiter;
