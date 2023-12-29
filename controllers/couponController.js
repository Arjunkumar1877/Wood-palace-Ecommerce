const Category = require("../models/categorySchema");
const { Coupon } = require("../models/couponSchema");
var couponCode = require("coupon-code");


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

// Find and update coupons that have expired
const checkAndUpdateExpiredCoupons = async () => {
    try {
        const currentDate = new Date();
        const coupons = await Coupon.find({ expirationDate: { $lte: currentDate }, expired: false });

        if (coupons.length > 0) {
            const expiredCoupons = await Coupon.updateMany(
                { _id: { $in: coupons.map(coupon => coupon._id) } },
                { $set: { expired: true } }
            );

            if (expiredCoupons) {
                console.log("Coupons expired:", expiredCoupons.nModified);
            }
        } else {
            console.log("No coupons found that have expired.");
        }
    } catch (error) {
        console.error("Error checking and updating expired coupons:", error);
    }
};




// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^//
// <                             $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$  USER SIDE $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$>                            > //
// vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv//


// <-------------------------------------------------------| USE COUPON AT CHECOUT WITH AJAX ----------------------------------------------------|>
module.exports.useCoupon = async (req, res) => {
    try {
        const newCode = await Coupon.findOne({ couponCode: req.body.couponCode });
     

        checkAndUpdateExpiredCoupons();


       if(!newCode.active){
        res.send({used: 'coupon already used'});
       }else{
        if(!newCode){
            res.send({invalid: "Invalid coupon code"});

        }else if (!newCode.active && newCode.expired){
            
            res.send({expired: 'Coupon Expired'})
        } else {
            const perc = newCode.discountPercentage;
            res.send({ code: perc });

          const  couponExpired =  await Coupon.updateOne({ _id: newCode._id }, { $set: { active: false } });
        }
       }

    } catch (error) {
        console.log('Try catch error in useCoupon 🤷‍♂️📀🤷‍♀️');
        console.log(error.message);
    }
};


// <-------------------------------------------------------| USE COUPON AT CHECOUT WITH AJAX ----------------------------------------------------|>
module.exports.coupons = async (req, res) => {
    try {
    
        const user = req.session.user
        const coupons = await Coupon.find({});
        checkAndUpdateExpiredCoupons();


        if(coupons.startDate < coupons.expirationDate){
         const expired = await Coupon.updateMany({expired: true});
         if(expired){
            console.log("coupon expired !!..");
         }
        }


        const category = await Category.findOne({categoryName: 'CABINET'});

        

        const headCategory = await getCategory();
        res.render('user/coupons', {coupons: coupons, headCategory, user: user})
    } catch (error) {
        console.log('Try catch error in coupons 🤷‍♂️📀🤷‍♀️');
        console.log(error.message);
    }
};
















// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^//
// <                             $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ ADMIN SIDE $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$>                            > //
// vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv//


// <-------------------------------------------------------| RENDERING COUPON MANAGMENT PAGE --------------------------------------------|>
module.exports.couponManage = async(req,res)=>{
    try {
        const coupon = await Coupon.find({}).sort({_id: -1});
        checkAndUpdateExpiredCoupons();

        res.render("admin/couponManagment", {offer: coupon})
    } catch (error) {
        console.log('Try catch error in couponManage 🤷‍♂️📀🤷‍♀️');
        console.log(error.message);
    }
};

// <-------------------------------------------------------| RENDERING COUPON ADDING PAGE -----------------------------------------------|>
module.exports.addCouponPage = async(req,res)=>{
    try {
        checkAndUpdateExpiredCoupons();

        res.render('admin/addCoupon')
    } catch (error) {
        console.log('Try catch error in addCouponPage 🤷‍♂️📀🤷‍♀️');
        console.log(error.message);
    }
};

// <-------------------------------------------------------| GENRATING COUPON AJAX FUNCTION ---------------------------------------------|>
module.exports.generateCoupon = async(req,res)=>{
try {
    let codeC = couponCode.generate({parts: 2});

    res.send({coupon: codeC })
} catch (error) {
    console.log('Try catch error in generateCoupon 🤷‍♂️📀🤷‍♀️');
    console.log(error.message);
}
};

// <-------------------------------------------------------| ADDING THE GENERATED COUPON TO THE DB --------------------------------------|>
module.exports.addCoupon = async (req, res) => {
    try {
        const newCoupon = new Coupon({
            couponCode: req.body.code,
            discountPercentage: req.body.discountPercentage,
            expirationDate: req.body.expiryDate, 
        });

        console.log(newCoupon)

        const savedCoupon = await newCoupon.save();

        if (savedCoupon) {
            res.redirect("/admin/coupon-mg");
        } else {
            console.log("Coupon not saved");
        }
    } catch (error) {
        console.log('Try catch error in addCoupon 🤷‍♂️📀🤷‍♀️');
        console.log(error.message);
    }
};

// <-------------------------------------------------------| ADDING THE GENERATED COUPON TO THE DB --------------------------------------|>
module.exports.deleteCoupon = async (req, res) => {
    try {
 
        const id = req.params.id;
        const deleteCoupon = await Coupon.findOneAndRemove({_id: id});
        if(deleteCoupon){
           res.redirect('/admin/coupon-mg');
        }else{
            console.log("coupon not found for deletion!!!!");
        }


    } catch (error) {
        console.log('Try catch error in deleteCoupon 🤷‍♂️📀🤷‍♀️');
        console.log(error.message);
    }
};


