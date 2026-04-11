const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../config/upload'); 

const { 
  followUser, 
  unfollowUser, 
  getUserProfile, 
  updateProfile,
  getAllUsers ,
  searchUsers,
  uploadProfilePicture
} = require("../controllers/userController");


router.get("/search", protect, searchUsers);
router.get("/all", protect, getAllUsers);   
router.get("/:id", protect, getUserProfile);
router.put("/profile", protect, updateProfile);
router.put("/follow/:id", protect, followUser);
router.put("/unfollow/:id", protect, unfollowUser);

router.post("/upload-picture", protect, upload.single("profilePicture"), uploadProfilePicture);
module.exports = router;