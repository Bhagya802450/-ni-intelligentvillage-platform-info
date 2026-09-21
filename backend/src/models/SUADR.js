/**
 * =========================================================================
 * State Unified Digital Database (SUADR)
 * Common State-Level Agricultural Data Store
 * 
 * Logical Hierarchy:
 * SUADR
 *  │
 *  ├── Soil Data
 *  ├── Climate Data
 *  ├── Crop Data
 *  ├── Agronomy Data
 *  ├── Pest Data
 *  └── Market Data
 * =========================================================================
 */

/**
 * 1. Soil Data Model
 * Schema:
 * soil_data
 * -----------
 * id
 * location
 * soil_type
 * ph
 * nitrogen
 * phosphorus
 * potassium
 */
class SoilData {
  constructor(data = {}) {
    const locPrefix = (data.location || data.district || 'HP').substring(0, 3).toUpperCase();
    this.id = data.id || data.shcId || `SOIL-${locPrefix}-${Math.floor(100 + Math.random() * 900)}`;
    this.location = data.location || data.district || 'Shimla';
    this.soil_type = data.soil_type || data.soilType || 'Clay Loam';
    this.ph = Number(data.ph !== undefined ? data.ph : 6.5);
    this.nitrogen = Number(data.nitrogen !== undefined ? data.nitrogen : (data.nitrogenKgHa !== undefined ? data.nitrogenKgHa : 260));
    this.phosphorus = Number(data.phosphorus !== undefined ? data.phosphorus : (data.phosphorusKgHa !== undefined ? data.phosphorusKgHa : 22));
    this.potassium = Number(data.potassium !== undefined ? data.potassium : (data.potassiumKgHa !== undefined ? data.potassiumKgHa : 280));

    // Supporting metadata & backward-compatible aliases
    this.district = this.location;
    this.shcId = this.id;
    this.organic_carbon = Number(data.organic_carbon !== undefined ? data.organic_carbon : (data.organicCarbonPercent !== undefined ? data.organicCarbonPercent : 1.25));
    this.zinc_ppm = Number(data.zinc_ppm !== undefined ? data.zinc_ppm : (data.zincPpm !== undefined ? data.zincPpm : 0.85));
    this.boron_ppm = Number(data.boron_ppm !== undefined ? data.boron_ppm : (data.boronPpm !== undefined ? data.boronPpm : 0.60));
    this.recommendation = data.recommendation || "Balanced NPK application with organic compost / Jeevamrit.";
    this.last_tested = data.last_tested || data.lastTested || new Date().toISOString().split('T')[0];
  }

  toJSON() {
    return {
      id: this.id,
      location: this.location,
      soil_type: this.soil_type,
      ph: this.ph,
      nitrogen: this.nitrogen,
      phosphorus: this.phosphorus,
      potassium: this.potassium,
      // Metadata
      organic_carbon: this.organic_carbon,
      zinc_ppm: this.zinc_ppm,
      boron_ppm: this.boron_ppm,
      recommendation: this.recommendation,
      last_tested: this.last_tested,
      // Backward compatibility aliases
      shcId: this.id,
      district: this.district,
      nitrogenKgHa: this.nitrogen,
      phosphorusKgHa: this.phosphorus,
      potassiumKgHa: this.potassium
    };
  }
}

/**
 * 2. Climate Data Model
 * Schema:
 * climate_data
 * ------------
 * id
 * location
 * temperature
 * humidity
 * rainfall
 * date
 */
class ClimateData {
  constructor(data = {}) {
    const locPrefix = (data.location || data.station || data.district || 'HP').substring(0, 3).toUpperCase();
    this.id = data.id || `CLM-${locPrefix}-${Math.floor(100 + Math.random() * 900)}`;
    this.location = data.location || data.station || data.district || 'Shimla';
    this.temperature = Number(data.temperature !== undefined ? data.temperature : (data.tempCelsius !== undefined ? data.tempCelsius : 21.5));
    this.humidity = Number(data.humidity !== undefined ? data.humidity : (data.humidityPercent !== undefined ? data.humidityPercent : 58));
    this.rainfall = Number(data.rainfall !== undefined ? data.rainfall : (data.rainfallTodayMm !== undefined ? data.rainfallTodayMm : 0.0));
    this.date = data.date || data.updatedAt || new Date().toISOString().split('T')[0];

    // Supporting metadata
    this.wind_speed = Number(data.wind_speed !== undefined ? data.wind_speed : (data.windSpeedKmh !== undefined ? data.windSpeedKmh : 8.0));
    this.frost_risk = data.frost_risk || data.frostRisk || 'Low';
    this.condition = data.condition || 'Partly Cloudy';
  }

  toJSON() {
    return {
      id: this.id,
      location: this.location,
      temperature: this.temperature,
      humidity: this.humidity,
      rainfall: this.rainfall,
      date: this.date,
      // Metadata & aliases
      wind_speed: this.wind_speed,
      frost_risk: this.frost_risk,
      condition: this.condition,
      tempCelsius: this.temperature,
      humidityPercent: this.humidity,
      rainfallTodayMm: this.rainfall
    };
  }
}

/**
 * 3. Crop Master Data Model
 * Schema:
 * crop_master
 * -----------
 * id
 * crop_name
 * crop_type
 * season
 */
class CropMaster {
  constructor(data = {}) {
    const namePrefix = (data.crop_name || data.cropName || 'CRP').substring(0, 3).toUpperCase();
    this.id = data.id || `CRPM-${namePrefix}-${Math.floor(100 + Math.random() * 900)}`;
    this.crop_name = data.crop_name || data.cropName || data.name || 'Apple';
    this.crop_type = data.crop_type || data.cropType || 'Horticulture / Fruit';
    this.season = data.season || 'Perennial';

    // Supporting metadata
    this.duration_days = Number(data.duration_days || 180);
    this.water_requirement = data.water_requirement || 'Medium to High';
    this.suitable_zones = data.suitable_zones || ['ZONE-III', 'ZONE-IV'];
    this.standard_yield_quintal_per_acre = Number(data.standard_yield_quintal_per_acre || 110);
  }

  toJSON() {
    return {
      id: this.id,
      crop_name: this.crop_name,
      crop_type: this.crop_type,
      season: this.season,
      duration_days: this.duration_days,
      water_requirement: this.water_requirement,
      suitable_zones: this.suitable_zones,
      standard_yield_quintal_per_acre: this.standard_yield_quintal_per_acre
    };
  }
}

/**
 * 4. Agronomy Data Model
 * Schema:
 * agronomy_data
 * -------------
 * id
 * crop
 * soil_type
 * sowing_window
 * seed_rate
 * irrigation_practices
 * fertilizer_recommendation
 */
class AgronomyData {
  constructor(data = {}) {
    const cropPrefix = (data.crop || 'AGR').substring(0, 3).toUpperCase();
    this.id = data.id || `AGRO-${cropPrefix}-${Math.floor(100 + Math.random() * 900)}`;
    this.crop = data.crop || 'Apple';
    this.soil_type = data.soil_type || data.soilType || 'Clay Loam with good drainage';
    this.sowing_window = data.sowing_window || data.sowingWindow || 'Dec - Feb (Dormancy Planting)';
    this.seed_rate = data.seed_rate || data.seedRate || '250 - 300 rootstocks / acre';
    this.irrigation_practices = data.irrigation_practices || data.irrigationPractices || 'Drip irrigation @ 15-20L/tree/week during fruit set';
    this.fertilizer_recommendation = data.fertilizer_recommendation || data.fertilizerRecommendation || 'FYM 40kg + 700g N, 350g P, 700g K per mature tree';
    this.intercropping = data.intercropping || 'French beans, peas or white clover';
  }

  toJSON() {
    return {
      id: this.id,
      crop: this.crop,
      soil_type: this.soil_type,
      sowing_window: this.sowing_window,
      seed_rate: this.seed_rate,
      irrigation_practices: this.irrigation_practices,
      fertilizer_recommendation: this.fertilizer_recommendation,
      intercropping: this.intercropping
    };
  }
}

/**
 * 5. Pest Data Model
 * Schema:
 * pest_data
 * ---------
 * id
 * pest_name
 * crop
 * symptoms
 */
class PestData {
  constructor(data = {}) {
    const pestPrefix = (data.crop || 'PST').substring(0, 3).toUpperCase();
    this.id = data.id || data.pestId || `PEST-${pestPrefix}-${Math.floor(100 + Math.random() * 900)}`;
    this.pest_name = data.pest_name || data.pestName || 'Apple Scab (Venturia inaequalis)';
    this.crop = data.crop || 'Apple';
    this.symptoms = data.symptoms || 'Olive-green to dark velvety spots on leaf surface and developing fruits.';

    // Supporting metadata
    this.control_measures = data.control_measures || data.naturalRemedy || 'Spray Neemastra / fermented buttermilk (5%) or contact bio-fungicide.';
    this.severity = data.severity || data.riskLevel || 'High';
  }

  toJSON() {
    return {
      id: this.id,
      pest_name: this.pest_name,
      crop: this.crop,
      symptoms: this.symptoms,
      control_measures: this.control_measures,
      severity: this.severity,
      // Backward compatibility aliases
      pestId: this.id,
      pestName: this.pest_name,
      naturalRemedy: this.control_measures
    };
  }
}

/**
 * 6. Market Data Model
 * Schema:
 * market_data
 * -----------
 * id
 * market_name
 * crop
 * modal_price
 * min_price
 * max_price
 * date
 */
class MarketData {
  constructor(data = {}) {
    const mktPrefix = (data.market_name || data.mandi || 'MKT').substring(0, 3).toUpperCase();
    this.id = data.id || `MKT-${mktPrefix}-${Math.floor(100 + Math.random() * 900)}`;
    this.market_name = data.market_name || data.mandi || data.market || 'Dhalli APMC Mandi, Shimla';
    this.crop = data.crop || data.commodity || 'Apple (Royal Delicious)';
    this.modal_price = Number(data.modal_price !== undefined ? data.modal_price : (data.modal_price_per_qtl !== undefined ? data.modal_price_per_qtl : 9400));
    this.min_price = Number(data.min_price !== undefined ? data.min_price : (data.min_price_per_qtl !== undefined ? data.min_price_per_qtl : 7800));
    this.max_price = Number(data.max_price !== undefined ? data.max_price : (data.max_price_per_qtl !== undefined ? data.max_price_per_qtl : 11500));
    this.date = data.date || data.arrival_date || new Date().toISOString().split('T')[0];

    // Supporting metadata
    this.arrival_quintals = Number(data.arrival_quintals || 450);
    this.trend = data.trend || 'Upward';
  }

  toJSON() {
    return {
      id: this.id,
      market_name: this.market_name,
      crop: this.crop,
      modal_price: this.modal_price,
      min_price: this.min_price,
      max_price: this.max_price,
      date: this.date,
      arrival_quintals: this.arrival_quintals,
      trend: this.trend
    };
  }
}

/**
 * SUADR Root Model
 * Encapsulates the complete State Unified Digital Database
 */
class SUADR {
  constructor(data = {}) {
    this.soil_data = (data.soil_data || data.soilProfiles || []).map(s => new SoilData(s).toJSON());
    this.climate_data = (data.climate_data || []).map(c => new ClimateData(c).toJSON());
    this.crop_data = (data.crop_data || data.crop_master || []).map(c => new CropMaster(c).toJSON());
    this.agronomy_data = (data.agronomy_data || []).map(a => new AgronomyData(a).toJSON());
    this.pest_data = (data.pest_data || data.pestDiagnostics || []).map(p => new PestData(p).toJSON());
    this.market_data = (data.market_data || []).map(m => new MarketData(m).toJSON());
  }

  getHierarchy() {
    return {
      entity: "SUADR",
      name: "State Unified Digital Database",
      description: "State-wide common agricultural repository for Himachal Pradesh",
      tree_structure: [
        "SUADR",
        " │",
        " ├── Soil Data",
        " ├── Climate Data",
        " ├── Crop Data",
        " ├── Agronomy Data",
        " ├── Pest Data",
        " └── Market Data"
      ].join("\n"),
      branches: {
        soil_data: {
          name: "Soil Data",
          description: "Location-wise soil chemical and physical test parameters",
          schema: ["id", "location", "soil_type", "ph", "nitrogen", "phosphorus", "potassium"],
          records_count: this.soil_data.length,
          sample: this.soil_data[0] || null
        },
        climate_data: {
          name: "Climate Data",
          description: "Real-time agro-meteorological station telemetry and records",
          schema: ["id", "location", "temperature", "humidity", "rainfall", "date"],
          records_count: this.climate_data.length,
          sample: this.climate_data[0] || null
        },
        crop_data: {
          name: "Crop Data (crop_master)",
          description: "Statewide standardized agro crop catalog and classifications",
          schema: ["id", "crop_name", "crop_type", "season"],
          records_count: this.crop_data.length,
          sample: this.crop_data[0] || null
        },
        agronomy_data: {
          name: "Agronomy Data",
          description: "Crop-specific cultivation protocols, sowing windows, and nutrient advice",
          schema: ["id", "crop", "soil_type", "sowing_window", "seed_rate", "irrigation_practices", "fertilizer_recommendation"],
          records_count: this.agronomy_data.length,
          sample: this.agronomy_data[0] || null
        },
        pest_data: {
          name: "Pest Data",
          description: "Statewide plant protection, disease symptoms and control database",
          schema: ["id", "pest_name", "crop", "symptoms"],
          records_count: this.pest_data.length,
          sample: this.pest_data[0] || null
        },
        market_data: {
          name: "Market Data",
          description: "APMC Mandi wholesale price discovery and arrival volumes",
          schema: ["id", "market_name", "crop", "modal_price", "min_price", "max_price", "date"],
          records_count: this.market_data.length,
          sample: this.market_data[0] || null
        }
      }
    };
  }

  toJSON() {
    return {
      soil_data: this.soil_data,
      climate_data: this.climate_data,
      crop_data: this.crop_data,
      agronomy_data: this.agronomy_data,
      pest_data: this.pest_data,
      market_data: this.market_data
    };
  }
}

module.exports = {
  SUADR,
  SoilData,
  ClimateData,
  CropMaster,
  AgronomyData,
  PestData,
  MarketData
};
