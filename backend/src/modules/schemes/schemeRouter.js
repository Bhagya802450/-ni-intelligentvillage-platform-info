const express = require('express');
const router = express.Router();
const db = require('../../data/dbStore');

// GET all schemes catalog
router.get('/', (req, res) => {
  res.json({ success: true, count: db.get().schemes.length, data: db.get().schemes });
});

// GET applications with filter
router.get('/applications', (req, res) => {
  const { farmerId, district, status } = req.query;
  let apps = db.get().applications;

  if (farmerId) {
    apps = apps.filter(a => a.farmerId === farmerId);
  }

  if (district && district !== 'All') {
    apps = apps.filter(a => a.district.toLowerCase() === district.toLowerCase());
  }

  if (status && status !== 'All') {
    apps = apps.filter(a => a.status === status);
  }

  // Enrich with scheme name
  const schemes = db.get().schemes;
  const enriched = apps.map(app => {
    const s = schemes.find(x => x.schemeId === app.schemeId);
    return {
      ...app,
      schemeName: s ? s.name : "State Agriculture Scheme",
      department: s ? s.department : "Dept of Agriculture"
    };
  });

  res.json({ success: true, count: enriched.length, data: enriched });
});

// POST submit new scheme application
router.post('/applications', (req, res) => {
  const { schemeId, farmerId, remarks } = req.body;
  const store = db.get();

  const farmer = store.farmers.find(f => f.id === farmerId || f.agriStackId === farmerId);
  if (!farmer) {
    return res.status(404).json({ success: false, message: "Farmer not found in registry." });
  }

  const scheme = store.schemes.find(s => s.schemeId === schemeId);
  if (!scheme) {
    return res.status(404).json({ success: false, message: "Scheme not found." });
  }

  // Check if already applied
  const existing = store.applications.find(a => a.schemeId === schemeId && a.farmerId === farmer.id);
  if (existing) {
    return res.status(400).json({ success: false, message: "Application already submitted for this scheme." });
  }

  const newApp = {
    applicationId: `APP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    schemeId,
    farmerId: farmer.id,
    farmerName: farmer.name,
    district: farmer.district,
    appliedAmount: scheme.annualBenefitAmount,
    appliedAt: new Date().toISOString(),
    status: "FIELD_VERIFICATION_PENDING",
    officerRemarks: remarks || "Application filed online via Farmer Portal. Pending field inspection.",
    verifiedBy: null,
    disbursementDate: null,
    utrReference: null
  };

  db.update(s => {
    s.applications.unshift(newApp);
    return s;
  });

  res.status(201).json({
    success: true,
    message: "Application submitted successfully and routed to District Agriculture Officer queue.",
    data: newApp
  });
});

// PUT update status by Officer
router.put('/applications/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, officerRemarks, officerName } = req.body;

  const validStatuses = ["FIELD_VERIFICATION_PENDING", "APPROVED_BY_OFFICER", "REJECTED", "DBT_DISBURSED"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
  }

  let updatedApp = null;

  db.update(store => {
    const app = store.applications.find(a => a.applicationId === id);
    if (!app) return store;

    app.status = status;
    if (officerRemarks) app.officerRemarks = officerRemarks;
    if (officerName) app.verifiedBy = officerName;

    if (status === 'DBT_DISBURSED') {
      app.disbursementDate = new Date().toISOString().split('T')[0];
      app.utrReference = `HPSC${Date.now()}${Math.floor(100 + Math.random() * 900)}`;
    }

    updatedApp = app;
    return store;
  });

  if (!updatedApp) {
    return res.status(404).json({ success: false, message: "Application not found." });
  }

  res.json({
    success: true,
    message: `Application ${id} status updated to ${status}.`,
    data: updatedApp
  });
});

// GET District DBT Analytics
router.get('/analytics', (req, res) => {
  const store = db.get();
  const totalFarmers = store.farmers.length;
  const totalApplications = store.applications.length;
  const disbursedApps = store.applications.filter(a => a.status === 'DBT_DISBURSED');
  const pendingApps = store.applications.filter(a => a.status === 'FIELD_VERIFICATION_PENDING');
  const approvedApps = store.applications.filter(a => a.status === 'APPROVED_BY_OFFICER');

  const totalDisbursedAmt = disbursedApps.reduce((acc, curr) => acc + (curr.appliedAmount || 0), 0);

  res.json({
    success: true,
    metrics: {
      totalRegisteredFarmers: totalFarmers,
      totalApplicationsFiled: totalApplications,
      disbursedCount: disbursedApps.length,
      disbursedAmountINR: totalDisbursedAmt,
      pendingVerificationCount: pendingApps.length,
      readyForDisbursementCount: approvedApps.length
    },
    districtBreakdown: [
      { district: "Shimla", farmers: 1, disbursedINR: 6000, pending: 0 },
      { district: "Solan", farmers: 1, disbursedINR: 0, pending: 1 },
      { district: "Kangra", farmers: 1, disbursedINR: 0, pending: 1 }
    ]
  });
});

module.exports = router;
