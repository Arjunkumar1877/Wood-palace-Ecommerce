const mongoose = require('mongoose');
const Schema =  mongoose.Schema;



const addressSchema = Schema({
    userId:{
        type: String,
        required: true,
    },
    address: [
        {
            firstName: String,
            lastName: String,
            landmark: String,
            addressDetail: String,
            state: String,
            zip: Number,
            phone: Number
        }
    ],
})

module.exports.Address = mongoose.model("Address", addressSchema);