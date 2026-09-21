/**
 * =========================================================================
 * Unified Farmer Database (AgriStack & HimBhoomi Aligned)
 * Data Model: Land (Cadastral Land Parcel)
 * 
 * Exact Schema:
 * Land
 * ----------------
 * id
 * farmer_id
 * survey_number
 * area
 * latitude
 * longitude
 * soil_type
 * irrigation_type
 * =========================================================================
 */

class Land {
  constructor(data = {}) {
    const districtPrefix = (data.district || 'SHI').substring(0, 3).toUpperCase();
    const generatedId = data.id || data.parcelId || data.parcel_id || `LAND-${districtPrefix}-${Math.floor(100 + Math.random() * 900)}`;

    // Core 8 Attributes
    this.id = generatedId;
    this.farmer_id = data.farmer_id || data.farmerId || null;
    this.survey_number = String(data.survey_number || data.khasraNo || data.khasra_no || '101/1').trim();
    this.area = Number(data.area !== undefined ? data.area : (data.areaBigha !== undefined ? data.areaBigha : (data.area_bigha !== undefined ? data.area_bigha : 5.0)));
    
    // Geographic centroid coordinates
    this.latitude = Number(data.latitude !== undefined ? data.latitude : (data.lat !== undefined ? data.lat : (data.coordinates?.lat || 31.1215)));
    this.longitude = Number(data.longitude !== undefined ? data.longitude : (data.lng !== undefined ? data.lng : (data.coordinates?.lng || 77.5321)));

    // Soil & Irrigation taxonomy
    this.soil_type = data.soil_type || data.soilType || 'Clay Loam';
    this.irrigation_type = data.irrigation_type || data.irrigationType || 'Rainfed';

    // Supporting & Backward-compatible aliases
    this.parcelId = this.id;
    this.parcel_id = this.id;
    this.farmerId = this.farmer_id;
    this.khasraNo = this.survey_number;
    this.khasra_no = this.survey_number;
    this.khatauniNo = String(data.khatauniNo || data.khatauni_no || '1').trim();
    this.khatauni_no = this.khatauniNo;
    this.areaBigha = this.area;
    this.area_bigha = this.area;
    // HP standard conversion: 1 Bigha ≈ 0.08 Hectares
    this.areaHectares = Number(data.areaHectares || data.area_hectares || (this.area * 0.08).toFixed(2));
    this.area_hectares = this.areaHectares;
    this.irrigationType = this.irrigation_type;
    this.primaryCrop = data.primaryCrop || data.primary_crop || 'Apple';
    this.primary_crop = this.primaryCrop;
    this.soilHealthId = data.soilHealthId || data.soil_health_id || `SHC-${districtPrefix}-${Math.floor(1000 + Math.random() * 9000)}`;
    this.soil_health_id = this.soilHealthId;
    this.coordinates = {
      lat: this.latitude,
      lng: this.longitude
    };

    this.verificationStatus = data.verificationStatus || data.verification_status || 'PENDING_PATWARI_VERIFICATION';
    this.verifiedBy = data.verifiedBy || data.verified_by || null;
    this.verifiedAt = data.verifiedAt || data.verified_at || null;
    this.officerRemarks = data.officerRemarks || data.officer_remarks || null;

    // Associated crops grown on this parcel
    this.crops = Array.isArray(data.crops) ? data.crops : [];
    this.created_at = data.created_at || data.createdAt || new Date().toISOString();
  }

  /**
   * Validate mandatory land parcel attributes
   */
  static validate(payload = {}) {
    const errors = [];
    const survey = payload.survey_number || payload.khasraNo || payload.khasra_no;
    const area = payload.area !== undefined ? payload.area : (payload.areaBigha !== undefined ? payload.areaBigha : payload.area_bigha);

    if (!survey || String(survey).trim().length === 0) {
      errors.push("Field 'survey_number' (or khasraNo) is mandatory.");
    }
    if (area === undefined || area === null || Number(area) <= 0) {
      errors.push("Field 'area' must be a numeric value greater than zero.");
    }
    if (payload.latitude !== undefined && (Number(payload.latitude) < -90 || Number(payload.latitude) > 90)) {
      errors.push("Field 'latitude' must be between -90 and 90 degrees.");
    }
    if (payload.longitude !== undefined && (Number(payload.longitude) < -180 || Number(payload.longitude) > 180)) {
      errors.push("Field 'longitude' must be between -180 and 180 degrees.");
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
      farmer_id: this.farmer_id,
      survey_number: this.survey_number,
      area: this.area,
      latitude: this.latitude,
      longitude: this.longitude,
      soil_type: this.soil_type,
      irrigation_type: this.irrigation_type,
      // Backward-compatible properties
      parcelId: this.parcelId,
      parcel_id: this.parcel_id,
      farmerId: this.farmerId,
      khasraNo: this.khasraNo,
      khasra_no: this.khasra_no,
      khatauniNo: this.khatauniNo,
      khatauni_no: this.khatauni_no,
      areaBigha: this.areaBigha,
      area_bigha: this.area_bigha,
      areaHectares: this.areaHectares,
      area_hectares: this.area_hectares,
      irrigationType: this.irrigationType,
      primaryCrop: this.primaryCrop,
      primary_crop: this.primary_crop,
      soilHealthId: this.soilHealthId,
      soil_health_id: this.soil_health_id,
      coordinates: this.coordinates,
      verificationStatus: this.verificationStatus,
      verifiedBy: this.verifiedBy,
      verifiedAt: this.verifiedAt,
      officerRemarks: this.officerRemarks,
      crops: this.crops,
      created_at: this.created_at
    };
  }
}

module.exports = Land;
