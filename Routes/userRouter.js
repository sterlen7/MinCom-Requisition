const express = require('express');
const { createUser, userLogin, getInventory, searchMerch, createRequisition, addMerch ,getAllRequisitions} = require('../Controller/userController');
const { isAdmin,requireSignIn } = require('../middleware/authMiddleware');



const userRouter = express.Router();


userRouter.post('/user/register',createUser)
userRouter.post('/user/login',userLogin)

userRouter.post('/add-merch', isAdmin,addMerch)
userRouter.get ('/all-inventory',getInventory)
userRouter.get('/search-inventory',requireSignIn,searchMerch)


userRouter.post('/create-requisition',requireSignIn,createRequisition)
userRouter.get('/all-requisitions',isAdmin,getAllRequisitions)



module.exports = userRouter

