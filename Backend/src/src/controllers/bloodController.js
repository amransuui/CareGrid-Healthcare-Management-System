const { query } = require('../config/db');

// GET /api/blood/inventory
const getBloodInventory = async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM blood_inventory ORDER BY blood_group ASC');
    const inventory = result.rows.map(item => ({
      id: item.id,
      bloodGroup: item.blood_group,
      units: item.units,
      status: item.status,
      lastUpdated: item.last_updated
    }));

    res.status(200).json({
      success: true,
      count: inventory.length,
      data: inventory
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/blood/requests
const getBloodRequests = async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM blood_requests ORDER BY created_at DESC');
    const requests = result.rows.map(r => ({
      id: r.id,
      patientId: r.patient_id,
      patientName: r.patient_name,
      bloodGroup: r.blood_group,
      unitsRequested: r.units_requested,
      urgency: r.urgency,
      requestedBy: r.requested_by,
      status: r.status,
      createdAt: r.created_at
    }));

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/blood/requests
const createBloodRequest = async (req, res, next) => {
  try {
    const { patientId, patientName, bloodGroup, unitsRequested, urgency, requestedBy } = req.body;

    if (!patientName || !bloodGroup || !unitsRequested || !urgency || !requestedBy) {
      return res.status(400).json({
        success: false,
        message: 'patientName, bloodGroup, unitsRequested, urgency, and requestedBy are required.'
      });
    }

    const id = `breq_${Math.random().toString(36).slice(2, 9)}`;

    const result = await query(
      `INSERT INTO blood_requests (id, patient_id, patient_name, blood_group, units_requested, urgency, requested_by, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
       RETURNING *`,
      [id, patientId || null, patientName, bloodGroup, unitsRequested, urgency, requestedBy]
    );

    res.status(201).json({
      success: true,
      message: 'Blood request submitted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/blood/requests/:id
const updateBloodRequestStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await query(
      `UPDATE blood_requests SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Blood request ${id} not found.` });
    }

    res.status(200).json({
      success: true,
      message: 'Blood request updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/blood/requests/:id
const deleteBloodRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM blood_requests WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Blood request ${id} not found.` });
    }

    res.status(200).json({
      success: true,
      message: `Blood request ${id} deleted successfully.`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBloodInventory,
  getBloodRequests,
  createBloodRequest,
  updateBloodRequestStatus,
  deleteBloodRequest
};
