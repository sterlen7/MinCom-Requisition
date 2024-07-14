const express = require('express');
const { createUser, userLogin } = require('../Controller/userController');
const validateUser = require('../middleware/userRegister');
const userRouter = express.Router();


userRouter.post('/user/register',validateUser,createUser)
userRouter.post('/user/login',userLogin)


module.exports = {userRouter};