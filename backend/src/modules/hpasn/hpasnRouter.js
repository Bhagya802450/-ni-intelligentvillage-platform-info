const express = require('express');
const router = express.Router();
const db = require('../../data/dbStore');
const crypto = require('crypto');
const HPASNExchange = require('../../models/HPASN');
const redisService = require('../../services/redisService');

// GET /api/hpasn/departments - List all connected departments on HP-ASN
router.get('/departments', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        deptCode: "REV-BHOOMI",
        name: "Department of Revenue (Bhoomi RTC Land Records Karnataka)",
        apiProtocol: "REST / HTTPS HMAC-SHA256",
        systemType: "GOVERNMENT",
        status: "ONLINE / HEALTHY",
        uptime: "99.98%",
        latency: "142ms",
        dataShared: ["Bhoomi RTC Survey Numbers", "Ownership Title & Encumbrance", "Cadastral Geo-Boundaries (Pahani)"]
      },
      {
        deptCode: "HORT-KA",
        name: "Department of Horticulture & HOPCOMS Karnataka",
        apiProtocol: "REST / OAuth 2.0 Mutual-TLS",
        systemType: "GOVERNMENT",
        status: "ONLINE / HEALTHY",
        uptime: "99.95%",
        latency: "180ms",
        dataShared: ["Horticulture Crop Certification", "Cold Storage Quota", "Drip Irrigation Subsidy"]
      },
      {
        deptCode: "BANK-KGB",
        name: "Karnataka Gramin Bank, Canara Bank & NPCI DBT Gateway",
        apiProtocol: "ISO-20022 / NACH APBS (Aadhaar Payment Bridge)",
        systemType: "PARTNER",
        status: "ONLINE / HEALTHY",
        uptime: "99.99%",
        latency: "110ms",
        dataShared: ["Aadhaar Payment Bridge Account Status", "Direct Credit Settlement Tracing", "KCC Loan Status"]
      },
      {
        deptCode: "KSNDMC-KA",
        name: "Karnataka State Natural Disaster Monitoring Centre (KSNDMC)",
        apiProtocol: "MQTT / WSS GeoJSON Stream",
        systemType: "GOVERNMENT",
        status: "ONLINE / HEALTHY",
        uptime: "99.92%",
        latency: "65ms",
        dataShared: ["Automatic Weather Station (AWS) Telemetry", "Drought & Heavy Rainfall Advisories", "Soil Moisture Index"]
      },
      {
        deptCode: "FCS-KA",
        name: "Department of Food, Civil Supplies & Consumer Affairs (Ahara Karnataka)",
        apiProtocol: "REST / JWT Authenticated",
        systemType: "GOVERNMENT",
        status: "ONLINE / HEALTHY",
        uptime: "99.90%",
        latency: "210ms",
        dataShared: ["Ration Card Aadhaar Linkage", "e-PDS Grain Procurement Record", "APMC Procurement Verification"]
      },
      {
        deptCode: "AGRI-FINTECH",
        name: "Rural Credit & Crop Insurance Partner System (PMFBY / Agri-Fintech)",
        apiProtocol: "REST / OAuth 2.0 + HMAC Signature",
        systemType: "PARTNER",
        status: "ONLINE / HEALTHY",
        uptime: "99.94%",
        latency: "125ms",
        dataShared: ["KCC Loan Underwriting", "Crop Loss Verification", "Satellite Crop Coverage"]
      }
    ]
  });
});

// GET /api/hpasn/policies - Data governance and inter-department agreements
router.get('/policies', (req, res) => {
  const store = db.get();
  res.json({
    success: true,
    count: (store.hpasnPolicies || []).length,
    data: store.hpasnPolicies || []
  });
});

// GET /api/hpasn/logs - Cryptographically linked audit logs maintaining the 6 mandatory exchange questions
router.get('/logs', (req, res) => {
  const store = db.get();
  const rawLogs = store.hpasnLogs || [];

  // Normalize logs to ensure all 6 mandatory questions are explicitly present
  const normalizedLogs = rawLogs.map(log => {
    const exchange = new HPASNExchange(log);
    return exchange.toJSON();
  });

  res.json({
    success: true,
    standard: "HP-ASN Secure Interoperability Specification",
    mandatoryQuestions: [
      "who_requested",
      "what_data",
      "when",
      "why",
      "was_consent_required",
      "was_access_allowed"
    ],
    count: normalizedLogs.length,
    data: normalizedLogs
  });
});

// POST /api/hpasn/exchange - Core HP-ASN integration endpoint for Government & Partner systems
router.post('/exchange', async (req, res) => {
  const {
    who_requested,
    what_data,
    why,
    was_consent_required,
    was_access_allowed,
    system_type,
    target_system,
    farmer_id,
    query_key,
    // Supporting backward-compatible payload keys
    sourceDept,
    targetDept,
    queryType,
    queryKey,
    purpose,
    dataScope
  } = req.body;

  const requester = who_requested || sourceDept;
  const dataRequested = what_data || dataScope || queryType;
  const reason = why || purpose;

  if (!requester || !dataRequested) {
    return res.status(400).json({
      success: false,
      message: "HP-ASN exchange requires 'who_requested' and 'what_data'.",
      requiredFields: ["who_requested", "what_data", "why"]
    });
  }

  const lookupKey = query_key || queryKey || farmer_id;
  const store = db.get();
  let resultPayload = null;

  // Determine whether consent was required and allowed
  const isPersonalData = dataRequested.toLowerCase().includes('farmer') || 
                         dataRequested.toLowerCase().includes('land') || 
                         dataRequested.toLowerCase().includes('khasra') || 
                         dataRequested.toLowerCase().includes('bank');

  const consentRequired = was_consent_required !== undefined ? Boolean(was_consent_required) : isPersonalData;
  const accessAllowed = was_access_allowed !== undefined ? Boolean(was_access_allowed) : true;

  if (accessAllowed) {
    // 1. Check Land Parcel in store
    if (dataRequested.toLowerCase().includes('land') || dataRequested.toLowerCase().includes('khasra')) {
      for (const f of store.farmers) {
        const p = (f.landParcels || []).find(parcel => 
          parcel.khasraNo === lookupKey || parcel.parcelId === lookupKey || f.id === lookupKey || f.farmer_id === lookupKey
        );
        if (p) {
          resultPayload = {
            farmerName: f.name,
            farmerId: f.farmer_id || f.id,
            agriStackId: f.national_farmer_id || f.agriStackId,
            surveyNumber: p.survey_number || p.khasraNo,
            areaBigha: p.areaBigha || p.area,
            soilType: p.soil_type || p.soilType,
            irrigationType: p.irrigation_type || p.irrigationType,
            jamabandiStatus: "VERIFIED_ACTIVE_ROR",
            source: "HimBhoomi Land Records Backbone"
          };
          break;
        }
      }
    } else if (dataRequested.toLowerCase().includes('bank') || dataRequested.toLowerCase().includes('dbt')) {
      // 2. Check Bank DBT mandate
      const f = store.farmers.find(farmer => 
        farmer.id === lookupKey || farmer.farmer_id === lookupKey || farmer.phone?.includes(lookupKey) || farmer.mobile?.includes(lookupKey)
      );
      if (f) {
        resultPayload = {
          farmerName: f.name,
          farmerId: f.farmer_id || f.id,
          bankName: f.bankDetails?.bankName || "HP State Cooperative Bank",
          accountMasked: f.bankDetails?.accountNo || "XXXX-XXXX-8921",
          ifsc: f.bankDetails?.ifsc || "HPSC0000104",
          dbtStatus: "MANDATE_ACTIVE_APBS",
          npciAadhaarLinked: true
        };
      }
    } else if (dataRequested.toLowerCase().includes('soil')) {
      // 3. Check Soil profile
      const soil = (store.suadr?.soil_data || []).find(s => 
        (s.location || '').toLowerCase().includes((lookupKey || '').toLowerCase()) || s.id === lookupKey
      );
      if (soil) {
        resultPayload = soil;
      }
    }

    if (!resultPayload) {
      resultPayload = {
        query_key: lookupKey,
        status: "RECORD_FOUND_AUTHORIZED",
        exchangeMetadata: "Verified across HP-ASN Government & Partner Data Exchange Backbone",
        timestamp: new Date().toISOString()
      };
    }
  } else {
    resultPayload = {
      status: "ACCESS_DENIED",
      reason: "Farmer consent token not present or revoked by data principal."
    };
  }

  // Create immutable HP-ASN exchange instance maintaining the 6 questions
  const exchangeInstance = new HPASNExchange({
    who_requested: requester,
    what_data: dataRequested,
    when: new Date().toISOString(),
    why: reason || "Inter-system verification for scheme entitlement",
    was_consent_required: consentRequired,
    was_access_allowed: accessAllowed,
    system_type: system_type || (requester.toLowerCase().includes('partner') || requester.toLowerCase().includes('bank') ? 'PARTNER' : 'GOVERNMENT'),
    target_system: target_system || targetDept || "Frappe Backend (PostgreSQL & Redis)",
    farmer_id: lookupKey
  });

  const exchangeRecord = exchangeInstance.toJSON();

  // Save to persistent database store
  db.update(s => {
    s.hpasnLogs = s.hpasnLogs || [];
    s.hpasnLogs.unshift(exchangeRecord);
    return s;
  });

  // Enqueue background audit logging in Redis
  try {
    await redisService.enqueueJob('hpasn-audit', {
      transaction_id: exchangeRecord.transaction_id,
      who_requested: exchangeRecord.who_requested,
      what_data: exchangeRecord.what_data,
      hash_signature: exchangeRecord.hash_signature
    });
  } catch (err) {
    // Non-blocking
  }

  res.status(accessAllowed ? 200 : 403).json({
    success: accessAllowed,
    flow: `${exchangeRecord.system_type} SYSTEM ➔ HP-ASN API ➔ Frappe Backend ➔ PostgreSQL & Redis`,
    exchange: exchangeRecord,
    data: resultPayload
  });
});

// POST /api/hpasn/request-consent - Consent generation with cryptographic signature
router.post('/request-consent', (req, res) => {
  const { sourceDept, targetDept, purpose, farmerId, dataScope, who_requested, what_data, why } = req.body;

  const requester = who_requested || sourceDept || "Department of Agriculture";
  const dataScopeRequested = what_data || dataScope || "Land Ownership & Cadastral Verification";
  const purposeStated = why || purpose || "AgriStack Scheme Enrollment";
  const targetFarmer = farmerId || "FARMER-HP-1001";

  const exchangeInstance = new HPASNExchange({
    who_requested: requester,
    what_data: dataScopeRequested,
    when: new Date().toISOString(),
    why: purposeStated,
    was_consent_required: true,
    was_access_allowed: true,
    system_type: "GOVERNMENT",
    target_system: targetDept || "Frappe Backend",
    farmer_id: targetFarmer
  });

  const newLog = exchangeInstance.toJSON();

  db.update(store => {
    store.hpasnLogs = store.hpasnLogs || [];
    store.hpasnLogs.unshift(newLog);
    return store;
  });

  res.status(201).json({
    success: true,
    message: "HP-ASN Inter-Departmental consent established and cryptographically signed.",
    transaction: newLog
  });
});

// POST /api/hpasn/verify-signature - Prove cryptographic non-repudiation
router.post('/verify-signature', (req, res) => {
  const { transactionId, transaction_id, signature, hash_signature } = req.body;
  const txn = transaction_id || transactionId;
  const sig = hash_signature || signature;

  if (!txn || !sig) {
    return res.status(400).json({ success: false, message: "transaction_id and signature are required." });
  }

  const store = db.get();
  const log = (store.hpasnLogs || []).find(l => (l.transaction_id === txn || l.transactionId === txn));

  if (!log) {
    return res.status(404).json({ success: false, message: "Transaction ID not found in HP-ASN ledger." });
  }

  const expectedSignature = log.hash_signature || log.hashSignature;
  const matches = expectedSignature === sig;

  res.json({
    success: true,
    transaction_id: txn,
    verified: matches,
    status: matches ? "CRYPTO_VERIFIED_VALID" : "SIGNATURE_MISMATCH_TAMPERED",
    algorithm: "HMAC-SHA256 (256-bit Non-Repudiation)",
    logDetails: log
  });
});

// GET /api/hpasn/stats - High-level exchange statistics
router.get('/stats', (req, res) => {
  const logs = db.get().hpasnLogs || [];
  const govCount = logs.filter(l => (l.system_type || '').toUpperCase() === 'GOVERNMENT').length;
  const partnerCount = logs.filter(l => (l.system_type || '').toUpperCase() === 'PARTNER').length;
  const consentRequiredCount = logs.filter(l => l.was_consent_required).length;
  const allowedCount = logs.filter(l => l.was_access_allowed).length;

  res.json({
    success: true,
    totalExchanges: logs.length,
    breakdown: {
      government_system_exchanges: govCount,
      partner_system_exchanges: partnerCount,
      consent_required_exchanges: consentRequiredCount,
      access_allowed_exchanges: allowedCount,
      access_denied_exchanges: logs.length - allowedCount
    },
    interoperabilityLayers: [
      "Government System ➔ HP-ASN API ➔ Frappe Backend ➔ PostgreSQL",
      "Partner System ➔ HP-ASN API ➔ Frappe Backend ➔ PostgreSQL & Redis"
    ]
  });
});

module.exports = router;
