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

		
		const blacklistedToken = await tokenBlacklist.findOne({ token })
		if (blacklistedToken) {
			console.log("Token is blacklisted");
			return res.status(403).json({ message: "Invalid token. Login to continue..." })
		}
		

       
        jwt.verify(token, access_token, async (err, decoded) => {
            if (err) {
                console.log("Token verification failed", err);
                return res.sendStatus(403);
            }

           
            const userId = decoded.userId;
            console.log("Decoded user ID:", userId);

            try {
                const user = await User.findById(userId);
                if (!user) {
                    console.log("User not found for ID:", userId);
                    return res.status(401).json({ message: "User not found" });
                }
                console.log("User found:", user.email);

                req.auth = user; 
                next();
            } catch (dbError) {
                console.error("Database error when finding user:", dbError);
                return res.status(500).json({ message: "Error retrieving user data" });
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

const isAdmin = asyncHandler(async (req, res, next) => {
   
    if (!req.auth) {
        console.log("Authentication missing");
        return res.status(401).json({ message: "Authentication required" });
    }
    // Check if role is an array and includes 'admin'
    if (Array.isArray(req.auth.role) && req.auth.role.includes('admin')) {
        console.log("Admin access granted");
        next();
    } else if (req.auth.role === 'admin') {
        
        next();
    } else {
        return res.status(403).json({ message: "Access denied. Admin privileges required." });
    }
});

module.exports = { requireSignIn, isAdmin };

