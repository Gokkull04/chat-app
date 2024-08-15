import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const ChatPage = ({ username }) => {
  const [message, setMessage] = useState('');
  const [chats, setChats] = useState([]);
  const [receiver, setReceiver] = useState('');
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const socketRef = useRef();

  useEffect(() => {
    // Connect to the server with Socket.IO
    socketRef.current = io('http://localhost:5000');

    // Join the room with the logged-in username
    socketRef.current.emit('join', username);

    // Listen for incoming messages
    socketRef.current.on('receive-message', (data) => {
      setChats((prevChats) => [...prevChats, { sender: data.sender, message: data.message }]);
      alert(`New message from ${data.sender}: ${data.message}`);
    });

    // Fetch existing chats from the server
    axios
      .get('http://localhost:5000/chats', { params: { username } })
      .then((response) => {
        setChats(response.data);
      })
      .catch((error) => {
        console.error('Error fetching chats:', error);
      });

    return () => {
      socketRef.current.disconnect(); // Disconnect when component unmounts
    };
  }, [username]);

  const handleSearch = () => {
    if (search.trim() && search !== username) {
      axios
        .get('http://localhost:5000/search-user', { params: { username: search } })
        .then((response) => {
          if (response.data.exists) {
            setReceiver(search);
            setSearchResults([{ username: search, name: response.data.name }]);
          } else {
            setSearchResults([]);
          }
        })
        .catch((error) => {
          console.error('Error searching for user:', error);
        });
    } else {
      setSearchResults([]);
    }
  };

  const handleSendMessage = () => {
    if (message.trim() && receiver) {
      const newChat = { sender: username, receiver, message }; // Ensure 'username' is set correctly
  
      // Send the message to the server
      axios
        .post('http://localhost:5000/send-message', newChat)
        .then(() => {
          setChats([...chats, { sender: username, message }]);
          setMessage('');
        })
        .catch((error) => {
          console.error('Error sending message:', error);
        });
    }
  };
  

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-1/4 bg-white p-4 border-r border-gray-300">
        <h2 className="text-xl font-semibold mb-4">Search Users</h2>
        <input
          type="text"
          placeholder="Search by username..."
          className="w-full p-2 mb-4 border border-gray-300 rounded-md"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          onClick={handleSearch}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
        >
          Search
        </button>
        {searchResults.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-medium mb-2">Search Results</h3>
            {searchResults.map((user) => (
              <div key={user.username} className="flex items-center mb-2">
                <div>
                  <h4 className="text-md font-semibold">{user.name}</h4>
                  <p className="text-sm text-gray-600">@{user.username}</p>
                </div>
                <button
                  onClick={() => setReceiver(user.username)}
                  className="ml-2 bg-blue-600 text-white px-2 py-1 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Chat
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chat Container */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-4 overflow-y-auto bg-white">
          <div className="border-b border-gray-300 pb-2 mb-2">
            <h2 className="text-xl font-semibold">Chat with {receiver || 'Select a user'}</h2>
          </div>
          <div className="space-y-4">
            {chats.map((chat, index) => (
              <div
                key={index}
                className={`p-2 rounded-md ${
                  chat.sender === username ? 'bg-blue-100 text-blue-800 self-end' : 'bg-gray-100 text-gray-800 self-start'
                }`}
              >
                <strong>{chat.sender}:</strong> {chat.message}
              </div>
            ))}
          </div>
        </div>
        <div className="p-4 bg-gray-200">
          <input
            type="text"
            placeholder="Type your message..."
            className="w-full p-2 border border-gray-300 rounded-md"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button
            onClick={handleSendMessage}
            className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
