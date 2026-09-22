const fs = require('fs');
const path = require('path');
const Farmer = require('../models/Farmer');
const Land = require('../models/Land');
const Crop = require('../models/Crop');
const { SUADR, SoilData, ClimateData, CropMaster, AgronomyData, PestData, MarketData } = require('../models/SUADR');

const DB_FILE = path.join(__dirname, 'seed_data.json');

let initialData = {};
try {
  initialData = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
} catch (e) {
  initialData = {};
}

// Helper to extract all crops across all farmers
function extractAllCrops(farmers = []) {
  const all = [];
  farmers.forEach(f => {
    (f.landParcels || []).forEach(p => {
      if (Array.isArray(p.crops)) {
        all.push(...p.crops);
      }
    });
  });
  return all;
}

// Initialize file if not present
function loadData() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      initialData.crops = extractAllCrops(initialData.farmers);
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
      return initialData;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    const merged = parsed;

    if (Array.isArray(merged.farmers)) {
      merged.farmers = merged.farmers.map(f => {
        // Ensure each parcel has crops linked
        if (Array.isArray(f.landParcels)) {
          f.landParcels.forEach(p => {
            if (!Array.isArray(p.crops) || p.crops.length === 0) {
              const cropName = (p.primaryCrop || 'Seasonal Crop').split('(')[0].trim();
              const cropPrefix = (f.district || 'HP').substring(0, 3).toUpperCase();
              p.crops = [
                new Crop({
                  crop_id: `CROP-${cropPrefix}-${Math.floor(100 + Math.random() * 900)}`,
                  farmer_id: f.farmer_id || f.id,
                  parcel_id: p.parcelId,
                  crop_name: cropName,
                  variety: p.primaryCrop && p.primaryCrop.includes('(') ? p.primaryCrop.split('(')[1].replace(')', '') : 'Standard Cultivar',
                  season: cropName.toLowerCase().includes('apple') || cropName.toLowerCase().includes('tea') ? 'Perennial' : 'Kharif',
                  area_bigha: Number(p.areaBigha) || 5.0,
                  crop_stage: 'Vegetative',
                  health_status: 'Optimal',
                  estimated_yield_quintals: ((Number(p.areaBigha) || 5.0) * 6.5).toFixed(1),
                  ndvi_score: 0.78
                }).toJSON()
              ];
            }
          });
        }
        return new Farmer(f).toJSON();
      });
    }

    // Ensure SUADR holds all 6 branches
    merged.suadr = merged.suadr || {};
    ['soil_data', 'climate_data', 'crop_master', 'agronomy_data', 'pest_data', 'market_data'].forEach(branch => {
      if (!Array.isArray(merged.suadr[branch]) || merged.suadr[branch].length === 0) {
        merged.suadr[branch] = initialData.suadr[branch] || [];
      }
    });
    // Ensure crop_data is an alias to crop_master
    merged.suadr.crop_data = merged.suadr.crop_master;

    // Ensure legacy aliases are populated
    if (!merged.suadr.soilProfiles) merged.suadr.soilProfiles = initialData.suadr.soilProfiles;
    if (!merged.suadr.agroClimaticZones) merged.suadr.agroClimaticZones = initialData.suadr.agroClimaticZones;
    if (!merged.suadr.liveTelemetry) merged.suadr.liveTelemetry = initialData.suadr.liveTelemetry;
    if (!merged.suadr.pestDiagnostics) merged.suadr.pestDiagnostics = initialData.suadr.pestDiagnostics;

    // Populate top-level crops array
    merged.crops = extractAllCrops(merged.farmers);

    if (!parsed.officers || !parsed.roles || !parsed.hpasnPolicies || !parsed.crops || !parsed.suadr?.soil_data) {
      saveData(merged);
    }
    return merged;
  } catch (err) {
    console.error('Error reading db file, using memory initialData:', err);
    return initialData;
  }
}

function saveData(data) {
  try {
    if (Array.isArray(data.farmers)) {
      data.crops = extractAllCrops(data.farmers);
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving db file:', err);
  }
}

let cache = loadData();

module.exports = {
  get: () => cache,
  save: () => {
    saveData(cache);
    return cache;
  },
  update: (updaterFn) => {
    cache = updaterFn(cache);
    saveData(cache);
    return cache;
  },
  reset: () => {
    cache = JSON.parse(JSON.stringify(initialData));
    saveData(cache);
    return cache;
  }
};

