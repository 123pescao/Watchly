import { FaUserPlus, FaSignInAlt, FaCog, FaInfoCircle, FaSignOutAlt } from "react-icons/fa";

export default function Navigation() {
  const navItems = [
    { label: "SIGN UP", icon: <FaUserPlus />, action: () => console.log("Sign Up clicked") },
    { label: "LOGIN", icon: <FaSignInAlt />, action: () => console.log("Login clicked") },
    { label: "SETTINGS", icon: <FaCog />, action: () => console.log("Settings clicked") },
    { label: "ABOUT", icon: <FaInfoCircle />, action: () => console.log("About clicked") },
    { label: "LOGOUT", icon: <FaSignOutAlt />, action: () => console.log("Logout clicked") },
  ];

  return (
    <nav className="flex space-x-6 bg-gray-900 p-4 rounded-lg shadow-lg">
      {navItems.map((item, index) => (
        <button
          key={index}
          className="flex items-center space-x-2 text-xl text-white hover:text-green-500 transition duration-300"
          onClick={item.action}
        >
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
