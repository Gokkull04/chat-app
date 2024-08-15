import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const ChatPage = ({ username }) => {
  const [message, setMessage] = useState('');
  const [chats, setChats] = useState([]);
  const [receiver, setReceiver] = useState(''); // Store receiver username
  const [search, setSearch] = useState('');
  const [userExists, setUserExists] = useState(false); // Track if the user exists
  const socketRef = useRef();

  useEffect(() => {
    // Connect to the server with Socket.IO
    socketRef.current = io('http://localhost:5000');

    // Join the room with the logged-in username
    socketRef.current.emit('join', username);

    // Listen for incoming messages
    socketRef.current.on('receive-message', (data) => {
      setChats((prevChats) => [...prevChats, { sender: data.sender, text: data.message }]);
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
    if (search.trim()) {
      axios
        .get('http://localhost:5000/search-user', { params: { username: search } })
        .then((response) => {
          if (response.data.exists) {
            setReceiver(search);
            setUserExists(true);
          } else {
            alert('User not found');
            setUserExists(false);
          }
        })
        .catch((error) => {
          console.error('Error searching for user:', error);
        });
    }
  };

  const handleSendMessage = () => {
    if (message.trim() && userExists) {
      const newChat = { sender: username, receiver, message };

      // Send the message to the server
      axios
        .post('http://localhost:5000/send-message', newChat)
        .then(() => {
          setChats([...chats, { sender: username, text: message }]);
          setMessage('');
        })
        .catch((error) => {
          console.error('Error sending message:', error);
        });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-blue-100 flex">
      
      {/* Sidebar */}
      <div className="w-1/4 bg-white p-4">
        <h2 className="text-xl font-semibold mb-4">Chats</h2>
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
        {/* Display searched user if found */}
        {userExists && (
          <ul className="mt-4 space-y-2">
            <li
              className="p-2 bg-gray-100 rounded-md cursor-pointer"
              onClick={() => setReceiver(search)}
            >
              {search}
            </li>
          </ul>
        )}
      </div>
      
      {/* Divider */}
      <div className="w-0.5 bg-gray-300"></div>
      
      {/* Chat Container */}
      <div className="flex-1 flex flex-col">
        <div className="bg-white p-4 shadow-md">
          <h2 className="text-xl font-semibold text-gray-700">{receiver || 'Select a contact'}</h2>
        </div>
        <div className="flex-1 p-4 bg-white overflow-y-auto space-y-4">
          {chats.map((chat, index) => (
            <div
              key={index}
              className={`flex ${
                chat.sender === username ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-xs p-2 rounded-lg ${
                  chat.sender === username
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                {chat.text}
              </div>
            </div>
          ))}
        </div>
        
        {/* Message Input */}
        <div className="bg-gray-100 p-4 flex items-center space-x-2">
          <textarea
            className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            rows="1"
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button
            onClick={handleSendMessage}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!userExists}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
