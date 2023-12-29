const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const walletSchema = Schema({
      userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        require: true
      },
      walletBalance: {
        type: Number,
        default: 0,
        require: true
      }
})

module.exports.Wallet = mongoose.model('Wallet', walletSchema);