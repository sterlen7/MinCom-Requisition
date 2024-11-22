const nodemailer = require('nodemailer')
const expressAsyncHandler = require('express-async-handler');
const User = require('../models/userModel')


function generateCode() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

exports.sendOtp = expressAsyncHandler(async (req, res) => {
    const userId = req.params.userId;

    if (!userId) {
        return res.status(400).json({ message: 'Bad Request: No userId provided' });
    }

    try {
        const user = await User.findById(userId);
        
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
            to: user.email,
            subject: 'Minerals Commission Requisition Platform OTP Code',
            text: `Your OTP code is ${otpCode}. It will expire in 5 minutes. PLEASE DO NOT SHARE THIS WITH ANYBODY. Thank you`
        };

        await transporter.sendMail(mailOptions);

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Internal server error", error });
    }
});


  