import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState(''); // State for success message
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    const user = { username, password };

    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage('Login successful! Redirecting to chat page...'); // Set success message
        setErrorMessage(''); // Clear error message if any

        // Redirect after a short delay to show the success message
        setTimeout(() => {
          navigate(data.redirectUrl); // Redirect to chat page
        }, 2000);
      } else {
        setErrorMessage(data.message); // Display error message
        setSuccessMessage(''); // Clear success message if any
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('An error occurred. Please try again.');
      setSuccessMessage(''); // Clear success message if any
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-r from-blue-50 to-blue-100">
      {/* Navbar */}
      <nav className="bg-white shadow-lg p-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-blue-600">Chaat</div>
        <div className="flex items-center space-x-4">
          <a href="/" className="text-blue-600 hover:text-blue-800">Home</a>
          <p href="/login" className="text-blue-600 hover:text-blue-800 font-semibold">Login</p>
        </div>
      </nav>

      {/* Body */}
      <main className="flex-grow p-8 flex items-center justify-center">
        <div className="max-w-sm w-full bg-white p-8 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-blue-700 mb-6 text-center">Login</h1>
          
          {errorMessage && (
            <p className="text-red-500 text-center mb-4">{errorMessage}</p>
          )}

          {successMessage && (
            <p className="text-green-500 text-center mb-4">{successMessage}</p>
          )}
          
          <form className="space-y-4" onSubmit={handleLogin}>
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
              Login
            </button>
          </form>
          <p className="mt-4 text-center text-gray-600">
            Not have an account? <a href="/signup" className="text-blue-600 hover:text-blue-800">Sign up</a>
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

export default Login;
