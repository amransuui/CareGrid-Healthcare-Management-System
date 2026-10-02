const { query } = require('../config/db');

// GET /api/pharmacy/medicines
const getMedicines = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    let sql = 'SELECT * FROM medicines WHERE 1=1';
    const params = [];

    if (category) {
      params.push(category);
      sql += ` AND category = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (name ILIKE $${params.length} OR generic_name ILIKE $${params.length})`;
    }

    sql += ' ORDER BY name ASC';

    const result = await query(sql, params);
    const medicines = result.rows.map(m => ({
      id: m.id,
      name: m.name,
      genericName: m.generic_name,
      category: m.category,
      stock: m.stock,
      unit: m.unit,
      minThreshold: m.min_threshold,
      price: parseFloat(m.price),
      expiryDate: m.expiry_date
    }));

    res.status(200).json({
      success: true,
      count: medicines.length,
      data: medicines
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/pharmacy/medicines
const addMedicine = async (req, res, next) => {
  try {
    const { name, genericName, category, stock, unit, minThreshold = 10, price, expiryDate } = req.body;

    if (!name || stock == null || !unit || price == null) {
      return res.status(400).json({ success: false, message: 'name, stock, unit, and price are required.' });
    }

    const id = `med_${Math.random().toString(36).slice(2, 9)}`;

    const result = await query(
      `INSERT INTO medicines (id, name, generic_name, category, stock, unit, min_threshold, price, expiry_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [id, name, genericName || '', category || '', stock, unit, minThreshold, price, expiryDate || '']
    );

    res.status(201).json({
      success: true,
      message: 'Medicine added successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/pharmacy/medicines/:id
const updateMedicine = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, genericName, category, stock, unit, minThreshold, price, expiryDate } = req.body;

    const result = await query(
      `UPDATE medicines SET
        name = COALESCE($1, name),
        generic_name = COALESCE($2, generic_name),
        category = COALESCE($3, category),
        stock = COALESCE($4, stock),
        unit = COALESCE($5, unit),
        min_threshold = COALESCE($6, min_threshold),
        price = COALESCE($7, price),
        expiry_date = COALESCE($8, expiry_date)
      WHERE id = $9
      RETURNING *`,
      [name, genericName, category, stock, unit, minThreshold, price, expiryDate, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Medicine ${id} not found.` });
    }

    res.status(200).json({
      success: true,
      message: 'Medicine updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/pharmacy/medicines/:id
const deleteMedicine = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM medicines WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Medicine ${id} not found.` });
    }

    res.status(200).json({
      success: true,
      message: `Medicine ${id} deleted successfully.`
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/pharmacy/prescriptions
const getPrescriptions = async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM prescriptions ORDER BY date DESC');
    const prescriptions = result.rows.map(p => ({
      id: p.id,
      patientId: p.patient_id,
      patientName: p.patient_name,
      doctorName: p.doctor_name,
      items: typeof p.items === 'string' ? JSON.parse(p.items) : (p.items || []),
      status: p.status,
      date: p.date
    }));

    res.status(200).json({
      success: true,
      count: prescriptions.length,
      data: prescriptions
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/pharmacy/prescriptions
const createPrescription = async (req, res, next) => {
  try {
    const { patientId, patientName, doctorName, items = [], status = 'active' } = req.body;

    if (!patientName || !doctorName) {
      return res.status(400).json({ success: false, message: 'patientName and doctorName are required.' });
    }

    const id = `rx_${Math.random().toString(36).slice(2, 9)}`;

    const result = await query(
      `INSERT INTO prescriptions (id, patient_id, patient_name, doctor_name, items, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [id, patientId || null, patientName, doctorName, JSON.stringify(items), status]
    );

    res.status(201).json({
      success: true,
      message: 'Prescription created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/pharmacy/prescriptions/:id
const deletePrescription = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM prescriptions WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Prescription ${id} not found.` });
    }

    res.status(200).json({
      success: true,
      message: `Prescription ${id} deleted successfully.`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMedicines,
  addMedicine,
  updateMedicine,
  deleteMedicine,
  getPrescriptions,
  createPrescription,
  deletePrescription
};
