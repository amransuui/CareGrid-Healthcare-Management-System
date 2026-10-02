const express = require('express');
const router = express.Router();
const {
  getAllVitals,
  getPatientVitals,
  recordVitals,
  deleteVitals
} = require('../controllers/vitalsController');

router.get('/', getAllVitals);
router.get('/patient/:patientId', getPatientVitals);
router.post('/', recordVitals);
router.delete('/:id', deleteVitals);

module.exports = router;
