const mongoose = require('mongoose');
const schema = mongoose.Schema


const walletSchema = new schema({
    userId: {
        type: String,
        required: true
    },
    walletBalance: {
        type:Number,
        default: 0
    }
})

module.exports.Wallet = mongoose.model('Wallet', walletSchema);