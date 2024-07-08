const User = require ('../models/user')
const bcrypt =require('bcrypt')


exports.createUser = async (req, res) => {
    const { name, department, email, password,  } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10); 
        
    const usernameExists = await User.findOne({username})
    const emailExists = await User.findOne({email})

    if (usernameExists) {
        return res.status(400).json({ msg: 'Username already exists' });
    }

    if(emailExists){
        return res.status(400).json({msg:"Email already exists"})
    }

        const newUser = new User({
            name,
            department,
            email,
            password: hashedPassword,
        });

        await newUser.save();

        res.status(201).json({ msg: 'User created successfully', newUser });
    } catch (error) {
        console.error('Error creating user', error);
        res.status(500).json({ msg: 'Server error' });
    }
};


exports.userLogin = async (req,res) => {
    const {email,password}=req.body 

    try{

    }catch(error){
        console.error(error)
        res.status(500).json({msg:"Internal server error"},error)
    }


}