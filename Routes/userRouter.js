const express = require('express');
const { createUser, userLogin, userLogout,getInventory, searchMerch, createRequisition, addMerch ,getAllRequisitions, approveRequisition, rejectRequisition, getPendingRequisitions, getApprovedRequisitions, verifyAccount,forgotPassword} = require('../Controller/userController');
const { isAdmin,requireSignIn, isSuperAdmin } = require('../middleware/authMiddleware');
const { sendOtp } = require('../utils/verificationCode');
const { forgotPasswordOtp } = require('../utils/forgotPasswordOtp');


const userRouter = express.Router();


userRouter.post('/user/register',createUser)
userRouter.post('/user/login',userLogin)
userRouter.post('/user/logout',requireSignIn,userLogout)
userRouter.post('/user/forgot-password',forgotPassword)

userRouter.post('/user/send-otp/:userId',requireSignIn,sendOtp)
userRouter.post('/user/verify-otp',verifyAccount)

userRouter.post('/user/otp-request',forgotPasswordOtp)


userRouter.get ('/all-inventory',getInventory)
userRouter.get('/search-inventory',requireSignIn,searchMerch)
userRouter.post('/add-merch', requireSignIn,isAdmin,addMerch)


userRouter.post('/create-requisition',requireSignIn,createRequisition)
userRouter.get('/requisitions', requireSignIn, isAdmin, getAllRequisitions)
userRouter.put('/requisitions/:id/approve', requireSignIn, isAdmin, approveRequisition)
userRouter.put('/requisitions/:id/reject', requireSignIn, isAdmin, rejectRequisition)
userRouter.get('/pending-requisitions', requireSignIn, isAdmin, getPendingRequisitions)


//super admin routes
userRouter.get('/approved-requisitions', requireSignIn, isSuperAdmin,getApprovedRequisitions)


module.exports = userRouter