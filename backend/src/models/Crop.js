/**
 * =========================================================================
 * Unified Farmer Database (AgriStack & SUADR Aligned)
 * Data Model: Crop
 * 
 * Hierarchy:
 * Farmer
 *    │
 *    ├────────── Land (LandParcel)
 *    │
 *    └────────── Crop
 * =========================================================================
 */

class Crop {
  constructor(data = {}) {
    const districtPrefix = (data.district || 'HP').substring(0, 3).toUpperCase();
    const generatedCropId = data.crop_id || data.cropId || `CROP-${districtPrefix}-${Math.floor(100 + Math.random() * 900)}`;

    this.crop_id = generatedCropId;
    this.cropId = this.crop_id;
    this.farmer_id = data.farmer_id || data.farmerId || null;
    this.farmerId = this.farmer_id;
    this.parcel_id = data.parcel_id || data.parcelId || null;
    this.parcelId = this.parcel_id;

    this.crop_name = (data.crop_name || data.cropName || data.name || 'Apple').trim();
    this.cropName = this.crop_name;
    this.variety = (data.variety || data.cultivar || 'Royal Delicious').trim();
    this.season = data.season || 'Perennial'; // Kharif, Rabi, Zaid, Perennial

    this.sowing_date = data.sowing_date || data.sowingDate || null;
    this.harvest_date = data.harvest_date || data.harvestDate || null;

    this.area_bigha = Number(data.area_bigha || data.areaBigha || 5.0);
    this.areaBigha = this.area_bigha;

    this.crop_stage = data.crop_stage || data.cropStage || 'Vegetative';
    this.cropStage = this.crop_stage;

    this.health_status = data.health_status || data.healthStatus || 'Optimal';
    this.healthStatus = this.health_status;

    this.estimated_yield_quintals = data.estimated_yield_quintals !== undefined
      ? Number(data.estimated_yield_quintals)
      : (data.estimatedYieldQuintals !== undefined ? Number(data.estimatedYieldQuintals) : null);
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
   * Validate mandatory crop attributes
   */
  static validate(payload = {}) {
    const errors = [];
    const name = payload.crop_name || payload.cropName || payload.name;
    const season = payload.season;
    const area = payload.area_bigha || payload.areaBigha;
    const parcelId = payload.parcel_id || payload.parcelId;

    if (!name || String(name).trim().length === 0) {
      errors.push("Field 'crop_name' is mandatory.");
    }
    if (!parcelId || String(parcelId).trim().length === 0) {
      errors.push("Field 'parcel_id' is mandatory to link Crop to its parent Land parcel.");
    }
    if (!season) {
      errors.push("Field 'season' is mandatory (Kharif, Rabi, Zaid, or Perennial).");
    }
    if (area === undefined || area === null || Number(area) <= 0) {
      errors.push("Field 'area_bigha' must be a numeric value greater than zero.");
    }
    if (payload.ndvi_score !== undefined && (Number(payload.ndvi_score) < -1 || Number(payload.ndvi_score) > 1)) {
      errors.push("Field 'ndvi_score' must be between -1.0 and 1.0.");
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  toJSON() {
    return {
      crop_id: this.crop_id,
      cropId: this.cropId,
      farmer_id: this.farmer_id,
      farmerId: this.farmerId,
      parcel_id: this.parcel_id,
      parcelId: this.parcelId,
      crop_name: this.crop_name,
      cropName: this.cropName,
      variety: this.variety,
      season: this.season,
      sowing_date: this.sowing_date,
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
