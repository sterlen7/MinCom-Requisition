const mongoose = require ('mongoose')

const requisitionSchema = new mongoose.Requisition({
    products: [{
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true }
    }],
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    requestedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
});

const Requisition = mongoose.model('Requisition', requisitionSchema);
