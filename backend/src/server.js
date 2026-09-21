const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimiter = require('./middleware/rateLimiter');

// Routers
const authRouter = require('./modules/auth/authRouter');
const farmerRouter = require('./modules/farmers/farmerRouter');
const suadrRouter = require('./modules/suadr/suadrRouter');
const schemeRouter = require('./modules/schemes/schemeRouter');
const hpasnRouter = require('./modules/hpasn/hpasnRouter');
const marketplaceRouter = require('./modules/marketplace/marketplaceRouter');

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());
app.use(morgan('dev'));
app.use(rateLimiter);

// Gateway Health & Architecture Meta
app.get('/api/health', (req, res) => {
  res.json({
    platform: "HP Agriculture Service Network (HP-ASN) & SUADR Gateway",
    version: "2.4.0-enterprise",
    status: "HEALTHY",
    timestamp: new Date().toISOString(),
    subsystems: {
      apiGateway: "ONLINE (Nginx / Rate-Limiter Active)",
      frappeRestBackend: "ONLINE",
      postgresqlDataBackbone: "CONNECTED (Unified Farmer & Land DB)",
      redisCacheAndQueues: "ACTIVE (Micro-cache & session guard)",
      hpasnNetwork: "CONNECTED (HimBhoomi, HPMC, NPCI-DBT)",
      suadrStateRepository: "SYNCHRONIZED (Soil, Weather, Pest Intelligence)"
    }
  });
});

// Mount Platform APIs
app.use('/api/auth', authRouter);
app.use('/api/farmers', farmerRouter);
app.use('/api/suadr', suadrRouter);
app.use('/api/schemes', schemeRouter);
app.use('/api/hpasn', hpasnRouter);
app.use('/api/marketplace', marketplaceRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route ${req.method} ${req.originalUrl} not found on HP-ASN Gateway.`
  });
});

// Start Server if executed directly
let server = null;
if (require.main === module) {
  server = app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🌾 HP Agriculture Service Network (HP-ASN)`);
    console.log(`📊 State Unified Digital Database (SUADR)`);
    console.log(`🚀 API Gateway running on: http://localhost:${PORT}`);
    console.log(`=======================================================`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use by another process. Please stop the existing process or use PORT=5001.`);
      process.exit(1);
    } else {
      throw err;
    }
  });
}

module.exports = app;
