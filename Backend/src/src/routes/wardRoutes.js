const express = require('express');
const router = express.Router();
const {
  getWards,
  getBeds,
  createBed,
  updateBedStatus,
  deleteBed
} = require('../controllers/wardController');

router.get('/wards', getWards);
router.get('/beds', getBeds);
router.post('/beds', createBed);
router.put('/beds/:id', updateBedStatus);
router.delete('/beds/:id', deleteBed);

module.exports = router;
