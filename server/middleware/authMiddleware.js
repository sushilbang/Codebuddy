const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    // console.log("Cookies received:", req.cookies);
    const token = req.cookies.token; // Get token from cookie
    // console.log("Token in request:", token);

    if (!token) {
        return res.status(401).json({ message: "Unauthorized - No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.log("JWT Verification Error:", error.message);
        res.status(401).json({ message: "Unauthorized - Invalid token" });
    }
};

module.exports = authMiddleware;
