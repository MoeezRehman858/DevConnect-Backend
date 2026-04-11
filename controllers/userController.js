const User = require("../models/User");
const mongoose = require("mongoose");

// FOLLOW USER
exports.followUser = async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);

    if (!userToFollow) {
      return res.status(404).json({ message: "User not found" });
    }

    // prevent following yourself
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    // already following check
    if (currentUser.following.includes(req.params.id)) {
      return res.status(400).json({ message: "Already following" });
    }

    currentUser.following.push(req.params.id);
    userToFollow.followers.push(req.user._id);

    await currentUser.save();
    await userToFollow.save();

    res.json({ message: "User followed" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// UNFOLLOW USER
exports.unfollowUser = async (req, res) => {
  try {
    const userToUnfollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);

    if (!userToUnfollow) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!currentUser.following.includes(req.params.id)) {
      return res.status(400).json({ message: "You are not following this user" });
    }

    currentUser.following = currentUser.following.filter(
      (id) => id.toString() !== req.params.id
    );

    userToUnfollow.followers = userToUnfollow.followers.filter(
      (id) => id.toString() !== req.user._id.toString()
    );

    await currentUser.save();
    await userToUnfollow.save();

    res.json({ message: "User unfollowed" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// GET USER PROFILE

exports.getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;

    // 🔥 FIX: Validate ID first
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findById(id)
      .select("-password")
      .populate("followers", "name email")
      .populate("following", "name email");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);

  } catch (error) {
    console.log("ERROR:", error.message); // 👈 add this
    res.status(500).json({ message: error.message });
  }
};
// UPDATE PROFILE
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ update name, email, bio, skills
    user.name  = req.body.name  || user.name;
    user.email = req.body.email || user.email;
    user.bio   = req.body.bio   !== undefined ? req.body.bio : user.bio;
    user.skills = req.body.skills !== undefined ? req.body.skills : user.skills;

    const updatedUser = await user.save();

    // ✅ return full updated user + token so frontend can update localStorage
    return res.json({
      _id:    updatedUser._id,
      name:   updatedUser.name,
      email:  updatedUser.email,
      bio:    updatedUser.bio,
      skills: updatedUser.skills,
      token:  req.body.token  // pass token through so localStorage stays valid
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
exports.getAllUsers = async (req, res) => {
  try {
    // Returns all users except the logged-in user
    const users = await User.find({ _id: { $ne: req.user._id } })
      .select("name email followers following");

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.searchUsers = async (req, res) =>{
  try{
    const query = req.query.q;
    if(!query || query.trim() === ""){
      return res.json([]);
    }
    const users = await User.find({
      _id:{ $ne: req.user._id },
      name: { $regex: query, $options: "i"}
    })
    .select("name email followers")
    .limit(6);
    return res.json(users);
  }catch(error){
    return res.status(500).json({message:error.message})
  }
};
// UPLOAD PROFILE PICTURE
exports.uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Cloudinary gives us the URL in req.file.path
    user.profilePicture = req.file.path;
    await user.save();

    return res.json({
      _id:            user._id,
      name:           user.name,
      email:          user.email,
      bio:            user.bio,
      skills:         user.skills,
      profilePicture: user.profilePicture,
      token:          req.body.token
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};