// middleware/auth.js
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    let token = null;

    if (req.headers.authorization) {
        if (req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        } else {
            token = req.headers.authorization;
        }
    } else if (req.headers['x-access-token']) {
        token = req.headers['x-access-token'];
    } else if (req.headers.cookie) {
        const cookies = req.headers.cookie.split(';');
        for (let c of cookies) {
            const [key, value] = c.trim().split('=');
            if (key === 'token') {
                token = value;
                break;
            }
        }
    }

    if (!token) {
        return res.status(403).json({ message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mysecretkey123');
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

const checkRole = (role) => {
    return (req, res, next) => {
        if (!req.user || req.user.role !== role) {
            return res.status(403).json({ message: "Access denied. Insufficient permissions." });
        }
        next();
    };
};

module.exports = {
    verifyToken,
    checkRole
};
