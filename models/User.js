const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    bio: { type: String, default: "" },        // ✅ new
    skills: [{ type: String }],                // ✅ new
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    profilePicture:{
        type: String,
        default: ""
    }
});

module.exports = mongoose.model('User', UserSchema);