const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// ─── Generate Token ───────────────────────────────────────────
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// ─── REGISTER ─────────────────────────────────────────────────
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 2. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // 4. Send response
    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ─── LOGIN ────────────────────────────────────────────────────
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 2. Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 3. Send response — only ONE res.json() ✅
    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};