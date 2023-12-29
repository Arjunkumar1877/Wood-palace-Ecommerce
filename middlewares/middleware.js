const { User } = require("../models/userModel");


// <---------------------------| MIDDLEWARE FOR CHECKING BLOCKED USER ------------------------------|>
module.exports.blockChecker = async (req, res, next) => {
  try {


 if(req.session.user){

  const user = req.session.user;
  const id = user._id;

  if (!id) {
    console.log("Session got killed in block checking Middleware ⛔⛔⛔");
  }

  const userDb = await User.findOne({ _id: id });

  if (!userDb) {
    throw new Error("User not found  😥🤷‍♂️");
  }

  if(userDb){
    if (userDb.status === false) {
      req.session.user = null;
      res.redirect("/user/blocked");
    } else {
      next();
    }
  }else{
    next()
  }
 }else{
  next();
 }



  } catch (error) {
    console.log("Try catch error in blockChecker 🤷‍♀️📀🤷‍♂️");
    console.log(error.message);
  }
};

// <---------------------------| SESSION HANDLING MIDDLEWARE USER-----------------------------------|>
module.exports.UserLoginChecker = (req, res, next) => {
  try {
    if (req.session.user) {
     res.redirect('/user');
    } else {
      next();
    }
  } catch (error) {
    console.log("Try catch error in UserLoginChecker 🤷‍♀️📀🤷‍♂️");
    console.log(error.message);
  }
};

// <---------------------------| SESSION HANDLING MIDDLEWARE ADMIN----------------------------------|>
module.exports.adminSessionCheck = (req, res, next) => {
  try {
    if (req.session.name && req.session.admin) {
      res.redirect("/admin/dash");
    } else {
      next();
    }
  } catch (error) {
    console.log("Try catch error in loginCheckUser 🤷‍♀️📀🤷‍♂️");
    console.log(error.message);
  }
};

// <---------------------------| RENDERING BLOCK USER PAGE -----------------------------------------|>
module.exports.blockedUser = (req, res) => {
  try {
    res.render("user/blockPage");
  } catch (error) {
    console.log("Try catch error in loginCheckUser 🤷‍♀️📀🤷‍♂️");
    console.log(error.message);
  }
};

// <---------------------------| RENDERING BLOCK USER PAGE -----------------------------------------|>
module.exports.loginOrNot = async(req,res,next)=>{
  try {
   
    if(req.session.user){
      const user = req.session.user;
      const id = user._id;
      const userDb = await User.findOne({ _id: id });
  
  
      if (userDb.status === false) {
        
        res.redirect("/user/blocked");
      } else {
        next();
      }
    }else{
      res.redirect('/user/signup');
    }
    
  } catch (error) {
    console.log(error.message)
  }
}


