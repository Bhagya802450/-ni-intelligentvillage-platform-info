/**
 * =========================================================================
 * HP-ASN (Himachal Pradesh Agriculture Service Network)
 * Integration & Secure Data Exchange Layer
 * 
 * Interoperability Architecture:
 * 
 * Government System
 *        │
 *        ▼
 *    HP-ASN API
 *        │
 *        ▼
 *  Frappe Backend
 *        │
 *        ▼
 *   PostgreSQL & Redis
 * 
 * Partner System
 *        │
 *        ▼
 *    HP-ASN API
 *        │
 *        ▼
 *  Frappe Backend
 * 
 * For every important exchange, HP-ASN maintains:
 * 1. Who requested?          (who_requested)
 * 2. What data?              (what_data)
 * 3. When?                   (when / timestamp)
 * 4. Why?                    (why / purpose)
 * 5. Was consent required?   (was_consent_required)
 * 6. Was access allowed?     (was_access_allowed)
 * =========================================================================
 */

const crypto = require('crypto');

class HPASNExchange {
  constructor(data = {}) {
    const txnId = data.transaction_id || data.transactionId || `TXN-ASN-${Math.floor(10000 + Math.random() * 90000)}`;
    const now = data.when || data.timestamp || new Date().toISOString();

    // The 6 Mandatory HP-ASN Exchange Attributes
    this.who_requested = data.who_requested || data.whoRequested || data.sourceDept || data.source_dept || 'Department of Agriculture (HP-ASN Gateway)';
    this.what_data = data.what_data || data.whatData || data.dataScope || data.data_scope || 'Farmer Cadastral Land & Soil Health Record';
    this.when = now;
    this.why = data.why || data.purpose || 'AgriStack Verification & Scheme Delivery';
    this.was_consent_required = data.was_consent_required !== undefined 
      ? Boolean(data.was_consent_required) 
      : (data.consentRequired !== undefined ? Boolean(data.consentRequired) : true);
    this.was_access_allowed = data.was_access_allowed !== undefined 
      ? Boolean(data.was_access_allowed) 
      : (data.accessAllowed !== undefined ? Boolean(data.accessAllowed) : true);

    // System Interoperability & Security Meta
    this.transaction_id = txnId;
    this.system_type = data.system_type || data.systemType || (this.who_requested.toLowerCase().includes('bank') || this.who_requested.toLowerCase().includes('partner') ? 'PARTNER' : 'GOVERNMENT');
    this.target_system = data.target_system || data.targetDept || 'Frappe Backend (PostgreSQL)';
    this.farmer_id = data.farmer_id || data.farmerId || null;
    this.consent_method = data.consent_method || (this.was_consent_required ? 'Aadhaar e-Sign / Digital Farmer Consent' : 'Exempted (Public Agro-Met Data)');
    this.status = this.was_access_allowed ? 'SUCCESS_AUTHORIZED' : 'ACCESS_DENIED_CONSENT_MISSING';
    this.response_latency_ms = data.response_latency_ms || Math.floor(65 + Math.random() * 115);

    // Cryptographic Non-Repudiation Signature (HMAC-SHA256)
    const secretSalt = process.env.HPASN_SECRET || "HPASN_SECURE_KERNEL_KEY_2026";
    this.hash_signature = data.hash_signature || ("0x" + crypto.createHmac('sha256', secretSalt)
      .update(`${this.transaction_id}:${this.who_requested}:${this.what_data}:${this.when}:${this.why}:${this.was_access_allowed}`)
      .digest('hex'));

    // Backward compatibility aliases
    this.transactionId = this.transaction_id;
    this.sourceDept = this.who_requested;
    this.targetDept = this.target_system;
    this.dataScope = this.what_data;
    this.purpose = this.why;
    this.consentGranted = this.was_access_allowed;
    this.hashSignature = this.hash_signature;
    this.timestamp = this.when;
  }

  static validate(exchangeData) {
    const errors = [];
    if (!exchangeData.who_requested && !exchangeData.sourceDept) {
      errors.push("Missing 'who_requested' attribute (Who requested the exchange?)");
    }
    if (!exchangeData.what_data && !exchangeData.dataScope) {
      errors.push("Missing 'what_data' attribute (What data was requested?)");
    }
    if (!exchangeData.why && !exchangeData.purpose) {
      errors.push("Missing 'why' attribute (Why / purpose of data exchange?)");
    }
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  toJSON() {
    return {
      // The 6 Mandatory HP-ASN Questions
      who_requested: this.who_requested,
      what_data: this.what_data,
      when: this.when,
      why: this.why,
      was_consent_required: this.was_consent_required,
      was_access_allowed: this.was_access_allowed,

      // Technical & Security Architecture
      transaction_id: this.transaction_id,
      system_type: this.system_type,
      target_system: this.target_system,
      farmer_id: this.farmer_id,
      consent_method: this.consent_method,
      status: this.status,
      response_latency_ms: this.response_latency_ms,
      hash_signature: this.hash_signature,

      // Backward-compatible fields
      transactionId: this.transactionId,
      sourceDept: this.sourceDept,
      targetDept: this.targetDept,
      purpose: this.purpose,
      dataScope: this.dataScope,
      consentGranted: this.consentGranted,
      hashSignature: this.hashSignature,
      timestamp: this.timestamp
    };
  }
}

module.exports = HPASNExchange;
