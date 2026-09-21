const db = require('../data/dbStore');

/**
 * =========================================================================
 * Security Authentication & Authorization Pipeline:
 * Login ➔ Authentication ➔ Role Check ➔ Permission ➔ Access API
 * =========================================================================
 */

/**
 * Step 1 & 2: Authentication Middleware
 * Validates Bearer token and attaches authenticated user identity to req.user
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      pipelineStep: "Authentication",
      error: "AUTH_TOKEN_MISSING",
      message: "Authorization Bearer token is required to access this API. Please log in."
    });
  }

  const token = authHeader.split(' ')[1].trim();
  const store = db.get();

  // Search officer or farmer by token identity
  let user = null;
  const officer = (store.officers || []).find(o => 
    token.includes(o.id.toLowerCase()) || token.includes(o.id)
  );

  if (officer) {
    const roleDef = (store.roles || []).find(r => r.roleCode === officer.role);
    user = {
      id: officer.id,
      name: officer.name,
      email: officer.email,
      role: officer.role,
      designation: officer.designation,
      department: officer.department,
      district: officer.district,
      permissions: officer.permissions || roleDef?.allowedActions || [],
      token
    };
  } else {
    const farmer = (store.farmers || []).find(f => 
      token.includes(f.id.toLowerCase()) || token.includes(f.id)
    );

    if (farmer) {
      const farmerRole = (store.roles || []).find(r => r.roleCode === 'FARMER');
      user = {
        id: farmer.id,
        name: farmer.name,
        role: "FARMER",
        agriStackId: farmer.agriStackId,
        phone: farmer.phone,
        district: farmer.district,
        permissions: farmerRole?.allowedActions || ["farmer:read_own", "farmer:apply_schemes", "farmer:mandi_trade"],
        token
      };
    }
  }

  if (!user) {
    return res.status(401).json({
      success: false,
      pipelineStep: "Authentication",
      error: "INVALID_TOKEN",
      message: "Session token is invalid or has been revoked in IAM registry."
    });
  }

  req.user = user;
  res.setHeader('X-Auth-Principal', user.id);
  res.setHeader('X-Auth-Role', user.role);
  next();
}

function matchesRole(userRole, allowedRole) {
  if (!userRole || !allowedRole) return false;
  const u = userRole.toUpperCase();
  const a = allowedRole.toUpperCase();
  if (a === '*' || a === 'USER') return true;
  if (u === a) return true;
  if (a === 'ADMIN' && (u === 'ADMIN' || u === 'STATE_ADMIN')) return true;
  if (a === 'OFFICER' && (u === 'OFFICER' || u.includes('OFFICER') || u === 'VILLAGE_REVENUE_OFFICER' || u === 'AGRICULTURE_OFFICER' || u === 'BANK_NODAL_OFFICER')) return true;
  if (a === 'FARMER' && u === 'FARMER') return true;
  return false;
}

/**
 * Step 3: Role Check Middleware
 * Verifies that the authenticated user has one of the required roles in the User hierarchy
 */
function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        pipelineStep: "Role Check",
        error: "UNAUTHENTICATED",
        message: "Authentication is required before checking roles."
      });
    }

    const rolesList = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    const isAdmin = matchesRole(req.user.role, 'ADMIN');
    const roleMatches = rolesList.some(r => matchesRole(req.user.role, r));

    // Admin always has superuser authority across all endpoints
    if (isAdmin || roleMatches) {
      return next();
    }

    // Role mismatch
    return res.status(403).json({
      success: false,
      pipelineStep: "Role Check",
      error: "FORBIDDEN_ROLE",
      userRole: req.user.role,
      requiredRoles: rolesList,
      message: `Access denied. Role '${req.user.role}' is not authorized to access this resource. Requires one of: [${rolesList.join(', ')}].`
    });
  };
}

/**
 * Step 4: Permission Check Middleware
 * Verifies that the authenticated user's role contains the required granular action permission
 */
function requirePermission(requiredPermission) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        pipelineStep: "Permission Check",
        error: "UNAUTHENTICATED",
        message: "Authentication is required before checking permissions."
      });
    }

    const isAdmin = matchesRole(req.user.role, 'ADMIN');
    const userPerms = req.user.permissions || [];
    const hasPermission = isAdmin || userPerms.includes('*') || userPerms.includes(requiredPermission);

    if (hasPermission) {
      res.setHeader('X-Auth-Decision', 'PERMIT');
      return next(); // Step 5: Access API
    }

    // Permission Denied
    res.setHeader('X-Auth-Decision', 'DENY');
    return res.status(403).json({
      success: false,
      pipelineStep: "Permission Check",
      error: "PERMISSION_DENIED",
      userId: req.user.id,
      userRole: req.user.role,
      requiredPermission,
      userPermissions: userPerms,
      decision: "DENY",
      message: `Access denied. User does not hold the mandatory permission: '${requiredPermission}'.`
    });
  };
}

module.exports = {
  authenticate,
  requireRole,
  requirePermission,
  matchesRole
};
