const mongoose = require("mongoose");
const Schema=mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose").default;   
const userschema=Schema({
    email:{
        type:String,
        required:true
    }
});
userschema.plugin(passportLocalMongoose);

module.exports=mongoose.model("User",userschema);