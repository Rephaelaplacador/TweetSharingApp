import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [username, setUsername] = useState("");
  const [content, setContent] = useState("");
  const [tweets, setTweets] = useState([]);

  const baseURL = "http://localhost:5001"; 

 
  useEffect(() => {
    axios.get(`${baseURL}/tweets`).then((response) => setTweets(response.data));
  }, []);

  
  const handleTweetSubmit = async (e) => {
    e.preventDefault();
    const newTweet = { username, content };
    await axios.post(`${baseURL}/tweets`, newTweet);
    setTweets([...tweets, newTweet]); 
    setContent(""); 
  };

  
  const handleDeleteTweet = async (tweetId) => {
    try {
      await axios.delete(`${baseURL}/tweets/${tweetId}`); 
      setTweets(tweets.filter((tweet) => tweet._id !== tweetId)); 
    } catch (error) {
      console.error("Error deleting tweet:", error);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>OneCodeCamp App</h1>

     
      <form onSubmit={handleTweetSubmit} style={styles.form}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={styles.input}
        />
        <input
          type="text"
          placeholder="What's happening?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          style={styles.input}
        />
        <button type="submit" style={styles.button}>
          Tweet
        </button>
      </form>

      <h2 style={styles.dashboardHeader}>Dashboard</h2>

      
      {tweets.length > 0 ? (
        tweets.map((tweet, index) => (
          <div key={index} style={styles.tweetCard}>
            <p style={styles.tweetContent}>
              <b>{tweet.username}:</b> {tweet.content}
            </p>
            <button
              onClick={() => handleDeleteTweet(tweet._id)}
              style={styles.deleteButton}
            >
              Delete
            </button>
          </div>
        ))
      ) : (
        <p style={styles.noTweetsMessage}>No tweets yet. Start tweeting!</p>
      )}
    </div>
  );
}


const styles = {
  container: {
    padding: "20px",
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#f4f4f9",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    color: "#333",
    fontSize: "2rem",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: "20px",
  },
  input: {
    padding: "10px",
    margin: "10px",
    width: "300px",
    fontSize: "1rem",
    border: "1px solid #ccc",
    borderRadius: "5px",
    backgroundColor: "#fff",
  },
  button: {
    padding: "10px 20px",
    fontSize: "1rem",
    color: "#fff",
    backgroundColor: "#007bff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  dashboardHeader: {
    color: "#333",
    fontSize: "1.5rem",
    marginTop: "20px",
  },
  tweetCard: {
    backgroundColor: "#fff",
    padding: "15px",
    borderRadius: "10px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    marginBottom: "10px",
    width: "80%",
    maxWidth: "600px",
  },
  tweetContent: {
    fontSize: "1rem",
    color: "#333",
  },
  deleteButton: {
    marginTop: "10px",
    padding: "5px 10px",
    fontSize: "0.9rem",
    color: "#fff",
    backgroundColor: "#e74c3c",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  noTweetsMessage: {
    color: "#888",
  },
};

export default App;
