import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useUser } from '@/contexts/UserContext';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, User, Menu, X, ArrowLeft, Mail, ArrowRight } from 'lucide-react';
import CaptchaVerification from './CaptchaVerification';

interface CreateAccountFormData {
  name: string;
  phone: string;
  selectedMembershipTier?: string;
}

const CreateAccountPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useUser();
  const { signInWithGoogle } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [formData, setFormData] = useState<CreateAccountFormData>({
    name: '',
    phone: ''
  });

  // Get membership tier and pre-filled phone from navigation state
  const selectedTier = location.state?.selectedTier || '';
  const preFilledPhone = location.state?.preFilledPhone || '';
  const fromGoogle = location.state?.fromGoogle || false;

  useEffect(() => {
    setIsVisible(true);
    if (selectedTier) {
      setFormData(prev => ({ ...prev, selectedMembershipTier: selectedTier }));
    }
    if (preFilledPhone) {
      setFormData(prev => ({ ...prev, phone: preFilledPhone }));
    }
  }, [selectedTier, preFilledPhone]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCaptchaVerify = (token: string | null) => {
    setCaptchaVerified(!!token);
  };

  const validateForm = () => {
    if (!formData.name || !formData.phone) {
      alert('Please fill in all required fields');
      return false;
    }
    if (!captchaVerified) {
      alert('Please complete the captcha verification');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      // Mobile authentication (simulated for now)
      const demoUser = {
        user_id: 'mobile_user_123',
        name: formData.name,
        email: 'mobile@example.com',
        phone: formData.phone,
        membership_tier: selectedTier || 'Silver Benefits',
        user_cookie_id: 'mobile_cookie_123',
        account_created_date: new Date().toISOString(),
        last_login_date: new Date().toISOString(),
        login_count: 1
      };
      
      login(demoUser);
      
      // Navigate to success page or back to circle page
      navigate('/circle', { 
        state: { 
          message: 'Account created successfully! You can now access your selected membership benefits.',
          showSuccess: true
        }
      });
    } catch (error: unknown) {
      console.error('Error creating account:', error);
      alert(`Failed to create account: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    
    try {
      const user = await signInWithGoogle();
      console.log('Google user signed in:', user);
      
      // Create user object for the app
      const appUser = {
        user_id: user.uid,
        name: user.displayName || formData.name || 'Google User',
        email: user.email || 'googleuser@gmail.com',
        phone: user.phoneNumber || formData.phone || '',
        membership_tier: selectedTier || 'Silver Benefits',
        user_cookie_id: user.uid,
        account_created_date: new Date().toISOString(),
        last_login_date: new Date().toISOString(),
        login_count: 1
      };
      
      login(appUser);
      
      // Navigate to success page or back to circle page
      navigate('/circle', { 
        state: { 
          message: 'Account created successfully with Google! You can now access your selected membership benefits.',
          showSuccess: true
        }
      });
    } catch (error: unknown) {
      console.error('Google authentication error:', error);
      alert(`Google authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueWithMail = () => {
    if (formData.phone) {
      // Navigate to sign in with pre-filled phone
      navigate('/login', { 
        state: { 
          preFilledPhone: formData.phone,
          fromCreateAccount: true
        } 
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Navigation Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
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
                  onClick={() => navigate('/personality-quiz')}
                  className="font-body text-gray-700 hover:text-purple-600 transition-colors text-sm font-medium py-2"
                >
                  Personality Quiz
                </button>
                <button
                  onClick={() => navigate('/circle')}
                  className="font-body text-gray-700 hover:text-purple-600 transition-colors text-sm font-medium py-2"
                >
                  Circle
                </button>
              </div>
            </nav>

            {/* Right Side - Join Circle Button and Mobile Menu Button */}
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
            <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg">
              <div className="container mx-auto px-6 py-4">
                <nav className="flex flex-col space-y-4">
                  <button
                    onClick={() => navigate('/')}
                    className="font-body text-gray-700 hover:text-purple-600 transition-colors text-sm font-medium py-3 text-left border-b border-gray-100"
                  >
                    Home
                  </button>
                  <button
                    onClick={() => navigate('/personality-quiz')}
                    className="font-body text-gray-700 hover:text-purple-600 transition-colors text-sm font-medium py-3 text-left border-b border-gray-100"
                  >
                    Personality Quiz
                  </button>
                  <button
                    onClick={() => navigate('/circle')}
                    className="font-body text-gray-700 hover:text-purple-600 transition-colors text-sm font-medium py-3 text-left border-b border-gray-100"
                  >
                    Circle
                  </button>
                  
                  {/* Mobile Join Circle Button */}
                  <div className="pt-4">
                    <Button
                      onClick={() => navigate('/circle')}
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

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-8">
        <div className={`w-full max-w-md transform transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full flex items-center justify-center shadow-lg">
                  <User className="w-8 h-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Create Your Account
              </CardTitle>
              <p className="text-gray-600 mt-2">
                {selectedTier ? `Join Anuschka Circle with ${selectedTier} benefits` : 'Join Anuschka Circle'}
              </p>
              {selectedTier && (
                <div className="mt-3 inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                  {selectedTier} Membership
                </div>
              )}
              {fromGoogle && (
                <div className="mt-2 inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                  Continuing with Google
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Google Sign Up Button */}
              <Button
                onClick={handleGoogleAuth}
                disabled={isLoading}
                className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:shadow-md transition-all duration-300 py-3"
                variant="outline"
              >
                <div className="flex items-center justify-center space-x-3">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Continue with Google</span>
                </div>
              </Button>

              {/* Continue with Mail Button */}
              <Button
                onClick={handleContinueWithMail}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 transition-all duration-300"
              >
                <div className="flex items-center justify-center space-x-3">
                  <Mail className="w-5 h-5" />
                  <span>Continue with Mail</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or create account with mobile</span>
                </div>
              </div>

              {/* Create Account Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Full Name *
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="pl-10 py-3 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-lg transition-all duration-300"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                {/* Phone Field */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                    Phone Number *
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="pl-10 py-3 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-lg transition-all duration-300"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                {/* Captcha Verification */}
                <CaptchaVerification
                  onVerify={handleCaptchaVerify}
                  isVerified={captchaVerified}
                  className="mt-6"
                />

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading || !captchaVerified}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating Account...</span>
                    </div>
                  ) : (
                    'Create Account with Mobile'
                  )}
                </Button>
              </form>

              {/* Footer Links */}
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <button
                    onClick={() => navigate('/login')}
                    className="text-purple-600 hover:text-purple-700 font-medium transition-colors"
                  >
                    Sign in
                  </button>
                </p>
                <button
                  onClick={() => navigate('/circle')}
                  className="text-sm text-purple-600 hover:text-purple-700 transition-colors flex items-center justify-center mx-auto"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back to Circle
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="standard-blob animation-delay-2000"></div>
        <div className="standard-blob animation-delay-4000"></div>
      </div>
    </div>
  );
};

export default CreateAccountPage;
