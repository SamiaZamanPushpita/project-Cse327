const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { verifyToken } = require('../middleware/auth');
const { notificationPublisher } = require('../patterns');

router.use(verifyToken);

// Get all users available to chat with (everyone except self)
router.get('/available-users', async (req, res) => {
    try {
        const users = await db.query(
            `SELECT id, name, email, role, profile_image FROM users WHERE id != ? ORDER BY role, name`,
            [req.user.id]
        );
        res.json({ success: true, users });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});


router.get('/conversations', async (req, res) => {
    try {
        const conversations = await db.query(
            `SELECT c.*, 
                    (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY sent_at DESC LIMIT 1) as last_message,
                    (SELECT sent_at FROM messages WHERE conversation_id = c.id ORDER BY sent_at DESC LIMIT 1) as last_message_at
             FROM conversations c 
             JOIN conversation_participants cp ON c.id = cp.conversation_id 
             WHERE cp.user_id = ? 
             ORDER BY last_message_at DESC`,
            [req.user.id]
        );

        // Fetch details of participants for each conversation
        const detailedConversations = [];
        for (const conv of conversations) {
            const participants = await db.query(
                `SELECT u.id, u.name, u.role, u.profile_image 
                 FROM conversation_participants cp 
                 JOIN users u ON cp.user_id = u.id 
                 WHERE cp.conversation_id = ? AND u.id != ?`,
                [conv.id, req.user.id]
            );
            detailedConversations.push({
                ...conv,
                otherParticipant: participants[0] || { name: 'Chat Member' }
            });
        }

        res.json({ success: true, conversations: detailedConversations });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Get Messages in Conversation
router.get('/conversations/:id/messages', async (req, res) => {
    try {
        const conversationId = req.params.id;
        const messages = await db.query(
            `SELECT m.*, u.name as sender_name, u.role as sender_role, u.profile_image as sender_avatar 
             FROM messages m 
             JOIN users u ON m.sender_id = u.id 
             WHERE m.conversation_id = ? 
             ORDER BY m.sent_at ASC`,
            [conversationId]
        );
        res.json({ success: true, messages });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Send Message
router.post('/conversations/:id/messages', async (req, res) => {
    try {
        const conversationId = req.params.id;
        const { content } = req.body;
        if (!content || !content.trim()) {
            return res.status(400).json({ success: false, message: 'Message content cannot be empty.' });
        }

        const msgRes = await db.run(
            `INSERT INTO messages (conversation_id, sender_id, content) VALUES (?, ?, ?)`,
            [conversationId, req.user.id, content]
        );

        // Notify other participants via Observer Pattern
        const otherParticipants = await db.query(
            `SELECT user_id FROM conversation_participants WHERE conversation_id = ? AND user_id != ?`,
            [conversationId, req.user.id]
        );

        for (const p of otherParticipants) {
            await notificationPublisher.notify('new_message', {
                title: `New Message from ${req.user.name}`,
                message: content.length > 50 ? content.substring(0, 50) + '...' : content,
                link: '/chat',
                userIds: [p.user_id]
            });
        }

        res.status(201).json({
            success: true,
            messageId: msgRes.id,
            data: {
                id: msgRes.id,
                conversation_id: conversationId,
                sender_id: req.user.id,
                sender_name: req.user.name,
                content,
                sent_at: new Date().toISOString()
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Start New Conversation
router.post('/conversations', async (req, res) => {
    try {
        const { targetUserId, title } = req.body;

        // Check if existing conversation exists
        const existing = await db.get(
            `SELECT c.id FROM conversations c
             JOIN conversation_participants cp1 ON c.id = cp1.conversation_id
             JOIN conversation_participants cp2 ON c.id = cp2.conversation_id
             WHERE cp1.user_id = ? AND cp2.user_id = ?`,
            [req.user.id, targetUserId]
        );

        if (existing) {
            return res.json({ success: true, conversationId: existing.id, isNew: false });
        }

        const targetUser = await db.get(`SELECT name FROM users WHERE id = ?`, [targetUserId]);

        const cRes = await db.run(`INSERT INTO conversations (title) VALUES (?)`, [title || `Chat with ${targetUser ? targetUser.name : 'User'}`]);
        const convId = cRes.id;

        await db.run(`INSERT INTO conversation_participants (conversation_id, user_id) VALUES (?, ?)`, [convId, req.user.id]);
        await db.run(`INSERT INTO conversation_participants (conversation_id, user_id) VALUES (?, ?)`, [convId, targetUserId]);

        res.status(201).json({ success: true, conversationId: convId, isNew: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
