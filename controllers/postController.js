const Post = require("../models/Post");

// ─── CREATE POST ──────────────────────────────────────────────
exports.createPost = async (req, res) => {
  try {
    const { text } = req.body;

    const post = await Post.create({
      user: req.user._id,
      text,
    });

    // ✅ populate user so frontend gets name immediately
    const populated = await post.populate("user", "name email");

    return res.status(201).json(populated);

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ─── GET ALL POSTS ────────────────────────────────────────────
exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "name email")
      .populate("comments.user", "name")
      .sort({ createdAt: -1 });

    return res.json(posts);

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ─── GET FEED POSTS ───────────────────────────────────────────
exports.getFeedPosts = async (req, res) => {
  try {
    const User = require("../models/User");
    const user = await User.findById(req.user._id);

    // ✅ Show followed users posts + your own posts
    const feedUsers = [...user.following, req.user._id];

    const posts = await Post.find({ user: { $in: feedUsers } })
      .populate("user", "name email")
      .populate("comments.user", "name")
      .sort({ createdAt: -1 });

    return res.json(posts);

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ─── LIKE POST ────────────────────────────────────────────────
exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // ✅ likes stored as plain user IDs (simpler + matches frontend)
    const alreadyLiked = post.likes.includes(req.user._id.toString());

    if (alreadyLiked) {
      return res.status(400).json({ message: "Post already liked" });
    }

    post.likes.push(req.user._id);
    await post.save();

    return res.json({ likes: post.likes }); // ✅ return { likes } object

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ─── UNLIKE POST ──────────────────────────────────────────────
exports.unlikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const alreadyLiked = post.likes.includes(req.user._id.toString());

    if (!alreadyLiked) {
      return res.status(400).json({ message: "Post not liked yet" });
    }

    // ✅ filter out the user's ID
    post.likes = post.likes.filter(
      (id) => id.toString() !== req.user._id.toString()
    );

    await post.save();

    return res.json({ likes: post.likes }); // ✅ return { likes } object

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ─── ADD COMMENT ─────────────────────────────────────────────
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.comments.unshift({ user: req.user._id, text });
    await post.save();

    // ✅ populate comments before sending back
    await post.populate("comments.user", "name");

    return res.json(post.comments);

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ─── DELETE COMMENT ───────────────────────────────────────────
exports.deleteComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = post.comments.find(
      (c) => c._id.toString() === req.params.commentId
    );

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "User not authorized" });
    }

    post.comments = post.comments.filter(
      (c) => c._id.toString() !== req.params.commentId
    );

    await post.save();

    return res.json(post.comments);

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ─── DELETE POST ──────────────────────────────────────────────
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "User not authorized" });
    }

    await post.deleteOne();

    return res.json({ message: "Post removed" });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};