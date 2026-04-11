const express = require("express");
const router = express.Router();

const {
  createPost,
  getPosts,
  likePost,
  unlikePost,
  addComment,
  deleteComment,
  deletePost,
  getFeedPosts
} = require("../controllers/postController");


const { protect } = require("../middleware/authMiddleware");
router.get("/feed", protect, getFeedPosts);
router.post("/comment/:id", protect, addComment);
router.delete("/comment/:postId/:commentId", protect, deleteComment);
router.delete("/:id", protect, deletePost);

router.put("/like/:id", protect, likePost);
router.put("/unlike/:id", protect, unlikePost);

router.post("/", protect, createPost);
router.get("/", getPosts);

module.exports = router;