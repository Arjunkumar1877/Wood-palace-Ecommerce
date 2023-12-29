const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const productSchema = Schema({
    name:{
        type: String,
        required: true
    },
    category:{
        type: Schema.Types.ObjectId, 
        ref: 'Category', 
        required: true,
    },
    price:{
         type: Number,
         required: true
    },
    description:{
         type: String,
         required: true
    },
    images: [
        {
          url: {
            type: String,
            required: true
          },
          altText: {
            type: String
          },
          caption: {
            type: String
          }
        }
      ],
    isFeatured: {
        type: Boolean,
        default: false,
    },
    dateCreated: {
        type: Date,
        default: Date.now,
    },
    stock: {
        type: Number,
        required: true
    }

});


module.exports.Product = mongoose.model('Product', productSchema);



// const mongoose = require('mongoose');
// const Schema = mongoose.Schema;

// const productSchema = Schema({
//     name: {
//         type: String,
//         required: true
//     },
//     category: {
//         type: Schema.Types.ObjectId,
//         ref: 'Category',
//         required: true,
//     },
//     price: {
//         type: Number,
//         required: true
//     },
//     description: {
//         type: String,
//         required: true
//     },
//     images: [
//         {
//             type: String,
//             required: true
//         }
//     ],
//     isFeatured: {
//         type: Boolean,
//         default: false,
//     },
//     dateCreated: {
//         type: Date,
//         default: Date.now,
//     },
//     stock: {
//         type: Number,
//         required: true
//     }
// });

// const Product = mongoose.model('Product', productSchema);
// module.exports = Product;
