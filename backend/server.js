const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

// Initialize the app
const app = express();
app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose
  .connect("mongodb+srv://admin:admin@myapp.jp2dt.mongodb.net/?retryWrites=true&w=majority&appName=myApp", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// User Schema
const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
});
const User = mongoose.model("User", UserSchema);

// Tweet Schema
const TweetSchema = new mongoose.Schema({
  content: String,
  username: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});
const Tweet = mongoose.model("Tweet", TweetSchema);

// Hardcoded JWT Secret for simplicity (Not recommended for production)
const JWT_SECRET = "your-very-secure-secret-key"; // Change this to a strong secret

// Register User
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ username, password: hashedPassword });
  await newUser.save();
  res.json({ message: "User registered" });
});

// Login User
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({ message: "Invalid password" });
  }

  // Sign the JWT with the hardcoded secret
  const token = jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET, { expiresIn: "1h" });
  res.json({ token });
});

// Protect Routes with JWT middleware
const authenticateToken = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
};

// Get all tweets
app.get("/tweets", authenticateToken, async (req, res) => {
  const tweets = await Tweet.find();
  res.json(tweets);
});

// Create tweet
app.post("/tweets", authenticateToken, async (req, res) => {
  const { content } = req.body;
  const newTweet = new Tweet({
    content,
    username: req.user.username,  // Use the username from the JWT token
    userId: req.user.userId,      // Use the userId from the JWT token
  });
  try {
    await newTweet.save();
    res.json(newTweet);
  } catch (err) {
    console.error("Error creating tweet:", err);
    res.status(500).json({ message: "Error posting tweet" });
  }
});

// Delete tweet (only the creator can delete)
app.delete("/tweets/:id", authenticateToken, async (req, res) => {
  const tweetId = req.params.id;
  const userId = req.user.userId; // Extract user ID from the token

  try {
    const tweet = await Tweet.findById(tweetId); // Find the tweet by ID
    if (!tweet) return res.status(404).send("Tweet not found.");

    console.log("Tweet owner:", tweet.userId.toString()); // Debugging: Log tweet's userId
    console.log("Authenticated user:", userId); // Debugging: Log the authenticated user's ID

    // Check if the user is the creator of the tweet
    if (tweet.userId.toString() !== userId.toString()) {
      return res.status(403).send("You are not authorized to delete this tweet.");
    }

    // Delete the tweet
    await tweet.remove();
    res.status(200).send("Tweet deleted.");
  } catch (err) {
    console.error("Error deleting tweet:", err); // Debugging: Log error
    res.status(500).send("Server error.");
  }
});

// Start server
app.listen(5001, () => console.log("Server running on http://localhost:5001"));
