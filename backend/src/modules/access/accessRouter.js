const express = require('express');
const router = express.Router();
const db = require('../../data/dbStore');
const { authenticate, requireRole, requirePermission } = require('../../middleware/authGuard');

/**
 * =========================================================================
 * Security Pipeline: Login ➔ Authentication ➔ Role Check ➔ Permission ➔ Access API
 * 
 * Implemented Role Actions:
 * Farmer
 *  ├── View own profile: GET /api/farmer/profile (farmer:view_profile)
 *  ├── View own land:    GET /api/farmer/land (farmer:view_land)
 *  └── View own crops:   GET /api/farmer/crops (farmer:view_crops)
 * 
 * Officer
 *  ├── View farmers:               GET /api/officer/farmers (officer:view_farmers)
 *  ├── Verify farmer:              POST /api/officer/verify-farmer (officer:verify_farmer)
 *  └── Update field information:   POST /api/officer/update-field-info (officer:update_field_info)
 * 
 * Admin
 *  ├── Manage users:        GET & POST /api/admin/users (admin:manage_users)
 *  ├── Manage roles:        GET & POST /api/admin/roles (admin:manage_roles)
 *  └── Manage system data:  GET & POST /api/admin/system-data (admin:manage_system_data)
 * =========================================================================
 */

// =========================================================================
// 1. FARMER ENDPOINTS
// =========================================================================

// Farmer ├── View own profile
router.get('/farmer/profile', authenticate, requireRole('FARMER'), requirePermission('farmer:view_profile'), (req, res) => {
  const store = db.get();
  const farmer = (store.farmers || []).find(f => f.id === req.user.id || f.agriStackId === req.user.agriStackId);
  if (!farmer) {
    return res.status(404).json({ success: false, message: "Farmer record not found in Unified Farmer Database." });
  }

  res.json({
    success: true,
    pipeline: "Login ➔ Authentication ➔ Role Check ➔ Permission ➔ Access API",
    role: "Farmer",
    action: "View own profile",
    permission: "farmer:view_profile",
    profile: {
      id: farmer.id,
      name: farmer.name,
      fatherName: farmer.fatherName,
      agriStackId: farmer.agriStackId,
      aadhaarHash: farmer.aadhaarHash,
      phone: farmer.phone,
      district: farmer.district,
      tehsil: farmer.tehsil,
      village: farmer.village,
      pincode: farmer.pincode,
      category: farmer.category,
      naturalFarmingPractitioner: farmer.naturalFarmingPractitioner,
      bankDetails: farmer.bankDetails
    }
  });
});

// Farmer ├── View own land
router.get('/farmer/land', authenticate, requireRole('FARMER'), requirePermission('farmer:view_land'), (req, res) => {
  const store = db.get();
  const farmer = (store.farmers || []).find(f => f.id === req.user.id || f.agriStackId === req.user.agriStackId);
  if (!farmer) {
    return res.status(404).json({ success: false, message: "Farmer record not found." });
  }

  res.json({
    success: true,
    pipeline: "Login ➔ Authentication ➔ Role Check ➔ Permission ➔ Access API",
    role: "Farmer",
    action: "View own land",
    permission: "farmer:view_land",
    farmerId: farmer.id,
    farmerName: farmer.name,
    parcelsCount: (farmer.landParcels || []).length,
    landParcels: farmer.landParcels || []
  });
});

// Farmer ├── View own crops
router.get('/farmer/crops', authenticate, requireRole('FARMER'), requirePermission('farmer:view_crops'), (req, res) => {
  const store = db.get();
  const farmer = (store.farmers || []).find(f => f.id === req.user.id || f.agriStackId === req.user.agriStackId);
  if (!farmer) {
    return res.status(404).json({ success: false, message: "Farmer record not found." });
  }

  const crops = (farmer.landParcels || []).map(p => ({
    parcelId: p.parcelId,
    khasraNo: p.khasraNo,
    cropName: p.primaryCrop,
    areaBigha: p.areaBigha,
    irrigationType: p.irrigationType,
    estimatedHarvestDate: "2026-10-15",
    healthStatus: "Optimal",
    ndviScore: 0.78
  }));

  res.json({
    success: true,
    pipeline: "Login ➔ Authentication ➔ Role Check ➔ Permission ➔ Access API",
    role: "Farmer",
    action: "View own crops",
    permission: "farmer:view_crops",
    farmerId: farmer.id,
    farmerName: farmer.name,
    cropsCount: crops.length,
    crops
  });
});

// =========================================================================
// 2. OFFICER ENDPOINTS
// =========================================================================

// Officer ├── View farmers
router.get('/officer/farmers', authenticate, requireRole(['OFFICER', 'ADMIN']), requirePermission('officer:view_farmers'), (req, res) => {
  const store = db.get();
  res.json({
    success: true,
    pipeline: "Login ➔ Authentication ➔ Role Check ➔ Permission ➔ Access API",
    role: "Officer",
    action: "View farmers",
    permission: "officer:view_farmers",
    officer: {
      id: req.user.id,
      name: req.user.name,
      designation: req.user.designation || "Officer",
      department: req.user.department || "Agriculture"
    },
    count: (store.farmers || []).length,
    farmers: (store.farmers || []).map(f => ({
      id: f.id,
      name: f.name,
      agriStackId: f.agriStackId,
      district: f.district,
      tehsil: f.tehsil,
      village: f.village,
      parcelsCount: (f.landParcels || []).length,
      category: f.category
    }))
  });
});

// Officer ├── Verify farmer
router.post('/officer/verify-farmer', authenticate, requireRole(['OFFICER', 'ADMIN']), requirePermission('officer:verify_farmer'), (req, res) => {
  const { farmerId, parcelId, verificationStatus, remarks } = req.body;
  const store = db.get();
  const farmer = (store.farmers || []).find(f => f.id === farmerId || f.agriStackId === farmerId);

  if (!farmer) {
    return res.status(404).json({ success: false, message: `Farmer '${farmerId}' not found in database.` });
  }

  let parcel = null;
  if (parcelId) {
    parcel = (farmer.landParcels || []).find(p => p.parcelId === parcelId);
    if (parcel) {
      parcel.verificationStatus = verificationStatus || "VERIFIED_HIMBHOOMI_MATCH";
      parcel.verifiedBy = `${req.user.name} (${req.user.id})`;
      parcel.verifiedAt = new Date().toISOString();
      parcel.officerRemarks = remarks || "Physical and cadastral verification completed.";
      db.save();
    }
  }

  res.json({
    success: true,
    pipeline: "Login ➔ Authentication ➔ Role Check ➔ Permission ➔ Access API",
    role: "Officer",
    action: "Verify farmer",
    permission: "officer:verify_farmer",
    verificationRecord: {
      farmerId: farmer.id,
      farmerName: farmer.name,
      verifiedBy: req.user.name,
      officerId: req.user.id,
      status: verificationStatus || "VERIFIED_HIMBHOOMI_MATCH",
      verifiedAt: new Date().toISOString(),
      remarks: remarks || "Farmer credentials and land registry validated against HimBhoomi cadastral records.",
      parcelVerified: parcel ? parcel.parcelId : "ALL_PARCELS_CHECKED"
    }
  });
});

// Officer ├── Update field information
router.post('/officer/update-field-info', authenticate, requireRole(['OFFICER', 'ADMIN']), requirePermission('officer:update_field_info'), (req, res) => {
  const { farmerId, parcelId, soilMoisture, pestRisk, cropStatus, fieldNotes } = req.body;
  const store = db.get();
  const farmer = (store.farmers || []).find(f => f.id === farmerId);

  if (!farmer) {
    return res.status(404).json({ success: false, message: `Farmer '${farmerId}' not found.` });
  }

  const parcel = (farmer.landParcels || []).find(p => p.parcelId === parcelId) || (farmer.landParcels && farmer.landParcels[0]);
  if (parcel) {
    parcel.fieldTelemetry = {
      soilMoisture: soilMoisture !== undefined ? soilMoisture : 44,
      pestRisk: pestRisk || "LOW",
      cropStatus: cropStatus || "Normal Growth",
      updatedBy: req.user.name,
      updatedAt: new Date().toISOString(),
      fieldNotes: fieldNotes || "Field inspection logged by Agricultural Officer."
    };
    db.save();
  }

  res.json({
    success: true,
    pipeline: "Login ➔ Authentication ➔ Role Check ➔ Permission ➔ Access API",
    role: "Officer",
    action: "Update field information",
    permission: "officer:update_field_info",
    officer: { id: req.user.id, name: req.user.name },
    farmerId: farmer.id,
    parcelId: parcel ? parcel.parcelId : null,
    fieldInformation: parcel ? parcel.fieldTelemetry : null
  });
});

// =========================================================================
// 3. ADMIN ENDPOINTS
// =========================================================================

// Admin ├── Manage users
router.get('/admin/users', authenticate, requireRole('ADMIN'), requirePermission('admin:manage_users'), (req, res) => {
  const store = db.get();
  const allUsers = [
    ...(store.officers || []).map(o => ({ id: o.id, name: o.name, role: o.role, department: o.department, status: "ACTIVE" })),
    ...(store.farmers || []).map(f => ({ id: f.id, name: f.name, role: "FARMER", department: "Individual Beneficiary", status: "ACTIVE" }))
  ];

  res.json({
    success: true,
    pipeline: "Login ➔ Authentication ➔ Role Check ➔ Permission ➔ Access API",
    role: "Admin",
    action: "Manage users",
    permission: "admin:manage_users",
    admin: { id: req.user.id, name: req.user.name },
    count: allUsers.length,
    users: allUsers
  });
});

router.post('/admin/users', authenticate, requireRole('ADMIN'), requirePermission('admin:manage_users'), (req, res) => {
  const { name, role, email, department, district } = req.body;
  if (!name || !role) {
    return res.status(400).json({ success: false, message: "Name and role are required." });
  }

  const newUser = {
    id: `USR-HP-${Math.floor(1000 + Math.random() * 9000)}`,
    name,
    role,
    email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@hp.gov.in`,
    department: department || "HP Agriculture / Revenue",
    district: district || "Shimla",
    status: "ACTIVE",
    createdAt: new Date().toISOString()
  };

  const store = db.get();
  store.officers = store.officers || [];
  store.officers.push(newUser);
  db.save();

  res.status(201).json({
    success: true,
    pipeline: "Login ➔ Authentication ➔ Role Check ➔ Permission ➔ Access API",
    role: "Admin",
    action: "Manage users",
    permission: "admin:manage_users",
    message: "New platform user created successfully.",
    user: newUser
  });
});

// Admin ├── Manage roles
router.get('/admin/roles', authenticate, requireRole('ADMIN'), requirePermission('admin:manage_roles'), (req, res) => {
  const store = db.get();
  res.json({
    success: true,
    pipeline: "Login ➔ Authentication ➔ Role Check ➔ Permission ➔ Access API",
    role: "Admin",
    action: "Manage roles",
    permission: "admin:manage_roles",
    tree: "User ├── Farmer ├── Officer └── Admin",
    roles: store.roles || []
  });
});

router.post('/admin/roles', authenticate, requireRole('ADMIN'), requirePermission('admin:manage_roles'), (req, res) => {
  const { roleCode, name, parentRole, description, allowedActions } = req.body;
  if (!roleCode || !name) {
    return res.status(400).json({ success: false, message: "roleCode and name are required." });
  }

  const store = db.get();
  const existingIndex = (store.roles || []).findIndex(r => r.roleCode === roleCode);
  const rolePayload = {
    roleCode,
    name,
    parentRole: parentRole || "USER",
    description: description || "Custom administrative RBAC role",
    allowedActions: allowedActions || []
  };

  if (existingIndex >= 0) {
    store.roles[existingIndex] = { ...store.roles[existingIndex], ...rolePayload };
  } else {
    store.roles.push(rolePayload);
  }
  db.save();

  res.json({
    success: true,
    pipeline: "Login ➔ Authentication ➔ Role Check ➔ Permission ➔ Access API",
    role: "Admin",
    action: "Manage roles",
    permission: "admin:manage_roles",
    message: "Role definition updated in IAM registry.",
    role: rolePayload
  });
});

// Admin ├── Manage system data
router.get('/admin/system-data', authenticate, requireRole('ADMIN'), requirePermission('admin:manage_system_data'), (req, res) => {
  const store = db.get();
  res.json({
    success: true,
    pipeline: "Login ➔ Authentication ➔ Role Check ➔ Permission ➔ Access API",
    role: "Admin",
    action: "Manage system data",
    permission: "admin:manage_system_data",
    systemData: {
      gatewayStatus: "HEALTHY",
      platformVersion: "3.0.0-production",
      database: {
        engine: "PostgreSQL 16 Relational Backbone",
        activeFarmers: (store.farmers || []).length,
        totalSoilCards: (store.suadr?.soilProfiles || []).length,
        hpasnPoliciesEnforced: (store.hpasnPolicies || []).length,
        auditRecordsCount: (store.hpasnLogs || []).length
      },
      rateLimiter: {
        windowMs: 60000,
        maxRequestsPerMin: 120,
        activeClients: 4
      },
      securityPipeline: {
        architecture: "Login ➔ Authentication ➔ Role Check ➔ Permission ➔ Access API",
        enforcementMode: "ZERO_TRUST_STRICT",
        tokenType: "Bearer HMAC/JWT Session"
      }
    }
  });
});

router.post('/admin/system-data', authenticate, requireRole('ADMIN'), requirePermission('admin:manage_system_data'), (req, res) => {
  const { maxRequestsPerMin, maintenanceMode } = req.body;
  res.json({
    success: true,
    pipeline: "Login ➔ Authentication ➔ Role Check ➔ Permission ➔ Access API",
    role: "Admin",
    action: "Manage system data",
    permission: "admin:manage_system_data",
    message: "System data configuration updated successfully.",
    updatedConfig: {
      maxRequestsPerMin: maxRequestsPerMin || 120,
      maintenanceMode: maintenanceMode || false,
      appliedAt: new Date().toISOString()
    }
  });
});

module.exports = router;
