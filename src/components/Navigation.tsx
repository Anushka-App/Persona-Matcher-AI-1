import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { User, Menu, X } from "lucide-react";
import { useState } from "react";

const Navigation = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false); // Close mobile menu after navigation
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo - Left */}
          <button
            onClick={() => navigate('/')}
            className="hover:opacity-80 transition-opacity flex-shrink-0"
          >
            <img
              src="/logo.png"
              alt="ANUSCHKA Logo"
              className="h-10 md:h-12"
            />
          </button>

          {/* Navigation Menu - Center (Desktop) */}
          <nav className="hidden md:flex items-center">
            <div className="flex items-center space-x-8">
              <button
                onClick={() => navigate('/')}
                className="font-body text-gray-700 hover:text-purple-600 transition-colors text-sm font-medium py-2"
              >
                Home
              </button>
              <button
                onClick={() => navigate('/home1')}
                className="font-body text-gray-700 hover:text-purple-600 transition-colors text-sm font-medium py-2"
              >
                Home1
              </button>


              <button
                onClick={() => navigate('/personality-quiz')}
                className="font-body text-gray-700 hover:text-purple-600 transition-colors text-sm font-medium py-2"
              >
                Personality Quiz
              </button>

              <button
                onClick={() => navigate('/upload')}
                className="font-body text-gray-700 hover:text-purple-600 transition-colors text-sm font-medium py-2"
              >
                Upload
              </button>
              <button
                onClick={() => navigate('/arvr')}
                className="font-body text-gray-700 hover:text-purple-600 transition-colors text-sm font-medium py-2"
              >
                AR/VR
              </button>
              <button
                onClick={() => navigate('/report')}
                className="font-body text-gray-700 hover:text-purple-600 transition-colors text-sm font-medium py-2"
              >
                Report
              </button>

              <button
                onClick={() => navigate('/chat')}
                className="font-body text-gray-700 hover:text-purple-600 transition-colors text-sm font-medium py-2"
              >
                Chat
              </button>
              <button
                onClick={() => navigate('/admin')}
                className="font-body text-gray-700 hover:text-purple-600 transition-colors text-sm font-medium py-2"
              >
                Admin
              </button>
            </div>
          </nav>

          {/* Right Side - Join Circle Button, Profile Icon, and Mobile Menu Button */}
          <div className="flex items-center space-x-4 flex-shrink-0">
            {/* Join Circle Button - Hidden on mobile */}
            <Button
              onClick={() => navigate('/circle')}
              variant="outline"
              size="sm"
              className="hidden md:flex border-purple-200 text-gray-700 hover:bg-purple-50 hover:border-purple-300 rounded-full px-6 py-2 text-sm font-medium"
            >
              Join Circle
            </Button>

            {/* Profile Icon */}
            <button
              onClick={() => navigate('/profile')}
              className="w-8 h-8 rounded-full bg-red-800 border-2 border-black flex items-center justify-center hover:opacity-80 transition-opacity"
            >
              <User className="w-4 h-4 text-white" />
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
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
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg">
            <div className="container mx-auto px-6 py-4">
              <nav className="flex flex-col space-y-4">
                <button
                  onClick={() => handleNavigation('/')}
                  className="font-body text-gray-700 hover:text-purple-600 transition-colors text-sm font-medium py-3 text-left border-b border-gray-100"
                >
                  Home
                </button>
                <button
                  onClick={() => handleNavigation('/home1')}
                  className="font-body text-gray-700 hover:text-purple-600 transition-colors text-sm font-medium py-3 text-left border-b border-gray-100"
                >
                  Home1
                </button>


                <button
                  onClick={() => handleNavigation('/personality-quiz')}
                  className="font-body text-gray-700 hover:text-purple-600 transition-colors text-sm font-medium py-3 text-left border-b border-gray-100"
                >
                  Personality Quiz
                </button>

                <button
                  onClick={() => handleNavigation('/upload')}
                  className="font-body text-gray-700 hover:text-purple-600 transition-colors text-sm font-medium py-3 text-left border-b border-gray-100"
                >
                  Upload
                </button>
                <button
                  onClick={() => handleNavigation('/arvr')}
                  className="font-body text-gray-700 hover:text-purple-600 transition-colors text-sm font-medium py-3 text-left border-b border-gray-100"
                >
                  AR/VR
                </button>
                <button
                  onClick={() => handleNavigation('/report')}
                  className="font-body text-gray-700 hover:text-purple-600 transition-colors text-sm font-medium py-3 text-left border-b border-gray-100"
                >
                  Report
                </button>

                <button
                  onClick={() => handleNavigation('/chat')}
                  className="font-body text-gray-700 hover:text-purple-600 transition-colors text-sm font-medium py-3 text-left border-b border-gray-100"
                >
                  Chat
                </button>
                <button
                  onClick={() => handleNavigation('/admin')}
                  className="font-body text-gray-700 hover:text-purple-600 transition-colors text-sm font-medium py-3 text-left border-b border-gray-100"
                >
                  Admin
                </button>

                {/* Mobile Join Circle Button */}
                <div className="pt-4">
                  <Button
                    onClick={() => handleNavigation('/circle')}
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

export default Navigation;