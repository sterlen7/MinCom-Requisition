const express = require('express');
const { createUser, userLogin, getInventory, searchMerch, createRequisition, addMerch ,getAllRequisitions, approveRequisition, rejectRequisition, getPendingRequisitions} = require('../Controller/userController');
const { isAdmin,requireSignIn } = require('../middleware/authMiddleware');



const userRouter = express.Router();


userRouter.post('/user/register',createUser)
userRouter.post('/user/login',userLogin)

userRouter.post('/add-merch', isAdmin,addMerch)
userRouter.get ('/all-inventory',getInventory)
userRouter.get('/search-inventory',requireSignIn,searchMerch)


userRouter.post('/create-requisition',requireSignIn,createRequisition)
userRouter.get('/requisitions', requireSignIn, isAdmin, getAllRequisitions)
userRouter.put('/requisitions/:id/approve', requireSignIn, isAdmin, approveRequisition)
userRouter.put('/requisitions/:id/reject', requireSignIn, isAdmin, rejectRequisition)
userRouter.get('/pending-requisitions', requireSignIn, isAdmin, getPendingRequisitions)



module.exports = userRouter

