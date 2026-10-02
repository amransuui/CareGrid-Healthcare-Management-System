const express = require('express');
const router = express.Router();
const {
  getMedicines,
  addMedicine,
  updateMedicine,
  deleteMedicine,
  getPrescriptions,
  createPrescription,
  deletePrescription
} = require('../controllers/pharmacyController');

router.get('/medicines', getMedicines);
router.post('/medicines', addMedicine);
router.put('/medicines/:id', updateMedicine);
router.delete('/medicines/:id', deleteMedicine);

router.get('/prescriptions', getPrescriptions);
router.post('/prescriptions', createPrescription);
router.delete('/prescriptions/:id', deletePrescription);

module.exports = router;
