const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        // Allow public access for introspection/schema stitching
        return next();
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        // Allow public access if header format is weird but no token
        return next();
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET || 'rahasia_negara_grup_b');
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).json({ message: "Invalid Token" });
    }
};

module.exports = authMiddleware;
