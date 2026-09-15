const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your-super-secret-key-change-this-in-production';

module.exports = function (req, res, next) {
    // Get token from header
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Adds user info (id, role) to the request object
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};
