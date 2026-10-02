const { query } = require('../config/db');

// GET /api/notifications
const getNotifications = async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM notifications ORDER BY created_at DESC');
    const notifications = result.rows.map(n => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type,
      read: n.read,
      createdAt: n.created_at
    }));

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/notifications
const createNotification = async (req, res, next) => {
  try {
    const { title, message, type = 'info' } = req.body;

    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'title and message are required.' });
    }

    const id = `notif_${Math.random().toString(36).slice(2, 9)}`;

    const result = await query(
      `INSERT INTO notifications (id, title, message, type)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [id, title, message, type]
    );

    res.status(201).json({
      success: true,
      message: 'Notification created',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/notifications/:id/read
const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query(
      'UPDATE notifications SET read = true WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Notification ${id} not found.` });
    }

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/notifications/:id
const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM notifications WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Notification ${id} not found.` });
    }

    res.status(200).json({
      success: true,
      message: `Notification ${id} deleted successfully.`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  createNotification,
  markAsRead,
  deleteNotification
};
