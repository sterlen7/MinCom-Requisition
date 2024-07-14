const mongoose = require('mongoose')

const adminSchema = new mongoose.Schema({
    email :{type :String , required:true},
    password :{type :String , required:true},
    admin:{type:Boolean, default:true}
})

const Admin = mongoose.model ('Admin', adminSchema)

module.exports = Admin