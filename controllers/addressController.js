const { Address } = require("../models/addressSchema");
const Category = require("../models/categorySchema");
const { User } = require("../models/userModel");

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
    console.log("try catch error getcategory  in addressController 🤷‍♂️📀🤷‍♀️");
    console.log(error.message);
  }
};

// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^//
// <                             <$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ USER SIDE $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$>                            > //
// vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv//


// <-------------------------------------------------------| RENDERING A PAGE WITH ADDRESSES LISTED -------------------------------------------|>
module.exports.manageAddress = async (req, res) => {
  try {
    const user = req.session.user;

    // Find addresses for the user with the given user ID
    const userAddresses = await Address.findOne({ userId: user._id });

    console.log(userAddresses);
    const headCategory = await getCategory();

    res.render("user/addressManage", {
      headCategory,
      userAddresses: userAddresses,
      user: user,
    });
  } catch (error) {
    console.log("Try catch error in manageAddress 🤷‍♀️📀🤷‍♂️");
    console.log(error.message);
    res.status(500).json({ error: "Error fetching addresses" });
  }
};

// <-------------------------------------------------------| RENDERING THE PAGE TO ADD ADDRESSES-----------------------------------------------|>
module.exports.addAddressPage = async (req, res) => {
  try {
    const headCategory = await getCategory();
    const user = req.session.user;

    res.render("user/addAddress", { headCategory, user: user });
  } catch (error) {
    console.log("Try catch error in addAddressPage 🤷‍♂️📀🤷‍♀️");
    console.log(error.message);
  }
};

// <-------------------------------------------------------| POSTING & ADDING ADDRESS TO THE DATABASE -----------------------------------------|>
module.exports.addAddress = async (req, res) => {
  try {
    const userId = req.session.user._id;
    const addressSchema = await Address.findOne({ userId: userId });

    const user = req.session.user;

    if (!addressSchema) {
      const newAddress = new Address({
        userId: userId,
        address: [
          {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            landmark: req.body.landmark,
            addressDetail: req.body.addressDetail,
            state: req.body.state,
            zip: req.body.zip,
            phone: req.body.phone,
          },
        ],
      });
      await newAddress.save();
    } else {
      const addAddress = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        landmark: req.body.landmark,
        addressDetail: req.body.addressDetail,
        state: req.body.state,
        zip: req.body.zip,
        phone: req.body.phone,
      };
      addressSchema.address.push(addAddress);
      await addressSchema.save();
    }

    // console.log(updatedUser);

    res.redirect("/user/manage-address");
  } catch (error) {
    console.log("Try catch error in addAddress 🤷‍♂️📀🤷‍♀️");
    console.log(error.message);
  }
};

// <-------------------------------------------------------| RENDERING THE PAGE TO EDIT ADDRESSES----------------------------------------------|>
module.exports.editAddressPage = async (req, res) => {
  try {
    const userId = req.session.user._id;
    const user = req.session.user;
    const addressId = req.params.id;
    const headCategory = await getCategory();
    const addressSchema = await Address.findOne({ userId: userId });
    if (addressSchema) {
      var address = addressSchema.address.id(addressId);
    } else {
      console.log("Nod Schema");
    }

    if (!address) {
      console.log("no Data ");
    } else {
      res.render("user/editAddressPage", { address, headCategory, user: user });
    }
  } catch (error) {
    console.log("Try catch error in editAddressPage 🤷‍♂️📀🤷‍♀️");
    console.log(error.message);
  }
};

// <-------------------------------------------------------| POSTING & EDITING THE ADDRESSES---------------------------------------------------|>
module.exports.editAddress = async (req, res) => {
  try {
    const userId = req.session.user._id;
    const addressIdToEdit = req.params.id;
    const user = req.session.user;
    if (!userId) {
      return res.status(404).json({ message: "User not found" });
    }
    const result = await Address.updateOne(
      {
        "address._id": addressIdToEdit,
      },
      {
        $set: {
          "address.$.firstName": req.body.firstName,
          "address.$.lastName": req.body.lastName,
          "address.$.landmark": req.body.landmark,
          "address.$.addressDetail": req.body.addressDetail,
          "address.$.state": req.body.state,
          "address.$.zip": req.body.zip,
          "address.$.phone": req.body.phone,
        },
      }
    );
    // await result.save();
    console.log(result);
    if (result.nModified === 0) {
      return res.json("failed updating");
    }
    return res.redirect("/user/manage-address");
  } catch (error) {
    console.log("Try catch error in editAddress 🤷‍♀️📀🤷‍♂️");
    console.log(error.message);
  }
};

// <-------------------------------------------------------| DELETING THE ADDRESSES FROM THE ARRAY---------------------------------------------|>
module.exports.deleteAddress = async (req, res) => {
  try {
    const userID = req.session.user._id;
    const id = req.params.id;
    const removed = await Address.findOneAndUpdate(
      { userId: userID },
      { $pull: { address: { _id: id } } }
    );
    console.log(removed);
    if (removed) {
      // res.json("successssssss")
      res.redirect("/user/manage-address");
    } else {
      res.json("error");
    }
  } catch (error) {
    console.log("Try catch error in deleteAddressPage 🤷‍♂️📀🤷‍♀️");
    console.log(error.message);
  }
};

// <-------------------------------------------------------| GET A NEW PAGE TO ADD ADDRESS IN CHECKOUT PAGE -----------------------------------|>
module.exports.addNewAddressForCheckoutPage = async (req, res) => {
  try {
    const user = req.session.user;
    const headCategory = await getCategory();
    res.render("user/addAddressCheckout", { headCategory, user: user });
  } catch (error) {
    console.log("Try catch error in addNewAddressForCheckout 🤷‍♂️📀🤷‍♀️");
    console.log(error.message);
  }
};

// <-------------------------------------------------------| POST & ADD NEW ADDRESS IN CHECKOUT PAGE ------------------------------------------|>
module.exports.addNewAddressCheckout = async (req, res) => {
  try {
    const userId = req.session.user._id;
    const addressSchema = await Address.findOne({ userId: userId });
    const user = req.session.user;

    if (!addressSchema) {
      const newAddress = new Address({
        userId: userId,
        address: [
          {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            landmark: req.body.landmark,
            addressDetail: req.body.addressDetail,
            state: req.body.state,
            zip: req.body.zip,
            phone: req.body.phone,
          },
        ],
      });
      await newAddress.save();
    } else {
      const addAddress = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        landmark: req.body.landmark,
        addressDetail: req.body.addressDetail,
        state: req.body.state,
        zip: req.body.zip,
        phone: req.body.phone,
      };
      addressSchema.address.push(addAddress);
      await addressSchema.save();
    }
    // console.log(updatedUser);
    res.redirect("/user/checkout");
  } catch (error) {
    console.log("Try catch error in addNewAddressForCheckout 🤷‍♂️📀🤷‍♀️");
    console.log(error.message);
  }
};






