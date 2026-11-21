// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const appEvents = require('../events/eventEmitter');

router.post('/signup', async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists with this email" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            role: role || 'user'
        });

        appEvents.emit('user_registered', newUser);

        return res.status(201).json({
            message: "User registered",
            id: newUser._id.toString(),
            username: newUser.username,
            email: newUser.email
        });
    } catch (err) {
        return res.status(500).json({ message: "Server error", error: err.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            {
                id: user._id.toString(),
                username: user.username,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET || 'mysecretkey123',
            { expiresIn: '24h' }
        );

        appEvents.emit('user_login', user);

        return res.status(200).json({
            message: "Login successful",
            token: token
        });
    } catch (err) {
        return res.status(500).json({ message: "Server error", error: err.message });
    }
});

module.exports = router;
