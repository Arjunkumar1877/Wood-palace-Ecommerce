const mongoose = require('mongoose');
const schema = mongoose.Schema;

const transactionSchema = new schema({
    userId: {
        type: String,
        required: true

    },
    transaction: [
        {
        mode: {
        type: String,
        required: true,
    },
    amount:{
       type: Number,
       required: true
    },
    time: {
       type: Date,
       default: Date.now
    }
}
]
})

module.exports.Transaction =  mongoose.model('Transaction', transactionSchema);