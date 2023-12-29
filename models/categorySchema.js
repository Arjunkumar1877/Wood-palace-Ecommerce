const mongoose = require("mongoose")
const Schema = mongoose.Schema;



const categorySchema = new Schema({
    categoryName : {
        type:String,
        trim:"true",
        uppercase:"true",
        unique: true

    },
    active:{
        type:Boolean,
        default:true
    }
})

const Category = mongoose.model("Category",categorySchema)

module.exports = Category

// // Custom middleware to fetch categories
// module.exports.fetchCategories = async (req, res, next) => {
//   try {
//     const categories = await Category.find(); // Fetch all categories
//     res.locals.categories = categories; // Make categories accessible in views
//     next();
//   } catch (error) {
//     console.error('Error fetching categories:', error);
//     next(error);
//   }
// };
