import React, { useState, useEffect } from 'react';

const ChatPage = ({ username }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [receiver, setReceiver] = useState('');
  const [ws, setWs] = useState(null);

  useEffect(() => {
    // Establish WebSocket connection
    const socket = new WebSocket('ws://localhost:5000');
    setWs(socket);

    socket.onmessage = (event) => {
      const receivedMessage = JSON.parse(event.data);
      setMessages((prevMessages) => [...prevMessages, receivedMessage]);
    };

    // Fetch initial chat history
    const fetchChats = async () => {
      try {
        const response = await fetch(`/chats?username=${username}`);
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error('Error fetching chats', error);
      }
    };

    fetchChats();

    return () => {
      socket.close();
    };
  }, [username]);

  const handleSendMessage = () => {
    if (!message.trim() || !receiver.trim()) return;

    const chatMessage = {
      sender: username,
      receiver,
      content: message,
    };

    // Send message via WebSocket
    ws.send(JSON.stringify(chatMessage));

    // Update local messages state
    setMessages((prevMessages) => [...prevMessages, chatMessage]);
    setMessage('');
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto border border-gray-300 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-green-700 text-white p-4 flex items-center border-b border-gray-300">
        <span className="text-lg font-semibold">Chat with {receiver}</span>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 bg-gray-100 overflow-y-auto">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.sender === username ? 'justify-end' : 'justify-start'} mb-4`}
          >
            <div className={`p-2 rounded-lg ${msg.sender === username ? 'bg-green-500 text-white' : 'bg-white border border-gray-300'}`}>
              <p>{msg.content}</p>
              <span className="text-xs text-gray-500">{new Date(msg.timestamp).toLocaleTimeString()}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Search bar and input */}
      <div className="bg-white border-t border-gray-300 p-4 flex items-center space-x-4">
        <input
          type="text"
          value={receiver}
          onChange={(e) => setReceiver(e.target.value)}
          placeholder="Search or select a user..."
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
        />
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
