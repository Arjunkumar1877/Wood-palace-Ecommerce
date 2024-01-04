var express = require("express");
var router = express.Router();
const {
  signUp,
  verifyOtp,
  authLogin,
  alreadySignedIn,
  signupPage,
  homePage,
  userLogout,
  forgotPassword,
  resetPassword,
  addNewPassword,
  userProfile,
  editUserProfile,
  editUserProfilePage,
  resendOtp,
  emailOtp,
  emailOtpVerify,
  resendEmailOtp,
  editUserPasswordPage,
  changePassword,
} = require("../controllers/userController");
const {
  blockChecker,
  UserLoginChecker,
  blockedUser,
  loginOrNot,
} = require("../middlewares/middleware");
const {
  ProductAddToCart,
  updateQuantity,
  cartPage,
  cartRemove,
  continueShopping,
  ProductBuyToCart,
} = require("../controllers/cartController");
const {
  productLoad,
  productSingleView,
  allProducts,
  productSearch,
  filterProductAjax,
} = require("../controllers/productController");
const {
  placeOrder,
  checkoutPage,
  usersOrderList,
  cancelOrder,
  checkoutAjaxAddress,
  PaymentCheckout,
  verifyPayment,
  walletPage,
  returnOrder,
  walletUsage,
  invoiceDownload,
  orderDetail,
} = require("../controllers/orderController");
const {
  manageAddress,
  addAddressPage,
  addAddress,
  editAddressPage,
  editAddress,
  deleteAddress,
  addNewAddressForCheckoutPage,
  addNewAddressCheckout,
} = require("../controllers/addressController");
const { useCoupon, coupons } = require("../controllers/couponController");
const {
  wishlistPage,
  removeWishlistProduct,
  wishlistToCart,
  productAddToWishlist,
} = require("../controllers/wishlistController");


router.get("/signup", UserLoginChecker, signupPage); //--------------------------------------------===| RENDERING SIGNUP PAGE

router.post("/signupOtp", UserLoginChecker, signUp); //--------------------------------------------===| SENDING SIGNUP OTP 

router.get("/alreadyLogged", UserLoginChecker, alreadySignedIn); //--------------------------------===| RENDERING LOGIN PAGE

router.get("/login", UserLoginChecker, alreadySignedIn); //----------------------------------------===| LOGIN PAGE

router.get("/resend-otp/:id", UserLoginChecker, resendOtp); //-------------------------------------===| RESEND OTP AFTER TIME OUT

router.get("/email-otp/:id", UserLoginChecker, emailOtp); //---------------------------------------===| EMAIL OTP PAGE

router.get("/resend-email-otp/:id", UserLoginChecker, resendEmailOtp); //--------------------------===| RESEND OTP

router.post("/email-verify/:id", UserLoginChecker, emailOtpVerify); //-----------------------------===| EMAIL OTP VERIFY

router.get("/forgot-password", forgotPassword); //-------------------------------------------------===| FORGOT PASSWORD PAGE

router.post("/loginToHome", UserLoginChecker, authLogin); //---------------------------------------===| CHECK LOGIN

router.post("/reset-password", UserLoginChecker, resetPassword); //--------------------------------===| RESETTING PASSWORD BY THE OTP

router.post("/add-newPassword/:id", addNewPassword); //--------------------------------------------===| ADDING NEW PASSWORD

router.post("/add-change-password", changePassword); //--------------------------------------------===| ADDING NEW PASSWORD

router.post("/verify", UserLoginChecker, verifyOtp); //--------------------------------------------===| VERIFY OTP

router.get("/", homePage); //----------------------------------------------------------------------===| HOME PAGE

router.get("/all-products", allProducts); //-------------------------------------------------------===| ALL PRODUCTS

router.post("/product-search", productSearch); //--------------------------------------------------===| USING FETCH SEARCH PRODUCT

router.post("/filter-products", filterProductAjax); //---------------------------------------------===| FILTER PRODUCTS IN ALL PRODUCTS

router.get("/productSinglePage", blockChecker, productSingleView); //------------------------------===| SINGLE PAGE WITH PRODUCT DETAILS

router.get("/category", blockChecker, productLoad); //---------------------------------------------===| LOADING PRODUCT COLLECTION ACCORDING TO THE CATEGORY

router.get("/user-profile", loginOrNot, userProfile); //-------------------------------------------===| USER PROFILE PAGE

router.get("/edit-profile", blockChecker, editUserProfilePage); //---------------------------------===| EDIT USER PROFILE PAGE

router.get("/change-password", blockChecker, editUserPasswordPage); //---------------------------------===| EDIT USER PASSWORD PAGE

router.post("/update-profile", blockChecker, editUserProfile); //----------------------------------===| UPDATE EDITED USER PROFILE

router.get("/manage-address", blockChecker, manageAddress); //-------------------------------------===| PAGE TO MANAGE ADDRESSES

router.get("/add-address-page", blockChecker, addAddressPage); //----------------------------------===| ADD ADDRESS PAGE

router.post("/add-address", blockChecker, addAddress); //------------------------------------------===| ADDING ADDRESS

router.get("/edit-address/:id", blockChecker, editAddressPage); //---------------------------------===| EDITTING ADDRESS PAGE

router.post("/edit-address/:id", blockChecker, editAddress); //------------------------------------===| SAVING EDITTED ADDRESS

router.get("/delete-address/:id", blockChecker, deleteAddress); //---------------------------------===| DELETING ADDRESS

router.get("/wishlist", loginOrNot, blockChecker, wishlistPage); //--------------------------------===| RENDERING  WISHLIST

router.get("/add-wishlist/:id", loginOrNot, blockChecker, productAddToWishlist); //----------------===| PRODUCT ADD TO  WISHLIST

router.get("/remove-wishlist", blockChecker, removeWishlistProduct); //----------------------------===| REMOVE PRODUCT FROM WISHLIST

router.get("/delete-wishlist-item/:id", blockChecker, removeWishlistProduct); //-------------------===| DELETE PRODUCT FROM WISHLIST

router.get("/whishlist-to-cart/:id", blockChecker, wishlistToCart); //-----------------------------===| WISHLIST TO CART

router.get("/cart", loginOrNot, blockChecker, cartPage); //----------------------------------------===| USER CART

router.get("/addToCart/:id", loginOrNot, blockChecker, ProductAddToCart); //-----------------------===| ADDING PRODUCT TO CART

router.get("/buy-now/:id", loginOrNot, blockChecker, ProductBuyToCart); //-------------------------===| ADDING PRODUCT TO CART

router.get("/continue-shopping", blockChecker, continueShopping); //-------------------------------===| FROM CART TO RETURN HOME PAGE

router.post("/updateQuantity", blockChecker, updateQuantity); //-----------------------------------===| UPDATING QUATITY ON ACTION USING AJAX

router.get("/cart-remove/:productId", blockChecker, cartRemove); //--------------------------------===| REMOVING PRODUCTS FROM CART

router.get("/checkout", blockChecker, checkoutPage); //--------------------------------------------===| CHECKOUT ADDRESS SELECTION PAGE

router.get("/add-address-checkout-page",blockChecker, addNewAddressForCheckoutPage);//-------------===| ADD NEW ADDRESS FROM CHECKOUT PAGE

router.post("/add-address-checkout-page", blockChecker, addNewAddressCheckout); //-----------------===| ADD NEW ADDRESS FROM CHECKOUT PAGE

router.post("/checkout-address", blockChecker, checkoutAjaxAddress); //----------------------------===| ADDRESS  SELECTION USING AJAX

router.post("/checkout-payment", blockChecker, PaymentCheckout); //--------------------------------===| CHECKOUT PAYMENT USING AJAX AND RAZORPAY

router.post("/verify-payment", verifyPayment); //--------------------------------------------------===| VERIFY PAYMENT USING AJAX

router.get("/coupons", coupons); //----------------------------------------------------------------===| COUPONS

router.post("/use-coupon", blockChecker, useCoupon); //--------------------------------------------===| USING AND VALIDATING COUPON USING AJAX

router.get("/place-order/:id", blockChecker, placeOrder); //---------------------------------------===| ORDER PLACING AND DESPLAYING RECIEPT

router.get("/users-orders", blockChecker, usersOrderList); //--------------------------------------===| ORDERS LIST

router.get("/order-details/:id", blockChecker, orderDetail); //------------------------------------===| ORDERS LIST

router.get("/cancel-order/:id", blockChecker, cancelOrder); //-------------------------------------===| CANCEL THE ORDER

router.get("/return-order/:id", blockChecker, returnOrder); //-------------------------------------===| RETURN AN ORDER

router.post("/order-invoice", blockChecker, invoiceDownload); //-----------------------------------===| ORDER INVOICE PAGE

router.get("/wallet", blockChecker, walletPage); //------------------------------------------------===| RENDERING WALLET PAGE

router.post("/use-wallet", blockChecker, walletUsage); //------------------------------------------===| WALLET USAGE IN CHECKOUT

router.get("/logout", userLogout); //--------------------------------------------------------------===| LOGGIN OUT

router.get("/blocked", blockedUser); //------------------------------------------------------------===| A PAGE FOR BLOCKED USERS











































module.exports = router;
