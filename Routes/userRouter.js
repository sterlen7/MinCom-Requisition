const express = require('express');
const { createUser } = require('../Controller/userController');
const validateUser = require('../middleware/userRegister');
const userRouter = express.Router();


userRouter.post('/user/register',validateUser,createUser)


module.exports = {userRouter};