import React from 'react';

function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-r from-blue-50 to-blue-100">
      {/* Navbar */}
      <nav className="bg-white shadow-lg p-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-blue-600">Chaat</div>
        <div className="flex items-center space-x-4">
          <input 
            type="text" 
            placeholder="Search..." 
            className="px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <a href="/" className="text-blue-600 font-semibold hover:text-blue-800">Home</a>
          <a href="/login" className="text-blue-600 hover:text-blue-800">Login</a>
        </div>
      </nav>

      {/* Body */}
      <main className="flex-grow p-8 text-center">
        <h1 className="text-4xl font-bold text-blue-700 mb-6">Welcome to Chaat</h1>
        <p className="text-lg text-gray-700">
          Chaat is your go-to chat application for seamless and secure communication. 
          Connect with friends, family, and colleagues with ease. Enjoy real-time messaging, 
          media sharing, and group chats, all in one user-friendly platform.
        </p>
      </main>

      {/* Footer */}
      <footer className="bg-white shadow-inner p-4 text-center">
        <p className="text-gray-500">&copy; 2024 Chaat. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default HomePage;
