import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react'; // Import the LogOut icon

const LogoutButton = () => {
  const navigate = useNavigate();

  const logout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('token'); // Ensure this matches your token key
    localStorage.removeItem('userSession'); // Clear any other user-related data

    // Redirect to the login page
    navigate('/login');
  };

  return (
    <button
      onClick={logout}
      className="flex items-center space-x-2 p-2 rounded-md bg-green-500 hover:bg-green-600 text-white transition-colors"
    >
      <LogOut className="h-5 w-5" /> {/* Add an icon for better UX */}
      <span className="text-sm font-medium">Logout</span>
    </button>
  );
};

export default LogoutButton;