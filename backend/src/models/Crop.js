/**
 * =========================================================================
 * Unified Farmer Database (AgriStack & SUADR Aligned)
 * Data Model: Crop
 * 
 * Exact Schema:
 * Crop
 * ----------------
 * id
 * land_id
 * crop_name
 * crop_type
 * sowing_date
 * season
 * area
 * status
 * 
 * Complete Hierarchy:
 * Farmer
 *    ↓
 * Land
 *    ↓
 * Crop
 * =========================================================================
 */

class Crop {
  constructor(data = {}) {
    const districtPrefix = (data.district || 'HP').substring(0, 3).toUpperCase();
    const generatedId = data.id || data.crop_id || data.cropId || `CROP-${districtPrefix}-${Math.floor(100 + Math.random() * 900)}`;

    // Core 8 Attributes
    this.id = generatedId;
    this.land_id = data.land_id || data.parcel_id || data.parcelId || null;
    this.crop_name = (data.crop_name || data.cropName || data.name || 'Apple').trim();
    this.crop_type = data.crop_type || data.cropType || this._inferCropType(this.crop_name);
    this.sowing_date = data.sowing_date || data.sowingDate || new Date().toISOString().split('T')[0];
    this.season = data.season || 'Perennial'; // Kharif, Rabi, Zaid, Perennial
    this.area = Number(data.area !== undefined ? data.area : (data.area_bigha !== undefined ? data.area_bigha : (data.areaBigha !== undefined ? data.areaBigha : 5.0)));
    this.status = data.status || data.crop_stage || data.cropStage || 'Vegetative';

    // Supporting & Backward-compatible aliases
    this.crop_id = this.id;
    this.cropId = this.id;
    this.parcel_id = this.land_id;
    this.parcelId = this.land_id;
    this.farmer_id = data.farmer_id || data.farmerId || null;
    this.farmerId = this.farmer_id;
    this.cropName = this.crop_name;
    this.cropType = this.crop_type;
    this.sowingDate = this.sowing_date;
    this.area_bigha = this.area;
    this.areaBigha = this.area;
    this.crop_stage = this.status;
    this.cropStage = this.status;
    this.variety = (data.variety || data.cultivar || 'Royal Delicious').trim();
    this.harvest_date = data.harvest_date || data.harvestDate || null;
    this.health_status = data.health_status || data.healthStatus || 'Optimal';
    this.healthStatus = this.health_status;
    this.estimated_yield_quintals = data.estimated_yield_quintals !== undefined
      ? Number(data.estimated_yield_quintals)
      : (data.estimatedYieldQuintals !== undefined ? Number(data.estimatedYieldQuintals) : Number((this.area * 6.5).toFixed(1)));
    this.estimatedYieldQuintals = this.estimated_yield_quintals;
    this.actual_yield_quintals = data.actual_yield_quintals !== undefined
      ? Number(data.actual_yield_quintals)
      : (data.actualYieldQuintals !== undefined ? Number(data.actualYieldQuintals) : null);
    this.actualYieldQuintals = this.actual_yield_quintals;
    this.ndvi_score = data.ndvi_score !== undefined
      ? Number(data.ndvi_score)
      : (data.ndviScore !== undefined ? Number(data.ndviScore) : 0.78);
    this.ndviScore = this.ndvi_score;

    this.created_at = data.created_at || data.createdAt || new Date().toISOString();
    this.updated_at = data.updated_at || data.updatedAt || new Date().toISOString();
  }

  /**
   * Automatically infer standard agro crop type from name
   */
  _inferCropType(name = '') {
    const n = name.toLowerCase();
    if (n.includes('apple') || n.includes('pear') || n.includes('kiwi') || n.includes('plum') || n.includes('peach') || n.includes('cherry')) {
      return 'Horticulture / Fruit';
    }
    if (n.includes('wheat') || n.includes('maize') || n.includes('rice') || n.includes('barley') || n.includes('millet')) {
      return 'Cereal Grain';
    }
    if (n.includes('tomato') || n.includes('peas') || n.includes('beans') || n.includes('capsicum') || n.includes('cauliflower') || n.includes('potato')) {
      return 'Vegetable';
    }
    if (n.includes('tea')) {
      return 'Plantation / Cash Crop';
    }
    if (n.includes('gram') || n.includes('lentil') || n.includes('urad') || n.includes('moong')) {
      return 'Pulse';
    }
    return 'Field Crop';
  }

  /**
   * Validate mandatory crop attributes
   */
  static validate(payload = {}) {
    const errors = [];
    const name = payload.crop_name || payload.cropName || payload.name;
    const landId = payload.land_id || payload.parcel_id || payload.parcelId;
    const season = payload.season;
    const area = payload.area !== undefined ? payload.area : (payload.area_bigha !== undefined ? payload.area_bigha : payload.areaBigha);

    if (!name || String(name).trim().length === 0) {
      errors.push("Field 'crop_name' is mandatory.");
    }
    if (!landId || String(landId).trim().length === 0) {
      errors.push("Field 'land_id' is mandatory to link Crop to its parent Land parcel.");
    }
    if (!season) {
      errors.push("Field 'season' is mandatory (Kharif, Rabi, Zaid, or Perennial).");
    }
    if (area === undefined || area === null || Number(area) <= 0) {
      errors.push("Field 'area' must be a numeric value greater than zero.");
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  toJSON() {
    return {
      // Core 8 attributes
      id: this.id,
      land_id: this.land_id,
      crop_name: this.crop_name,
      crop_type: this.crop_type,
      sowing_date: this.sowing_date,
      season: this.season,
      area: this.area,
      status: this.status,

      // Backward-compatible properties & extensions
      crop_id: this.crop_id,
      cropId: this.cropId,
      parcel_id: this.parcel_id,
      parcelId: this.parcelId,
      farmer_id: this.farmer_id,
      farmerId: this.farmerId,
      cropName: this.cropName,
      cropType: this.cropType,
      sowingDate: this.sowingDate,
      variety: this.variety,
      harvest_date: this.harvest_date,
      area_bigha: this.area_bigha,
      areaBigha: this.areaBigha,
      crop_stage: this.crop_stage,
      cropStage: this.cropStage,
      health_status: this.health_status,
      healthStatus: this.healthStatus,
      estimated_yield_quintals: this.estimated_yield_quintals,
      estimatedYieldQuintals: this.estimatedYieldQuintals,
      actual_yield_quintals: this.actual_yield_quintals,
      actualYieldQuintals: this.actualYieldQuintals,
      ndvi_score: this.ndvi_score,
      ndviScore: this.ndviScore,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = Crop;
