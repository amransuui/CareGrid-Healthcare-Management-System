const { query } = require('../config/db');

// GET /api/organs
const getOrgans = async (req, res, next) => {
  try {
    const { status, bloodType } = req.query;
    let sql = 'SELECT * FROM organ_donations WHERE 1=1';
    const params = [];

    if (status) {
      params.push(status);
      sql += ` AND status = $${params.length}`;
    }

    if (bloodType) {
      params.push(bloodType);
      sql += ` AND blood_type = $${params.length}`;
    }

    sql += ' ORDER BY created_at DESC';

    const result = await query(sql, params);
    const organs = result.rows.map(o => ({
      id: o.id,
      organType: o.organ_type,
      donorId: o.donor_id,
      donorName: o.donor_name,
      bloodType: o.blood_type,
      preservationStart: o.preservation_start,
      maxIschemicHours: o.max_ischemic_hours,
      status: o.status,
      recipientId: o.recipient_id,
      createdAt: o.created_at
    }));

    res.status(200).json({
      success: true,
      count: organs.length,
      data: organs
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/organs
const createOrgan = async (req, res, next) => {
  try {
    const { organType, donorId, donorName, bloodType, maxIschemicHours = 24, status = 'available', recipientId } = req.body;

    if (!organType || !donorName || !bloodType) {
      return res.status(400).json({ success: false, message: 'organType, donorName, and bloodType are required.' });
    }

    const id = `org_${Math.random().toString(36).slice(2, 9)}`;

    const result = await query(
      `INSERT INTO organ_donations (id, organ_type, donor_id, donor_name, blood_type, preservation_start, max_ischemic_hours, status, recipient_id)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, $6, $7, $8)
       RETURNING *`,
      [id, organType, donorId || null, donorName, bloodType, maxIschemicHours, status, recipientId || null]
    );

    res.status(201).json({
      success: true,
      message: 'Organ record registered successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/organs/:id
const deleteOrgan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM organ_donations WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Organ record ${id} not found.` });
    }

    res.status(200).json({
      success: true,
      message: `Organ record ${id} deleted successfully.`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOrgans,
  createOrgan,
  deleteOrgan
};
