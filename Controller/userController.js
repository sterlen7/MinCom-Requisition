const User = require ('../models/userModel')
const bcrypt =require('bcrypt')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const Requisition = require ('../models/requisition')
const expressAsyncHandler = require('express-async-handler')
const Product = require('../models/productModel')
const tokenBlacklist = require('../models/tokenBlacklistModel')


exports.createUser =expressAsyncHandler (async (req, res) => {
    const { name, department, email, password,role } = req.body;

    try {
        const saltRounds = 10
        const hashedPassword = await bcrypt.hash(password, saltRounds); 
        
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
            role,
            isVerified: false
        });

        await newUser.save();

        res.status(201).json({ msg: 'User created successfully. Please verify your email to complete registration.', newUser})
    } catch (error) {
        console.error('Error creating user', error);
        res.status(500).json({ msg: 'Server error' });
    }
})

exports.verifyAccount = expressAsyncHandler(async(req,res) => {
    const{otpCode}= req.body
    try{
        if (!otpCode) {
            return res.status(400).json({ msg: "Provide an OTP code" });
          }
      
          const existingUser = await User.findOne({ otpCode })
          if (existingUser.otpCodeExpires < Date.now()) {
            return res.status(400).json({ message: 'OTP code has expired' });
          }

          existingUser.isVerified = true
          existingUser.otpCode = undefined
          existingUser.otpCodeExpires = undefined
          
          await existingUser.save()
          res.status(200).json({msg:"Account verified successfully"})

    }catch(error){
        res.status(500).json({msg:"Internal Server Error", error})
    }
})

exports.userLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }
    
        if (!password) {
            return res.status(400).json({ message: 'Password is required' });
        }

        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User does not exist. Please sign up." })
        }
      
        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" })
        }

        const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_ACCESS_SECRET_KEY, { expiresIn: '6000s' });
        const refreshToken = jwt.sign({ userId: user._id }, process.env.JWT_REFRESH_SECRET_KEY, { expiresIn: '1d' });

        user.accessToken.push(accessToken)
        user.refreshToken.push(refreshToken)
        await user.save()
        
        return res.status(200).json({
            message: "Login successful",
            accessToken,
            refreshToken,
            role: user.role,
            isVerified:user.isVerified,
            department:user.department
        });


    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

exports.userLogout = expressAsyncHandler(async (req, res) => {
    try {
     
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ msg: "Access token required" });
        }

       
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET_KEY);

     
        const userId = decoded.userId

     
        const loggedUser = await User.findById(userId);
        if (!loggedUser) {
            return res.status(404).json({ msg: "User not found" });
        }

       
        loggedUser.accessToken = loggedUser.accessToken.filter(at => at !== token);

      
        if (req.body.refreshToken) {
            loggedUser.refreshToken = loggedUser.refreshToken.filter(rt => rt !== req.body.refreshToken);
        } else {
            loggedUser.refreshToken = [];
        }

       
        await loggedUser.save();

      
        const decodedToken = jwt.verify(token, process.env.JWT_ACCESS_SECRET_KEY);
        const expiresAt = new Date(decodedToken.exp * 1000); 

       
        const blacklistedToken = new tokenBlacklist({
            token,
            expiresAt
        });

        
        await blacklistedToken.save();

       
        res.status(200).json({ msg: "Log out successful" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error logging out", error });
    }
})


exports.forgotPassword = expressAsyncHandler(async (req, res) => {
    const { newPassword,otpCode } = req.body;
    try{
        if (!otpCode) {
            return res.status(400).json({ msg: "Provide an OTP code" });
          }
          const existingUser = await User.findOne({ otpCode })
          if (existingUser.otpCodeExpires < Date.now()) {
            return res.status(400).json({ message: 'OTP code has expired' });
          }
          const hashedPassword = await bcrypt.hash(newPassword,10)

        existingUser.password = hashedPassword
        existingUser.otpCode = undefined
        existingUser.otpCodeExpires = undefined
    
        await existingUser.save()
    
        return res.status(200).json({ message: 'Password reset successful' })
    

    }catch(error){
        res.status(500).json({msg:"Internal server error", error})
    }
})

exports.addMerch = expressAsyncHandler(async (req, res) => {
    console.log('addMerch controller reached');
    console.log('Authenticated user:', req.auth); 

    const { name, color, size, description,unitPrice,currency } = req.body;
    
    console.log('Received merchandise data:', { name, color, size, description });

    try {
        const newMerch = new Product({
            name,
            description,
            size,
            color,
            unitPrice,
            currency
        });

        const createdMerch = await newMerch.save();
        
        console.log('Merchandise created successfully:', createdMerch);
        res.status(201).json({ message: 'Merchandise created successfully', merchandise: createdMerch });
    } catch (error) {
        console.error('Error creating merchandise:', error);
        res.status(500).json({ message: "Error creating merchandise", error: error.message });
    }
})

exports.getInventory = async (req,res) => {
    try{
        const inventory = await Product.find()
        res.status(200).json(inventory)

    }catch(error){
        console.log(error,"Error fetching inventory")
        res.status(500).json({msg:"Internal server error"})
    }
}

exports.searchMerch = async (req, res) => {
    const { name } = req.body; 
    try {
        if (!name) {
            return res.status(400).json({ msg: "Please provide the name of the merchandise" });
        }

        const merch = await Product.find({ name: { $regex: new RegExp(name, 'i') } });

        if (merch.length === 0) {
            return res.status(404).json({ message: 'No product found with the specified name' });
        }

        res.status(200).json(merch);
    } catch (error) {
        console.error("Error searching for product:", error);
        res.status(500).json({ msg: "Server Error" });
    }
}

exports.createRequisition = async (req, res) => {
    try {
        const requestedBy = req.auth._id;
        console.log('Authenticated User ID:', requestedBy);

        if (!requestedBy) {
            return res.status(401).json({ msg: "Invalid token, user ID not found" });
        }

        const { products } = req.body;

        
        for (const product of products) {
            if (!product.quantityRequested) {
                return res.status(400).json({ msg: "Quantity is required for each product" });
            }
        }

        const productPromises = products.map(async ({ name, quantityRequested }) => {
            const foundProduct = await Product.findOne({ name: { $regex: new RegExp('^' + name + '$', 'i') } });
            if (!foundProduct) {
                throw new Error(`Product with name ${name} not found`);
            }
            return { product: foundProduct._id, quantityRequested };
        });

        const resolvedProducts = await Promise.all(productPromises);

        const request = new Requisition({
            products: resolvedProducts,
            requestedBy,
            status: 'pending',
            createdAt: Date.now()
        });

        await request.save();

        await request.populate('products.product', 'name');
        await request.populate('requestedBy', 'name email');

        return res.status(201).json({ msg: "Requisition created successfully", requisition: request });
    } catch (error) {
        console.error('General Error:', error);
        res.status(500).json({ msg: "Error creating requisition", error: error.message });
    }
}
exports.getAllRequisitions = async (req, res) => {
    try {
        console.log('Fetching requisitions...');
        console.log('Authenticated user:', req.auth);
        console.log('User role:', req.auth.role);

        // Check if the user is an admin
        if (!req.auth || !req.auth.role.includes('admin')) {
            console.log('Access denied. User role:', req.auth?.role);
            return res.status(403).json({ msg: "Access denied. Admin role required." });
        }

        const adminDepartment = req.auth.department;
        console.log('Admin Department:', adminDepartment);

        if (!adminDepartment) {
            console.log('Admin department not found');
            return res.status(400).json({ msg: "Admin department not specified" });
        }

        
        const usersInDepartment = await User.find({ department: adminDepartment }).select('_id');
        const userIds = usersInDepartment.map(user => user._id);

       
        const requisitions = await Requisition.find({ requestedBy: { $in: userIds } })
            .populate('products.product', 'name')
            .populate('requestedBy', 'name email department');

        console.log('Requisitions found:', requisitions.length);

        if (requisitions.length === 0) {
            console.log('No requisitions found for this department');
            return res.status(200).json({ msg: "No requisitions found for your department", requisitions: [] });
        }

        const formattedRequisitions = requisitions.map(req => ({
            _id: req._id,
            products: req.products.map(p => ({
                name: p.product?.name,
                quantity: p.quantity
            })),
            requestedBy: req.requestedBy?.name,
            requestedByDepartment: req.requestedBy?.department,
            status: req.status,
            createdAt: req.createdAt
        }));

        console.log('Returning department requisitions...');
        return res.status(200).json({ 
            msg: "Requisitions retrieved successfully", 
            userRole: req.auth.role,
            userDepartment: adminDepartment,
            requisitions: formattedRequisitions 
        });

    } catch (error) {
        console.error('Error fetching requisitions:', error);
        return res.status(500).json({ msg: "Error retrieving requisitions", error: error.message });
    }
}
exports.getMyRequisitions = expressAsyncHandler(async (req, res) => {
    try {
        const userId = req.auth._id; // Get the authenticated user's ID

        // Fetch requisitions made by the authenticated user
        const myRequisitions = await Requisition.find({ requestedBy: userId })
            .populate('products.product', 'name') 
            .select('status createdAt'); 

        if (myRequisitions.length === 0) {
            return res.status(200).json({ msg: "No requisitions found for your account", requisitions: [] });
        }

        return res.status(200).json({
            msg: "Requisitions retrieved successfully",
            requisitions: myRequisitions
        });
    } catch (error) {
        console.error('Error fetching my requisitions:', error);
        return res.status(500).json({ msg: "Error retrieving requisitions", error: error.message });
    }
})

exports.approveRequisition = expressAsyncHandler(async (req, res) => {
    const requisitionId = req.params.id;

    try {
        // the requisition and populate the requestedBy field
        const requisition = await Requisition.findById(requisitionId).populate('requestedBy', 'department');

        if (!requisition) {
            return res.status(404).json({ msg: "Requisition not found" });
        }

        
        if (req.auth.department !== requisition.requestedBy.department) {
            return res.status(403).json({ msg: "You can only approve requisitions from your department" });
        }

        if (requisition.status === 'approved') {
            return res.status(400).json({ msg: "Requisition already approved" });
        }

        requisition.status = 'approved';
        requisition.approvedBy = req.auth._id;

        await requisition.save();

        return res.status(200).json({ msg: "Requisition approved successfully", requisition });
    } catch (error) {
        console.error("Error approving requisition:", error);
        return res.status(500).json({ msg: "Error approving requisition", error: error.message });
    }
})

exports.rejectRequisition = expressAsyncHandler(async (req, res) => {
    const requisitionId = req.params.id;

    try {
        
        const requisition = await Requisition.findById(requisitionId).populate('requestedBy', 'department');

        if (!requisition) {
            return res.status(404).json({ msg: "Requisition not found" });
        }

       
        if (req.auth.department !== requisition.requestedBy.department) {
            return res.status(403).json({ msg: "You can only reject requisitions from your department" });
        }

        if (requisition.status !== 'pending') {
            return res.status(400).json({ msg: `Cannot reject requisition. Status is already ${requisition.status}` });
        }

        requisition.status = 'rejected';
        requisition.rejectedBy = req.auth._id;
        await requisition.save();

        return res.status(200).json({ msg: "Requisition rejected successfully", requisition });
    } catch (error) {
        console.error('Error rejecting requisition:', error);
        return res.status(500).json({ msg: "Error rejecting requisition", error: error.message });
    }
})

exports.grantRequisition = expressAsyncHandler(async (req, res) => {
    const requisitionId = req.params.id;
    const { grantedProducts } = req.body;

    try {
        
        if (!req.auth.role.includes('superAdmin')) {
            return res.status(403).json({ msg: "Access denied. Super Admin role required." });
        }

        
        const requisition = await Requisition.findById(requisitionId)
            .populate('products.product', 'name')
            .populate('requestedBy', 'name email department');

        if (!requisition) {
            return res.status(404).json({ msg: "Requisition not found" });
        }

        
        if (requisition.status !== 'approved') {
            return res.status(400).json({ msg: "Only approved requisitions can be granted" });
        }

        
        requisition.products = requisition.products.map(item => {
            const grantedItem = grantedProducts.find(gp => gp.productId.toString() === item.product._id.toString());
            return {
                ...item.toObject(),
                grantedQuantity: grantedItem ? grantedItem.grantedQuantity : 0
            };
        });

        requisition.status = 'granted';
        requisition.grantedBy = req.auth._id;
        requisition.grantedAt = Date.now();

        await requisition.save();

        return res.status(200).json({
            msg: "Requisition granted successfully",
            requisition: {
                _id: requisition._id,
                products: requisition.products.map(p => ({
                    name: p.product.name,
                    requestedQuantity: p.quantity,
                    grantedQuantity: p.grantedQuantity
                })),
                requestedBy: requisition.requestedBy.name,
                department: requisition.requestedBy.department,
                status: requisition.status,
                grantedAt: requisition.grantedAt
            }
        });

    } catch (error) {
        console.error('Error granting requisition:', error);
        return res.status(500).json({ msg: "Error granting requisition", error: error.message });
    }
});

exports.getPendingRequisitions = expressAsyncHandler(async (req, res) => {
    try {
        console.log('Fetching pending requisitions...');
        console.log('Admin department:', req.auth.department);

       
        if (!req.auth.role.includes('admin')) {
            return res.status(403).json({ msg: "Access denied. Admin role required." });
        }

        
        const usersInDepartment = await User.find({ department: req.auth.department }).select('_id');
        const userIds = usersInDepartment.map(user => user._id);

        const pendingRequisitions = await Requisition.find({ 
            status: 'pending',
            requestedBy: { $in: userIds }
        })
        .populate('products.product', 'name color size description')
        .populate('requestedBy', 'name email department');

        console.log('Pending requisitions fetched:', pendingRequisitions.length);

        if (pendingRequisitions.length === 0) {
            console.log('No pending requisitions found for this department');
            return res.status(200).json({ msg: "No pending requisitions found for your department", requisitions: [] });
        }

        console.log('Returning pending requisitions...');
        return res.status(200).json({ 
            msg: "Pending requisitions retrieved successfully", 
            adminDepartment: req.auth.department,
            requisitions: pendingRequisitions 
        });

    } catch (error) {
        console.error('Error fetching pending requisitions:', error);
        return res.status(500).json({ msg: "Error retrieving pending requisitions", error: error.message });
    }
})

exports.getApprovedRequisitions = expressAsyncHandler(async (req, res) => {
    try {
        console.log('Fetching approved requisitions...');
        console.log('User role:', req.auth.role);

        
        if (!req.auth.role.includes('superAdmin')) {
            return res.status(403).json({ msg: "Access denied. Super Admin role required." });
        }

        const approvedRequisitions = await Requisition.find({ status: 'approved' })
            .populate('products.product', 'name color size description')
            .populate('requestedBy', 'name email department')
            .populate('approvedBy', 'name')
            

        console.log('Approved requisitions fetched:', approvedRequisitions.length);

        if (approvedRequisitions.length === 0) {
            console.log('No granted requisitions found');
            return res.status(200).json({ msg: "No approved requisitions found", requisitions: [] });
        }

        console.log('Returning approved requisitions...');
        return res.status(200).json({ 
            msg: "Approved requisitions retrieved successfully", 
            requisitions: approvedRequisitions 
        });

    } catch (error) {
        console.error('Error fetching approved requisitions:', error);
        return res.status(500).json({ msg: "Error retrieving approved requisitions", error: error.message });
    }
})



