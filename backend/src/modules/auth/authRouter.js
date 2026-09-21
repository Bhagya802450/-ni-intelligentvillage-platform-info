const express = require('express');
const router = express.Router();
const db = require('../../data/dbStore');

// GET /api/auth/roles - Full RBAC Roles & Permissions Matrix
router.get('/roles', (req, res) => {
  const store = db.get();
  res.json({
    success: true,
    count: (store.roles || []).length,
    data: store.roles || []
  });
});

// GET /api/auth/principals - Directory of authorized departmental officials
router.get('/principals', (req, res) => {
  const store = db.get();
  res.json({
    success: true,
    count: (store.officers || []).length,
    data: (store.officers || []).map(o => ({
      id: o.id,
      name: o.name,
      email: o.email,
      role: o.role,
      designation: o.designation,
      department: o.department,
      district: o.district,
      jurisdiction: o.jurisdiction,
      permissions: o.permissions
    }))
  });
});

// POST /api/auth/login - Universal login supporting Farmer, Patwari, ADO/DAO, Bank Nodal, and State Admin
router.post('/login', (req, res) => {
  const { role, identifier, password } = req.body;
  const store = db.get();
  const idLower = (identifier || '').trim().toLowerCase();

  // If specific role or officer identifier
  if (role === 'OFFICER' || role === 'PATWARI' || role === 'BANK' || role === 'ADMIN' || !role) {
    const officer = (store.officers || []).find(
      o => o.id.toLowerCase() === idLower ||
           o.email.toLowerCase() === idLower ||
           o.name.toLowerCase().includes(idLower)
    );

    if (officer) {
      const roleDef = (store.roles || []).find(r => r.roleCode === officer.role);
      return res.json({
        success: true,
        user: {
          ...officer,
          roleDescription: roleDef?.description,
          scope: roleDef?.scope
        },
        token: `jwt-token-${officer.role.toLowerCase()}-${officer.id}-${Date.now()}`
      });
    }
  }

  // Farmer login
  const cleanId = (identifier || '').replace(/[\s-]/g, '');
  const farmer = (store.farmers || []).find(
    f => f.phone.replace(/[\s-]/g, '').includes(cleanId) ||
         f.agriStackId.toLowerCase() === idLower ||
         f.id.toLowerCase() === idLower
  );

  if (!farmer) {
    return res.status(401).json({
      success: false,
      message: "Identity not found in IAM registry. Use demo ID (e.g. 98160 12345 or OFF-HP-801, PAT-HP-301, BNK-HP-501, ADM-HP-001)."
    });
  }

  const farmerRole = (store.roles || []).find(r => r.roleCode === 'FARMER');
  return res.json({
    success: true,
    user: {
      ...farmer,
      role: "FARMER",
      designation: "Registered HimBhoomi Farmer",
      department: "Directorate of Agriculture Beneficiary Registry",
      permissions: farmerRole?.allowedActions || ["farmer:read_own", "farmer:apply_schemes", "farmer:mandi_trade"],
      roleDescription: farmerRole?.description,
      scope: farmerRole?.scope
    },
    token: `jwt-token-farmer-${farmer.id}-${Date.now()}`
  });
});

// GET /api/auth/me - Validate token and return current session
router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: "Missing or invalid Bearer token in Authorization header." });
  }

  const token = authHeader.split(' ')[1];
  const parts = token.split('-');
  const store = db.get();

  // Search officer or farmer by token signature
  const officer = (store.officers || []).find(o => token.includes(o.id.toLowerCase()) || token.includes(o.id));
  if (officer) {
    const roleDef = (store.roles || []).find(r => r.roleCode === officer.role);
    return res.json({
      success: true,
      user: {
        ...officer,
        roleDescription: roleDef?.description,
        scope: roleDef?.scope
      },
      token
    });
  }

  const farmer = (store.farmers || []).find(f => token.includes(f.id.toLowerCase()) || token.includes(f.id));
  if (farmer) {
    const farmerRole = (store.roles || []).find(r => r.roleCode === 'FARMER');
    return res.json({
      success: true,
      user: {
        ...farmer,
        role: "FARMER",
        permissions: farmerRole?.allowedActions,
        roleDescription: farmerRole?.description
      },
      token
    });
  }

  return res.status(401).json({ success: false, message: "Token expired or revoked in IAM session cache." });
});

// POST /api/auth/check-permission - Policy evaluation engine for RBAC
router.post('/check-permission', (req, res) => {
  const { role, action } = req.body;
  const store = db.get();

  if (!role || !action) {
    return res.status(400).json({ success: false, message: "Both role and action are required for policy evaluation." });
  }

  const roleDef = (store.roles || []).find(r => r.roleCode === role);
  if (!roleDef) {
    return res.status(404).json({ success: false, message: `Role '${role}' not defined in IAM directory.` });
  }

  const allowed = roleDef.allowedActions.includes(action) || roleDef.allowedActions.includes('*');

  res.json({
    success: true,
    role,
    action,
    allowed,
    scope: roleDef.scope,
    decision: allowed ? "PERMIT" : "DENY",
    policyRule: allowed 
      ? `Action '${action}' is explicitly granted under ${role} policy definition.` 
      : `Action '${action}' is not authorized for role ${role}. Requires elevation.`
  });
});

// POST /api/auth/verify-aadhaar - Aadhaar OTP Verification & AgriStack ID Minting
router.post('/verify-aadhaar', (req, res) => {
  const { aadhaarNumber, otp } = req.body;

  if (!aadhaarNumber || aadhaarNumber.replace(/[\s-]/g, '').length !== 12) {
    return res.status(400).json({ success: false, message: "Invalid 12-digit Aadhaar number." });
  }

  if (otp && otp !== "123456") {
    return res.status(400).json({ success: false, message: "Invalid OTP. Use demo OTP 123456." });
  }

  const generatedAgriStackId = `AGRI-HP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  return res.json({
    success: true,
    message: "Aadhaar e-KYC Verified successfully via UIDAI / AgriStack Bridge.",
    agriStackId: generatedAgriStackId,
    verifiedStatus: "AUTHENTICATED",
    ekycDetails: {
      state: "Himachal Pradesh",
      status: "ACTIVE",
      timestamp: new Date().toISOString()
    }
  });
});

module.exports = router;
