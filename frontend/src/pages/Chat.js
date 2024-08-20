import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import './ChatPage.css'; // Custom styles for additional tweaks

const socket = io("http://localhost:5000"); // Adjust the URL if needed

const ChatPage = ({ username }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [receiver, setReceiver] = useState(''); // Set this to the chat partner's username

  useEffect(() => {
    socket.emit('join', username);

    socket.on('receive-message', (data) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: data.sender, message: data.message, timestamp: new Date() }
      ]);
    });

    // Fetch initial chat history
    const fetchChats = async () => {
      try {
        const response = await axios.get(`/chats?username=${username}`);
        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching chats', error);
      }
    };

    fetchChats();

    return () => {
      socket.off('receive-message');
    };
  }, [username]);

  const handleSendMessage = async () => {
    if (message.trim() === '') return;

    try {
      await axios.post('/send-message', {
        sender: username,
        receiver,
        message
      });

      socket.emit('send-message', { sender: username, receiver, message });
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: username, message, timestamp: new Date() }
      ]);
      setMessage('');
    } catch (error) {
      console.error('Error sending message', error);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto border border-gray-300 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-green-700 text-white p-4 flex items-center border-b border-gray-300">
        <span className="text-lg font-semibold">Chat with {receiver}</span>
        <div className="ml-auto flex space-x-4">
          <i className="fas fa-video cursor-pointer"></i>
          <i className="fas fa-phone cursor-pointer"></i>
          <i className="fas fa-ellipsis-v cursor-pointer"></i>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 bg-gray-100 overflow-y-auto">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.sender === username ? 'justify-end' : 'justify-start'} mb-4`}
          >
            <div className={`p-2 rounded-lg ${msg.sender === username ? 'bg-green-500 text-white' : 'bg-white border border-gray-300'}`}>
              <p>{msg.message}</p>
              <span className="text-xs text-gray-500">{new Date(msg.timestamp).toLocaleTimeString()}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-300 p-4 flex items-center">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
        />
        <button
          onClick={handleSendMessage}
          className="ml-4 bg-green-700 text-white px-4 py-2 rounded-lg"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatPage;
