import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function SignupPage() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    const user = { name, username, password };

    try {
      const response = await fetch('http://localhost:5000/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });

      if (response.ok) {
        alert('Signup successful!');
        navigate('/'); // Redirect to the home page
      } else {
        alert('Signup failed. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-r from-blue-50 to-blue-100">
      {/* Navbar */}
      <nav className="bg-white shadow-lg p-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-blue-600">Chaat</div>
        <div className="flex items-center space-x-4">
          <a href="/" className="text-blue-600 hover:text-blue-800">Home</a>
          <a href="/login" className="text-blue-600 hover:text-blue-800">Login</a>
          <a href="/signup" className="text-blue-600 font-semibold hover:text-blue-800">Sign up</a>
        </div>
      </nav>

      {/* Body */}
      <main className="flex-grow p-8 flex items-center justify-center">
        <div className="max-w-sm w-full bg-white p-8 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-blue-700 mb-6 text-center">Sign Up</h1>
          <form className="space-y-4" onSubmit={handleSignup}>
            <div>
              <label htmlFor="name" className="block text-gray-700">Name</label>
              <input 
                type="text" 
                id="name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name" 
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label htmlFor="username" className="block text-gray-700">Username</label>
              <input 
                type="text" 
                id="username" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username" 
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-gray-700">Password</label>
              <input 
                type="password" 
                id="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password" 
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <button 
              type="submit" 
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Sign Up
            </button>
          </form>
          <p className="mt-4 text-center text-gray-600">
            Already have an account? <a href="/login" className="text-blue-600 hover:text-blue-800">Login</a>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white shadow-inner p-4 text-center">
        <p className="text-gray-500">&copy; 2024 Chaat. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default SignupPage;
