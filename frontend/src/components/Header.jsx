import React, { useState, useEffect, useRef } from "react";
import { Bell, Menu, X } from "lucide-react";
import { NavLink } from "react-router-dom";
import PropTypes from "prop-types";
import { useToast } from "../hooks/use-toast";
import { useIsMobile } from "../hooks/use-mobile";
import Logo from "./Logo";
import LogoutButton from "./LogoutButton";

const Header = ({ showNotifications, setShowNotifications, notifications }) => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const notificationRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const toast = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      ) {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setShowNotifications]);

  return (
    <header className="sticky top-0 z-50 w-full bg-background/70 backdrop-blur-lg border-b border-white/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left Section: Logo and Navigation */}
          <div className="flex items-center space-x-6">
            {/* Logo */}
            <Logo variant="medium" dark={false} />

            {/* Navigation items - Desktop */}
            {!isMobile && (
              <nav className="hidden md:flex md:space-x-8">
                {["Dashboard", "Websites", "Reports", "Integrations", "Security", "Settings"].map((name) => (
                  <NavLink
                    key={name}
                    to={`/${name.toLowerCase()}`}
                    className={({ isActive }) =>
                      `text-white/80 hover:text-white transition-colors px-3 py-2 text-sm font-medium border-b-2 ${
                        isActive ? "border-primary text-white" : "border-transparent"
                      }`
                    }
                  >
                    {name}
                  </NavLink>
                ))}
              </nav>
            )}
          </div>

          {/* Right Section: Bell Icon, Logout Button, and Mobile Menu */}
          <div className="flex items-center space-x-4">
            {/* Notification Bell */}
            <div className="relative" ref={notificationRef}>
              <button
                className="p-2 rounded-full hover:bg-white/5"
                onClick={() => setShowNotifications(!showNotifications)}
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5 text-white/70" />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-72 bg-card rounded-lg shadow-lg border border-white/10 z-50">
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-white/90 mb-4">
                      Notifications
                    </h3>
                    <div className="mt-2 divide-y divide-white/5">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <div key={notification.id} className="py-3">
                            <div className="flex items-start justify-between">
                              <span
                                className={`text-xs font-medium ${
                                  notification.status === "up"
                                    ? "text-green-400"
                                    : "text-red-400"
                                }`}
                              >
                                {notification.website} -{" "}
                                {notification.status.toUpperCase()}
                              </span>
                              <span className="text-xs text-white/50">
                                {/* ✅ Fix: Ensure timestamp is valid */}
                                {notification.timestamp
                                  ? new Date(notification.timestamp).toLocaleTimeString()
                                  : "Unknown Time"}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-white/70">
                              {notification.message}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="py-6 text-center">
                          <p className="text-sm text-white/50">
                            No new notifications
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Logout Button - AFTER Bell Icon */}
            {!isMobile && <LogoutButton />}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-md text-white/70 hover:text-white hover:bg-white/5"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              aria-label="Toggle mobile menu"
            >
              {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div ref={mobileMenuRef} className="md:hidden bg-background/80 backdrop-blur-md p-4 rounded-lg shadow-lg">
            <div className="space-y-2">
              {["Dashboard", "Analytics", "Alerts", "Settings"].map((name) => (
                <NavLink
                  key={name}
                  to={`/${name.toLowerCase()}`}
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded-md text-base font-medium ${
                      isActive
                        ? "bg-white/10 text-white"
                        : "text-white/70 hover:text-white hover:bg-white/5"
                    }`
                  }
                  onClick={() => setShowMobileMenu(false)} // ✅ Close menu on navigation
                >
                  {name}
                </NavLink>
              ))}
              {/* Mobile Logout Button */}
              <LogoutButton />
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

Header.propTypes = {
  showNotifications: PropTypes.bool.isRequired,
  setShowNotifications: PropTypes.func.isRequired,
  notifications: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      website: PropTypes.string.isRequired,
      status: PropTypes.oneOf(["up", "down"]).isRequired,
      message: PropTypes.string.isRequired,
      timestamp: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string]), // ✅ Fixed timestamp validation
    })
  ).isRequired,
};

export default Header;
