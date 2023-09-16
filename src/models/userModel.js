const mongoose= require("../services/db");
// user class
const UserSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    salt:{
        type: String,
        required: true
    },
    // TODO: status, isAdmin: false
})

const UserModel = mongoose.model("User", UserSchema);

module.exports = UserModel;