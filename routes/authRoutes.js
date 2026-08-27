const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/db');
const { verifyToken, JWT_SECRET } = require('../middleware/auth');
const { UserFactory } = require('../patterns/factory/UserAndAssessmentFactory');

// Login Route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required.' });
        }

        const user = await db.get(`SELECT * FROM users WHERE email = ?`, [email]);
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }

        // Apply Factory Method Pattern to construct user domain object with permissions
        const userDomainObject = UserFactory.createUser(user);

        // Fetch role specific ID
        let roleProfileId = null;
        if (user.role === 'TUTOR') {
            const tutor = await db.get(`SELECT id FROM tutors WHERE user_id = ?`, [user.id]);
            roleProfileId = tutor ? tutor.id : null;
        } else if (user.role === 'STUDENT') {
            const student = await db.get(`SELECT id FROM students WHERE user_id = ?`, [user.id]);
            roleProfileId = student ? student.id : null;
        } else if (user.role === 'PARENT') {
            const parent = await db.get(`SELECT id FROM parents WHERE user_id = ?`, [user.id]);
            roleProfileId = parent ? parent.id : null;
        }

        const token = jwt.sign(
            { id: user.id, name: user.name, email: user.email, role: user.role, roleProfileId },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                profileImage: user.profile_image,
                roleProfileId,
                permissions: userDomainObject.getPermissions()
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, message: 'Server error during login.' });
    }
});

// Register Route
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role, phone, specialization, institution, academicLevel, occupation } = req.body;
        
        if (!name || !email || !password || !role) {
            return res.status(400).json({ success: false, message: 'Required fields missing.' });
        }

        const existing = await db.get(`SELECT id FROM users WHERE email = ?`, [email]);
        if (existing) {
            return res.status(400).json({ success: false, message: 'Email already registered.' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.replace(/\s+/g, '')}`;

        const userRes = await db.run(
            `INSERT INTO users (name, email, password_hash, phone, role, profile_image) VALUES (?, ?, ?, ?, ?, ?)`,
            [name, email, passwordHash, phone || '', role, avatar]
        );
        const userId = userRes.id;

        let roleProfileId = null;
        if (role === 'TUTOR') {
            const tutorRes = await db.run(`INSERT INTO tutors (user_id, specialization, bio) VALUES (?, ?, ?)`, [userId, specialization || 'General', '']);
            roleProfileId = tutorRes.id;
        } else if (role === 'STUDENT') {
            const studentRes = await db.run(`INSERT INTO students (user_id, institution, academic_level) VALUES (?, ?, ?)`, [userId, institution || '', academicLevel || 'Undergraduate']);
            roleProfileId = studentRes.id;
        } else if (role === 'PARENT') {
            const parentRes = await db.run(`INSERT INTO parents (user_id, occupation) VALUES (?, ?)`, [userId, occupation || 'Guardian']);
            roleProfileId = parentRes.id;
        }

        const token = jwt.sign(
            { id: userId, name, email, role, roleProfileId },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            success: true,
            token,
            user: { id: userId, name, email, role, roleProfileId }
        });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ success: false, message: 'Server error during registration.' });
    }
});

// Current User Me Endpoint
router.get('/me', verifyToken, async (req, res) => {
    try {
        const user = await db.get(`SELECT id, name, email, phone, role, profile_image, created_at FROM users WHERE id = ?`, [req.user.id]);
        if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

        const userDomainObject = UserFactory.createUser(user);

        res.json({
            success: true,
            user: {
                ...user,
                permissions: userDomainObject.getPermissions()
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

module.exports = router;
