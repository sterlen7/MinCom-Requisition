const Jwt = require('jsonwebtoken');
const Admin = require('../models/admin')

exports.adminAuth = async (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ msg: 'Authorization token is missing' });
    }

    try {
        const verifyToken = Jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SEC);

        const admin = await Admin.findById(verifyToken.adminId);

        if (!admin) {
            return res.status(404).json({ msg: 'You are not authorized!' });
        }

        req.admin = admin;
        next();
    } catch (err) {
        console.error('Error verifying token', err.message);
        return res.status(500).json({ msg: 'Internal server error' });
    }
};