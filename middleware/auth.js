const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'tms_super_secret_jwt_key_cse327_2026';

function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ success: false, message: 'Invalid or expired token.' });
    }
}

function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Forbidden. Role '${req.user ? req.user.role : 'Guest'}' is not authorized. Allowed: [${roles.join(', ')}]`
            });
        }
        next();
    };
}

module.exports = {
    verifyToken,
    requireRole,
    JWT_SECRET
};
