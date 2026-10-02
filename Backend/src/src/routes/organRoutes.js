const express = require('express');
const router = express.Router();
const {
  getOrgans,
  createOrgan,
  deleteOrgan
} = require('../controllers/organController');

router.get('/', getOrgans);
router.post('/', createOrgan);
router.delete('/:id', deleteOrgan);

module.exports = router;
