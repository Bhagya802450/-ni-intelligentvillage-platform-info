/**
 * =========================================================================
 * Unified Farmer Database (AgriStack Aligned)
 * Core Data Model: Farmer
 * 
 * Fields:
 * - id:                  Internal primary key / UUID / String
 * - farmer_id:           State unique alphanumeric farmer registry identifier
 * - name:                Full legal name of the farmer
 * - mobile:              Primary 10-digit mobile contact (Aadhaar linked)
 * - email:               Farmer contact email (optional/registered)
 * - address:             Full residential and cadastral address
 * - state:               State jurisdiction (Default: 'Himachal Pradesh')
 * - district:            Administrative district (e.g., 'Shimla', 'Solan')
 * - block:               Sub-district administrative block / tehsil (e.g., 'Kotkhai')
 * - village:             Revenue village / Patwar circle (e.g., 'Kiari')
 * - national_farmer_id:  Federal AgriStack ID (e.g., 'AGRI-HP-2026-9812')
 * - status:              Lifecycle state: 'ACTIVE' | 'PENDING_VERIFICATION' | 'SUSPENDED' | 'INACTIVE'
 * - created_at:          ISO-8601 creation timestamp
 * - updated_at:          ISO-8601 last modified timestamp
 * =========================================================================
 */

class Farmer {
  constructor(data = {}) {
    // Generate IDs if missing
    const generatedFarmerId = data.farmer_id || data.id || `FARMER-HP-${Math.floor(1000 + Math.random() * 9000)}`;
    const generatedNationalId = data.national_farmer_id || data.agriStackId || `AGRI-HP-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    this.id = data.id || generatedFarmerId;
    this.farmer_id = generatedFarmerId;
    this.name = (data.name || data.farmer_name || '').trim();
    this.mobile = (data.mobile || data.phone || '').trim();
    this.email = (data.email || `${this.name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@hpfarmers.in`).trim();
    this.address = data.address || `Village ${data.village || 'Rural'}, Block ${data.block || data.tehsil || 'Sadar'}, District ${data.district || 'Shimla'}, HP`;
    this.state = data.state || 'Himachal Pradesh';
    this.district = (data.district || 'Shimla').trim();
    this.block = (data.block || data.tehsil || 'Sadar').trim();
    this.village = (data.village || 'Rural').trim();
    this.national_farmer_id = generatedNationalId;
    this.status = (data.status || 'ACTIVE').toUpperCase();
    this.created_at = data.created_at || data.createdAt || new Date().toISOString();
    this.updated_at = data.updated_at || data.updatedAt || new Date().toISOString();

    // Secondary / Legacy attributes for full compatibility
    this.phone = this.mobile;
    this.tehsil = this.block;
    this.agriStackId = this.national_farmer_id;
    this.aadhaarHash = data.aadhaarHash || (data.aadhaarNumber ? `XXXX-XXXX-${data.aadhaarNumber.slice(-4)}` : "XXXX-XXXX-8823");
    this.category = data.category || "Small & Marginal";
    this.naturalFarmingPractitioner = data.naturalFarmingPractitioner !== undefined ? !!data.naturalFarmingPractitioner : false;
    this.bankDetails = data.bankDetails || {
      accountNo: "XXXXXXXX" + Math.floor(1000 + Math.random() * 9000),
      ifsc: "HPSC0000101",
      bankName: "HP State Cooperative Bank",
      dbtLinked: true
    };
    this.landParcels = data.landParcels || [];
  }

  /**
   * Validate mandatory farmer attributes
   */
  static validate(payload = {}) {
    const errors = [];
    const name = payload.name || payload.farmer_name;
    const mobile = payload.mobile || payload.phone;
    const district = payload.district;

    if (!name || String(name).trim().length < 2) {
      errors.push("Field 'name' is mandatory and must be at least 2 characters.");
    }

    if (!mobile || String(mobile).replace(/[\s\+\-]/g, '').length < 10) {
      errors.push("Field 'mobile' is mandatory and must contain a valid 10-digit number.");
    }

    if (!district || String(district).trim().length === 0) {
      errors.push("Field 'district' is mandatory.");
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Produce standardized JSON model
   */
  toJSON() {
    return {
      id: this.id,
      farmer_id: this.farmer_id,
      name: this.name,
      mobile: this.mobile,
      email: this.email,
      address: this.address,
      state: this.state,
      district: this.district,
      block: this.block,
      village: this.village,
      national_farmer_id: this.national_farmer_id,
      status: this.status,
      created_at: this.created_at,
      updated_at: this.updated_at,
      // Supporting details
      phone: this.phone,
      tehsil: this.tehsil,
      agriStackId: this.agriStackId,
      aadhaarHash: this.aadhaarHash,
      category: this.category,
      naturalFarmingPractitioner: this.naturalFarmingPractitioner,
      bankDetails: this.bankDetails,
      landParcels: this.landParcels
    };
  }
}

module.exports = Farmer;
