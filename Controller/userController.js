const User = require ('../models/user')
const bcrypt =require('bcrypt')
const jwt = require('jsonwebtoken')


exports.createUser = async (req, res) => {
    const { name, department, email, password,  } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10); 
        
    const usernameExists = await User.findOne({name})
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

            if (!email) {
                return res.status(400).json({ message: 'Email or username is required' });
            }
    
            if(!password){
                return res.status(400).json({msg:'Password is required'})
            }
            const user = await User.findOne({ email });
         
           
            if (!user) {
                return res.json({ message: "User does not exist. Sign up!" });
            }
            
            const isPassword = await bcrypt.compare( password , user.password);
    
                if (!isPassword) {
                    return res.status(401).json({ msg: "Invalid credential" }); 
                } 
            const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SEC, { expiresIn: '6000s' });


            res.status(200).json({ msg: "Login success",accessToken});
    
    }catch(error){
        console.error(error)
        res.status(500).json({msg:"Internal server error"},error)
    }
} 