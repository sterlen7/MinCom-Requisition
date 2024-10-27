const mongoose = require('mongoose');
const validator = require('validator');

const requisitionSchema = new mongoose.Schema({
    products: [{
        product: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Product', 
            required: [true, 'Product is required'] 
        },
        quantity: { 
            type: Number, 
            required: [true, 'Quantity is required'],
            min: [1, 'Quantity must be at least 1'], 
            validate: {
                validator: Number.isInteger,
                message: 'Quantity must be an integer'
            }
        }
    }],
    status: { 
        type: String, 
        enum: ['pending', 'approved', 'rejected','granted'], 
        default: 'pending',
        required: [true, 'Status is required']
    },
    requestedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: [true, 'Requestor is required'] 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvedAt: {
        type: Date
    },
    rejectedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    requestedByDepartment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'department',
    },
    rejectedAt: {
        type: Date
    },
    rejectionReason: {
        type: String
    }
});

const Requisition = mongoose.model('Requisition', requisitionSchema);

module.exports = Requisition;



