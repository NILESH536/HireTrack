import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiLogOut, FiUser } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import NotificationBell from './NotificationBell';
import AnimatedLogo from './AnimatedLogo';
import { getDashboardRoute } from '../../utils/helpers';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isLanding = location.pathname === '/';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isLanding ? 'bg-transparent' : 'bg-navy-950/80 backdrop-blur-xl border-b border-white/5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <AnimatedLogo size="sm" />

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {isAuthenticated ? (
            <>
              <Link to={getDashboardRoute(user?.role)} className="text-gray-300 hover:text-white transition-colors text-sm">
                Dashboard
              </Link>
              {user?.role === 'STUDENT' && (
                <Link to="/student/browse" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Browse Drives
                </Link>
              )}
              <NotificationBell />
              <Link to="/student/profile" className="text-gray-300 hover:text-white transition-colors">
                <FiUser className="w-5 h-5" />
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors text-sm">
                <FiLogOut className="w-4 h-4" />
                Logout
              </button>
            </>
          ) : (
            <>
              {isLanding && (
                <>
                  <a href="#features" className="text-gray-300 hover:text-white transition-colors text-sm">Features</a>
                  <a href="#how-it-works" className="text-gray-300 hover:text-white transition-colors text-sm">How It Works</a>
                </>
              )}
              <Link to="/login" className="text-gray-300 hover:text-white transition-colors text-sm">Login</Link>
              <Link to="/register" className="btn-primary !py-2 !px-5 text-sm">Get Started</Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-gray-300 p-2">
          {mobileOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-navy-900/95 backdrop-blur-xl border-t border-white/5"
          >
            <div className="px-4 py-4 space-y-3">
              {isAuthenticated ? (
                <>
                  <Link to={getDashboardRoute(user?.role)} className="block text-gray-300 py-2" onClick={() => setMobileOpen(false)}>Dashboard</Link>
                  {user?.role === 'STUDENT' && (
                    <Link to="/student/browse" className="block text-gray-300 py-2" onClick={() => setMobileOpen(false)}>Browse Drives</Link>
                  )}
                  <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="block text-red-400 py-2">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="block text-gray-300 py-2" onClick={() => setMobileOpen(false)}>Login</Link>
                  <Link to="/register" className="block text-electric py-2" onClick={() => setMobileOpen(false)}>Get Started</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
