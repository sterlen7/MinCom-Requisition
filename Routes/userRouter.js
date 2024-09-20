const express = require('express');
const { createUser, userLogin, getInventory, searchMerch, createRequisition } = require('../Controller/userController');
const validateUser = require('../middleware/userRegister');
const { userAuth } = require('../middleware/userAuth');
const userRouter = express.Router();


userRouter.post('/user/register',validateUser,createUser)
userRouter.post('/user/login',userLogin)
userRouter.get ('/all-inventory',userAuth,getInventory)
userRouter.get('/search-inventory',userAuth,searchMerch)
userRouter.post('/create-requisition',userAuth,createRequisition)


module.exports = {userRouter};