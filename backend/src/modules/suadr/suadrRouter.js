const express = require('express');
const router = express.Router();
const db = require('../../data/dbStore');

// GET all soil profiles
router.get('/soil', (req, res) => {
  const { district } = req.query;
  let soils = db.get().suadr.soilProfiles;

  if (district && district !== 'All') {
    soils = soils.filter(s => s.district.toLowerCase() === district.toLowerCase());
  }

  res.json({ success: true, count: soils.length, data: soils });
});

// GET specific Soil Health Card by ID
router.get('/soil/:shcId', (req, res) => {
  const { shcId } = req.params;
  const card = db.get().suadr.soilProfiles.find(s => s.shcId.toLowerCase() === shcId.toLowerCase());

  if (!card) {
    return res.status(404).json({ success: false, message: "Soil Health Card not found in SUADR repository." });
  }

  res.json({ success: true, data: card });
});

// GET Agro-Climatic Zones of Himachal Pradesh
router.get('/zones', (req, res) => {
  res.json({ success: true, data: db.get().suadr.agroClimaticZones });
});

// GET Micro-climate live telemetry
router.get('/telemetry', (req, res) => {
  const telemetry = db.get().suadr.liveTelemetry;
  res.json({
    success: true,
    data: telemetry,
    lastRefreshed: new Date().toISOString()
  });
});

// GET Pest & Disease diagnostic guide
router.get('/pests', (req, res) => {
  const { crop } = req.query;
  let list = db.get().suadr.pestDiagnostics;

  if (crop) {
    list = list.filter(p => p.crop.toLowerCase().includes(crop.toLowerCase()));
  }

  res.json({ success: true, count: list.length, data: list });
});

// POST dynamic advisory query (Rule-based agronomy inference)
router.post('/advisory-query', (req, res) => {
  const { district, crop, soilPh, nitrogenLevel } = req.body;

  let advice = [];
  let alerts = [];

  // Zone specific insights
  if (district === 'Shimla' || district === 'Kullu') {
    alerts.push("Moderate humidity expected in temperate valleys. Monitor orchard canopy for early fungal signs.");
    advice.push("Foliar boron spray at 0.15% recommended before petal fall to improve fruit set.");
  } else if (district === 'Solan') {
    advice.push("Polyhouse ventilation check recommended between 11 AM - 3 PM to avoid humidity spike.");
    advice.push("Maintain drip fertigation schedule: 19:19:19 @ 3kg/acre alternating with calcium nitrate.");
  } else if (district === 'Kangra') {
    advice.push("Drain standing water from lower tea terraces following precipitation.");
  }

  // Soil specific rule
  const phNum = parseFloat(soilPh);
  if (!isNaN(phNum)) {
    if (phNum < 6.0) {
      advice.push("Soil is moderately acidic: Apply dolomite lime @ 200 kg/ha to enhance nutrient uptake.");
    } else if (phNum > 7.5) {
      advice.push("Soil is alkaline: Incorporate gypsum and acidic organic compost.");
    } else {
      advice.push("Soil pH is in optimal range (6.0 - 7.2) for balanced microbial activity.");
    }
  }

  // Pest alert
  if (crop && crop.toLowerCase().includes('apple')) {
    alerts.push("Warning: Scab prediction index is at Level 2 (Moderate). Keep Neemastra or contact fungicides on standby.");
  } else if (crop && crop.toLowerCase().includes('tomato')) {
    alerts.push("Alert: Fruit borer flight detected in mid-hills. Install 4 pheromone traps per bigha.");
  }

  res.json({
    success: true,
    query: { district, crop, soilPh, nitrogenLevel },
    generatedAt: new Date().toISOString(),
    confidenceScore: 0.94,
    agroAdvisories: advice,
    pestAlerts: alerts
  });
});

module.exports = router;
