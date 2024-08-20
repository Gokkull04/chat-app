import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

// Replace with your server URL
const SERVER_URL = 'http://localhost:5000';

const ChatPage = () => {
  const [username, setUsername] = useState('');
  const [currentUser, setCurrentUser] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const socketRef = useRef();

  useEffect(() => {
    // Get the username from localStorage or any other method you use to store it
    const storedUser = localStorage.getItem('username');
    if (storedUser) {
      setUsername(storedUser);
      setCurrentUser(storedUser);
    }

    // Connect to Socket.IO server
    socketRef.current = io(SERVER_URL);

    // Join the current user to their own room
    socketRef.current.emit('join', storedUser);

    // Listen for incoming messages
    socketRef.current.on('receive-message', (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    if (selectedUser) {
      // Fetch chats with the selected user
      axios.get(`${SERVER_URL}/chats`, { params: { username: currentUser } })
        .then(response => {
          setMessages(response.data);
        })
        .catch(error => {
          console.error('Error fetching chats:', error);
        });
    }
  }, [selectedUser, currentUser]);

  const handleSearch = () => {
    axios.get(`${SERVER_URL}/search-user`, { params: { username: searchQuery, currentUser } })
      .then(response => {
        if (response.data.exists) {
          setSearchResults([{ username: searchQuery, name: response.data.name }]);
        } else {
          setSearchResults([]);
        }
      })
      .catch(error => {
        console.error('Error searching for user:', error);
      });
  };

  const handleSendMessage = () => {
    if (message.trim() && selectedUser) {
      const msgData = { sender: currentUser, receiver: selectedUser.username, message };
  
      // Send message to server
      axios.post(`${SERVER_URL}/send-message`, msgData)
        .then(() => {
          // Emit message to receiver via Socket.IO
          socketRef.current.emit('send-message', msgData);
          setMessage('');
        })
        .catch(error => {
          console.error('Error sending message:', error);
        });
    }
  };
  
  

  return (
    <div>
      <h1>Chat Application</h1>
      <div>
        <input
          type="text"
          placeholder="Search for users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>
      <div>
        {searchResults.length > 0 ? (
          <ul>
            {searchResults.map((user) => (
              <li key={user.username} onClick={() => setSelectedUser(user)}>
                {user.name}
              </li>
            ))}
          </ul>
        ) : (
          <p>No results</p>
        )}
      </div>
      <div>
        {selectedUser && (
          <div>
            <h2>Chat with {selectedUser.name}</h2>
            <div>
              <ul>
                {messages.map((msg, index) => (
                  <li key={index}>
                    <strong>{msg.sender}:</strong> {msg.message} <em>({new Date(msg.timestamp).toLocaleTimeString()})</em>
                  </li>
                ))}
              </ul>
            </div>
            <input
              type="text"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button onClick={handleSendMessage}>Send</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
