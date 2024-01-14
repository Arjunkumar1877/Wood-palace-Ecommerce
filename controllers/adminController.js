const objectId = require("mongodb").ObjectId;
let { Product } = require("../models/productSchema");
const { promisify } = require("util");
const fs = require("fs").promises;
const path = require("path");
const Category = require("../models/categorySchema");
const { User } = require("../models/userModel");
const { Admin } = require("../models/adminSchema");
const { Orders } = require("../models/orderSchema");

// Function to get categories
const getCategory = async function () {
  try {
    const categories = await Category.find({});
    if (categories.length > 0) {
      return categories;
    } else {
      throw new Error("Couldn't find categories");
    }
  } catch (error) {
    console.log(error.message);
  }
};

let errorMessage = null;


// <-------------------------------------------------------| RENDERING ADMIN LOGIN PAGE -------------------------------------------------------|>
module.exports.adminLogin = (req, res) => {
  try {
    res.render("admin/login", { admin: true });
    console.log(req.session);
  } catch (error) {
    console.log("Try catch error in adminLogin 🤷‍♂️📀🤷‍♀️");
    console.log(error.message);
  }
};

// <-------------------------------------------------------|  ADMIN CHECKING EMAIL & PASSWORD  LOGININGIN -------------------------------------|>
module.exports.adminVerifyLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const existingAdmin = await Admin.findOne({ email, password });

    if (existingAdmin) {
      req.session.admin = email;
      req.session.name = true;
      // req.session.save()
      console.log(req.session);
      res.redirect("/admin/dash");
    } else {
      res.redirect("/admin");
    }
  } catch (error) {
    console.log("Try catch error in adminVerifyLogin 🤷‍♂️📀🤷‍♀️");
    console.log(error.message);
  }
};

// <-------------------------------------------------------|  RENDERING CATEGORY ADDING PAGE --------------------------------------------------|>
module.exports.CategoryMg = async (req, res) => {
  try {
    const category = await getCategory();

    res.render("admin/addCategory", {
      category,
      admin: true,
      message: errorMessage,
    });
  } catch (error) {
    console.log("Try catch error in CategoryMg 🤷‍♂️📀🤷‍♀️");
    console.log(error.message);
  }
};

// <-------------------------------------------------------|  ADDING CATEGORY -----------------------------------------------------------------|>
module.exports.addCategory = async (req, res) => {try {
  const categoryNew = req.body.categoryName;
  const oldCategory = await Category.findOne({ categoryName: categoryNew });
  if (!oldCategory) {
    const categorySave = new Category({
      categoryName: categoryNew,
    });
    const saved = await categorySave.save();
    if (saved) {
      errorMessage = "New Category Added.";
      res.redirect("/admin/category-mg");
      return;
    } else {
      console.log("Error saving category not try-catch error.");
    }
  } else {
    errorMessage = "Category you have entered already exists..!";
    res.redirect("/admin/category-mg");
  }
} catch (error) {
  console.log("Try catch error in addCategory 🤷‍♂️📀🤷‍♀️");
  console.log(error.message);
}
  
};

// <-------------------------------------------------------|  DEACTIVATING CATEGORY -----------------------------------------------------------|>
module.exports.deactivateCategory = async (req, res) => {
  try {
    const id = req.params.id;
    await Category.findByIdAndUpdate(id, { active: false });
    res.redirect("/admin/category-mg");
  } catch (error) {
    console.log("Try catch error in deactivateCategory 🤷‍♂️📀🤷‍♀️");
    console.log(error.message);
  }
};

// <-------------------------------------------------------|  ACTIVATING CATEGORY -------------------------------------------------------------|>
module.exports.activateCategory = async (req, res) => {
  try {
    const id = req.params.id;
    await Category.findByIdAndUpdate(id, { active: true });
    res.redirect("/admin/category-mg");
  } catch (error) {
    console.log("Try catch error in activateCategory 🤷‍♂️📀🤷‍♀️");
    console.log(error.message);
  }
};

// <-------------------------------------------------------| RENDERING  EDITCATEGORY PAGE -----------------------------------------------------|>
module.exports.editCategoryPage = async(req,res)=>{
  try {

    const id = req.params.id;

    const category = await Category.findOne({_id: id});
  
    if(category){
      console.log(category)
      res.render('admin/editCategory', {category: category});
    }else{
      console.log("no category data found for editing");
    }
  
  } catch (error) {
    console.log("Try catch error in editCategoryPage 🤷‍♂️📀🤷‍♀️");
    console.log(error.message);
  }
};

// <-------------------------------------------------------|  EDITING CATEGORY NAME -----------------------------------------------------------|>
module.exports.editCategory = async(req,res)=>{
  try {
    const catId = req.params.id;

    const category = await Category.findOneAndUpdate({_id: catId},{
      categoryName: req.body.categoryName
    })

    if(category){
      res.redirect("/admin/category-mg");
    }else{
      console.log('failed to edit category name');
    }


  } catch (error) {
    console.log("Try catch error in editCategory 🤷‍♂️📀🤷‍♀️");
    console.log(error.message);
  }
};

// <-------------------------------------------------------| RENDERING  THE USER MANAGMENT PAGE PAGE ------------------------------------------|>
module.exports.userManagment = async (req, res) => {
  try {
    const user = await User.find();
    res.render("admin/userManagment", { user: user });
  } catch (error) {
    console.log("Try catch error in userManagment 🤷‍♂️📀🤷‍♀️");
    console.log(error.message);
  }
};

// <-------------------------------------------------------| BLOCKING TH EXCISTING USER -------------------------------------------------------|>
module.exports.blockUser = async (req, res) => {
  try {
    const id = req.params.id;
    await User.findByIdAndUpdate(id, { status: true });

    res.redirect("/admin/user-mg");
  } catch (error) {
    console.log("Try catch error in blockUser 🤷‍♂️📀🤷‍♀️");
    console.log(error.message);
  }
};

// <-------------------------------------------------------| UNBLOCKING THE EXCISTING USER ----------------------------------------------------|>
module.exports.unblockUser = async (req, res) => {
  try {
    const id = req.params.id;
    await User.findByIdAndUpdate(id, { status: false });
    res.redirect("/admin/user-mg");
  } catch (error) {
    console.log("Try catch error in unblockUser 🤷‍♂️📀🤷‍♀️");
    console.log(error.message);
  }
};

// <-------------------------------------------------------| ADMIN LOGGIN OUT -----------------------------------------------------------------|>
module.exports.adminLogout = (req, res) => {
  try {
    req.session.admin = null
    res.redirect("/admin");
  } catch (error) {
    console.log("Try catch error in adminLogout 🤷‍♂️📀🤷‍♀️");
    console.log(error.message);
  }
};

