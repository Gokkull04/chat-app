import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const ChatPage = ({ currentUser }) => {
  const [socket, setSocket] = useState(null);
  const [message, setMessage] = useState('');
  const [chats, setChats] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    if (currentUser) {
      newSocket.emit('join', currentUser.username);
    }

    if (selectedUser) {
      fetchChatHistory(selectedUser);
    }

    newSocket.on('receive-message', (message) => {
      setChats((prevChats) => [...prevChats, message]);
    });

    return () => newSocket.disconnect();
  }, [currentUser, selectedUser]);

  const fetchChatHistory = async (username) => {
    try {
      const response = await axios.get('http://localhost:5000/chats', {
        params: { username: currentUser.username },
      });
      setChats(response.data);
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!message || !selectedUser) return;

    try {
      await axios.post('http://localhost:5000/send-message', {
        sender: currentUser.username,
        receiver: selectedUser.username,
        message,
      });

      setChats((prevChats) => [
        ...prevChats,
        { sender: currentUser.username, receiver: selectedUser.username, message },
      ]);
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar with user list */}
      <div className="w-1/4 bg-gray-200 p-4">
        <h3 className="text-lg font-semibold mb-4">Your Chats</h3>
        <div className="space-y-4">
          {/* Display a list of users you have chatted with */}
          {/* On click, setSelectedUser(user) to load chat */}
        </div>
      </div>

      {/* Chat window */}
      <div className="w-3/4 p-4 flex flex-col">
        <h3 className="text-lg font-semibold mb-4">
          Chat with {selectedUser ? selectedUser.name : '...'}
        </h3>
        <div className="flex-1 overflow-y-auto p-4 bg-gray-100 rounded-lg">
          {chats.map((chat, index) => (
            <div
              key={index}
              className={`max-w-xs p-3 rounded-lg mb-2 ${
                chat.sender === currentUser.username ? 'bg-green-200 ml-auto' : 'bg-white'
              }`}
            >
              <p className="text-sm">
                <strong>{chat.sender}:</strong> {chat.message}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg p-2"
            placeholder="Type a message..."
          />
          <button
            onClick={handleSendMessage}
            className="ml-2 bg-green-500 text-white p-2 rounded-lg"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
