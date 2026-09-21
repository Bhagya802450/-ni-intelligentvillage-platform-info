/**
 * =========================================================================
 * Unified Farmer Database (AgriStack & HimBhoomi Aligned)
 * Data Model: Land (Cadastral Land Parcel)
 * 
 * Hierarchy:
 * Farmer
 *    │
 *    ├────────── Land (LandParcel)
 *    │
 *    └────────── Crop
 * =========================================================================
 */

class Land {
  constructor(data = {}) {
    const districtPrefix = (data.district || 'SHI').substring(0, 3).toUpperCase();
    const generatedParcelId = data.parcelId || data.parcel_id || `LAND-${districtPrefix}-${Math.floor(100 + Math.random() * 900)}`;

    this.parcelId = generatedParcelId;
    this.parcel_id = this.parcelId;
    this.farmer_id = data.farmer_id || data.farmerId || null;
    this.khasraNo = String(data.khasraNo || data.khasra_no || '101/1').trim();
    this.khasra_no = this.khasraNo;
    this.khatauniNo = String(data.khatauniNo || data.khatauni_no || '1').trim();
    this.khatauni_no = this.khatauniNo;

    const bigha = Number(data.areaBigha || data.area_bigha || 5.0);
    this.areaBigha = bigha;
    this.area_bigha = bigha;
    // HP standard conversion: 1 Bigha ≈ 0.08 Hectares
    this.areaHectares = Number(data.areaHectares || data.area_hectares || (bigha * 0.08).toFixed(2));
    this.area_hectares = this.areaHectares;

    this.irrigationType = data.irrigationType || data.irrigation_type || 'Rainfed';
    this.irrigation_type = this.irrigationType;
    this.primaryCrop = data.primaryCrop || data.primary_crop || 'Apple';
    this.primary_crop = this.primaryCrop;
    this.soilHealthId = data.soilHealthId || data.soil_health_id || `SHC-${districtPrefix}-${Math.floor(1000 + Math.random() * 9000)}`;
    this.soil_health_id = this.soilHealthId;

    this.coordinates = data.coordinates || {
      lat: Number(data.lat) || 31.1215,
      lng: Number(data.lng) || 77.5321
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
    const khasra = payload.khasraNo || payload.khasra_no;
    const khatauni = payload.khatauniNo || payload.khatauni_no;
    const area = payload.areaBigha || payload.area_bigha;

    if (!khasra || String(khasra).trim().length === 0) {
      errors.push("Field 'khasraNo' (Khasra Number) is mandatory.");
    }
    if (!khatauni || String(khatauni).trim().length === 0) {
      errors.push("Field 'khatauniNo' (Khatauni Number) is mandatory.");
    }
    if (area === undefined || area === null || Number(area) <= 0) {
      errors.push("Field 'areaBigha' must be a numeric value greater than zero.");
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  toJSON() {
    return {
      parcelId: this.parcelId,
      parcel_id: this.parcel_id,
      farmer_id: this.farmer_id,
      khasraNo: this.khasraNo,
      khasra_no: this.khasra_no,
      khatauniNo: this.khatauniNo,
      khatauni_no: this.khatauni_no,
      areaBigha: this.areaBigha,
      area_bigha: this.area_bigha,
      areaHectares: this.areaHectares,
      area_hectares: this.area_hectares,
      irrigationType: this.irrigationType,
      irrigation_type: this.irrigation_type,
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
