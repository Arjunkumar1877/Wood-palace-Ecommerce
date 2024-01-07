const { forEach, isTypedArray } = require("lodash");
const Cart = require("../models/cartSchema");
const Category = require("../models/categorySchema");
const { Product } = require("../models/productSchema");
const { Orders } = require("../models/orderSchema");
const { Address } = require("../models/addressSchema");

// Function to get categories
const getCategory = async function () {
  try {
    const categories = await Category.find({ active: true });
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


// <-------------------------------------------------------| RENDERING CART PAGE-----------------------------------------------|>
module.exports.cartPage = async (req, res) => {
  try {
    const user = req.session.user;

    const cart = await Cart.findOne({ userId: user._id }).populate(
      "items.product"
    );

    const headCategory = await getCategory();

    res.render("user/cart", { cart, headCategory, user: user });
  } catch (error) {
    console.log("Try catch error in CartPage 🤷‍♂️📀🤷‍♀️");
    console.log(error.message);
  }
};

// <-------------------------------------------------------| ADD PRODUCT TO THE CART-------------------------------------------|>
module.exports.ProductAddToCart = async (req, res) => {

  try {
    const prodId = req.params.id;
    const user = req.session.user;

    const cart = await Cart.findOne({ userId: user._id });

    const product = await Cart.findOne({ userId: user._id }).populate(
      "items.product"
    );

    // console.log(total_of+"❤️❤️❤️❤️❤️");

    let total = 0;

    if (product) {
      const subtotals = product.items.map((item) => {
        return {
          productId: item.product._id,
          subtotal: item.product.price * item.quantity,
        };
      });

      const subtotalPrices = subtotals.map((item) => item.subtotal);

      total = subtotalPrices.reduce((acc, item) => acc + item, 0);
    } else {
      console.log("No items in the cart");
    }

    if (cart) {
      const existingCartItem = cart.items.find((item) =>
        item.product.equals(prodId)
      );

      if (existingCartItem) {
        existingCartItem.quantity += 1;
      } else {
        cart.items.push({ product: prodId, quantity: 1 });
      }

      cart.totalprice = total;

      await cart.save();
    } else {
      const newCart = new Cart({
        userId: user._id,
        items: [{ product: prodId, quantity: 1 }],
        totalprice: total,
      });

      await newCart.save();
    }

    res.redirect("/user/productSinglePage?id=" + prodId);
  } catch (error) {
    console.log("Try catch error in ProductAddToCart 🤷‍♂️📀🤷‍♀️");
    console.log(error.message);
  }
};

// <-------------------------------------------------------| ADD PRODUCT TO THE CART-------------------------------------------|>
module.exports.ProductBuyToCart = async (req, res) => {

  try {
    const prodId = req.params.id;
    const user = req.session.user;

    const cart = await Cart.findOne({ userId: user._id });

    const product = await Cart.findOne({ userId: user._id }).populate(
      "items.product"
    );

    // console.log(total_of+"❤️❤️❤️❤️❤️");

    let total = 0;

    if (product) {
      const subtotals = product.items.map((item) => {
        return {
          productId: item.product._id,
          subtotal: item.product.price * item.quantity,
        };
      });

      const subtotalPrices = subtotals.map((item) => item.subtotal);

      total = subtotalPrices.reduce((acc, item) => acc + item, 0);
    } else {
      console.log("No items in the cart");
    }

    if (cart) {
      const existingCartItem = cart.items.find((item) =>
        item.product.equals(prodId)
      );

      if (existingCartItem) {
        existingCartItem.quantity += 1;
      } else {
        cart.items.push({ product: prodId, quantity: 1 });
      }

      cart.totalprice = total;

      await cart.save();
    } else {
      const newCart = new Cart({
        userId: user._id,
        items: [{ product: prodId, quantity: 1 }],
        totalprice: total,
      });

      await newCart.save();
    }

    res.redirect("/user/cart");
  } catch (error) {
    console.log("Try catch error in ProductAddToCart 🤷‍♂️📀🤷‍♀️");
    console.log(error.message);
  }
};

// <-------------------------------------------------------| AJAX POST REQUEST TO UPDATE CART QUANTITY-------------------------|>
module.exports.updateQuantity = async (req, res) => {
  try {
    const userId = req.session.user._id;
    const { productId, quantity, totalPrice } = req.body;

    // console.log(totalPrice + "📀📀📀📀📀📀📀📀📀📀📀📀📀📀📀📀📀📀📀📀📀📀📀📀📀📀📀");
    const cart = await Cart.findOneAndUpdate(
      { userId: userId, "items.product": productId },
      {
        $set: { "items.$.quantity": quantity, totalprice: totalPrice },
      },
      { new: true }
    );

    const prodId = await Product.findOne({ _id: productId });
    const stock = prodId.stock;

    await prodId.save();

    const user = req.session.user;
    const product = await Cart.findOne({ userId: user._id }).populate(
      "items.product"
    );

    const subtotals = product.items.map((item) => {
      return {
        productId: item.product._id,
        subtotal: item.product.price * item.quantity,
      };
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Product not found in the cart",
      });
    }

    const quantityrsp = parseInt(quantity);

    res.json({
      success: true,
      message: "Cart updated successfully",
      subtotal: subtotals,
      stock: stock,
      quantity: quantityrsp,
      prodId: productId,
    });
  } catch (error) {
    console.log("Try catch error in updateQuantity 🤷‍♂️📀🤷‍♀️");
    console.log(error.message);
  }
};

// <-------------------------------------------------------| REMOVE PRODUCTS FROM CART-----------------------------------------|>
module.exports.cartRemove = async (req, res) => {
  try {
    const productId = req.params.productId;
    const user = req.session.user;

    if (!user) {
      return res.status(401).send("User not authenticated.");
    }

    const cartItem = await Cart.findOne({ userId: user._id }).populate(
      "items.product"
    );

    if (cartItem) {
      const productIndex = cartItem.items.findIndex(
        (item) => item.product._id.toString() === productId
      );

      if (productIndex !== -1) {
        cartItem.items.splice(productIndex, 1);
        await cartItem.save();
        console.log("Product removed from the cart.");
        return res.redirect("/user/cart");
      } else {
        console.log("Product not found in the cart.");
        return res.send("Product not found in the cart.");
      }
    } else {
      console.log("User's cart not found.");
      return res.send("User's cart not found.");
    }
  } catch (error) {
    console.log("Try catch error in cartRemove 🤷‍♂️📀🤷‍♀️");
    console.log(error.message);
  }
};

// <-------------------------------------------------------| GO TO HOME FROM CART----------------------------------------------|>
module.exports.continueShopping = async (req, res) => {
  const headCategory = await getCategory();

  try {
    res.redirect("/user/home");
  } catch (error) {
    console.log("Try catch error in continueShopping 🤷‍♂️📀🤷‍♀️");
    console.log(error.message);
  }
};


















