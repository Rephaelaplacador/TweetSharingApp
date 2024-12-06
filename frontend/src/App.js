import React, { useState, useEffect } from "react";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import './styles.css'; 

const baseURL = "http://localhost:5001"; 

function App() {
  return (
    <Router>
      <div>
        <h1>X App</h1>
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

function Home() {
  return (
    <div>
      <Link to="/login">Login</Link>
      <br />
      <Link to="/register">Register</Link>
    </div>
  );
}

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${baseURL}/login`, { username, password });
      localStorage.setItem("token", response.data.token);
      navigate("/dashboard");
    } catch (err) {
      alert("Login failed: " + err.response.data.message);
    }
  };

  return (
    <div className="form-container">
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
    </div>
  );
}

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${baseURL}/register`, { username, password });
      navigate("/login");
    } catch (err) {
      if (err.response) {
        alert("Registration failed: " + err.response.data.message);
      } else {
        alert("An error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="form-container">
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
    </div>
  );
}

function Dashboard() {
  const [tweets, setTweets] = useState([]);
  const [content, setContent] = useState("");
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
      await axios.post(
        `${baseURL}/tweets`,
        { content },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      setContent("");
      setTweets([...tweets, { content, username: "Your username" }]); 
    } catch (err) {
      alert("Error posting tweet");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div>
      <button className="logout-button" onClick={handleLogout}>Logout</button>
      <div className="tweet-container">
        <h2>Dashboard</h2>
        <form onSubmit={handleTweetSubmit}>
          <input
            type="text"
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <button type="submit">Tweet</button>
        </form>
        <div>
          {tweets.map((tweet) => (
            <div key={tweet._id} className="tweet">
              <p>{tweet.content}</p>
              <small>{tweet.username}</small>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
