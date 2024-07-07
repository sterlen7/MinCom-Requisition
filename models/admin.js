const mongoose = require('mongoose')

const adminSchema = new Admin ({
    name:{type:String, required:true},
    mincomEmail :{type :String , required:true},
    password :{type :String , required:true},
    role:{type:String ,  enum:['Admin'],required:true}
})

const Admin = mongoose.model ('Admin', adminSchema)

module.exports = Admin