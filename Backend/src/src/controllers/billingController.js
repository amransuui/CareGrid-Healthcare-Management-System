const { query } = require('../config/db');

// Map row
const formatInvoiceRow = (row) => ({
  id: row.id,
  invoiceNumber: row.invoice_number,
  patientId: row.patient_id,
  patientName: row.patient_name,
  admissionDate: row.admission_date,
  dischargeDate: row.discharge_date,
  items: typeof row.items === 'string' ? JSON.parse(row.items) : (row.items || []),
  totalAmount: parseFloat(row.total_amount),
  paidAmount: parseFloat(row.paid_amount || 0),
  balance: parseFloat(row.balance),
  status: row.status,
  issueDate: row.issue_date
});

// GET /api/billing
const getInvoices = async (req, res, next) => {
  try {
    const { status, patientId } = req.query;
    let sql = 'SELECT * FROM billing_invoices WHERE 1=1';
    const params = [];

    if (status) {
      params.push(status);
      sql += ` AND status = $${params.length}`;
    }

    if (patientId) {
      params.push(patientId);
      sql += ` AND patient_id = $${params.length}`;
    }

    sql += ' ORDER BY issue_date DESC';

    const result = await query(sql, params);
    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows.map(formatInvoiceRow)
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/billing/:id
const getInvoiceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM billing_invoices WHERE id = $1 OR invoice_number = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Invoice ${id} not found.` });
    }

    res.status(200).json({
      success: true,
      data: formatInvoiceRow(result.rows[0])
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/billing
const createInvoice = async (req, res, next) => {
  try {
    const {
      patientId,
      patientName,
      admissionDate,
      dischargeDate,
      items = [],
      totalAmount,
      paidAmount = 0,
      status = 'pending'
    } = req.body;

    if (!patientName || totalAmount == null) {
      return res.status(400).json({ success: false, message: 'patientName and totalAmount are required.' });
    }

    const id = `inv_${Math.random().toString(36).slice(2, 9)}`;
    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const balance = totalAmount - paidAmount;

    const result = await query(
      `INSERT INTO billing_invoices (id, invoice_number, patient_id, patient_name, admission_date, discharge_date, items, total_amount, paid_amount, balance, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [id, invoiceNumber, patientId || null, patientName, admissionDate || '', dischargeDate || null, JSON.stringify(items), totalAmount, paidAmount, balance, status]
    );

    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: formatInvoiceRow(result.rows[0])
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/billing/:id
const updateInvoice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { paidAmount, status } = req.body;

    const existing = await query('SELECT * FROM billing_invoices WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Invoice ${id} not found.` });
    }

    const inv = existing.rows[0];
    const newPaidAmount = paidAmount !== undefined ? paidAmount : parseFloat(inv.paid_amount);
    const newBalance = parseFloat(inv.total_amount) - newPaidAmount;
    const newStatus = status || (newBalance <= 0 ? 'paid' : (newPaidAmount > 0 ? 'partial' : 'pending'));

    const result = await query(
      `UPDATE billing_invoices SET
        paid_amount = $1,
        balance = $2,
        status = $3
      WHERE id = $4
      RETURNING *`,
      [newPaidAmount, newBalance, newStatus, id]
    );

    res.status(200).json({
      success: true,
      message: 'Invoice updated successfully',
      data: formatInvoiceRow(result.rows[0])
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/billing/:id
const deleteInvoice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM billing_invoices WHERE id = $1 OR invoice_number = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Invoice ${id} not found.` });
    }

    res.status(200).json({
      success: true,
      message: `Invoice ${id} deleted successfully.`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice
};
