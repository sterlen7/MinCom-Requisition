const mongoose = require('mongoose')

const userSchema = new User ({
    name :{type:String , required:true, unique:true},
    department:{type:String ,required:true},
    mincomEmail :{type:String ,required : true},
    password :{type: String , required : true},
    role:{ type: String, enum: ['employee'], required: true }
})

const User =  mongoose.model('User',userSchema)

module.exports = User