const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const WishlistSchema = new Schema({
    userId: {
        type: String,
        required: true
    },
    items: [{
        product: {
            type: Schema.Types.ObjectId,
            ref: 'Product', 
            required: true,
        }
    }]
})

module.exports.Wishlist = mongoose.model('wishlist', WishlistSchema);