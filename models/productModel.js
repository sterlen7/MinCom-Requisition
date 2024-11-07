const mongoose = require('mongoose');
const validator = require('validator'); 

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        minlength: [3, 'Product name must be at least 3 characters long'],
    },
    color: {
        type: String,
        required: [true, 'Color is required'],
        trim: true,
        validate: {
            validator: (value) => validator.isAlpha(value, 'en-US', { ignore: ' ' }),  
            message: 'Color must only contain alphabetic characters'
        }
    },
    size: {
        type: String,
        required: [true, 'Size is required'],
        validate: {
            validator: (value) => validator.isIn(value, ['small', 'medium', 'large', 'extra-large']), // Example sizes
            message: 'Size must be one of the following: small, medium, large, extra-large'
        }
    },
    description: {
        type: String,
        required: [true, 'Product description is required'],
        trim: true,
        minlength: [10, 'Description must be at least 10 characters long'],
        maxLength: [500, 'Description cannot exceed 500 characters']
    },
    unitPrice: {
        type: Number,
        required: [true, 'Unit price is required'],
        min: [0, 'Unit price must be a positive number'] 
    },
    currency: {
        type: String,
        default: 'GHS', 
        enum: ['GHS'], 
        required: [true, 'Currency is required']
    }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
