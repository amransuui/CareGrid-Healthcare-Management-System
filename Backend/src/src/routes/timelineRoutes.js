const express = require('express');
const router = express.Router();
const {
  getTimelineByPatientId,
  createTimelineEvent,
  deleteTimelineEvent
} = require('../controllers/timelineController');

router.get('/patient/:patientId', getTimelineByPatientId);
router.post('/', createTimelineEvent);
router.delete('/:id', deleteTimelineEvent);

module.exports = router;
