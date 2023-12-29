const { mongoose } = require('mongoose');
const schema = mongoose.Schema

module.exports.Otp = mongoose.model('Otp', schema({
    phone: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: { expires: 30 }
    }
}, { timestamps: true}));