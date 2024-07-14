const express = require('express');
const { createAdmin, adminLogin } = require('../Controller/adminController');
const adminRouter = express.Router();


adminRouter.post('/admin/register',createAdmin)
adminRouter.post('/admin/login',adminLogin)


module.exports = {adminRouter};