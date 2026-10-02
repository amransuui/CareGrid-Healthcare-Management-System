const { query } = require('../config/db');

// GET /api/wards
const getWards = async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM wards ORDER BY name ASC');
    const wards = result.rows.map(w => ({
      id: w.id,
      name: w.name,
      prefix: w.prefix,
      bedCount: w.bed_count,
      department: w.department,
      floor: w.floor,
      type: w.type
    }));

    res.status(200).json({
      success: true,
      count: wards.length,
      data: wards
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/beds
const getBeds = async (req, res, next) => {
  try {
    const { ward, status } = req.query;
    let sql = 'SELECT * FROM beds WHERE 1=1';
    const params = [];

    if (ward) {
      params.push(ward);
      sql += ` AND ward = $${params.length}`;
    }

    if (status) {
      params.push(status);
      sql += ` AND status = $${params.length}`;
    }

    sql += ' ORDER BY number ASC';

    const result = await query(sql, params);
    const beds = result.rows.map(b => ({
      id: b.id,
      number: b.number,
      ward: b.ward,
      status: b.status,
      patientId: b.patient_id,
      lastCleaned: b.last_cleaned,
      lastUpdated: b.last_updated
    }));

    res.status(200).json({
      success: true,
      count: beds.length,
      data: beds
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/beds
const createBed = async (req, res, next) => {
  try {
    const { number, ward, status = 'available' } = req.body;

    if (!number || !ward) {
      return res.status(400).json({ success: false, message: 'Bed number and ward are required.' });
    }

    const bedId = `bed_${number.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

    const result = await query(
      `INSERT INTO beds (id, number, ward, status)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [bedId, number, ward, status]
    );

    res.status(201).json({
      success: true,
      message: 'Bed created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/beds/:id
const updateBedStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, patientId } = req.body;

    const result = await query(
      `UPDATE beds
       SET status = COALESCE($1, status),
           patient_id = $2,
           last_updated = CURRENT_TIMESTAMP
       WHERE id = $3 OR number = $3
       RETURNING *`,
      [status, patientId !== undefined ? patientId : null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Bed ${id} not found.` });
    }

    res.status(200).json({
      success: true,
      message: 'Bed updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/beds/:id
const deleteBed = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM beds WHERE id = $1 OR number = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Bed ${id} not found.` });
    }

    res.status(200).json({
      success: true,
      message: `Bed ${id} deleted successfully.`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWards,
  getBeds,
  createBed,
  updateBedStatus,
  deleteBed
};
