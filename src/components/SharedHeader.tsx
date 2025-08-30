import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, User, ChevronDown, Search, ShoppingCart, Bell } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

const SharedHeader = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout, isLoading } = useUser();

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-white border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-6 py-5">
        <div className="flex items-center justify-between">
          {/* Left Side - Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => navigate('/')}
              className="font-body text-gray-700 hover:text-purple-600 transition-colors text-sm font-medium py-2"
            >
              Home
            </button>
            
            {/* Shop by Dropdown */}
            <div className="relative group">
              <button className="font-body text-gray-700 hover:text-purple-600 transition-colors text-sm font-medium py-2 flex items-center space-x-1">
                <span>Shop by</span>
                <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
              </button>
              <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-2">
                  <button
                    onClick={() => navigate('/personality-quiz')}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                  >
                    by Personality
                  </button>
                  <button
                    onClick={() => navigate('/upload')}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                  >
                    by Theme
                  </button>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => navigate('/circle')}
              className="font-body text-gray-700 hover:text-purple-600 transition-colors text-sm font-medium py-2"
            >
              Circle
            </button>
            <button
              onClick={() => navigate('/ambassador')}
              className="font-body text-gray-700 hover:text-purple-600 transition-colors text-sm font-medium py-2"
            >
              Brand Ambassador
            </button>
            <button
              onClick={() => navigate('/referral')}
              className="font-body text-gray-700 hover:text-purple-600 transition-colors text-sm font-medium py-2"
            >
              Referral Program
            </button>
          </nav>

          {/* Center - Logo */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <button
              onClick={() => navigate('/')}
              className="hover:opacity-80 transition-opacity flex-shrink-0"
            >
              <img
                src="/anuschka-circle-logo.png"
                alt="ANUSCHKA CIRCLE Logo"
                className="h-12 md:h-16"
              />
            </button>
          </div>

          {/* Right Side - Actions & Authentication */}
          <div className="flex items-center space-x-4 flex-shrink-0">
            {/* Right Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-4">
              <button
                onClick={() => navigate('/icon')}
                className="font-body text-gray-600 hover:text-purple-600 transition-colors text-sm font-medium py-2"
              >
                Icon Awards
              </button>
              <button
                onClick={() => navigate('/store-updates')}
                className="font-body text-gray-600 hover:text-purple-600 transition-colors text-sm font-medium py-2"
              >
                Store Updates
              </button>
            </nav>

            {/* Authentication Section */}
            {isLoading ? (
              <div className="hidden md:flex w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            ) : isAuthenticated && user ? (
              /* Profile Icon & Dropdown */
              <div className="relative hidden md:flex">
                <button
                  onClick={handleProfileClick}
                  className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 transition-colors"
                  title={`Welcome, ${user.name}`}
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <span className="hidden lg:block text-sm font-medium text-gray-700">
                    {user.name.split(' ')[0]}
                  </span>
                </button>
              </div>
            ) : (
              /* Sign In Button */
              <Button
                onClick={() => navigate('/login')}
                variant="outline"
                size="sm"
                className="hidden md:flex border-purple-300 text-purple-700 hover:bg-purple-50 rounded-full px-6 py-2 text-sm font-medium"
              >
                Sign In
              </Button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden w-8 h-8 flex items-center justify-center text-gray-700 hover:text-purple-600 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50">
            <div className="container mx-auto px-6 py-4">
              <nav className="flex flex-col space-y-4">
                <button
                  onClick={() => {
                    navigate('/');
                    setIsMobileMenuOpen(false);
                  }}
                  className="font-body text-gray-700 hover:text-purple-600 transition-colors text-sm font-medium py-3 text-left border-b border-gray-100"
                >
                  Home
                </button>
                <div className="border-b border-gray-100">
                  <div className="font-body text-gray-700 text-sm font-medium py-3 text-left">
                    Shop by
                  </div>
                  <div className="pl-4 space-y-2 pb-3">
                    <button
                      onClick={() => {
                        navigate('/personality-quiz');
                        setIsMobileMenuOpen(false);
                      }}
                      className="font-body text-gray-600 hover:text-purple-600 transition-colors text-sm py-2 text-left block w-full"
                    >
                      by Personality
                    </button>
                    <button
                      onClick={() => {
                        navigate('/upload');
                        setIsMobileMenuOpen(false);
                      }}
                      className="font-body text-gray-600 hover:text-purple-600 transition-colors text-sm py-2 text-left block w-full"
                    >
                      by Theme
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => {
                    navigate('/circle');
                    setIsMobileMenuOpen(false);
                  }}
                  className="font-body text-gray-700 hover:text-purple-600 transition-colors text-sm font-medium py-3 text-left border-b border-gray-100"
                >
                  Circle
                </button>
                <button
                  onClick={() => {
                    navigate('/ambassador');
                    setIsMobileMenuOpen(false);
                  }}
                  className="font-body text-gray-700 hover:text-purple-600 transition-colors text-sm font-medium py-3 text-left border-b border-gray-100"
                >
                  Brand Ambassador
                </button>
                
                {/* Mobile Authentication Section */}
                <div className="pt-4 space-y-3">
                  {isAuthenticated && user ? (
                    <>
                      <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-600">{user.email}</p>
                        </div>
                      </div>
                      <Button
                        onClick={() => {
                          handleProfileClick();
                          setIsMobileMenuOpen(false);
                        }}
                        variant="outline"
                        size="sm"
                        className="w-full border-purple-300 text-purple-700 hover:bg-purple-50 rounded-full py-3 text-sm font-medium"
                      >
                        View Profile
                      </Button>
                      <Button
                        onClick={() => {
                          handleLogout();
                          setIsMobileMenuOpen(false);
                        }}
                        variant="outline"
                        size="sm"
                        className="w-full border-red-300 text-red-700 hover:bg-red-50 rounded-full py-3 text-sm font-medium"
                      >
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => {
                        navigate('/login');
                        setIsMobileMenuOpen(false);
                      }}
                      variant="outline"
                      size="sm"
                      className="w-full border-purple-300 text-purple-700 hover:bg-purple-50 rounded-full py-3 text-sm font-medium"
                    >
                      Sign In
                    </Button>
                  )}
                  
                  <Button
                    onClick={() => {
                      navigate('/circle');
                      setIsMobileMenuOpen(false);
                    }}
                    variant="outline"
                    size="sm"
                    className="w-full border-purple-200 text-gray-700 hover:bg-purple-50 hover:border-purple-300 rounded-full py-3 text-sm font-medium"
                  >
                    Join Circle
                  </Button>
                </div>
              </nav>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default SharedHeader;
