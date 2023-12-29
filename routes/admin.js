const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const multer = require("multer");
const { adminSessionCheck } = require("../middlewares/middleware");
const path = require("path");
const { orders, orderDetails, updateOrderStatus, returnApproval } = require("../controllers/orderController");
const { couponManage, addCoupon, addCouponPage, generateCoupon, deleteCoupon } = require("../controllers/couponController");
const { productMg, addProductPage, addProduct, editProduct, updateProduct, deleteProduct, deleteImage, croppingImagePage, cropImageAjax } = require("../controllers/productController");
const {  dashboard } = require("../controllers/dashboardController");
const { addBannerPage, bannerList, addBanner, deleteBanner } = require("../controllers/bannerController");
const { salesReportsPage, salesReport, genertaeSalesReportsPage } = require("../controllers/salesController");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/uploads");
  },
  filename: (req, file, cb) => {
    let ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + Date.now() + ext);
  },
});

const upload = multer({
  storage: storage,
});

const storage1 = multer.diskStorage({
  destination: function (req, file, cb) { 
    cb(null, './public/banner'); 
  },
  filename: function (req, file, cb) { 
    cb(null, file.originalname); 
  }
});

const upload1 = multer({ 
  storage: storage1 
});



router.get("/", adminSessionCheck, adminController.adminLogin);//-------------------------------------------------| ADMIN LOGIN PAGE

router.post("/loginAdmin", adminController.adminVerifyLogin);//---------------------------------------------------| LOGIN

router.get("/dash", dashboard);//---------------------------------------------------------------------------------| HEAD NAV OPTION TO REDIRECT TO HOME/ ADMIN PANEL

router.get("/orders", orders);//----------------------------------------------------------------------------------| GO TO THE ORDERS LISTED

router.get("/product-mg", productMg);//---------------------------------------------------------------------------| GO TO PLODUCT MANAGMENT CRUD

router.get("/add-productPage", addProductPage);//-----------------------------------------------------------------| GO TO CREATE/ADD PRODUCT 

router.post("/add-product",  upload.array('images', 5), addProduct);//--------------------------------------------| ADD AND SAVE THE NEW PRODUCT

router.get("/edit-product/:id", editProduct);//-------------------------------------------------------------------| GO TO EDIT PRODUCT PAGE

router.get("/crop-image/:id", croppingImagePage);//---------------------------------------------------------------| GO TO CROPPING IMAGE PAGE

router.post("/crop-image", cropImageAjax);//----------------------------------------------------------------------| T 
 
router.post("/delete-image", deleteImage);//----------------------------------------------------------------------| GO TO EDIT PRODUCT PAGE 

router.post("/update-product/:id", upload.array('images', 5), updateProduct);//-----------------------------------| EDIT AND UPDATE THE PRODUCT

router.get("/delete-product/:id", deleteProduct);//---------------------------------------------------------------| DELETE A PRODUCT 

router.get("/category-mg", adminController.CategoryMg);//---------------------------------------------------------| GO TO CATEGORY MANAGMENT

router.post("/add-category", adminController.addCategory);//------------------------------------------------------| ADD CATEGORY 

router.get("/activate-category/:id", adminController.activateCategory);//-----------------------------------------| SCTIVATE CATEGOORY 

router.get("/deactivate-category/:id", adminController.deactivateCategory);//-------------------------------------| DEACTIVATE CATEGORY

router.get("/edit-category-page/:id", adminController.editCategoryPage);//----------------------------------------| EDIT CATEGORY PAGE

router.post('/edit-category/:id', adminController.editCategory)//-------------------------------------------------| EDITTING CATEGORY NAME

router.get("/update-category/:id", adminController.editCategory);//-----------------------------------------------| EDIT & UPDATE NEW CATEGORYNAME

router.get("/user-mg", adminController.userManagment);//----------------------------------------------------------| GO TO USER MANAGMENT 

router.get("/block/:id", adminController.blockUser);//------------------------------------------------------------| BLOCK A USER 

router.get("/unblock/:id", adminController.unblockUser);//--------------------------------------------------------| UNBLOCK A USER 

router.get("/order-details/:id", orderDetails)//------------------------------------------------------------------| A ORDER DETAILED PAGE

router.post('/update-order-status', updateOrderStatus)//----------------------------------------------------------| UPDATE ORDER STATUS 

router.get('/coupon-mg', couponManage)//--------------------------------------------------------------------------| COUPON-MANAGEMENT

router.get('/delete-coupon/:id', deleteCoupon)//------------------------------------------------------------------| COUPON-DELETE

router.get('/add-coupon', addCouponPage)//------------------------------------------------------------------------| ADD-NEW COUPON PAGE

router.post('/generate-coupon', generateCoupon)//-----------------------------------------------------------------| GENERATE-NEW COUPON USING AJAX 

router.post('/add-coupon', addCoupon);//--------------------------------------------------------------------------| ADD THE GENERATED COUPON TO THE DB 

router.get('/return-approve/:id', returnApproval);//--------------------------------------------------------------| APPROVING ORDER RETURN

router.get('/banner-mg', bannerList);//---------------------------------------------------------------------------| BANNERS LIST

router.get('/add-banner-page', addBannerPage);//------------------------------------------------------------------| ADD BANNER PAGE

router.post('/add-banner', upload1.single('image'), addBanner);//-------------------------------------------------| ADD BANNER

router.get('/delete-banner/:id', deleteBanner)//------------------------------------------------------------------| DELETE BANNER 

router.get('/report', salesReportsPage);//------------------------------------------------------------------------| SALES REPORT 

router.get('/get-report', genertaeSalesReportsPage)//-------------------------------------------------------------| FOR DOWNLOADING SALES REPORT

router.post('/report-download', salesReport);//-------------------------------------------------------------------| SALES REPORT 

router.get("/logout", adminController.adminLogout);//-------------------------------------------------------------| ADMIN LOGOUT 



module.exports = router;
