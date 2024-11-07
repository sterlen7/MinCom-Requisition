const nodemailer = require('nodemailer');
const User = require('../models/userModel');

function generateCode() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

exports.forgotPasswordOtp = async (req, res) => {
    const { email } = req.body

    try {
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const otpCode = generateCode();
        user.otpCode = otpCode;
        user.otpCodeExpires = Date.now() + 300000; // Expires in 5 minutes
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
            html: `Your OTP code to reset your password is <strong style="color: red;">${otpCode}</strong>. It will expire in <strong = "color:red">5 minutes</strong>. Please do not share this code.`
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({ message: 'OTP code sent successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Internal server error", error });
    }
};
