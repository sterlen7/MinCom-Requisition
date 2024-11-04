const nodemailer = require('nodemailer')
const expressAsyncHandler = require('express-async-handler');
const User = require('../models/userModel')
const jwt = require('jsonwebtoken');


exports.sendOtp = expressAsyncHandler(async (req, res) => {

    // const token = req.headers.authorization?.split(" ")[1];
    // if (!token) {
    //     return res.status(401).json({ message: 'Authorization token is missing' });
    // }
    
    // let decoded
    // try {
    //     decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET_KEY);
    // } catch (error) {
    //     return res.status(401).json({ message: 'Invalid or expired token' });
    // }
    
    const { email } = req.body

    function generateCode() {
        return Math.floor(1000 + Math.random() * 9000).toString();
    }

    try {
        console.log(`Searching for user with email: ${email}`);

        const user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const otpCode = generateCode();
        user.otpCode = otpCode;
        user.otpCodeExpires = Date.now() + 300000; 
        await user.save();

        let transporter = nodemailer.createTransport({
            service: process.env.NODEMAILER_HOST,
            secure: true,
            port: 465,
            auth: {
                user: process.env.USER_MAIL_ID,
                pass: process.env.USER_SECRET
            }
        });

        let mailOptions = {
            from: `"No Reply" <${process.env.USER_MAIL_ID}>`,
            to: email,
            subject: 'Minerals Commission Requisition Platform OTP Code',
            text: `Your OTP code is ${otpCode}. It will expire in 5 minutes. PLEASE DO NOT SHARE THIS WITH ANYBODY. Thank you`
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({ message: 'OTP code sent successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Internal server error", error });
    }
});


  