const express = require('express');
const router = express.Router();
const db = require('../../data/dbStore');

// GET all Mandi prices
router.get('/mandi-rates', (req, res) => {
  const { district, commodity } = req.query;
  let rates = db.get().mandiPrices;

  if (district && district !== 'All') {
    rates = rates.filter(r => r.district.toLowerCase() === district.toLowerCase());
  }

  if (commodity && commodity !== 'All') {
    rates = rates.filter(r => r.commodity.toLowerCase().includes(commodity.toLowerCase()));
  }

  res.json({
    success: true,
    count: rates.length,
    lastUpdated: new Date().toISOString().split('T')[0],
    data: rates
  });
});

// GET stats summary
router.get('/stats', (req, res) => {
  const rates = db.get().mandiPrices;
  res.json({
    success: true,
    totalMarketsReporting: 5,
    topGainer: "Capsicum (Green Bell) +6.1%",
    highestModalPriceCommodity: "Apple (Royal Delicious Grade A) - ₹11,800/Qtl",
    commoditiesTracked: rates.map(r => r.commodity)
  });
});

module.exports = router;
