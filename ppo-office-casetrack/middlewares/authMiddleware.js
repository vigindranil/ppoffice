const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

exports.verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]; // Extract token from Authorization header

    if (!token) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET); // Verify token
        req.user = decoded; // Attach decoded user data to the request object
        next();
    } catch (err) {
        return res.status(403).json({ error: "Invalid token." });
    }
};
