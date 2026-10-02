const express = require('express');
const router = express.Router();
const {
  getBloodInventory,
  getBloodRequests,
  createBloodRequest,
  updateBloodRequestStatus,
  deleteBloodRequest
} = require('../controllers/bloodController');

router.get('/inventory', getBloodInventory);
router.get('/requests', getBloodRequests);
router.post('/requests', createBloodRequest);
router.put('/requests/:id', updateBloodRequestStatus);
router.delete('/requests/:id', deleteBloodRequest);

module.exports = router;
