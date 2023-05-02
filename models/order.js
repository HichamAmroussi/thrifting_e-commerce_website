const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    wilaya: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    shippingType: {
        type: String,
        required: true
    },
    articles: {
        type: String,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    isConfirmed: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;