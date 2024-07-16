const express = require('express');
const { createAdmin, adminLogin, addMerch } = require('../Controller/adminController');
const { validateMerch } = require('../middleware/addMerch');
const { adminAuth } = require('../middleware/adminAuth');
const adminRouter = express.Router();


adminRouter.post('/admin/register',createAdmin)
adminRouter.post('/admin/login',adminLogin)
adminRouter.post('/admin/merch',adminAuth,validateMerch,addMerch)


module.exports = {adminRouter};