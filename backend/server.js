const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");


const app = express();
app.use(express.json());
app.use(cors());


mongoose
  .connect("mongodb+srv://admin:admin@myapp.jp2dt.mongodb.net/?retryWrites=true&w=majority&appName=myApp", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));


const TweetSchema = new mongoose.Schema({
  username: String,
  content: String,
});
const Tweet = mongoose.model("Tweet", TweetSchema);


app.post("/tweets", async (req, res) => {
  const { username, content } = req.body;
  const newTweet = new Tweet({ username, content });
  await newTweet.save();
  res.json(newTweet);
});

app.get("/tweets", async (req, res) => {
  const tweets = await Tweet.find();
  res.json(tweets);
});


app.delete("/tweets/:id", async (req, res) => {
  try {
    await Tweet.findByIdAndDelete(req.params.id); 
    res.json({ message: "Tweet deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting tweet", error: err });
  }
});


const PORT = 5001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
