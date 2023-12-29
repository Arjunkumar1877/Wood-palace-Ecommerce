const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const couponSchema = new Schema({
    couponCode: {
        type: String,
        required: true,
        unique: true
    },
    active: {
        type: Boolean,
        default: true
    },
    discountPercentage: {
        type: Number,
        required: true,

    },
    startDate: {
        type: Date,
        required: true,
        default: Date.now()
    },
    expirationDate: {
        type: Date,
        required: true,

    },
    expired: {
        type: Boolean,
        default: false
    }
});




module.exports.Coupon = mongoose.model('coupon', couponSchema);