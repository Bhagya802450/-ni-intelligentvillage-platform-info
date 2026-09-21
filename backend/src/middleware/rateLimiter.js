// Rate limiting middleware to mimic Redis/Nginx Token Bucket rate limiter
const requestCounts = new Map();
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 120; // 120 req/min

function rateLimiter(req, res, next) {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  const now = Date.now();

  let clientData = requestCounts.get(ip);
  if (!clientData || (now - clientData.startTime) > WINDOW_MS) {
    clientData = { count: 1, startTime: now };
    requestCounts.set(ip, clientData);
  } else {
    clientData.count++;
  }

  res.setHeader('X-RateLimit-Limit', MAX_REQUESTS);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, MAX_REQUESTS - clientData.count));

  if (clientData.count > MAX_REQUESTS) {
    return res.status(429).json({
      success: false,
      message: "Too many requests to HP-ASN Gateway. Rate limit exceeded (120 req/min). Please slow down."
    });
  }

  next();
}

module.exports = rateLimiter;
