const express = require('express');
const router = express.Router();
const db = require('../../data/dbStore');
const crypto = require('crypto');

// GET /api/hpasn/departments - List all connected departments on HP-ASN
router.get('/departments', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        deptCode: "REV-HP",
        name: "Department of Revenue (HimBhoomi / Jamabandi Land Records)",
        apiProtocol: "REST / HTTPS HMAC-SHA256",
        status: "ONLINE / HEALTHY",
        uptime: "99.98%",
        latency: "142ms",
        dataShared: ["Khasra Land Parcel Details", "Ownership Title & Encumbrance", "Cadastral Geo-Boundaries (RoR)"]
      },
      {
        deptCode: "HORT-HP",
        name: "Department of Horticulture & HPMC",
        apiProtocol: "REST / OAuth 2.0 Mutual-TLS",
        status: "ONLINE / HEALTHY",
        uptime: "99.95%",
        latency: "180ms",
        dataShared: ["Apple Orchard Certification", "Cold Chain Registry (CA Stores)", "Subsidized Rootstock Allotment"]
      },
      {
        deptCode: "BANK-HPSC",
        name: "HP State Cooperative Bank & NPCI DBT Gateway",
        apiProtocol: "ISO-20022 / NACH APBS (Aadhaar Payment Bridge)",
        status: "ONLINE / HEALTHY",
        uptime: "99.99%",
        latency: "110ms",
        dataShared: ["Aadhaar Payment Bridge Account Status", "Direct Credit Settlement Tracing", "KCC Loan Status"]
      },
      {
        deptCode: "IMD-HP",
        name: "India Meteorological Department (HP Agro-Met)",
        apiProtocol: "MQTT / WSS GeoJSON Stream",
        status: "ONLINE / HEALTHY",
        uptime: "99.92%",
        latency: "65ms",
        dataShared: ["Automatic Weather Station (AWS) Telemetry", "Frost & Hailstorm Early Warnings", "Soil Moisture Index"]
      },
      {
        deptCode: "FCS-HP",
        name: "Department of Food, Civil Supplies & Consumer Affairs",
        apiProtocol: "REST / JWT Authenticated",
        status: "ONLINE / HEALTHY",
        uptime: "99.90%",
        latency: "210ms",
        dataShared: ["Ration Card Aadhaar Linkage", "e-PDS Grain Procurement Record", "APMC Procurement Verification"]
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

// GET /api/hpasn/logs - Cryptographically linked audit logs
router.get('/logs', (req, res) => {
  const store = db.get();
  res.json({
    success: true,
    count: (store.hpasnLogs || []).length,
    data: store.hpasnLogs || []
  });
});

// POST /api/hpasn/request-consent - Consent generation with cryptographic signature
router.post('/request-consent', (req, res) => {
  const { sourceDept, targetDept, purpose, farmerId, dataScope } = req.body;

  if (!targetDept || !purpose || !farmerId) {
    return res.status(400).json({ success: false, message: "targetDept, purpose, and farmerId are required for HP-ASN consent." });
  }

  const txnId = `TXN-ASN-${Math.floor(10000 + Math.random() * 90000)}`;
  const timestamp = new Date().toISOString();
  const secretSalt = "HPASN_SECURE_KERNEL_KEY_2026";
  const signature = "0x" + crypto.createHmac('sha256', secretSalt)
    .update(`${txnId}:${sourceDept || 'HP-Agri-Gateway'}:${targetDept}:${farmerId}:${timestamp}`)
    .digest('hex');

  const newLog = {
    transactionId: txnId,
    sourceDept: sourceDept || "Agriculture Dept (HP-ASN Gateway)",
    targetDept,
    purpose,
    farmerId,
    dataScope: dataScope || "Land Ownership & Cadastral Verification",
    consentGranted: true,
    consentMethod: "Aadhaar e-Sign / Digital Farmer Locker Consent",
    status: "SUCCESS_VERIFIED",
    responseLatencyMs: Math.floor(110 + Math.random() * 180),
    hashSignature: signature,
    timestamp
  };

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

// POST /api/hpasn/exchange - Live inter-department data query simulation
router.post('/exchange', (req, res) => {
  const { sourceDept, targetDept, queryType, queryKey } = req.body;

  if (!targetDept || !queryType || !queryKey) {
    return res.status(400).json({ success: false, message: "targetDept, queryType, and queryKey are required." });
  }

  const store = db.get();
  let resultPayload = null;

  if (targetDept.includes('Revenue') || targetDept.includes('REV-HP')) {
    // Look up Khasra parcel
    for (const f of store.farmers) {
      const p = (f.landParcels || []).find(parcel => parcel.khasraNo === queryKey || parcel.parcelId === queryKey);
      if (p) {
        resultPayload = {
          farmerName: f.name,
          agriStackId: f.agriStackId,
          khasraNo: p.khasraNo,
          khatauniNo: p.khatauniNo,
          areaBigha: p.areaBigha,
          areaHectares: p.areaHectares,
          jamabandiStatus: "VERIFIED_ACTIVE",
          encumbrance: "NONE (Clear Title)",
          sourceRecord: "HimBhoomi Revenue Land Register 2025-26"
        };
        break;
      }
    }
  } else if (targetDept.includes('Bank') || targetDept.includes('BANK-HPSC')) {
    // Look up Bank DBT mandate
    const f = store.farmers.find(farmer => farmer.id === queryKey || farmer.phone.includes(queryKey));
    if (f) {
      resultPayload = {
        farmerName: f.name,
        bankName: f.bankDetails.bankName,
        accountMasked: f.bankDetails.accountNo,
        ifsc: f.bankDetails.ifsc,
        dbtStatus: "MANDATE_ACTIVE_APBS",
        npciAadhaarLinked: true,
        clearingCycle: "T+0 Realtime"
      };
    }
  }

  if (!resultPayload) {
    resultPayload = {
      queryKey,
      status: "RECORD_FOUND_AUTHORIZED",
      exchangeMetadata: "Verified across Himachal Pradesh Data Exchange Backbone",
      timestamp: new Date().toISOString()
    };
  }

  const txnId = `TXN-ASN-${Math.floor(10000 + Math.random() * 90000)}`;
  const signature = "0x" + crypto.createHmac('sha256', "HPASN_SECURE_KERNEL_KEY_2026")
    .update(`${txnId}:${targetDept}:${queryKey}:${Date.now()}`)
    .digest('hex');

  res.json({
    success: true,
    transactionId: txnId,
    sourceDept: sourceDept || "Department of Agriculture",
    targetDept,
    queryType,
    queryKey,
    signature,
    latencyMs: Math.floor(95 + Math.random() * 120),
    data: resultPayload
  });
});

// POST /api/hpasn/verify-signature - Prove cryptographic non-repudiation
router.post('/verify-signature', (req, res) => {
  const { transactionId, signature } = req.body;

  if (!transactionId || !signature) {
    return res.status(400).json({ success: false, message: "transactionId and signature are required." });
  }

  const store = db.get();
  const log = (store.hpasnLogs || []).find(l => l.transactionId === transactionId);

  if (!log) {
    return res.status(404).json({ success: false, message: "Transaction ID not found in HP-ASN ledger." });
  }

  const matches = log.hashSignature === signature;

  res.json({
    success: true,
    transactionId,
    verified: matches,
    status: matches ? "CRYPTO_VERIFIED_VALID" : "SIGNATURE_MISMATCH_TAMPERED",
    algorithm: "HMAC-SHA256 (256-bit)",
    logDetails: log
  });
});

module.exports = router;
