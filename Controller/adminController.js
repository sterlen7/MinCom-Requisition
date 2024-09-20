const Admin = require("../models/admin");
const product = require('../models/product')
const bcrypt=require('bcrypt')
const jwt = require('jsonwebtoken')

exports.createAdmin = async (req, res) => {
    const {  email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10); 
        
    const emailExists = await Admin.findOne({email})

    if(emailExists){
        return res.status(400).json({msg:"Email already exists"})
    }

        const newAdmin = new Admin({
            email,
            password: hashedPassword
        });

        await newAdmin.save();

        res.status(201).json({ msg: 'Admin created successfully', newAdmin});
    } catch (error) {
        console.error('Error creating admin', error);
        res.status(500).json({ msg: 'Server error' });
    }
};

exports.adminLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email) {
            return res.status(400).json({ message: 'Email or username is required' });
        }

        if (!password) {
            return res.status(400).json({ msg: 'Password is required' });
        }

        const admin = await Admin.findOne({ email });

        if (!admin) {
            return res.status(404).json({ msg: "Admin does not exist" });
        }

        const isPassword = await bcrypt.compare(password, admin.password);

        if (!isPassword) {
            return res.status(401).json({ msg: "Invalid password" });
        }

        const accessToken = jwt.sign({ adminId: admin.id }, process.env.JWT_SEC, { expiresIn: '6000s' });
        res.status(200).json({ msg: "Login success", accessToken });

    } catch (error) {
        console.error('Error logging in ', error);
        res.status(500).json({ msg: "Server Error" });
    }
};


exports.addMerch=async(req,res)=>{
    const {name,color,size,description}=req.body 
    try {
        const newMerch = new product({
            name,
            description,
            size,
            color
        });

        const createdMerch = await newMerch.save();
        
        res.status(201).json(createdMerch);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }

}

