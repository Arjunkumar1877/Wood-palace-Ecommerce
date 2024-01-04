const bcrypt = require("bcrypt");
const saltRounds = 10;

const otpGenerator = require("otp-generator");
const twilio = require("twilio");
const { Product } = require("../models/productSchema");
const { Otp  } = require("../models/otpModel");
const Category = require("../models/categorySchema");
const session = require("express-session");
const Cart = require("../models/cartSchema");
const { User } = require("../models/userModel");
const nodemailer = require('nodemailer');
const { Banner } = require("../models/bannerSchema");
const { Coupon } = require("../models/couponSchema");
const { Orders } = require("../models/orderSchema");


let pass = '';

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
// <                             <$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ USER SIDE $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$>                            > //
// vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv//


// <-------------------------------------------------------| RENDERING USER SIGNUP PAGE ------------------------------------------------------|>
module.exports.signupPage = async (req, res) => {
  try {
    const deletedUsers = await User.deleteMany({ verify: false });

    if (deletedUsers.deletedCount > 0) {
      console.log(`${deletedUsers.deletedCount} unverified users deleted successfully.`);
    } else {
      console.log("No unverified users found for deletion.");
    }

    res.render("user/signup", { admin: true });
  } catch (err) {
    console.error("Error deleting unverified users:", err);
    res.status(500).send("Internal Server Error");
  }
};

// <-------------------------------------------------------| USER LOGIN PAGE -----------------------------------------------------------------|>
module.exports.alreadySignedIn = (req, res) => {


  res.render("user/login", { admin: true, pass: ' '});
};

// <-------------------------------------------------------| POSTING USER NEW USER & SENDING OTP & REDIRECT TO OTP PAGE  ---------------------|>
module.exports.signUp = async (req, res) => {
  try {
    const user = await User.findOne({ phone: req.body.phone });

    if (user) {
      return res.status(400).send("User already registered");
    }

    const OTP = otpGenerator.generate(6, {
      upperCaseAlphabets: true,
      lowerCaseAlphabets: false,
      specialChars: false,
      digits: false,
    });

    const phone = req.body.phone;
    console.log(OTP);

    const accountSid = "AC3149c62e555ae65b32b9da0828582b06";
    const authToken = "38c9e081f8015f0d82ae53af1ceffc23";
    const twilioPhoneNumber = "+12567870140";

    const client = new twilio(accountSid, authToken);

    function sendSMS(to, body) {
      return client.messages
        .create({
          body: body,
          from: twilioPhoneNumber,
          to: to,
        })
        .then((message) => {
          console.log(`Message sent with SID: ${message.sid} 🔥🔥🔥🔥👍👍👍`);
        })
        .catch((error) => {
          console.error(`Error sending message: ${error}`);
        });
    }

    const recipientNumber = req.body.phone;
    const messageBody = `Your Verification code is ${OTP}`;

    await sendSMS(recipientNumber, messageBody);

    const hashedPass = await bcrypt.hash(req.body.password, saltRounds);

    // const otp = new Otp({ phone: phone, otp: OTP });
    const userAuth = new User({
      name: req.body.name,
      email: req.body.email,
      password: hashedPass,
      phone: req.body.phone,
      otp: OTP
    });

    await userAuth.save();
    // await otp.save();

    return  res.render("user/signupOtp", { admin: false, user: userAuth });
  } catch (error) {
    console.error(error);
  }
};

// <-------------------------------------------------------| RESEND MOBILE OTP ---------------------------------------------------------------|>
module.exports.resendOtp = async(req,res)=>{
  try {

    const id = req.params.id;
    const newUser = await User.findOne({_id: id});

    const OTP = otpGenerator.generate(6, {
      digits: true,
      alphabets: false,
      upperCase: true,
      specialChars: false,
    });

    const phone = newUser.phone
    console.log(OTP);

    const accountSid = "AC3149c62e555ae65b32b9da0828582b06";
    const authToken = "38c9e081f8015f0d82ae53af1ceffc23";
    const twilioPhoneNumber = "+12567870140";

    const client = new twilio(accountSid, authToken);

    function sendSMS(to, body) {
      return client.messages
        .create({
          body: body,
          from: twilioPhoneNumber,
          to: to,
        })
        .then((message) => {
          console.log(`Message sent with SID: ${message.sid} 🔥🔥🔥🔥👍👍👍`);
        })
        .catch((error) => {
          console.error(`Error sending message: ${error}`);
        });
    }

    const recipientNumber = phone;
    const messageBody = `Your Verification code is ${OTP}`;

    await sendSMS(recipientNumber, messageBody);

    const resend = await User.findOneAndUpdate({_id: id}, {
      otp: OTP
    })

    const successResend = await resend.save();

    if(successResend){
      console.log("otp sucessfully sended");
      res.render('user/signupOtp', {user: newUser});
    }else{
      console.log("failed to save the new otp resended")
    }

    
  } catch (error) {
    console.log(error.message)
  }
};

// <-------------------------------------------------------| RENDERING EMAIL OTP PAGE --------------------------------------------------------|>
module.exports.emailOtp = async(req,res)=>{
  
  try {
    const id = req.params.id;
  
    const OTP = otpGenerator.generate(6, {
      upperCaseAlphabets: true,
      lowerCaseAlphabets: false,
      specialChars: false,
      digits: false,
    });
  
    const userDb = await User.findOneAndUpdate({_id: id},{
      $set: {
        otp: OTP
      }
    });    
    
    console.log("🔥🔥🔥🔥" + OTP);
      const newEmail = userDb.email;
    
      const sendVerifyMail = async (email, otp) => {
        try {
          const https = require('https');
    
          const agent = new https.Agent({
            rejectUnauthorized: false, // Set this to true in production
          });
    
          const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
              user: 'arjun.tech177@gmail.com',
              pass: 'nctv beiz wucl vlnh',
            },
            tls: {
              rejectUnauthorized: false, // Set this to true in production
            },
            agent, // Pass the agent to nodemailer
          });
    
          const mailOptions = {
            from: 'arjun.tech177@gmail.com',
            to: email,
            subject: 'Verification Mail',
            html: `<p>Hi, your OTP for signing up is: ${otp}</p>`,
          };
    
          // Promisify sendMail
          const sendMailPromise = new Promise((resolve, reject) => {
            transporter.sendMail(mailOptions, function (error, info) {
              if (error) {
                console.error(error);
                reject(error);
              } else {
                console.log('Email has been sent', info.response);
                resolve(info);
              }
            });
          });
    
          // Wait for the email to be sent
          await sendMailPromise;
    
          return true; // Indicate success
        } catch (error) {
          console.error(error.message);
          return false; // Indicate failure
        }
      };
    
        const sendMailResult = await sendVerifyMail(newEmail, OTP);
    
       
  
  
  if(sendMailResult){
  console.log(userDb + '💕💕💕💕💕💕💕💕💕💕💕💕💕💕💕💕');
  if(userDb){
    res.render('user/email-otp', {user: userDb})
  }else{
    console.log('No user found!');
  }
  }
   
  } catch (error) {
    console.log(error.message);
  }
    
};

// <-------------------------------------------------------| RENDERING EMAIL OTP PAGE --------------------------------------------------------|>
module.exports.resendEmailOtp = async(req,res)=>{
  
  try {
    const id = req.params.id;
  
    const OTP = otpGenerator.generate(6, {
      upperCaseAlphabets: true,
      lowerCaseAlphabets: false,
      specialChars: false,
      digits: false,
    });
  
    const userDb = await User.findOneAndUpdate({_id: id},{
      $set: {
        otp: OTP
      }
    });    
    
    console.log("🔥🔥🔥🔥" + OTP);
      const newEmail = userDb.email;
    
      const sendVerifyMail = async (email, otp) => {
        try {
          const https = require('https');
    
          const agent = new https.Agent({
            rejectUnauthorized: false, // Set this to true in production
          });
    
          const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
              user: 'arjun.tech177@gmail.com',
              pass: 'nctv beiz wucl vlnh',
            },
            tls: {
              rejectUnauthorized: false, // Set this to true in production
            },
            agent, // Pass the agent to nodemailer
          });
    
          const mailOptions = {
            from: 'arjun.tech177@gmail.com',
            to: email,
            subject: 'Verification Mail',
            html: `<p>Hi, your OTP for signing up is: ${otp}</p>`,
          };
    
          // Promisify sendMail
          const sendMailPromise = new Promise((resolve, reject) => {
            transporter.sendMail(mailOptions, function (error, info) {
              if (error) {
                console.error(error);
                reject(error);
              } else {
                console.log('Email has been sent', info.response);
                resolve(info);
              }
            });
          });
    
          // Wait for the email to be sent
          await sendMailPromise;
    
          return true; // Indicate success
        } catch (error) {
          console.error(error.message);
          return false; // Indicate failure
        }
      };
    
        const sendMailResult = await sendVerifyMail(newEmail, OTP);
    
       
  
  
  if(sendMailResult){
  console.log(userDb + '💕💕💕💕💕💕💕💕💕💕💕💕💕💕💕💕');
  if(userDb){
    res.render('user/email-otp', {user: userDb})
  }else{
    console.log('No user found!');
  }
  }
   
  } catch (error) {
    console.log(error.message);
  }
    
};

// <-------------------------------------------------------| VERIFYING EMAIL OTP  ------------------------------------------------------------|>
module.exports.emailOtpVerify = async(req,res)=>{
  try {

    const id = req.params.id;
    const otpBd = req.body.otp
    const userDb = await User.findOne({_id: id});

    console.log(userDb)
    if(userDb){
      if(userDb.otp === otpBd){
        userDb.verify = true;

      const saved = await userDb.save();
      if(saved){
        res.render('user/login', {pass: ''});
      }else{
        res.redirect('/user/email-otp/'+ userDb._id);
      }
      }else{
        console.log('otp not equal ....');
      }
    }else{
      res.send("no user data found !!!!!!!!!!");
    }

    
  } catch (error) {
    console.log(error.message);
  }
};

// <-------------------------------------------------------| POSTING OTP VERIFYING PAGE ------------------------------------------------------|>
module.exports.verifyOtp = async (req, res) => {
  try {
    const phoneDb = await User.findOne({ phone: req.body.phone });

    if (!phoneDb) {
      return res.send("Invalid phone number.");
    }

    const otpDb = await User.findOneAndUpdate(
      { phone: req.body.phone, otp: req.body.otp },
      { $set: { verify: true } },
      { new: true }
    );

    if (otpDb) {
      console.log("OTP verified successfully.");

      res.render("user/login", {pass});
    } else {
      const removeUserData = await User.findOneAndRemove({ phone: req.body.phone });
      
      if (removeUserData) {
        console.log("User data removed successfully.");
        res.render("user/signup");
      } else {
        console.log("Removing user data failed");
        res.status(500).send("Internal Server Error");
      }
    }
  } catch (error) {
    console.log("Error in verifying OTP:", error.message);
    res.status(500).send("Internal Server Error");
  }
};

// <-------------------------------------------------------| POSTING & VERIFYING USER LOGING -------------------------------------------------|>
module.exports.authLogin = async (req, res) => {
 try {
  const password = req.body.password;

  // const userses= req.session.user;

  // const userB = await User.findById({userses: _id});
  const user = await User.findOne({ email: req.body.email });
  // const user1 = await User.find();

  if (user) {
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
      if (user.status === false) {
        req.session.destroy();
        return res.redirect("/user/blocked");
      }
      req.session.user = user;
      req.session.userAuthenticated = true;
      console.log(req.session.user + req.session.userAuthenticated);

      const products = await Product.find().populate("category");
      return res.redirect("/user");
    } else {
      
      return res.render("user/login", {pass: 'Incorrect password'});
    }
  } else {
  
    return res.render("user/login", {pass: 'Email invalid'});
  }
 } catch (error) {
  console.log('Auth-login try catch error !🤷‍♂️😥🤷‍♂️');
  console.log(error.message);
 }
};

// <-------------------------------------------------------| USER SIGNUP PAGE ----------------------------------------------------------------|>
module.exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.find({});

    res.render("user/userForgotPass", { user: user , changepass: false});
  } catch (error) {
    console.log(error.message);
  }
};

// <-------------------------------------------------------| POSTING & SENDING OTP FOR RESETTING THE FORGOTTEN PASSWORD ----------------------|>
module.exports.resetPassword = async (req, res) => {
  try {
    const OTP = otpGenerator.generate(6, {
      upperCaseAlphabets: true,
      lowerCaseAlphabets: false,
      specialChars: false,
      digits: false,
    });
  
    const userDb = await User.findOneAndUpdate({email: req.body.email},{
      $set: {
        otp: OTP
      }
    });    
    
    console.log("🔥🔥🔥🔥" + OTP);
      const newEmail = userDb.email;
    
      const sendVerifyMail = async (email, otp) => {
        try {
          const https = require('https');
    
          const agent = new https.Agent({
            rejectUnauthorized: false, // Set this to true in production
          });
    
          const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
              user: 'arjun.tech177@gmail.com',
              pass: 'nctv beiz wucl vlnh',
            },
            tls: {
              rejectUnauthorized: false, // Set this to true in production
            },
            agent, // Pass the agent to nodemailer
          });
    
          const mailOptions = {
            from: 'arjun.tech177@gmail.com',
            to: email,
            subject: 'Verification Mail',
            html: `<p>Hi, your OTP for signing up is: ${otp}</p>`,
          };
    
          // Promisify sendMail
          const sendMailPromise = new Promise((resolve, reject) => {
            transporter.sendMail(mailOptions, function (error, info) {
              if (error) {
                console.error(error);
                reject(error);
              } else {
                console.log('Email has been sent', info.response);
                resolve(info);
              }
            });
          });
    
          // Wait for the email to be sent
          await sendMailPromise;
    
          return true; // Indicate success
        } catch (error) {
          console.error(error.message);
          return false; // Indicate failure
        }
      };
    
        const sendMailResult = await sendVerifyMail(newEmail, OTP);
    
       

    const user = await User.findOne({ email: req.body.email });

    if (user) {
  
  user.otp = OTP;

  await user.save();

      res.render("user/verifyPassword", { user1: user,  changepass: false});
    } else {
      res.send("Entered phone number is invalid");
    }
  } catch (error) {
    console.log("Try catch error in resetPassword 🤷‍♂️📀🤷‍♀️");
    console.log(error.message);
  }
};

// <-------------------------------------------------------| POSTING & VERIFYING OTP & ADDING NEW PASSWORD  ----------------------------------|>
module.exports.addNewPassword = async (req, res) => {
  const id = req.params.id;
  
  try {

      const user = await User.findOne({_id: id});
   
    const hashedPass = await bcrypt.hash(req.body.password, saltRounds);
    const otpBody = req.body.otp

    if (user.otp === otpBody) {
      user.password = hashedPass;
      await user.save();

      res.render("user/login", {pass: ''});
    } else {
      res.send("Invalid user or OTP");
    }
    
    
  } catch (error) {
    console.log("Try catch error in addNewPassword 🤷‍♂️📀🤷‍♀️");
    console.log(error.message);
  }
};


module.exports.changePassword = async(req,res) =>{
  try {
    const oldPassword = req.body.oldPassword;
  const newPassword = req.body.passwordNew
    if(req.session.user){
      const id = req.session.user._id
      const user = await User.findOne({_id: id})
      
    const passwordMatch = await bcrypt.compare(oldPassword, user.password);
    const hashedPass = await bcrypt.hash(newPassword, saltRounds);

    if(passwordMatch){
const update = await User.findOneAndUpdate({_id: id}, {
  password: hashedPass
})      
      const saved = await update.save();

      if(saved){
        res.redirect('/user/user-profile')
      }else{
        res.json('changing password failed...');
      }

    }
    }


  
  } catch (error) {
    console.log(error.message)
  }
}

// <-------------------------------------------------------| RENDERING HOME PAGE -------------------------------------------------------------|>
module.exports.homePage = async (req, res) => {
 try {
   // const  user = req.session.user;
  // console.log("🔥🔥🔥🔥");
  // console.log(user._id);
  // console.log("❤️❤️❤️❤️❤️");
  checkAndUpdateExpiredCoupons();
  const deleteAll = await Orders.deleteMany({ verify: false });

  const product = await Product.find().limit(7)
  const product1 = await Product.find()
  const banner = await Banner.find({});``
  const category = await Category.findOne({categoryName: 'CABINET'});
 
  const user = req.session.user;
  const headCategory = await getCategory();
  res.render("user/home", { headCategory, admin: false, products: product, product1: product1, user: user, banners: banner, cat: category });
 } catch (error) {
  console.log("Try cach error homePage 🤷‍♂️📀🤷‍♀️");
  console.log(error.message)
 }
};

// <-------------------------------------------------------| USER LOGOUT ---------------------------------------------------------------------|>
module.exports.userLogout = (req, res) => {

  req.session.user = null;

  res.redirect("/user/login");
};

// <-------------------------------------------------------| RENDERING USER PROFILE ----------------------------------------------------------|>
module.exports.userProfile = async (req, res) => {
  try {
    const user = req.session.user;
  const headCategory = await getCategory();
  const user1 = await User.findOne({_id: user._id})
  console.log(user1);


  res.render("user/userProfile", { user: user1, headCategory });
  } catch (error) {
    console.log(error.message);
  }
};

// <-------------------------------------------------------| RENDERING EDIT USER PROFILE PAGE ------------------------------------------------|>
module.exports.editUserProfilePage = async(req,res)=>{
 try {
  const user = req.session.user;
  const headCategory = await getCategory();
  const user1 = await User.findOne({_id: user._id})
  console.log(user1);

 res.render('user/editUserProfile', {user: user1, headCategory});
 } catch (error) {
  console.log(error.message)
 }
};

// <-------------------------------------------------------| POSTING EDITED USER PROFILE PAGE ------------------------------------------------|>
module.exports.editUserProfile = async(req,res)=>{
 try {

  const user = req.session.user;

  const userDb = await User.findOneAndUpdate({_id: user._id}, {
    $set: {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone
    }
  });

   

    res.redirect('/user/user-profile')
  
 } catch (error) {
  console.log(error.message)
 }

};

// <-------------------------------------------------------| RENDERING EDIT USER PASSWORD PAGE ------------------------------------------------|>
module.exports.editUserPasswordPage = async(req,res)=>{
  try {

    const id = req.session.user._id;
    const user = await User.findOne({_id: id});

    res.render('user/verifyPassword', {user: user, changepass: true})
  } catch (error) {
    console.log(error.message)
  }
}





