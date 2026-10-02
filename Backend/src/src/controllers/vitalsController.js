const { query } = require('../config/db');

const formatVitalsRow = (row) => ({
  id: row.id,
  patientId: row.patient_id,
  recordedAt: row.recorded_at ? new Date(row.recorded_at).toISOString() : new Date().toISOString(),
  heartRate: row.heart_rate,
  systolic: row.systolic,
  diastolic: row.diastolic,
  temperature: parseFloat(row.temperature),
  spo2: row.spo2,
  respiratoryRate: row.respiratory_rate,
  notes: row.notes,
  recordedBy: row.recorded_by
});

// GET /api/vitals
const getAllVitals = async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM vitals ORDER BY recorded_at DESC');
    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows.map(formatVitalsRow)
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/vitals/patient/:patientId
const getPatientVitals = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const result = await query(
      'SELECT * FROM vitals WHERE patient_id = $1 ORDER BY recorded_at DESC',
      [patientId]
    );

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows.map(formatVitalsRow)
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/vitals
const recordVitals = async (req, res, next) => {
  try {
    const {
      patientId,
      heartRate,
      systolic,
      diastolic,
      temperature,
      spo2,
      respiratoryRate,
      notes,
      recordedBy
    } = req.body;

    if (!patientId || heartRate == null || systolic == null || diastolic == null || temperature == null || spo2 == null || respiratoryRate == null || !recordedBy) {
      return res.status(400).json({
        success: false,
        message: 'Missing required vitals fields (patientId, heartRate, systolic, diastolic, temperature, spo2, respiratoryRate, recordedBy)'
      });
    }

    const vitalsId = `vit_${Math.random().toString(36).slice(2, 9)}`;

    const result = await query(
      `INSERT INTO vitals (id, patient_id, heart_rate, systolic, diastolic, temperature, spo2, respiratory_rate, notes, recorded_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [vitalsId, patientId, heartRate, systolic, diastolic, temperature, spo2, respiratoryRate, notes || '', recordedBy]
    );

    res.status(201).json({
      success: true,
      message: 'Vitals recorded successfully',
      data: formatVitalsRow(result.rows[0])
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/vitals/:id
const deleteVitals = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM vitals WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Vitals record ${id} not found.` });
    }

    res.status(200).json({
      success: true,
      message: `Vitals record ${id} deleted successfully.`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllVitals,
  getPatientVitals,
  recordVitals,
  deleteVitals
};
