const { query } = require('../config/db');

// GET /api/timeline/patient/:patientId
const getTimelineByPatientId = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const result = await query(
      'SELECT * FROM care_timeline WHERE patient_id = $1 ORDER BY timestamp DESC',
      [patientId]
    );

    const events = result.rows.map(e => ({
      id: e.id,
      patientId: e.patient_id,
      timestamp: e.timestamp,
      event: e.event,
      department: e.department,
      author: e.author,
      authorRole: e.author_role,
      status: e.status,
      statusLabel: e.status_label
    }));

    res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/timeline
const createTimelineEvent = async (req, res, next) => {
  try {
    const { patientId, event, department, author, authorRole, status = 'completed', statusLabel = 'Completed' } = req.body;

    if (!patientId || !event || !department || !author) {
      return res.status(400).json({ success: false, message: 'patientId, event, department, and author are required.' });
    }

    const id = `evt_${Math.random().toString(36).slice(2, 9)}`;

    const result = await query(
      `INSERT INTO care_timeline (id, patient_id, event, department, author, author_role, status, status_label)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [id, patientId, event, department, author, authorRole || 'Staff', status, statusLabel]
    );

    res.status(201).json({
      success: true,
      message: 'Timeline event recorded',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/timeline/:id
const deleteTimelineEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM care_timeline WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Timeline event ${id} not found.` });
    }

    res.status(200).json({
      success: true,
      message: `Timeline event ${id} deleted successfully.`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTimelineByPatientId,
  createTimelineEvent,
  deleteTimelineEvent
};
