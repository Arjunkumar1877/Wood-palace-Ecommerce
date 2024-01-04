const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const walletSchema = Schema({
      userId: {
        type: String,
        require: true
      },
      walletBalance: {
        type: Number,
        default: 0,
        require: true
      }
})

module.exports.Wallet = mongoose.model('Wallet', walletSchema);