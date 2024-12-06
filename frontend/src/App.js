import React, { useState, useEffect } from "react";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";

const baseURL = "http://localhost:5001"; // Backend API URL

function App() {
  return (
    <Router>
      <div>
        <h1>Tweet Sharing App</h1>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

// Home Page
function Home() {
  return (
    <div>
      <Link to="/login">Login</Link>
      <br />
      <Link to="/register">Register</Link>
    </div>
  );
}

// Login Page
function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${baseURL}/login`, { username, password });
      localStorage.setItem("token", response.data.token); // Store token
      navigate("/dashboard");
    } catch (err) {
      alert("Login failed!");
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>
      <Link to="/register">Don't have an account? Register</Link>
    </div>
  );
}

// Register Page
function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${baseURL}/register`, { username, password });
      alert("Registration successful! Please login.");
      navigate("/login");
    } catch (err) {
      alert("Registration failed!");
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Register</button>
      </form>
      <Link to="/login">Already have an account? Login</Link>
    </div>
  );
}

// Dashboard
function Dashboard() {
  const [tweets, setTweets] = useState([]);
  const [content, setContent] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editingTweetId, setEditingTweetId] = useState(null);
  const authToken = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (!authToken) {
      navigate("/login");
    } else {
      axios
        .get(`${baseURL}/tweets`, { headers: { Authorization: `Bearer ${authToken}` } })
        .then((response) => setTweets(response.data))
        .catch((err) => alert("Error fetching tweets"));
    }
  }, [authToken, navigate]);

  const handleTweetSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${baseURL}/tweets`,
        { content },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      setTweets([response.data, ...tweets]); // Add new tweet to the top
      setContent(""); // Clear input
    } catch (err) {
      alert("Error posting tweet");
    }
  };

  const handleEditTweet = async (tweetId) => {
    try {
      const response = await axios.put(
        `${baseURL}/tweets/${tweetId}`,
        { content: editContent },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      setTweets(
        tweets.map((tweet) =>
          tweet._id === tweetId ? { ...tweet, content: response.data.content } : tweet
        )
      );
      setEditingTweetId(null); // Reset editing state
      setEditContent(""); // Clear edit content
    } catch (err) {
      alert("Error updating tweet");
    }
  };

  const handleDeleteTweet = async (tweetId) => {
    try {
      await axios.delete(`${baseURL}/tweets/${tweetId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setTweets(tweets.filter((tweet) => tweet._id !== tweetId)); // Remove tweet from UI
    } catch (err) {
      alert("Error deleting tweet");
    }
  };

  return (
    <div>
      <h2>Dashboard</h2>
      <form onSubmit={handleTweetSubmit}>
        <textarea
          placeholder="What's happening?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button type="submit">Post Tweet</button>
      </form>

      <div>
        {tweets.map((tweet) => (
          <div key={tweet._id}>
            <p>{tweet.content}</p>
            {tweet.userId === authToken.userId && (
              <>
                <button onClick={() => setEditingTweetId(tweet._id)}>Edit</button>
                <button onClick={() => handleDeleteTweet(tweet._id)}>Delete</button>
              </>
            )}
            {editingTweetId === tweet._id && (
              <div>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                />
                <button onClick={() => handleEditTweet(tweet._id)}>Save</button>
                <button onClick={() => setEditingTweetId(null)}>Cancel</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
