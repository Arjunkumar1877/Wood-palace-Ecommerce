const mongoose = require('mongoose');
const schema = mongoose.Schema;
require('dotenv/config');
const jwt = require('jsonwebtoken');


const userSchema =  schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required:true,
        unique: true
    },
    phone:{
       type: String,
       required: true
    },
    password:{
        type: String,
        required: true
    },
    otp:{
        type: String,
        required: true
    },
    
    status: {
        type: Boolean,
        default: true
    },
    verify: {
        type: Boolean,
        default: false
    }
})

userSchema.methods.generateJWT = function(){
    const token = jwt.sign({
        _id: this.id,
        phone: this.phone
    }, process.env.JWT_SECRET_KEY);
    return token 
}



module.exports.User = mongoose.model("User", userSchema);

