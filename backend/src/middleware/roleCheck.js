// src/middleware/roleCheck.js
const { errorResponse } = require('../utils/apiResponse');

/**
 * Allow only specific roles through.
 * Usage: roleCheck('admin', 'hospital')
 */
const roleCheck = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Authentication required.', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(
        res,
        `Access denied. Required role(s): ${allowedRoles.join(', ')}. Your role: ${req.user.role}`,
        403
      );
    }

    next();
  };
};

/**
 * Allow only verified donors / organisations.
 */
const requireVerified = (req, res, next) => {
  if (!req.user?.isVerified) {
    return errorResponse(
      res,
      'Account verification required. Please complete your profile and wait for admin approval.',
      403
    );
  }
  next();
};

/**
 * Allow the owner of a resource OR an admin.
 * The route must set `req.resourceOwnerId`.
 */
const ownerOrAdmin = (req, res, next) => {
  if (req.user?.role === 'admin') return next();

  if (req.user?.uid !== req.resourceOwnerId) {
    return errorResponse(res, 'Access denied. You can only access your own resources.', 403);
  }

  next();
};

// Convenience role shortcuts
const isAdmin      = roleCheck('admin');
const isDonor      = roleCheck('donor', 'admin');
const isHospital   = roleCheck('hospital', 'admin');
const isBloodBank  = roleCheck('blood_bank', 'admin');
const isOrg        = roleCheck('hospital', 'ngo', 'blood_bank', 'admin');
const isAnyAuth    = roleCheck('user', 'donor', 'hospital', 'ngo', 'blood_bank', 'admin');

module.exports = {
  roleCheck,
  requireVerified,
  ownerOrAdmin,
  isAdmin,
  isDonor,
  isHospital,
  isBloodBank,
  isOrg,
  isAnyAuth,
};