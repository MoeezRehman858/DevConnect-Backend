const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");

dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use(cors({
  origin: [
    "http://localhost:5173",                    // local dev
    process.env.FRONTEND_URL                    // production (Vercel URL)
  ],
  credentials: true
}));


app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);

app.get("/", (req, res) => {
  res.send("DevConnect API running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});