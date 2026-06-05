// src/routes/inventoryRoutes.js
'use strict';

const router = require('express').Router();
const ctrl   = require('../controllers/inventoryController');
const { authenticate } = require('../middleware/auth');
const { isAdmin, isOrg, roleCheck } = require('../middleware/roleCheck');
const { validate } = require('../middleware/validate');
const { inventoryValidation } = require('../utils/validators');

router.use(authenticate);

// Search across all orgs (any authenticated user)
router.get('/search', ctrl.searchInventory);

// Get inventory (org or admin)
router.get('/',               ctrl.getInventory);
router.get('/expiring',       roleCheck('blood_bank', 'hospital', 'admin'), ctrl.getExpiringStock);

// Org-level operations
router.post('/',
  isOrg,
  inventoryValidation,
  validate,
  ctrl.addStock
);

router.put('/:itemId',
  isOrg,
  ctrl.updateStock
);

router.delete('/:itemId',
  roleCheck('blood_bank', 'hospital', 'admin'),
  ctrl.deleteStock
);

router.patch('/:itemId/reserve',
  roleCheck('hospital', 'blood_bank', 'admin'),
  ctrl.reserveUnits
);

module.exports = router;