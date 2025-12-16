'use client';

import React, { useState } from 'react';
import { Menu, X } from './icons';
import { useAuth } from '@/contexts/AuthContext';
import UserMenu from './UserMenu';

interface NavbarProps {
  onGetStarted?: () => void;
  onLogin?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onGetStarted, onLogin }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setIsOpen(false);
    }
  };

  const handleGetStarted = () => {
    if (onGetStarted) {
      onGetStarted();
    } else {
      scrollToSection('cta');
    }
    setIsOpen(false);
  };

  const handleLogin = () => {
    if (onLogin) {
      onLogin();
    } else if (onGetStarted) {
      onGetStarted();
    } else {
      scrollToSection('cta');
    }
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-7xl px-4">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-6 h-16 flex items-center justify-between shadow-lg">
        {/* Logo */}
        <div className="flex items-center cursor-pointer" onClick={() => scrollToSection('hero')}>
          <img 
            src="/sync-title.svg" 
            alt="Sync" 
            className="h-7 w-auto"
          />
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-300">
          <button 
            onClick={() => scrollToSection('problem')}
            className="hover:text-white transition-colors"
          >
            Problem
          </button>
          <button 
            onClick={() => scrollToSection('solution')}
            className="hover:text-white transition-colors"
          >
            Solution
          </button>
          <button 
            onClick={() => scrollToSection('features')}
            className="hover:text-white transition-colors"
          >
            Features
          </button>
          <button 
            onClick={handleGetStarted}
            className="hover:text-white transition-colors"
          >
            Get Started
          </button>
        </div>

        {/* Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <UserMenu />
          ) : (
            <>
              <button 
                onClick={handleLogin}
                className="px-5 py-2 text-sm font-medium bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors border border-white/10"
              >
                Login
              </button>
              <button 
                onClick={handleGetStarted}
                className="px-5 py-2 text-sm font-medium bg-white text-black rounded-lg hover:bg-gray-200 transition-colors"
              >
                Demo
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-white p-2" 
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden mt-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col gap-4 text-gray-300 shadow-lg">
          <button 
            onClick={() => scrollToSection('problem')}
            className="text-left text-lg hover:text-white transition-colors"
          >
            Problem
          </button>
          <button 
            onClick={() => scrollToSection('solution')}
            className="text-left text-lg hover:text-white transition-colors"
          >
            Solution
          </button>
          <button 
            onClick={() => scrollToSection('features')}
            className="text-left text-lg hover:text-white transition-colors"
          >
            Features
          </button>
          <button 
            onClick={handleGetStarted}
            className="text-left text-lg hover:text-white transition-colors"
          >
            Get Started
          </button>
          <div className="h-px bg-white/10 my-2"></div>
          {!user && (
            <>
              <button 
                onClick={handleLogin}
                className="text-left text-lg hover:text-white transition-colors"
              >
                Login
              </button>
              <button 
                onClick={handleGetStarted}
                className="px-4 py-3 text-center font-medium bg-white text-black rounded-lg hover:bg-gray-200 transition-colors"
              >
                Demo
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;

