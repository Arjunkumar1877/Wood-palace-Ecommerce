const Category = require("../models/categorySchema");
const { Orders } = require("../models/orderSchema");

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
// <                             <$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ ADMIN SIDE $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$>                            > //
// vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv//


// <-------------------------------------------------------| SALES REPORTS PAGE ----------------------------------------------------------|>
module.exports.salesReportsPage = async(req,res)=>{
    try {
        const headCategory = await getCategory();
        const orders = await Orders.find().sort({createdAt: -1})

        console.log(orders)

        res.render('admin/sales-report', {headCategory, order: orders});
        
    } catch (error) {
      console.log(error.message);
      console.log('Try catch error in salesReportPage 🤷‍♂️📀🤷‍♀️');
    }
};

// <-------------------------------------------------------| SALES REPORTS PAGE ----------------------------------------------------------|>
module.exports.genertaeSalesReportsPage = async(req,res)=>{
  try {
      const headCategory = await getCategory();
      const orders = await Orders.find().sort({createdAt: -1})

      console.log(orders)

      res.render('admin/salesReport-download', {headCategory, order: orders});
      
  } catch (error) {
    console.log(error.message);
    console.log('Try catch error in generateSalesReportPage 🤷‍♂️📀🤷‍♀️');
  }
};

// <-------------------------------------------------------| SALES REPORTS DOWNLOAD ------------------------------------------------------|>
module.exports.salesReport = async (req, res) => {
  try {
    const startDateString = req.body.startDate;
    const endDateString = req.body.endDate;

    console.log(endDateString)

    const startDate = new Date(startDateString);
    const endDate = new Date(endDateString);

    console.log(startDate + "🔥🔥🔥🔥🔥🔥🔥" + endDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).send('Invalid date format. Please provide valid dates.');
    }

    const allOrders = await Orders.aggregate([
      {
        $match: { 
          orderStatus: 'Delivered',
          deliveryStatus: 'Delivered'
        }
      }
    ]);

    
    

    const ordersWithinDateRange = [];

    for (const order of allOrders) {
      const orderDate = new Date(order.createdAt);

      if (orderDate > startDate && orderDate < endDate) {
        ordersWithinDateRange.push(order);
      }
    }

    
    // console.log(ordersWithinDateRange);

    const orders = ordersWithinDateRange
    
    // Initialize variables to store aggregated data
    let totalSales = 0;
    let totalOrders = 0;
    

     orders.forEach((order)=>{
      totalSales += order.totalprice,
      totalOrders++
     })

    // Calculate average order value
    const averageOrderValue = totalOrders > 0 ? Math.ceil(totalSales / totalOrders ) : 0;

    
    const salesReport = {
      totalSales,
      totalOrders,
      averageOrderValue,
      orders: orders.map((order) => ({
        orderId: order._id.toString(),
        totalAmount: order.totalAmount,
        orderStatus: order.orderStatus,
        address: order.address
        
      })),
    };
    
    console.log(salesReport.orders);
    //

    res.send(salesReport)

  } catch (error) {
    console.log(error.message);
    console.log('Try catch error in salesReport 🤷‍♂️📀🤷‍♀️');
  }
};
