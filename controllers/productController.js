const Cart = require("../models/cartSchema");
const Category = require("../models/categorySchema");
const { Product } = require("../models/productSchema");
const { Wishlist } = require("../models/wishlistSchema");
const fs = require('fs');
const path = require('path');


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


// <-------------------------------------------------------| RENDERING PRODUCTS ACCORDING TO THE CATEGORIES -----------------------------------|>
module.exports.productLoad = async (req, res) => {
  try {
    const id = req.query.id;
    const product = await Product.find({ category: id }).populate("category");

    console.log(product);
    const user = req.session.user;

    const headCategory = await getCategory();
    res.render("user/productCollections", {
      product: product,
      headCategory,
      admin: false,
      user: user
    });
  } catch (error) {
    console.log("Try catch error in productLoad 🤷‍♀️📀🤷‍♂️");
    console.log(error.message);
  }
};

// <-------------------------------------------------------| RENDERING ALL PRODUCTS -----------------------------------------------------------|>
module.exports.allProducts = async (req, res) => {
  try {
    const headCategory = await getCategory();

    const user = req.session.user;    

    const results = await Product.find({});

    res.render("user/allProducts", {
      headCategory,
      product: results,
      user: user
      
    });
  } catch (error) {
    console.log("Try catch error in allProducts 🤷‍♀️📀🤷‍♂️");
    console.log(error.message);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// <-------------------------------------------------------| RENDERING DETAILED VIEW OF A  PRODUCTS -------------------------------------------|>
module.exports.productSingleView = async (req, res) => {
  try {
    const id = req.query.id;
    const product = await Product.findById(id);
    const headCategory = await getCategory();
    const user = req.session.user;

    res.render("user/singleProductPage", { product: product, headCategory, user: user });
  } catch (error) {
    console.log("Try catch error in productSingleView 🤷‍♀️📀🤷‍♂️");
    console.log(error.message);
  }
};

// <-------------------------------------------------------| SEARCHING PRODUCTS USING BY FETCHING  --------------------------------------------|>
module.exports.productSearch = async (req, res) => {
  try {
    let payload = req.body.payload.trim();
    let search = await Product.find({
      name: { $regex: new RegExp("^" + payload + ".*", "i") },
    }).exec();

    search = search.slice(0, 10);

    console.log(search);
    res.send({ payload: search });
  } catch (error) {
    console.log("Try catch error in  productSearch 🤷‍♀️📀🤷‍♂️");
    console.log(error.message);
  }
};

// <-------------------------------------------------------| FILTERING PRODUCTS WITH AJAX  ----------------------------------------------------|>
module.exports.filterProductAjax = async (req, res) => {
  try {
  
    const price = req.body.price;
    const id = req.body.categoryId;

    console.log(price         + "            "  + id);

    const product = await Product.find({})

    const productCat = await Product.find({ category: id }).populate("category");
   
    let products = [];
  
    

    if(price !== undefined && id === undefined){
      if (price < 2000) {
        products =  product.filter((value)=> value.price >= 1000 && value.price <= 2000);
      } else if (price < 3000) {
        products =  product.filter((value)=> value.price >= 2000 && value.price <= 3000);
      } else if (price < 4000) {
        products =  product.filter((value)=> value.price >= 3000 && value.price <= 4000);
      } else if (price < 5000) {
        products =  product.filter((value)=> value.price >= 4000 && value.price <= 5000);
      } else if (price < 6000) {
        products =  product.filter((value)=> value.price >= 5000 && value.price <= 6000);
      } else if (price < 7000) {
        products =  product.filter((value)=> value.price >= 6000 && value.price <= 7000);
      } else if (price < 8000) {
        products =  product.filter((value)=> value.price >= 7000 && value.price <= 8000);
      }  else if (price < 9000) {
        products =  product.filter((value)=> value.price >= 8000 && value.price <= 9000);
      } 
      res.send({ products: products });
console.log("h00000000000000000000000000000iiiiiiiiiiiiiiiiiiiiiiiii")
    }else if(price !== undefined && id !== undefined){


      if(price < 2000){
        products = productCat.filter((value)=> value.price >= 1000 && value.price <= 2000);
      }else if(price < 3000){
        products = productCat.filter((value)=> value.price >= 2000 && value.price <= 3000);
      }else if(price < 4000){
        products = productCat.filter((value)=> value.price >= 3000 && value.price <= 4000);
      }else if(price < 5000){
        products = productCat.filter((value)=> value.price >= 4000 && value.price <= 5000);
      }else if(price < 6000){
        products = productCat.filter((value)=> value.price >= 5000 && value.price <= 6000);
      }else if(price < 7000){
        products = productCat.filter((value)=> value.price >= 6000 && value.price <= 7000);
      }else if(price < 8000){
        products = productCat.filter((value)=> value.price >= 7000 && value.price <= 8000);
      }else if(price < 9000){
        products = productCat.filter((value)=> value.price >= 8000 && value.price <= 9000);
      }
      console.log("heeeeeeeeeeeeeeeeyyyyyyyyyy")
      res.send({ products: products });


    }else if (price === undefined && id !== undefined) {
      
      products = productCat;
      console.log("helllllllllllllllllllllllloooooooooooooooooooo")
      res.send({ products: products });
    }else{
      products = product
      console.log("All productsssssssssss")
      res.send({ products: products });
    }
    

  } catch (error) {
    console.log(error.message);
    console.log('try cach error in filterProductAjax 🤷‍♂️📀🤷‍♀️')
  }
};









// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^//
// <                             <$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ ADMIN SIDE $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$>                            > //
// vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv//


// <---------------------------------------------------------|  RENDERING PAGE WITH ADDED PRODUCTS PRODUCT LISTED -------------------------------|>
module.exports.productMg = async (req, res) => {
  try {
    const page = !parseInt(req.query.page) ? 1 : parseInt(req.query.page);
    const limit = parseInt(req.query.limit) || 4;
    const startIndex = (page - 1) * limit;

    const productDb = await Product.find().skip(startIndex).limit(limit);

    console.log(productDb)
    const msg = ".";
    res.render("admin/viewProducts", {
      data: msg,
      productDb: productDb,
      page: page,
      limit: limit,
      admin: true,
    });
  } catch (error) {
    console.log("Try catch error in productMg 🤷‍♂️📀🤷‍♀️");
    console.log(error.message);
  }
};

// <---------------------------------------------------------| RENDERING  ADDING NEW PRODUCTS PAGE ----------------------------------------------|>
module.exports.addProductPage = async (req, res) => {
  try {
    msg = ".";
    const category = await getCategory();
    res.render("admin/addProducts", { data: msg, category, admin: true });
  } catch (error) {
    console.log("Try catch error in addProductPage 🤷‍♂️📀🤷‍♀️");
    console.log(error.message);
  }
};

// <---------------------------------------------------------|  ADDING NEW PRODUCTS -------------------------------------------------------------|>
module.exports.addProduct = async (req, res) => {
  try {

    const images = req.files.map(file => ({ url: file.filename }));

    const productData = new Product({
      name: req.body.name,
      category: req.body.category,
      price: req.body.price,
      description: req.body.description,
      images: images,
      stock: req.body.stock,
    });


    await productData.save();
    msg = "New Product Added";
    console.log("🔥🔥🔥🔥🔥🔥🔥", { msg: msg });

    return res.redirect("/admin/add-productPage");
  } catch (error) {
    console.log("Try catch error in addProduct 🤷‍♂️📀🤷‍♀️");
    console.log(error.message);
  }
};

// <---------------------------------------------------------| RENDERING THE EDIT PRODUCTS PAGE -------------------------------------------------|>
module.exports.editProduct = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      res.status(400).send("Invalid product ID");
    }
    const category = await getCategory();
    const product = await Product.findById(id).exec();
    if (!product) {
      res.status(404).send("Product not found");
    }

    // console.log(categories)

    res.render("admin/editProduct", {
      title: "Edit User",
      product: product,
      admin: true,
      category,
    });
  } catch (error) {
    console.log("Try catch error in editProduct 🤷‍♂️📀🤷‍♀️");
    console.log(error.message);
  }
};

// <---------------------------------------------------------| EDITTING THE ADDED PRODUCTS ------------------------------------------------------|>
module.exports.updateProduct = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).send("Invalid product ID");
    }

    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).send("Product not found");
    }

    let newImages = [];

    if (req.files && req.files.length > 0) {
      newImages = req.files.map(file => ({ url: file.filename }));
      
      try {
        existingProduct.images.forEach(image => {
          const imagePath = path.join(__dirname, '../public/uploads/', image.url);
          fs.unlinkSync(imagePath);
        });
      } catch (err) {
        console.log("Error deleting existing images:", err);
      }
    }

    const newData = await Product.updateOne(
      { _id: id },
      {
        name: req.body.name,
        category: req.body.category,
        price: req.body.price,
        description: req.body.description,
        images: newImages.length > 0 ? newImages : existingProduct.images,
        stock: req.body.stock,
      }
    );

    console.log(newData);

    res.redirect("/admin/product-mg");
  } catch (error) {
    console.log('Try catch error in updateProduct 🤷‍♂️📀🤷‍♀️');
    console.log(error.message);
  }
};

// <---------------------------------------------------------| DELETING THE ADDED PRODUCTS ------------------------------------------------------|>
module.exports.deleteProduct = async (req, res, next) => {
  try {
    const id = req.params.id;

    const product = await Product.findByIdAndRemove(id).exec();

    if (product.images && product.images.length > 0) {
      try {
product.images.forEach(image=>{
  const imagePath = path.join(__dirname, '../public/uploads/', image.url);
  fs.unlinkSync(imagePath);

})

      } catch (err) {
        console.error(err);
      }
    }

    res.redirect("/admin/product-mg");
  } catch (error) {
    console.log("Try catch error in deleteProduct 🤷‍♂️📀🤷‍♀️");
    console.log(error.message);
  }
};

// <---------------------------------------------------------| DELETING SINGLE IMAGE ------------------------------------------------------------|>
module.exports.deleteImage = async (req, res) => {
  try {
   let imgId = req.body.imageId;
   let prodId = req.body.productId;

   console.log(imgId + "📀📀📀📀" + prodId);

   const product = await Product.findOne({_id: prodId});
   console.log(product)

   if(product){
    var imgIndex = product.images.findIndex((index)=> index._id.toString() === imgId);
    console.log(imgIndex)

    try {
      const deleteimage = path.join(__dirname, '../public/uploads/'+ product.images[imgIndex].url);
      fs.unlinkSync(deleteimage)
    } catch (error) {
      console.log(error.message);
    }
   }


   product.images.splice(imgIndex,1);

   res.send(imgId)

   await product.save();
  } catch (error) {
    console.log("Try catch error in deleteImage 🤷‍♂️📀🤷‍♀️");
    console.log(error.message);
  }
};

// <---------------------------------------------------------| CROPPING PAGE --------------------------------------------------------------------|>
module.exports.croppingImagePage = async (req,res)=>{
try {
  const id = req.params.id;


  const item = await Product.findOne({_id: id});

  res.render('admin/cropperImage', {item: item})
} catch (error) {
  console.log(error.message);
}
};

// <---------------------------------------------------------| CROPPING SINGLE IMAGE ------------------------------------------------------------|>
module.exports.cropImageAjax = async(req,res)=>{
  try {

    const image = req.body.image
    console.log(req.body.image);

    console.log(image.toDataUrl('image/png'));
    
  } catch (error) {
    console.log(error.message);
  }
};