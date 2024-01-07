// const { pdfMake } = require("../middlewares/invoice");
const { Address } = require("../models/addressSchema");
const Cart = require("../models/cartSchema");
const Category = require("../models/categorySchema");
const { Orders } = require("../models/orderSchema");
const { Product } = require("../models/productSchema");
const { User } = require("../models/userModel");
const { Wallet } = require("../models/walletSchema");
const { addAddress } = require("./addressController");
const { RAZORPAY_SECRET_KEY,  RAZORPAY_ID_KEY } = process.env;
const Razorpay = require('razorpay');
var easyinvoice = require('easyinvoice');
const { Transaction } = require("../models/walletTransactionSchema");
var instance = new Razorpay({
  key_id: RAZORPAY_ID_KEY,
  key_secret: RAZORPAY_SECRET_KEY,
});

// Function to get categories
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
// <                             $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$  USER SIDE $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$>                            > //
// vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv//

// <-------------------------------------------------------| FROM CART TO ADDRESS SELECTION FOR CHECKOUT-------------------------------|>
module.exports.checkoutPage = async (req, res) => {
  try {
    const userId = req.session.user;
    const headCategory = await getCategory();
    // const user = await User.findById(userId);

    const cart = await Cart.findOne({ userId: userId._id }).populate(
      "items.product"
    );
    const cartId = await Cart.findOne({ userId: userId._id });
    const addressSchema = await Address.findOne({ userId: userId._id });
    const wallet = await Wallet.findOne({userId: userId._id})

    // console.log(addressSchema+ "💕💕💕💕💕💕💕💕💕💕💕💕💕💕💕💕💕");

    res.render("user/checkoutPage", {
      headCategory,
      address: addressSchema,
      cart,
      cartId: cartId,
      user: userId,
      wallet: wallet
    });
  } catch (error) {
    console.log('Try catch error in checkoutPage 🤷‍♂️📀🤷‍♀️');
    console.log(error.message);
  }
};

// <-------------------------------------------------------| AJAX POST REQUEST TO ADD THE ADDRESS SELECTED TO DATABASE-----------------|>
module.exports.checkoutAjaxAddress = async (req, res) => {
  try {
    const addressIndex = req.body.selectedAddress;
    const orderTotal = req.body.orderTotal;
    const payment = req.body.payment;
    const userId = req.session.user._id;
    const totalAmount = req.body.totalAmount;

    const cart = await Cart.findOne({ userId: userId }).populate("items.product");
    const cart1 = await Cart.findOne({ userId: userId });
    const addressSchema = await Address.findOne({ userId: userId });

    if (!cart) {
      console.log("Cart is not available");
    }

    const index = addressSchema.address[addressIndex];

    const items = cart.items.map((item) => ({
      name: item.product.name,
      price: item.product.price,
      prodId: item.product._id,
      image: item.product.images[0].url,
      quantity: item.quantity,
    }));

    const orderSave = new Orders({
      userId: userId,
      items: items,
      address: index,
      totalprice: orderTotal,
      totalAmount: totalAmount,
      totalPaid: orderTotal,
      PaymentMethod: payment,
    });

    await orderSave.save();

    const newOrder = orderSave._id;

    console.log(orderSave)



    const order = await Orders.find({ userId: userId });

    if(orderSave.PaymentMethod === 'COD'){
      const codSuccess = true;
      res.send({codSuccess, id: newOrder})
    }else if(orderSave.PaymentMethod === 'Razorpay'){
     console.log("raxorpay 🙌🙌🙌🙌🙌📀📀");
     res.send({newOrderId: newOrder})

    }


  } catch (error) {
    console.log('Try catch error in checkoutAjaxAddress  🤷‍♂️📀🤷‍♀️');
    console.log(error.message);
  }
};

// <-------------------------------------------------------| AJAX POST REQUEST FOR PAYMENT INTEGRATION --------------------------------|>
module.exports.PaymentCheckout = async(req,res)=>{
  
try {
  const orderId = req.body.orderId;


  const newOrder = await Orders.findById(orderId);
  console.log(newOrder + "⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔⛔🔥");
  var options = {
    amount: newOrder.totalprice * 100,  // amount in the smallest currency unit
    currency: "INR",
    receipt: "razorUser@gmail.com"
  };
  instance.orders.create(options, function(err, order) {

    console.log(order);
    res.send(order)

  });
} catch (error) {
  console.log('Try catch error in PaymentCheckout  🤷‍♂️📀🤷‍♀️');
  console.log(error.message);
}

}

// <-------------------------------------------------------| VERIFYING RAZORPAY  PAYMENT INTEGRATION ----------------------------------|>
module.exports.verifyPayment = async (req, res) => {
  try {
    console.log(req.body, "Success of order 📀📀📀📀📀📀😁😁❤️❤️");
    const orderId = req.body.orderId;
    const details = req.body;

    const secretKey = "NJ4IKSGVgg4nSohvEX3RPxw8"; 
const crypto = require("crypto"); 


    const hmac = crypto.createHmac("sha256", secretKey);
    hmac.update(
      details['payment[razorpay_order_id]'] +
        "|" +
        details['payment[razorpay_payment_id]']
    );
    const calculatedHmac = hmac.digest("hex");

    console.log(calculatedHmac, "HMAC calculated");

    if (calculatedHmac === details['payment[razorpay_signature]']) {
      await Orders.updateOne(
        { _id: orderId },
        {
          $set: {
            paymentstatus: "placed",
          },
        }
      );

      console.log("Payment is successful");
      res.json({ status: true });
    } else {
      await Orders.updateOne(
        { _id: orderId },
        {
          $set: {
            paymentstatus: "failed",
          },
        }
      );

      console.log("Payment is failed");
      res.json({ status: false, errMsg: "Payment verification failed" });
    }
  } catch (error) {
    console.log('Try catch error in verifyPayment  🤷‍♂️📀🤷‍♀️');
    console.log(error.message);
  }
};

// <-------------------------------------------------------| PLACE ORDER AND DISPLAY THE RECIEPT---------------------------------------|>
module.exports.placeOrder = async (req, res) => {
  try {
    const userId = req.session.user._id;
    const orderId = req.params.id;

 console.log(orderId + "🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥")


    const orderDetails = await Orders.findOne({ _id: orderId });
    const headCategory = await getCategory();


    if (orderDetails && orderDetails.items) {
    
      for (const item of orderDetails.items) {
        console.log(item.prodId + "🔥🔥🔥🔥🔥🔥" + item.quantity);
  
        const product = await Product.findById(item.prodId);
        const currentStock = product.stock;
  
        const updated = await Product.findByIdAndUpdate(item.prodId, {
          stock: currentStock - item.quantity
        })
  
        if(updated){
          console.log(`stock successfull updated after order placed ${item.quantity}`);
        }else{
          console.log('stock updation failed');
        }
      
      }
    } else {
      console.log('Order details not found or items not available');
    }





    const cart = await Cart.findOne({ userId: userId });

   
   const updation =  await Orders.updateOne({ _id: orderId }, {
      $set: { orderStatus: 'Order Placed',verify: true }
    });

    console.log(updation);
    const deleteAll = await Orders.deleteMany({ verify: false });

    
    const deleteCartResult = await Cart.deleteOne({ userId: userId });
    if (deleteCartResult.deletedCount === 0) {
      console.log('No cart found for the user or deletion failed  🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥');
    } else {
      console.log('Cart deleted successfully 💕👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍');
    }
    res.render("user/orderPlacedPage", { details: orderDetails, user: userId, headCategory });
  } catch (error) {
    console.log('Try catch error in placeOrder 🤷‍♂️📀🤷‍♀️');
    console.log(error.message);
  }
};

// <-------------------------------------------------------| ORDERS LISTED -------------------------------------------------------------|>
module.exports.usersOrderList = async(req,res)=>{
  try {
    const id  = req.session.user._id
    const orders = await Orders.find({userId: id}).sort({_id: -1}) ;
    const headCategory = await getCategory();

    // await Orders.createIndex({ orderStatus: 1 }, { expireAfterSeconds: 100 });

  

    const user = req.session.user;
    res.render('user/ordersList', {products: orders.items, orders: orders, headCategory, user: user});

  } catch (error) {
    console.log('Try catch error in userOrderList 🤷‍♂️📀🤷‍♀️');
    console.log(error.message);
  }
};

// <-------------------------------------------------------| ORDERS LISTED -------------------------------------------------------------|>
module.exports.orderDetail = async(req,res)=>{
  try {
    const id  = req.params.id
    const orders = await Orders.findOne({_id: id})
    const headCategory = await getCategory();

    // await Orders.createIndex({ orderStatus: 1 }, { expireAfterSeconds: 100 });

  

    const user = req.session.user;
    res.render('user/orderDetail', { order: orders, headCategory, user: user});

  } catch (error) {
    console.log('Try catch error in userOrderList 🤷‍♂️📀🤷‍♀️');
    console.log(error.message);
  }
};

// <-------------------------------------------------------| CANCEL ORDER AJAX FUNCTION -----------------------------------------------|>
module.exports.cancelOrder = async (req, res) => {
  try {
    

    const userId = req.session.user._id;
    const orderId = req.params.id;

    const cancelOrder = await Orders.findOneAndUpdate(
        { _id: orderId, userId: userId },
        { $set: { canceled: true } },
        { new: true }
    );

    if (!cancelOrder) {
        console.log('Error in cancelling the order or unauthorized access');
        return res.status(400).send('Error in cancelling the order or unauthorized access');
    }

    // If the payment method is Razorpay, refund the amount to the wallet
    if (cancelOrder.PaymentMethod === 'Razorpay') {
        let wallet = await Wallet.findOne({ userId: userId });
        let transaction = await Transaction.findOne({ userId: userId });

        if (!wallet) {
        var  newWallet = new Wallet({
                userId: userId,
                walletBalance: cancelOrder.totalPaid,
            });
 await newWallet.save();
            console.log("🔥🔥🔥🔥🔥🔥👍👍👍" + 'new wallet created')

        }else{
          wallet.walletBalance += cancelOrder.totalPaid;
          await wallet.save();
        }

    

        if (!transaction) {
            transaction = new Transaction({
                userId: userId,
                transaction: [{ mode: 'Credit', amount: cancelOrder.totalprice }],
            });
            console.log("🔥🔥🔥🔥🔥🔥👍👍👍" + 'new  transaction created')

        } else {
            transaction.transaction.push({ mode: 'Credit', amount: cancelOrder.totalprice });
        }

        await transaction.save();
    }
   

    console.log('Order canceled successfully');
    return res.redirect('/user/order-details/' + orderId);
  } catch (error) {
    console.log('Try catch error in cancelOrder  🤷‍♂️📀🤷‍♀️');
    console.log(error.message);
  }
};

// <-------------------------------------------------------| RETURN ORDER REQUEST FUNCTION -----------------------------------------------|>
module.exports.returnOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.session.user._id;


    const returnOrder = await Orders.findOneAndUpdate({_id: orderId},{
      $set: {returned: true}
    })


  
  
    if(returnOrder){
      res.redirect("/user/users-orders");
      console.log('🔥🔥🔥🔥🔥 order retured to true');
    }else{
      console.log("order returning failed");
    }
   
  } catch (error) {
    console.log('Try catch error in returnOrder 🤷‍♂️📀🤷‍♀️');
    console.log(error.message);
  }
};

// <-------------------------------------------------------| RENDERING WALLET PAGE ----------------------------------------------------|>
module.exports.walletPage = async(req,res)=>{
  try {
    const id =  req.session.user._id

    const userWallet = await Wallet.findOne({userId: id})

    console.log(userWallet)
    const headCategory = await getCategory();
    const user = req.session.user
    const trans = await Transaction.findOne({userId: id}).sort({_id: -1});
    console.log(trans)

    res.render('user/wallet', {balance: userWallet, headCategory, user: user, transactions: trans});
  } catch (error) {
    console.log('Try catch error in walletPage  🤷‍♂️📀🤷‍♀️');
    console.log(error.message);
  }
};

// <-------------------------------------------------------| RENDERING WALLET PAGE ----------------------------------------------------|>
module.exports.walletUsage = async (req, res) => {
  try {
    const userId = req.session.user._id;

    const userWallet = await Wallet.findOne({ userId: userId });
    const userCart = await Cart.findOne({ userId: userId });
    const TransactionDb = await Transaction.findOne({userId: userId})



    if (!userCart) {
      return res.status(400).send("No cart available.");
    }

    if (!userWallet) {
      return res.status(400).send("No wallet available.");
    }

    const total = parseFloat(req.body.data);
    const walletBalance = userWallet.walletBalance

    let orderTotal = 0;
    let wallet = 0;
    let totalSave = 0;

    if (total < walletBalance) {
      wallet =  walletBalance -  total;
      totalSave = total
      userWallet.walletBalance = wallet;
      await userWallet.save();
      const pushTrans = {
          mode: "Debit",
          amount: totalSave
        }

        TransactionDb.transaction.push(pushTrans)
    
      await TransactionDb.save();

    } else{
      totalSave = walletBalance
      orderTotal = total - walletBalance;
      wallet = 0;
      userWallet.walletBalance = wallet;
      await userWallet.save();
      const pushTrans = {
        mode: "Debit",
        amount: totalSave
      }

      TransactionDb.transaction.push(pushTrans)
  
    await TransactionDb.save();

    } 

    res.send({ totalBalance: orderTotal, walletBalance: wallet, saved: totalSave});
  } catch (error) {
    console.log('Try catch error in walletUsage  🤷‍♂️📀🤷‍♀️');
    console.log(error.message);
  }
};

// <-------------------------------------------------------| ORDER INVOICE DOWNLOAD  ----------------------------------------------------|>
module.exports.invoiceDownload= async (req, res) => {
  try {
  
    const id = req.body.orderId;
      
    const order = await Orders.findById(id)
    res.send(order)
    

  } catch (error) {
    console.log('Try catch error in invoiceDownload  🤷‍♂️📀🤷‍♀️');
    console.log(error.message);
  }
};



















// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^//
// <                             <$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ ADMIN SIDE $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$>                            > //
// vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv//


// <-------------------------------------------------------| ORDERS LISTED IN ADMIN ORDERS PAGE ---------------------------------------|>
module.exports.orders = async (req, res) => {
try {
  // const id = req.session.admin._id;
  const orderDetail = await Orders.find({}).sort({_id: -1});

  if(!orderDetail){
    console.log("No order details 🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️");
  }else{
    console.log(orderDetail);
    res.render("admin/orders", { order: orderDetail });
  }

} catch (error) {
  console.log('Try catch error in orders 🤷‍♂️📀🤷‍♀️');
  console.log(error.message);
}
}
  
// <-------------------------------------------------------| DETAILS OF EACH AND EVERY ORDERS IN THE LIST -----------------------------|>
module.exports.orderDetails = async(req,res)=>{

  try {
    
    const id = req.params.id;

    console.log(id)

    const order = await Orders.findOne({_id: id});

    console.log(order.address);

    res.render('admin/orderDetails', {order: order})

  } catch (error) {
    console.log('Try catch error in orderDetails 🤷‍♂️📀🤷‍♀️');
    console.log(error.message);
  }

}

// <-------------------------------------------------------| CHANGIN  ORDER STATUS BY USING AJAX FUNCTION FROM ADMIN SIDE -------------|>
module.exports.updateOrderStatus = async(req,res)=>{
  try {
    const orderId = req.body.orderId;
  const orderState = req.body.orderStatus;

  const order = await Orders.findOneAndUpdate({_id: orderId}, {
    $set: {

      orderStatus: orderState,
      deliveryStatus: orderState
    }
  });
  
  if(orderState === 'Delivered'){
    order.deliveredAt = Date.now();
  }

  const savedOrder = await order.save();

 if(savedOrder){
  console.log(order);
  res.send( orderState )
 }else{
  console.log("data was not saved ");
 }
  } catch (error) {
    console.log('Try catch error in updateOrderStatus 🤷‍♂️📀🤷‍♀️');
    console.log(error.message);
  }
  
}

// <-------------------------------------------------------| CHANGIN  ORDER STATUS BY USING AJAX FUNCTION FROM ADMIN SIDE -------------|>
module.exports.returnApproval = async(req,res)=>{
  try {
    const id = req.params.id;

    const returnApproved = await Orders.findOneAndUpdate({_id: id}, {
      $set: {
        orderStatus: 'Order Returned',
        deliveryStatus: 'Returned',
        returnApprovel: true,

      }
    });

    console.log(returnApproved.userId + "This is the id of the ordered user 🔥🔥🔥😥😥😥😥");
    const user = returnApproved.userId;
    const walletAvailable = await Wallet.findOne({userId: user});
    const transactionDb  = await Transaction.findOne({userId: user});


    if(returnApproved){

      if(walletAvailable){
        await Wallet.findOneAndUpdate({userId: user},{
          $set: {
            walletBalance: returnApproved.totalprice + walletAvailable.walletBalance
          }
        })

        const trans = {
          mode: 'Credit',
          amount: returnApproved.totalPaid
        }
        transactionDb.transaction.push(trans);

       const pushTans =  await transactionDb.save();

       if(pushTans){
        console.log('transaction details pushed  👍👍👍👍👍👍🔥🔥🔥🔥🔥🔥🔥🔥');
       }else{
        console.log('error pushing transactioh details💕💕💕💕💕💕💕💕💕💕💕');
       }

      }else{
        const OrderReturnMoney = new Wallet({
          userId: returnApproved.userId,
          walletBalance: returnApproved.totalPaid
        
        }) 
        
        const saved = await OrderReturnMoney.save();

        
        const newTrans = new Transaction({
          userId: user,
          transaction: [{
            mode: 'Credit',
           amount: returnApproved.totalPaid,

         }]
        })

        const SaveNewTrans = await newTrans.save();

        if(SaveNewTrans){
          console.log('New transaction has been saved  📀📀📀📀📀📀💕💕💕👍👍👍👍👍');
        }else{
          console.log("Error saving new TRansaction ⛔⛔⛔⛔⛔⛔⛔⛔👋🤷‍♀️🤷‍♀️🤷‍♀️🤷‍♀️🤷‍♀️🤷‍♀️🤷‍♀️");
        }

if(saved){
  console.log('money Added to the wallet 👍👍👍👍👍👍👍👍👍👍💕');
}else{
  console.log("Money adding to walle failed ! ⛔⛔🤷‍♂️🤷‍♂️😥😥😥");
}
        
      }

      

      console.log('👍👍👍👍 return approved');
      res.redirect("/admin/order-details/" + id);
    }else{
      console.log("return approval failed ⛔⛔⛔⛔");
    }


  } catch (error) {
    console.log('Try catch error in returnApproval 🤷‍♂️📀🤷‍♀️');
    console.log(error.message);
  }
}
