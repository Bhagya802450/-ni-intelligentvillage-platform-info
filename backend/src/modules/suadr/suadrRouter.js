const express = require('express');
const router = express.Router();
const db = require('../../data/dbStore');
const { SUADR, SoilData, ClimateData, CropMaster, AgronomyData, PestData, MarketData } = require('../../models/SUADR');

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

// =========================================================================
// STATE UNIFIED DIGITAL DATABASE (SUADR)
// Core Hierarchy:
// SUADR
//  │
//  ├── Soil Data
//  ├── Climate Data
//  ├── Crop Data
//  ├── Agronomy Data
//  ├── Pest Data
//  └── Market Data
// =========================================================================

// GET /api/suadr/hierarchy - SUADR Logical Hierarchy Tree
router.get('/hierarchy', (req, res) => {
  const suadrStore = db.get().suadr || {};
  const suadrModel = new SUADR(suadrStore);
  res.json({
    success: true,
    model: "State Unified Digital Database (SUADR)",
    tree: "SUADR ├── Soil Data ├── Climate Data ├── Crop Data ├── Agronomy Data ├── Pest Data └── Market Data",
    hierarchy: suadrModel.getHierarchy()
  });
});

// 1. Soil Data (soil_data: id, location, soil_type, ph, nitrogen, phosphorus, potassium)
router.get('/soil-data', (req, res) => {
  const { location, search } = req.query;
  let list = db.get().suadr?.soil_data || [];
  if (location && location !== 'All') {
    list = list.filter(s => (s.location || s.district || '').toLowerCase() === location.toLowerCase());
  }
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(s => (s.location || '').toLowerCase().includes(q) || (s.soil_type || '').toLowerCase().includes(q));
  }
  res.json({ success: true, count: list.length, data: list });
});

router.post('/soil-data', (req, res) => {
  const { id, location, soil_type, ph, nitrogen, phosphorus, potassium, recommendation } = req.body;
  if (!location || ph === undefined) {
    return res.status(400).json({ success: false, message: "Fields 'location' and 'ph' are mandatory." });
  }

  const model = new SoilData({
    id,
    location,
    soil_type: soil_type || 'Clay Loam',
    ph: Number(ph),
    nitrogen: Number(nitrogen !== undefined ? nitrogen : 260),
    phosphorus: Number(phosphorus !== undefined ? phosphorus : 22),
    potassium: Number(potassium !== undefined ? potassium : 280),
    recommendation
  });

  const soilRecord = model.toJSON();

  db.update(store => {
    store.suadr = store.suadr || {};
    store.suadr.soil_data = store.suadr.soil_data || [];
    store.suadr.soil_data.unshift(soilRecord);
    store.suadr.soilProfiles = store.suadr.soilProfiles || [];
    store.suadr.soilProfiles.unshift(soilRecord);
    return store;
  });

  res.status(201).json({
    success: true,
    message: "Soil Data registered successfully in SUADR repository.",
    model: "soil_data (id, location, soil_type, ph, nitrogen, phosphorus, potassium)",
    data: soilRecord
  });
});

// 2. Climate Data (climate_data: id, location, temperature, humidity, rainfall, date)
const getClimateDataHandler = (req, res) => {
  const { location, date } = req.query;
  let list = db.get().suadr?.climate_data || [];
  if (location && location !== 'All') {
    list = list.filter(c => (c.location || '').toLowerCase() === location.toLowerCase());
  }
  if (date) {
    list = list.filter(c => c.date === date);
  }
  res.json({ success: true, count: list.length, data: list });
};

router.get('/climate-data', getClimateDataHandler);
router.get('/climate', getClimateDataHandler);


router.post('/climate-data', (req, res) => {
  const { id, location, temperature, humidity, rainfall, date, condition, wind_speed } = req.body;
  if (!location || temperature === undefined) {
    return res.status(400).json({ success: false, message: "Fields 'location' and 'temperature' are mandatory." });
  }

  const model = new ClimateData({
    id,
    location,
    temperature: Number(temperature),
    humidity: Number(humidity !== undefined ? humidity : 55),
    rainfall: Number(rainfall !== undefined ? rainfall : 0),
    date: date || new Date().toISOString().split('T')[0],
    condition,
    wind_speed
  });

  const climateRecord = model.toJSON();

  db.update(store => {
    store.suadr = store.suadr || {};
    store.suadr.climate_data = store.suadr.climate_data || [];
    store.suadr.climate_data.unshift(climateRecord);
    return store;
  });

  res.status(201).json({
    success: true,
    message: "Climate Data recorded successfully in SUADR repository.",
    model: "climate_data (id, location, temperature, humidity, rainfall, date)",
    data: climateRecord
  });
});

// 3. Crop Data (crop_master: id, crop_name, crop_type, season)
const getCropMasterHandler = (req, res) => {
  const { crop_type, season, search } = req.query;
  let list = db.get().suadr?.crop_master || db.get().suadr?.crop_data || [];
  if (crop_type && crop_type !== 'All') {
    list = list.filter(c => (c.crop_type || '').toLowerCase() === crop_type.toLowerCase());
  }
  if (season && season !== 'All') {
    list = list.filter(c => (c.season || '').toLowerCase() === season.toLowerCase());
  }
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(c => (c.crop_name || '').toLowerCase().includes(q));
  }
  res.json({ success: true, count: list.length, data: list });
};

const postCropMasterHandler = (req, res) => {
  const { id, crop_name, crop_type, season, duration_days, water_requirement } = req.body;
  if (!crop_name || !crop_type || !season) {
    return res.status(400).json({ success: false, message: "Fields 'crop_name', 'crop_type', and 'season' are mandatory." });
  }

  const model = new CropMaster({
    id,
    crop_name,
    crop_type,
    season,
    duration_days,
    water_requirement
  });

  const cropRecord = model.toJSON();

  db.update(store => {
    store.suadr = store.suadr || {};
    store.suadr.crop_master = store.suadr.crop_master || [];
    store.suadr.crop_master.push(cropRecord);
    store.suadr.crop_data = store.suadr.crop_master;
    return store;
  });

  res.status(201).json({
    success: true,
    message: "Crop Master registered successfully in SUADR repository.",
    model: "crop_master (id, crop_name, crop_type, season)",
    data: cropRecord
  });
};

router.get('/crop-master', getCropMasterHandler);
router.get('/crop-data', getCropMasterHandler);
router.get('/crops', getCropMasterHandler);
router.post('/crop-master', postCropMasterHandler);
router.post('/crop-data', postCropMasterHandler);


// 4. Agronomy Data (agronomy_data: id, crop, soil_type, sowing_window, seed_rate, irrigation_practices, fertilizer_recommendation)
router.get('/agronomy-data', (req, res) => {
  const { crop } = req.query;
  let list = db.get().suadr?.agronomy_data || [];
  if (crop && crop !== 'All') {
    list = list.filter(a => (a.crop || '').toLowerCase().includes(crop.toLowerCase()));
  }
  res.json({ success: true, count: list.length, data: list });
});

router.post('/agronomy-data', (req, res) => {
  const { id, crop, soil_type, sowing_window, seed_rate, irrigation_practices, fertilizer_recommendation } = req.body;
  if (!crop || !soil_type) {
    return res.status(400).json({ success: false, message: "Fields 'crop' and 'soil_type' are mandatory." });
  }

  const model = new AgronomyData({
    id,
    crop,
    soil_type,
    sowing_window,
    seed_rate,
    irrigation_practices,
    fertilizer_recommendation
  });

  const agroRecord = model.toJSON();

  db.update(store => {
    store.suadr = store.suadr || {};
    store.suadr.agronomy_data = store.suadr.agronomy_data || [];
    store.suadr.agronomy_data.push(agroRecord);
    return store;
  });

  res.status(201).json({
    success: true,
    message: "Agronomy protocol registered successfully in SUADR repository.",
    model: "agronomy_data (id, crop, soil_type, sowing_window, seed_rate, irrigation_practices, fertilizer_recommendation)",
    data: agroRecord
  });
});

// 5. Pest Data (pest_data: id, pest_name, crop, symptoms)
router.get('/pest-data', (req, res) => {
  const { crop, search } = req.query;
  let list = db.get().suadr?.pest_data || [];
  if (crop && crop !== 'All') {
    list = list.filter(p => (p.crop || '').toLowerCase().includes(crop.toLowerCase()));
  }
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(p => (p.pest_name || '').toLowerCase().includes(q) || (p.symptoms || '').toLowerCase().includes(q));
  }
  res.json({ success: true, count: list.length, data: list });
});

router.post('/pest-data', (req, res) => {
  const { id, pest_name, crop, symptoms, control_measures, severity } = req.body;
  if (!pest_name || !crop || !symptoms) {
    return res.status(400).json({ success: false, message: "Fields 'pest_name', 'crop', and 'symptoms' are mandatory." });
  }

  const model = new PestData({
    id,
    pest_name,
    crop,
    symptoms,
    control_measures,
    severity
  });

  const pestRecord = model.toJSON();

  db.update(store => {
    store.suadr = store.suadr || {};
    store.suadr.pest_data = store.suadr.pest_data || [];
    store.suadr.pest_data.push(pestRecord);
    return store;
  });

  res.status(201).json({
    success: true,
    message: "Pest diagnostic data registered successfully in SUADR repository.",
    model: "pest_data (id, pest_name, crop, symptoms)",
    data: pestRecord
  });
});

// 6. Market Data (market_data: id, market_name, crop, modal_price, min_price, max_price, date)
const getMarketDataHandler = (req, res) => {
  const { crop, market_name } = req.query;
  let list = db.get().suadr?.market_data || [];
  if (crop && crop !== 'All') {
    list = list.filter(m => (m.crop || '').toLowerCase().includes(crop.toLowerCase()));
  }
  if (market_name && market_name !== 'All') {
    list = list.filter(m => (m.market_name || '').toLowerCase().includes(market_name.toLowerCase()));
  }
  res.json({ success: true, count: list.length, data: list });
};

router.get('/market-data', getMarketDataHandler);
router.get('/market', getMarketDataHandler);


router.post('/market-data', (req, res) => {
  const { id, market_name, crop, modal_price, min_price, max_price, date, arrival_quintals } = req.body;
  if (!market_name || !crop || modal_price === undefined) {
    return res.status(400).json({ success: false, message: "Fields 'market_name', 'crop', and 'modal_price' are mandatory." });
  }

  const model = new MarketData({
    id,
    market_name,
    crop,
    modal_price: Number(modal_price),
    min_price: Number(min_price !== undefined ? min_price : modal_price * 0.85),
    max_price: Number(max_price !== undefined ? max_price : modal_price * 1.20),
    date: date || new Date().toISOString().split('T')[0],
    arrival_quintals
  });

  const mktRecord = model.toJSON();

  db.update(store => {
    store.suadr = store.suadr || {};
    store.suadr.market_data = store.suadr.market_data || [];
    store.suadr.market_data.unshift(mktRecord);
    return store;
  });

  res.status(201).json({
    success: true,
    message: "Market price quotation registered successfully in SUADR repository.",
    model: "market_data (id, market_name, crop, modal_price, min_price, max_price, date)",
    data: mktRecord
  });
});

// =========================================================================
// KARNATAKA DISTRICTS & AGRO-CLIMATIC DIRECTORY (31 Districts, 10 Zones)
// =========================================================================
const { karnatakaDistricts, karnatakaAgroZones } = require('../../data/karnatakaDistricts');

// GET /api/suadr/karnataka-districts - List all 31 districts of Karnataka
router.get('/karnataka-districts', (req, res) => {
  const { division, zone, search } = req.query;
  let list = karnatakaDistricts;

  if (division && division !== 'All') {
    list = list.filter(d => 
      d.division.toLowerCase().includes(division.toLowerCase()) || 
      d.division_kn.includes(division)
    );
  }

  if (zone && zone !== 'All') {
    list = list.filter(d => 
      d.agro_climatic_zone.toLowerCase().includes(zone.toLowerCase()) ||
      d.agro_climatic_zone_kn.includes(zone)
    );
  }

  if (search) {
    const q = search.toLowerCase();
    list = list.filter(d => 
      d.name.toLowerCase().includes(q) ||
      d.name_kn.includes(q) ||
      d.headquarters.toLowerCase().includes(q) ||
      d.headquarters_kn.includes(q) ||
      d.soil_type.toLowerCase().includes(q) ||
      d.major_crops.some(c => c.toLowerCase().includes(q)) ||
      d.major_crops_kn.some(c => c.includes(q))
    );
  }

  res.json({
    success: true,
    state: "Karnataka",
    state_kn: "ಕರ್ನಾಟಕ",
    total_districts: karnatakaDistricts.length,
    count: list.length,
    data: list
  });
});

// GET /api/suadr/karnataka-districts/:idOrName - Single Karnataka district details
router.get('/karnataka-districts/:idOrName', (req, res) => {
  const param = req.params.idOrName.toLowerCase();
  const district = karnatakaDistricts.find(d => 
    d.id.toLowerCase() === param || 
    d.name.toLowerCase() === param || 
    d.name_kn === req.params.idOrName ||
    d.headquarters.toLowerCase() === param
  );

  if (!district) {
    return res.status(404).json({
      success: false,
      message: `Karnataka district '${req.params.idOrName}' not found in SUADR directory.`
    });
  }

  res.json({
    success: true,
    data: district
  });
});

// GET /api/suadr/karnataka-zones - 10 Agro-Climatic Zones of Karnataka
router.get('/karnataka-zones', (req, res) => {
  res.json({
    success: true,
    state: "Karnataka",
    state_kn: "ಕರ್ನಾಟಕ",
    total_zones: karnatakaAgroZones.length,
    data: karnatakaAgroZones
  });
});

module.exports = router;
