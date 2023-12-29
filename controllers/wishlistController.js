const Cart = require("../models/cartSchema");
const Category = require("../models/categorySchema");
const { Wishlist } = require("../models/wishlistSchema");


const getCategory = async function () {
  try {
    const categories = await Category.find({active: true});
    if (categories.length > 0) {
      return categories;
    } else {
      throw new Error("Couldn't find categories");
    }
  } catch (error) {
    console.log(error.message);
  }
};

// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^//
// <                             <$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ USER SIDE $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$>                            > //
// vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv//


// <-------------------------------------------------------| RENDERING WISHLIST PAGE  ---------------------------------------------------------|>
module.exports.productAddToWishlist = async (req, res) => {
    try {
      const prodId = req.params.id;
      const userId = req.session.user._id;
  
      const wishlist = await Wishlist.findOne({ userId: userId });
      const existingProduct = wishlist
        ? wishlist.items.find((item) => item.product == prodId)
        : null;
  
      if (existingProduct) {
        console.log("Product already exists in the wishlist");
      } else {
        if (wishlist) {
          wishlist.items.push({
            product: prodId,
          });
  
          await wishlist.save();
        } else {
          const newWishlist = new Wishlist({
            userId: userId,
            items: [
              {
                product: prodId,
              },
            ],
          });
  
          await newWishlist.save();
        }
  
        console.log("Product saved to wishlist 👍👍👍👍👍👍👍");
      }
  
      res.redirect("/user/productSinglePage?id=" + prodId);
    } catch (error) {
      console.log("Try catch error in productAddToWishlist 🤷‍♀️📀🤷‍♂️");
      console.log(error.message);
      res.status(500).send("Internal Server Error"); // Add a proper error response
    }
};
  
  // <-------------------------------------------------------| RENDERING WISHLIST PAGE  ---------------------------------------------------------|>
module.exports.wishlistPage = async (req, res) => {
    try {
      const id = req.session.user._id;
      const user = req.session.user
  
      const wishlist = await Wishlist.findOne({ userId: id }).populate(
        "items.product"
      );
  
      const headCategory = await getCategory();
  
      res.render("user/wishlist", { product: wishlist, headCategory,user: user });
    } catch (error) {
      console.log("Try catch error in wishlistPage 🤷‍♀️📀🤷‍♂️");
      console.log(error.message);
    }
};
  
  // <-------------------------------------------------------| REMOVING  WISHLIST PRODUCTS  -----------------------------------------------------|>
module.exports.removeWishlistProduct = async (req, res) => {
    try {
      const id = req.session.user._id;
      const user = req.session.user;
  
      const wishlist = await Wishlist.findOne({ userId: id }).populate(
        "items.product"
      );
  
      if (wishlist) {
        var productIndex = wishlist.items.findIndex((item) => item.product._id);
      }
  
      wishlist.items.splice(productIndex, 1);
  
      await wishlist.save();
  
      res.redirect("/user/wishlist");
    } catch (error) {
      console.log("Try catch error in removeWishlistProduct 🤷‍♀️📀🤷‍♂️");
      console.log(error.message);
    }
};
 
  // <-------------------------------------------------------| REMOVING  WISHLIST PRODUCTS  -----------------------------------------------------|>
module.exports.wishlistToCart = async (req, res) => {
    try {
      const prodId = req.params.id;
      const user = req.session.user;
  
      const cart = await Cart.findOne({ userId: user._id }).populate('items.product');
      const wishlist = await Wishlist.findOne({ userId: user._id }).populate('items.product');
  
      let total = 0;
  
      if (cart) {
        total = cart.items.reduce((acc, item) => {
          return acc + item.product.price * item.quantity;
        }, 0);
      }
  
      if (cart) {
        const existingCartItem = cart.items.find((item) => item.product.equals(prodId));
  
        if (existingCartItem) {
          existingCartItem.quantity += 1;
        } else {
          cart.items.push({
            product: prodId,
            quantity: 1,
          });
        }
  
        cart.totalprice = total; 
        await cart.save(); 
        res.redirect('/user/cart');
      } else {
  
        const newCart = new Cart({
          userId: user._id,
          items: [{
            product: prodId,
            quantity: 1,
          }],
          totalprice: total,
        });
  
        await newCart.save();
        res.redirect('/user/cart');
      }
    } catch (error) {
      console.log('Try catch error in wishlistToCart  🤷‍♂️📀🤷‍♀️');
      console.log(error.message);
    }
};
  