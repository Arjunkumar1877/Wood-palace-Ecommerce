const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bannerSchema = new Schema({
    image: {
        type: String,
        required: true
    },
    desription: {
        type: String,
        requiired: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
})

module.exports.Banner = mongoose.model('Banner', bannerSchema);