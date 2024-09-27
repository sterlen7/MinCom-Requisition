const mongoose = require('mongoose');
const validator = require('validator'); // Import validator

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
            validator: (value) => validator.isAlpha(value, 'en-US', { ignore: ' ' }),  // Ensures only alphabetic characters
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
        maxlength: [500, 'Description cannot exceed 500 characters']
    }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
