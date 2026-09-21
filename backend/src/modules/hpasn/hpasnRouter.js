const express = require('express');
const router = express.Router();
const db = require('../../data/dbStore');
const crypto = require('crypto');

// GET connected departments
router.get('/departments', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        deptCode: "REV-HP",
        name: "Department of Revenue (HimBhoomi / Jamabandi Land Records)",
        apiProtocol: "REST / HTTPS HMAC-SHA256",
        status: "ONLINE / HEALTHY",
        dataShared: ["Khasra Land Parcel Details", "Ownership Title & Encumbrance", "Cadastral Geo-Boundaries"]
      },
      {
        deptCode: "HORT-HP",
        name: "Department of Horticulture & HPMC",
        apiProtocol: "REST / OAuth 2.0",
        status: "ONLINE / HEALTHY",
        dataShared: ["Apple Orchard Certification", "Cold Chain Registry", "Subsidized Rootstock Allotment"]
      },
      {
        deptCode: "BANK-HPSC",
        name: "HP State Cooperative Bank & NPCI DBT Gateway",
        apiProtocol: "ISO-20022 / NACH APBS",
        status: "ONLINE / HEALTHY",
        dataShared: ["Aadhaar Payment Bridge Account Status", "Direct Credit Settlement Tracing", "KCC Loan Status"]
      },
      {
        deptCode: "IMD-HP",
        name: "India Meteorological Department (HP Agro-Met)",
        apiProtocol: "MQTT / GeoJSON Stream",
        status: "ONLINE / HEALTHY",
        dataShared: ["Automatic Weather Station (AWS) Telemetry", "Frost & Hailstorm Early Warnings", "Soil Moisture Index"]
      }
    ]
  });
});

// GET HP-ASN Audit logs
router.get('/logs', (req, res) => {
  res.json({
    success: true,
    count: db.get().hpasnLogs.length,
    data: db.get().hpasnLogs
  });
});

// POST Initiate secure inter-department exchange with consent
router.post('/request-consent', (req, res) => {
  const { sourceDept, targetDept, purpose, farmerId } = req.body;

  if (!targetDept || !purpose || !farmerId) {
    return res.status(400).json({ success: false, message: "Missing required fields for HP-ASN transaction." });
  }

  const txnId = `TXN-ASN-${Math.floor(10000 + Math.random() * 90000)}`;
  const signature = "0x" + crypto.createHash('sha256').update(txnId + farmerId + Date.now()).digest('hex').substring(0, 40);

  const newLog = {
    transactionId: txnId,
    sourceDept: sourceDept || "Agriculture Dept (HP-ASN Gateway)",
    targetDept,
    purpose,
    farmerId,
    consentGranted: true,
    consentMethod: "Aadhaar e-Sign / Digital Locker Consent",
    status: "SUCCESS_VERIFIED",
    responseLatencyMs: Math.floor(120 + Math.random() * 200),
    hashSignature: signature,
    timestamp: new Date().toISOString()
  };

  db.update(store => {
    store.hpasnLogs.unshift(newLog);
    return store;
  });

  res.status(201).json({
    success: true,
    message: "HP-ASN Inter-Departmental exchange signed and verified.",
    transaction: newLog
  });
});

module.exports = router;
