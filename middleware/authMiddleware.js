const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const tokenBlacklist = require("../models/tokenBlacklistModel");

const access_token = process.env.JWT_ACCESS_SECRET_KEY;

const requireSignIn = asyncHandler(async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || req.headers.Authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            console.log("Authorization header missing or invalid");
            return res.status(401).json({ message: "Invalid token. Login to continue..." });
        }

        const token = authHeader.split(" ")[1];
        console.log("Extracted token:", token);

        // Check if token is blacklisted
        const blacklistedToken = await tokenBlacklist.findOne({ token });
        if (blacklistedToken) {
            console.log("Token is blacklisted");
            return res.status(403).json({ message: "Invalid token. Login to continue..." });
        }

        // Verify token
        let decoded;
        try {
            decoded = jwt.verify(token, access_token);
            console.log("Token decoded successfully:", decoded);
        } catch (err) {
            console.log("Token verification failed:", err.message);
            return res.status(403).json({ message: "Invalid token. Login to continue..." });
        }

        const userId = decoded.userId;
        console.log("Decoded user ID:", userId);

        const user = await User.findById(userId).select('name email department role')
        if (!user) {
            console.log("User not found for ID:", userId);
            return res.status(401).json({ message: "User not found" });
        }
        console.log("User found:", user.email);

        req.auth = user;
        next();

    } catch (error) {
        console.error("Error in requireSignIn middleware:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

const isAdmin = asyncHandler(async (req, res, next) => {
    if (!req.auth) {
        console.log("Authentication missing in isAdmin");
        return res.status(401).json({ message: "Authentication required" });
    }

    console.log("User role in isAdmin:", req.auth.role);

    if (req.auth.role === 'admin' || (Array.isArray(req.auth.role) && req.auth.role.includes('admin'))) {
        next();
    } else {
        return res.status(403).json({ message: "Access denied. Admin privileges required." });
    }
});



module.exports = { requireSignIn, isAdmin };

