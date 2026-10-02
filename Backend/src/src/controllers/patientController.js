const { query } = require('../config/db');

// Map database row to CareGrid Patient model format
const formatPatientRow = (row) => ({
  patientId: row.patient_id,
  fullName: row.full_name,
  age: row.age,
  gender: row.gender,
  bloodGroup: row.blood_group,
  dateOfBirth: row.date_of_birth,
  phone: row.phone,
  emergencyContact: row.emergency_contact,
  admissionDate: row.admission_date ? new Date(row.admission_date).toISOString() : new Date().toISOString(),
  department: row.department,
  ward: row.ward,
  bed: row.bed,
  attendingDoctor: row.attending_doctor,
  assignedNurse: row.assigned_nurse,
  diagnosis: row.diagnosis,
  status: row.status,
  allergies: typeof row.allergies === 'string' ? JSON.parse(row.allergies) : (row.allergies || []),
  medications: typeof row.medications === 'string' ? JSON.parse(row.medications) : (row.medications || []),
  admissionType: row.admission_type,
  notes: row.notes,
  lastUpdated: row.last_updated ? new Date(row.last_updated).toISOString() : new Date().toISOString()
});

// GET /api/patients
const getPatients = async (req, res, next) => {
  try {
    const { status, department, search } = req.query;
    let sql = 'SELECT * FROM patients WHERE 1=1';
    const params = [];

    if (status) {
      params.push(status);
      sql += ` AND status = $${params.length}`;
    }

    if (department) {
      params.push(department);
      sql += ` AND department = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (full_name ILIKE $${params.length} OR patient_id ILIKE $${params.length} OR diagnosis ILIKE $${params.length})`;
    }

    sql += ' ORDER BY admission_date DESC';

    const result = await query(sql, params);
    const patients = result.rows.map(formatPatientRow);

    res.status(200).json({
      success: true,
      count: patients.length,
      data: patients
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/patients/:id
const getPatientById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM patients WHERE patient_id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Patient with ID ${id} not found.`
      });
    }

    res.status(200).json({
      success: true,
      data: formatPatientRow(result.rows[0])
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/patients
const createPatient = async (req, res, next) => {
  try {
    const {
      patientId,
      fullName,
      age,
      gender,
      bloodGroup,
      dateOfBirth,
      phone,
      emergencyContact,
      department,
      ward,
      bed,
      attendingDoctor,
      assignedNurse,
      diagnosis,
      status = 'stable',
      allergies = [],
      medications = [],
      admissionType = 'elective',
      notes = ''
    } = req.body;

    if (!fullName || !gender || !bloodGroup || !department || !ward || !bed || !attendingDoctor || !assignedNurse) {
      return res.status(400).json({
        success: false,
        message: 'Missing required patient fields (fullName, gender, bloodGroup, department, ward, bed, attendingDoctor, assignedNurse)'
      });
    }

    // Auto-generate ID if not provided
    const newId = patientId || `P-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const result = await query(
      `INSERT INTO patients (
        patient_id, full_name, age, gender, blood_group, date_of_birth,
        phone, emergency_contact, department, ward, bed, attending_doctor,
        assigned_nurse, diagnosis, status, allergies, medications,
        admission_type, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING *`,
      [
        newId,
        fullName.trim(),
        age || null,
        gender,
        bloodGroup,
        dateOfBirth || new Date().toISOString().split('T')[0],
        phone || '',
        emergencyContact || '',
        department,
        ward,
        bed,
        attendingDoctor,
        assignedNurse,
        diagnosis || '',
        status,
        JSON.stringify(allergies),
        JSON.stringify(medications),
        admissionType,
        notes
      ]
    );

    // Update bed status to occupied
    await query(
      `UPDATE beds SET status = 'occupied', patient_id = $1, last_updated = CURRENT_TIMESTAMP WHERE number = $2`,
      [newId, bed]
    );

    res.status(201).json({
      success: true,
      message: 'Patient created successfully',
      data: formatPatientRow(result.rows[0])
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/patients/:id
const updatePatient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await query('SELECT * FROM patients WHERE patient_id = $1', [id]);

    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Patient with ID ${id} not found.` });
    }

    const current = existing.rows[0];
    const update = {
      fullName: req.body.fullName ?? current.full_name,
      age: req.body.age ?? current.age,
      gender: req.body.gender ?? current.gender,
      bloodGroup: req.body.bloodGroup ?? current.blood_group,
      dateOfBirth: req.body.dateOfBirth ?? current.date_of_birth,
      phone: req.body.phone ?? current.phone,
      emergencyContact: req.body.emergencyContact ?? current.emergency_contact,
      department: req.body.department ?? current.department,
      ward: req.body.ward ?? current.ward,
      bed: req.body.bed ?? current.bed,
      attendingDoctor: req.body.attendingDoctor ?? current.attending_doctor,
      assignedNurse: req.body.assignedNurse ?? current.assigned_nurse,
      diagnosis: req.body.diagnosis ?? current.diagnosis,
      status: req.body.status ?? current.status,
      allergies: req.body.allergies ? JSON.stringify(req.body.allergies) : current.allergies,
      medications: req.body.medications ? JSON.stringify(req.body.medications) : current.medications,
      admissionType: req.body.admissionType ?? current.admission_type,
      notes: req.body.notes ?? current.notes
    };

    const result = await query(
      `UPDATE patients SET
        full_name = $1, age = $2, gender = $3, blood_group = $4, date_of_birth = $5,
        phone = $6, emergency_contact = $7, department = $8, ward = $9, bed = $10,
        attending_doctor = $11, assigned_nurse = $12, diagnosis = $13, status = $14,
        allergies = $15, medications = $16, admission_type = $17, notes = $18,
        last_updated = CURRENT_TIMESTAMP
      WHERE patient_id = $19
      RETURNING *`,
      [
        update.fullName, update.age, update.gender, update.bloodGroup, update.dateOfBirth,
        update.phone, update.emergencyContact, update.department, update.ward, update.bed,
        update.attendingDoctor, update.assignedNurse, update.diagnosis, update.status,
        update.allergies, update.medications, update.admissionType, update.notes,
        id
      ]
    );

    res.status(200).json({
      success: true,
      message: 'Patient updated successfully',
      data: formatPatientRow(result.rows[0])
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/patients/:id
const deletePatient = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if patient exists
    const existing = await query('SELECT bed FROM patients WHERE patient_id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Patient with ID ${id} not found.` });
    }

    const assignedBed = existing.rows[0].bed;

    // Delete patient (cascades to vitals and timeline)
    await query('DELETE FROM patients WHERE patient_id = $1', [id]);

    // Free up assigned bed
    if (assignedBed) {
      await query(
        `UPDATE beds SET status = 'available', patient_id = NULL, last_updated = CURRENT_TIMESTAMP WHERE number = $1`,
        [assignedBed]
      );
    }

    res.status(200).json({
      success: true,
      message: `Patient ${id} deleted successfully.`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient
};
