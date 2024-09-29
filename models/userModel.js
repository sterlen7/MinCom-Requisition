const mongoose = require('mongoose');
const validator = require('validator'); 

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Name must be at least 3 characters long'],
    },
    department: {
        type: String,
        required: [true, 'Department is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        validate: {
            validator: (value) => validator.isEmail(value),  // Use validator to check email format
            message: 'Please enter a valid email address'
        }
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long'],
        validate: {
            validator: (value) => validator.isStrongPassword(value, {
                minLength: 6,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 0,
            }),  
            message: 'Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number'
        }
    },
    role: {
        type: [String],
        default: ["employee"],
        enum: ["employee", "admin", ],
      },
    isActive: {
        type: Boolean,
        default: true
    },
    refreshToken: [String],
	accessToken :[String],
    
    lastLogin: {
        type: Date
    }
}, {
    timestamps: true
});

// Method to exclude password when converting to JSON
userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password; 
    return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
