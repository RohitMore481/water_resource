const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = 'smart_water_secret_key_123';

router.post('/register', async (req, res) => {
    const { username, password, role, fullName, email, phone, pipelineId } = req.body;
    try {
        const _db = db.getDB();
        const existing = await _db.get('SELECT id FROM users WHERE username = ?', [username]);
        if (existing) return res.status(400).json({ error: 'Username already exists' });

        if (!phone) return res.status(400).json({ error: 'Phone number is required for SMS alerts' });

        const hashedPassword = await bcrypt.hash(password, 10);
        await _db.run(
            'INSERT INTO users (username, password, role, full_name, email, phone, pipeline_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [username, hashedPassword, role || 'citizen', fullName, email, phone, pipelineId]
        );
        res.json({ success: true, message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/login', async (req, res) => {
    const { username, password, captchaAnswer, captchaQuestion } = req.body;

    // Simple CAPTCHA validation
    if (parseInt(captchaAnswer) !== eval(captchaQuestion)) {
        return res.status(400).json({ error: 'Incorrect CAPTCHA answer' });
    }

    try {
        const _db = db.getDB();
        const user = await _db.get('SELECT * FROM users WHERE username = ?', [username]);

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, role: user.role, username: user.username });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
