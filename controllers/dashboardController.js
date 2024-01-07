const { Banner } = require("../models/bannerSchema");
const { Orders } = require("../models/orderSchema");
const { Product } = require("../models/productSchema");
const { User } = require("../models/userModel");




// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^//
// <                             <$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ ADMIN SIDE $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$>                            > //
// vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv//

// <-------------------------------------------------------| RENDERING DASHBOARD WITH GRAPHS  --------------------------------------|>
module.exports.dashboard= async (req, res) => {
  try {
const codOrders = await Orders.aggregate([
      { $match: { PaymentMethod: "COD" } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$totalprice" },
        },
      },
    ]);

    const codTotalAmount = codOrders.length > 0 ? codOrders[0].totalAmount : 0;

    console.log(codOrders);
    console.log("Total amount from COD orders:", codTotalAmount);

  const razorpayOrder = await Orders.aggregate([
      { 
        $match: { PaymentMethod: "Razorpay" } 
    },
      { 
        $group: { _id: null, totalAmount: { $sum: "$totalprice" } } 
    },
    ]);

    const razorpayTotalAmount = razorpayOrder.length > 0 ? razorpayOrder[0].totalAmount : 0;

    console.log(razorpayOrder);
    console.log("Total amount from Razorpay orders:", razorpayTotalAmount);


    const totalRevenue = razorpayTotalAmount + codTotalAmount
    console.log("Total revenue = " + totalRevenue);
    
  

    // console.log(User)

    const orderDelivered = await Orders.aggregate([{
      $match: {
        orderStatus: 'Delivered',
        returned: false,
      }
    },
    {$count: 'deliveredOrders'}
  
  ])
  console.log(orderDelivered)

  const deliveredOrders = orderDelivered[0].deliveredOrders;
  console.log(deliveredOrders + "🔥🔥🔥🔥💕💕💕💕💕💕🔥❤️❤️❤️");


  const orderReturned = await Orders.aggregate([
    {$match: {
      orderStatus: 'Order Returned',
      returned: true
    }},
    {$count: 'ReturnedOrders'}
  ])
  console.log(orderReturned);

  const returnedOrders = orderReturned[0].ReturnedOrders;

  console.log(returnedOrders + "💕💕💕💕💕🔥🔥🔥🔥🔥🔥❤️❤️❤️❤️❤️❤️");



  const orderCanceled = await Orders.aggregate([
    {$match: {
      canceled: true
    }},
    {$count: 'canceledOrders'}
  ])
  console.log(orderCanceled)

  const canceledOrders = orderCanceled[0].canceledOrders

  console.log(canceledOrders + "💕💕💕💕🔥🔥🔥❤️❤️❤️")


  const totalOrder = await Orders.aggregate([
    {$count: 'totalOrders'}
  ])

  const totalOrders = totalOrder[0].totalOrders;

  console.log(totalOrders + '💕💕💕💕💕❤️🔥🔥🔥🔥🔥🔥🔥🔥');

  const users = await Orders.find().limit(5);
  const products = await Product.find().sort({dateCreated: -1}).limit(4)

  const banner = await Banner.find();


    res.render('admin/dash', {
        codTotalAmount,
        razorpayTotalAmount,
        totalRevenue,
        users: users,
        product: products,
        deliveredOrders: deliveredOrders,
        returnedOrders: returnedOrders,
        canceledOrders: canceledOrders,
        totalOrders: totalOrders,
        banner: banner

    });

    
  } catch (error) {
    console.log(error.message);
    console.log('Try catch error in dashboard 🤷‍♂️📀🤷‍♀️');
  }
};



