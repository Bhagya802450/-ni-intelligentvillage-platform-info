const express = require('express');
const router = express.Router();
const db = require('../../data/dbStore');

// GET all soil profiles
router.get('/soil', (req, res) => {
  const { district } = req.query;
  let soils = db.get().suadr?.soilProfiles || [];

  if (district && district !== 'All') {
    soils = soils.filter(s => s.district.toLowerCase() === district.toLowerCase());
  }

  res.json({ success: true, count: soils.length, data: soils });
});

// GET specific Soil Health Card by ID
router.get('/soil/:shcId', (req, res) => {
  const { shcId } = req.params;
  const soils = db.get().suadr?.soilProfiles || [];
  const card = soils.find(s => s.shcId.toLowerCase() === shcId.toLowerCase());

  if (!card) {
    return res.status(404).json({ success: false, message: "Soil Health Card not found in SUADR repository." });
  }

  res.json({ success: true, data: card });
});

// POST new Soil Sample analysis into SUADR repository
router.post('/soil', (req, res) => {
  const {
    district, tehsil, ph, nitrogenKgHa, phosphorusKgHa, potassiumKgHa,
    organicCarbonPercent, zincPpm, boronPpm, recommendation
  } = req.body;

  if (!district || !ph) {
    return res.status(400).json({ success: false, message: "District and pH value are required." });
  }

  const shcId = `SHC-${district.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const phNum = parseFloat(ph);
  let phCategory = "Neutral (Optimal)";
  if (phNum < 6.0) phCategory = "Acidic (Typical Hill Soil)";
  else if (phNum > 7.5) phCategory = "Slightly Alkaline";

  const newCard = {
    shcId,
    district,
    tehsil: tehsil || "Sadar",
    ph: phNum,
    phCategory,
    nitrogenKgHa: Number(nitrogenKgHa) || 240,
    nitrogenRating: Number(nitrogenKgHa) > 280 ? "High" : Number(nitrogenKgHa) > 200 ? "Medium" : "Low",
    phosphorusKgHa: Number(phosphorusKgHa) || 18,
    phosphorusRating: Number(phosphorusKgHa) > 20 ? "High" : "Medium",
    potassiumKgHa: Number(potassiumKgHa) || 220,
    potassiumRating: Number(potassiumKgHa) > 250 ? "High" : "Medium",
    organicCarbonPercent: Number(organicCarbonPercent) || 1.10,
    organicCarbonRating: Number(organicCarbonPercent) > 1.0 ? "Very High" : "Moderate",
    zincPpm: Number(zincPpm) || 0.85,
    boronPpm: Number(boronPpm) || 0.50,
    lastTested: new Date().toISOString().split('T')[0],
    recommendation: recommendation || "Apply 10 tonnes/hectare well-rotted FYM and biofertilizers (Azotobacter / PSB)."
  };

  db.update(store => {
    store.suadr = store.suadr || {};
    store.suadr.soilProfiles = store.suadr.soilProfiles || [];
    store.suadr.soilProfiles.unshift(newCard);
    return store;
  });

  res.status(201).json({
    success: true,
    message: "Soil Health Card successfully registered in SUADR core repository.",
    data: newCard
  });
});

// GET Agro-Climatic Zones of Himachal Pradesh
router.get('/zones', (req, res) => {
  res.json({ success: true, data: db.get().suadr?.agroClimaticZones || [] });
});

// GET Crop suitability by Agro-Zone
router.get('/zones/:zoneId/crops', (req, res) => {
  const { zoneId } = req.params;
  const zones = db.get().suadr?.agroClimaticZones || [];
  const zone = zones.find(z => z.zoneId.toUpperCase() === zoneId.toUpperCase());

  if (!zone) {
    return res.status(404).json({ success: false, message: "Zone not found in SUADR agro-ecological records." });
  }

  const suitabilityMap = {
    "ZONE-I": [
      { crop: "Sugarcane (CoH-119)", suitability: "HIGH", expectedYieldQuintalPerAcre: 350 },
      { crop: "Citrus (Kinnow)", suitability: "VERY HIGH", expectedYieldQuintalPerAcre: 85 },
      { crop: "Organic Ginger", suitability: "HIGH", expectedYieldQuintalPerAcre: 60 }
    ],
    "ZONE-II": [
      { crop: "Off-Season Tomato (Himsona)", suitability: "VERY HIGH", expectedYieldQuintalPerAcre: 180 },
      { crop: "Capsicum (Yellow/Red Bell)", suitability: "HIGH", expectedYieldQuintalPerAcre: 120 },
      { crop: "Peach (July Elberta)", suitability: "HIGH", expectedYieldQuintalPerAcre: 75 }
    ],
    "ZONE-III": [
      { crop: "Apple (Royal Delicious / Spur)", suitability: "OPTIMAL", expectedYieldQuintalPerAcre: 120 },
      { crop: "European Pear (Bartlett)", suitability: "HIGH", expectedYieldQuintalPerAcre: 90 },
      { crop: "Off-Season Pea (Azad P-1)", suitability: "VERY HIGH", expectedYieldQuintalPerAcre: 45 }
    ],
    "ZONE-IV": [
      { crop: "Kinnauri Apple (High Sugar)", suitability: "OPTIMAL", expectedYieldQuintalPerAcre: 130 },
      { crop: "Dry Apricot & Almond", suitability: "HIGH", expectedYieldQuintalPerAcre: 35 },
      { crop: "Kuth & Kala Jeera (Medicinal)", suitability: "SPECIALIZED", expectedYieldQuintalPerAcre: 15 }
    ]
  };

  res.json({
    success: true,
    zone,
    suitability: suitabilityMap[zone.zoneId] || []
  });
});

// GET Micro-climate live telemetry
router.get('/telemetry', (req, res) => {
  const telemetry = db.get().suadr?.liveTelemetry || {};
  res.json({
    success: true,
    data: telemetry,
    lastRefreshed: new Date().toISOString()
  });
});

// POST Micro-climate telemetry ingestion (IoT / AWS station)
router.post('/telemetry', (req, res) => {
  const { district, tempCelsius, humidityPercent, rainfallTodayMm, soilMoisturePercent, frostRisk } = req.body;

  if (!district || tempCelsius === undefined) {
    return res.status(400).json({ success: false, message: "District and tempCelsius are required." });
  }

  const newReading = {
    tempCelsius: Number(tempCelsius),
    humidityPercent: Number(humidityPercent) || 55,
    rainfallTodayMm: Number(rainfallTodayMm) || 0,
    soilMoisturePercent: Number(soilMoisturePercent) || 40,
    frostRisk: frostRisk || "LOW",
    updatedAt: new Date().toISOString()
  };

  db.update(store => {
    store.suadr = store.suadr || {};
    store.suadr.liveTelemetry = store.suadr.liveTelemetry || {};
    store.suadr.liveTelemetry[district] = newReading;
    return store;
  });

  res.json({
    success: true,
    message: `Telemetry updated for AWS station [${district}] in SUADR.`,
    data: newReading
  });
});

// GET Pest & Disease diagnostic guide
router.get('/pests', (req, res) => {
  const { crop } = req.query;
  let list = db.get().suadr?.pestDiagnostics || [];

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
