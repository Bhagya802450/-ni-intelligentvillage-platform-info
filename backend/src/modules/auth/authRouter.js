const express = require('express');
const router = express.Router();
const db = require('../../data/dbStore');
const { authenticate, requireRole, requirePermission, matchesRole } = require('../../middleware/authGuard');
const redisService = require('../../services/redisService');


// GET /api/auth/hierarchy - 3-tier User role hierarchy (User -> Farmer, Officer, Admin)
router.get('/hierarchy', (req, res) => {
  res.json({
    success: true,
    tree: "User ├── Farmer ├── Officer └── Admin",
    hierarchy: {
      role: "User",
      description: "Root Platform Identity",
      children: [
        {
          role: "Farmer",
          code: "FARMER",
          parent: "User",
          scope: "Individual Beneficiary (Self)",
          description: "Access personal land parcels, Soil Health Cards, DBT subsidies, APMC Mandi trading, and Sentinel-2 NDVI analytics.",
          permissions: ["farmer:read_own", "farmer:apply_schemes", "farmer:mandi_trade", "suadr:read_advisories", "ml:view_field_ndvi"]
        },
        {
          role: "Officer",
          code: "OFFICER",
          parent: "User",
          scope: "Tehsil / District Operational ERP",
          description: "Field inspections, Khasra land verification (Patwari), DBT application approval (ADO/DAO), and advisories.",
          permissions: ["schemes:approve", "schemes:disburse_dbt", "cadastral:verify_khasra", "suadr:create_shc", "advisories:publish", "ml:run_satellite_inference"]
        },
        {
          role: "Admin",
          code: "ADMIN",
          parent: "User",
          scope: "Statewide Core Infrastructure",
          description: "Statewide HP-ASN data exchange governance, tamper-proof audit trail non-repudiation, and gateway telemetry.",
          permissions: ["iam:manage_roles", "hpasn:manage_policies", "audit:inspect_tamper_log", "system:configure_gateway", "cadastral:verify_khasra", "schemes:approve", "*"]
        }
      ]
    }
  });
});

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
           (o.email && o.email.toLowerCase() === idLower) ||
           (o.name && o.name.toLowerCase().includes(idLower))
    );

    if (officer) {
      const roleDef = (store.roles || []).find(r => r.roleCode === officer.role);
      const token = `jwt-token-${officer.role.toLowerCase()}-${officer.id}-${Date.now()}`;

      // Save ephemeral session in Redis
      redisService.createSession(token, {
        userId: officer.id,
        name: officer.name,
        role: officer.role,
        department: officer.department
      }).catch(() => {});

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
  }

  // Farmer login
  const cleanId = (identifier || '').replace(/[\s-]/g, '');
  const farmer = (store.farmers || []).find(
    f => (f.phone && f.phone.replace(/[\s-]/g, '').includes(cleanId)) ||
         (f.mobile && f.mobile.replace(/[\s-]/g, '').includes(cleanId)) ||
         (f.email && f.email.toLowerCase() === idLower) ||
         (f.national_farmer_id && f.national_farmer_id.toLowerCase() === idLower) ||
         (f.agriStackId && f.agriStackId.toLowerCase() === idLower) ||
         (f.farmer_id && f.farmer_id.toLowerCase() === idLower) ||
         (f.id && f.id.toLowerCase() === idLower)
  );

  if (!farmer) {
    return res.status(401).json({
      success: false,
      message: "Identity not found in IAM registry. Use demo ID (e.g. 98160 12345 or OFF-HP-801, PAT-HP-301, BNK-HP-501, ADM-HP-001)."
    });
  }

  const farmerRole = (store.roles || []).find(r => r.roleCode === 'FARMER');
  const token = `jwt-token-farmer-${farmer.id || farmer.farmer_id}-${Date.now()}`;

  // Save ephemeral session in Redis
  redisService.createSession(token, {
    userId: farmer.farmer_id || farmer.id,
    name: farmer.name,
    role: "FARMER",
    district: farmer.district
  }).catch(() => {});

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
    token
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

// POST /api/auth/pipeline-verify
// Simulates: Login ➔ Authentication ➔ Role Check ➔ Permission ➔ Access API
router.post('/pipeline-verify', authenticate, (req, res) => {
  const { requiredRole, requiredPermission } = req.body;
  const user = req.user;

  // Step 3: Role Check
  let rolePass = false;
  if (!requiredRole || matchesRole(user.role, 'ADMIN')) {
    rolePass = true;
  } else {
    const rolesList = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    rolePass = rolesList.some(r => matchesRole(user.role, r));
  }

  // Step 4: Permission Check
  let permPass = false;
  if (!requiredPermission || matchesRole(user.role, 'ADMIN')) {
    permPass = true;
  } else {
    const perms = user.permissions || [];
    permPass = perms.includes('*') || perms.includes(requiredPermission);
  }

  const accessGranted = rolePass && permPass;

  res.status(accessGranted ? 200 : 403).json({
    success: accessGranted,
    pipeline: [
      {
        step: 1,
        name: "Login",
        status: "COMPLETED",
        description: "Credentials verified, session token generated."
      },
      {
        step: 2,
        name: "Authentication",
        status: "AUTHENTICATED",
        identity: user.name,
        principalId: user.id,
        tokenValid: true
      },
      {
        step: 3,
        name: "Role Check",
        status: rolePass ? "ROLE_VERIFIED" : "ROLE_MISMATCH",
        userRole: user.role,
        requiredRole: requiredRole || "ANY",
        passed: rolePass
      },
      {
        step: 4,
        name: "Permission",
        status: permPass ? "PERMISSION_GRANTED" : "PERMISSION_DENIED",
        requiredPermission: requiredPermission || "NONE",
        userPermissions: user.permissions || [],
        decision: permPass ? "PERMIT" : "DENY",
        passed: permPass
      },
      {
        step: 5,
        name: "Access API implementation",
        status: accessGranted ? "ACCESS_GRANTED_HTTP_200" : "ACCESS_BLOCKED_HTTP_403",
        endpoint: req.originalUrl,
        timestamp: new Date().toISOString()
      }
    ]
  });
});

// GET /api/auth/guarded-sample - Example strictly guarded API endpoint
// Requires: Authentication -> Role Check: OFFICER/ADMIN -> Permission: schemes:approve
router.get('/guarded-sample', authenticate, requireRole(['OFFICER', 'ADMIN']), requirePermission('schemes:approve'), (req, res) => {
  res.json({
    success: true,
    message: "Access granted! Successfully passed through: Login ➔ Authentication ➔ Role Check ➔ Permission ➔ Access API.",
    caller: {
      id: req.user.id,
      name: req.user.name,
      role: req.user.role,
      permissions: req.user.permissions
    },
    accessedAt: new Date().toISOString()
  });
});

module.exports = router;
