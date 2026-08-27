const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

// Get User Notifications
router.get('/', async (req, res) => {
    try {
        const notifications = await db.query(
            `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20`,
            [req.user.id]
        );
        const unreadCount = notifications.filter(n => !n.is_read).length;
        res.json({ success: true, notifications, unreadCount });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Mark Notification as Read
router.put('/:id/read', async (req, res) => {
    try {
        await db.run(
            `UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?`,
            [req.params.id, req.user.id]
        );
        res.json({ success: true, message: 'Notification marked as read.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Mark All as Read
router.put('/read-all', async (req, res) => {
    try {
        await db.run(
            `UPDATE notifications SET is_read = 1 WHERE user_id = ?`,
            [req.user.id]
        );
        res.json({ success: true, message: 'All notifications marked as read.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
