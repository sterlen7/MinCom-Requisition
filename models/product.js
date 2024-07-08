const mongoose = require ('mongoose')

const productSchema = new mongoose.Product({
    name:{type:String , required:true},
    color:{type:String ,required:true},
    size:{type:String,required:true},
    description:{type:String , required:true}
})

const Product = mongoose.model('Product', productSchema)

module.exports = Product