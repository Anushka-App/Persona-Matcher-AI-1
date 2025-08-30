import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Heart, 
  ShoppingBag, 
  Star, 
  Edit3,
  Camera,
  Settings,
  Bell,
  Shield,
  Gift,
  Loader2
} from "lucide-react";

interface UserProfile {
  user_id: string;
  name: string;
  email: string;
  phone: string;
  membership_tier: string;
  account_created_date: string;
  last_login_date: string;
  login_count: number;
  user_location?: string;
  location?: string;
  avatar?: string;
}

interface PersonalityReport {
  personality_type: string;
  sentiment: string;
  explanation: string;
  style_preferences?: string;
  lifestyle_insights?: string;
  bag_personality?: string;
  timestamp: string;
}

interface ProductRecommendation {
  Bag_Name: string;
  Personality_Description: string;
  Product_Link: string;
  Price: string;
  Brand: string;
  Style: string;
  Material: string;
  Color: string;
  image?: string;
}

const ProfilePage = () => {
  const navigate = useNavigate();
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [personalityReport, setPersonalityReport] = useState<PersonalityReport | null>(null);
  const [productRecommendations, setProductRecommendations] = useState<ProductRecommendation[]>([]);
  const [recentLooks, setRecentLooks] = useState<Array<{
    id: number;
    image: string;
    title: string;
    description: string;
    category: string;
    price: string;
  }>>([]);
  const [favoriteProducts, setFavoriteProducts] = useState<Array<{
    id: number;
    image: string;
    name: string;
    category: string;
    price: string;
    rating: number;
    reviews: number;
  }>>([]);
  const [orderHistory, setOrderHistory] = useState<Array<{
    id: string;
    date: string;
    total: string;
    status: string;
    items: Array<{
      name: string;
      price: string;
      quantity: number;
    }>;
  }>>([]);

  const colorOptions = ["Warm Tones", "Vibrant Florals", "Earthy Tones", "Cool Hues", "Pastel Dream"];
  const categoryOptions = ["Classic Totes", "Crossbody Bags", "Clutches", "Wallets", "Backpacks"];
  const sizeOptions = ["Mini", "Small", "Medium", "Large", "Oversize"];

  // Load user data from localStorage or cookies
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoading(true);
        
        // Get user cookie ID from cookies
        const getCookie = (name: string): string | null => {
          const nameEQ = name + "=";
          const ca = document.cookie.split(';');
          for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
          }
          return null;
        };

        const userCookieId = getCookie('user_cookie_id');
        
        if (userCookieId) {
          // Load user profile from users.csv
          const userResponse = await fetch('/api/user/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_cookie_id: userCookieId })
          });
          
          if (userResponse.ok) {
            const userData = await userResponse.json();
            setUserProfile(userData.user);
          }

          // Load personality report from personality_reports.csv
          const personalityResponse = await fetch('/api/user/personality-report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_cookie_id: userCookieId })
          });
          
          if (personalityResponse.ok) {
            const personalityData = await personalityResponse.json();
            if (personalityData.report) {
              setPersonalityReport(personalityData.report);
              
              // Parse style preferences from the report
              if (personalityData.report.style_preferences) {
                try {
                  const preferences = JSON.parse(personalityData.report.style_preferences);
                  if (preferences.colors) setSelectedColors(preferences.colors);
                  if (preferences.categories) setSelectedCategories(preferences.categories);
                  if (preferences.sizes) setSelectedSizes(preferences.sizes);
                } catch (e) {
                  console.log('No saved preferences found');
                }
              }
            }
          }

          // Load product recommendations based on personality
          const recommendationsResponse = await fetch('/api/products/recommendations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              user_cookie_id: userCookieId,
              personality_type: personalityReport?.personality_type 
            })
          });
          
          if (recommendationsResponse.ok) {
            const recommendationsData = await recommendationsResponse.json();
            setProductRecommendations(recommendationsData.recommendations || []);
          }

          // Load recent looks and favorites (simulated for now)
          setRecentLooks([
            {
              id: 1,
              image: "/girl.png",
              title: "Blooming Elegance",
              description: "A garden of vibrant optimism and earnings.",
              category: "Tote Bag",
              price: "$299"
            },
            {
              id: 2,
              image: "/logo.png",
              title: "Floral Bliss",
              description: "Embrace the beauty of nature with vibrant colors.",
              category: "Crossbody",
              price: "$199"
            },
            {
              id: 3,
              image: "/girl.png",
              title: "Professional Chic",
              description: "Sophistication for the modern, on-the-go professional.",
              category: "Clutch",
              price: "$159"
            },
            {
              id: 4,
              image: "/logo.png",
              title: "Streetwise Style",
              description: "Urban edge meets artistic expression for the bold.",
              category: "Backpack",
              price: "$249"
            }
          ]);

          // Set favorite products from recommendations
          if (productRecommendations.length > 0) {
            setFavoriteProducts(productRecommendations.slice(0, 3).map((product, index) => ({
              id: index + 1,
              image: product.image || "/logo.png",
              name: product.Bag_Name,
              category: product.Style,
              price: product.Price,
              rating: 4.5 + (Math.random() * 0.5),
              reviews: Math.floor(Math.random() * 100) + 50
            })));
          }

          // Simulated order history
          setOrderHistory([
            {
              id: "ORD-001",
              date: "Dec 10, 2023",
              items: [{ name: "Blooming Elegance Tote", price: "$299", quantity: 1 }],
              total: "$299",
              status: "Delivered"
            },
            {
              id: "ORD-002",
              date: "Nov 28, 2023",
              items: [
                { name: "Abstract Leopard Crossbody", price: "$250", quantity: 1 },
                { name: "Boho Paisley Clutch", price: "$200", quantity: 1 }
              ],
              total: "$450",
              status: "Delivered"
            },
            {
              id: "ORD-003",
              date: "Oct 12, 2023",
              items: [{ name: "Floral Bloom Wallet", price: "$109", quantity: 1 }],
              total: "$109",
              status: "Delivered"
            }
          ]);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  const handleSavePreferences = async () => {
    try {
      const preferences = {
        colors: selectedColors,
        categories: selectedCategories,
        sizes: selectedSizes
      };

      const response = await fetch('/api/user/update-preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_cookie_id: userProfile?.user_id,
          style_preferences: JSON.stringify(preferences)
        })
      });

      if (response.ok) {
        // Show success message
        alert('Preferences saved successfully!');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Failed to save preferences. Please try again.');
    }
  };

  const handleAvatarEdit = () => {
    setIsEditingAvatar(true);
    // Simulate avatar editing
    setTimeout(() => {
      setIsEditingAvatar(false);
      alert('Avatar updated successfully!');
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Use real user data or fallback to dummy data
  const displayUser = userProfile || {
    name: "Eleanor Vance",
    email: "eleanor.vance@example.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    membership_tier: "Gold Circle",
    account_created_date: "January 2023",
    avatar: "/girl.png"
  };

  const displayPersonality = personalityReport || {
    personality_type: "The Creative Catalyst",
    sentiment: "Artistic Flair, Color Playfulness, Sophistication",
    explanation: "You possess a vibrant spirit, effortlessly blending artistic flair with a sophisticated understanding of color and form."
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="relative inline-block">
              <Avatar className="w-32 h-32 mx-auto mb-4">
                <AvatarImage src={displayUser.avatar || "/girl.png"} alt={displayUser.name} />
                <AvatarFallback className="text-2xl font-semibold bg-purple-100 text-purple-600">
                  {displayUser.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={handleAvatarEdit}
                disabled={isEditingAvatar}
                className="absolute bottom-2 right-2 bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {isEditingAvatar ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </button>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome, {displayUser.name}!
            </h1>
            
            <p className="text-gray-600 max-w-2xl mx-auto mb-6">
              Every Anuschka bag carries art with soul. That's why the Matchmaker also considers your personality, 
              helping you find a bag whose design resonates with who you are—because style should be as personal as it is beautiful.
            </p>
            
            <div className="flex justify-center space-x-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{recentLooks.length}</div>
                <div className="text-sm text-gray-600">Looks Created</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{favoriteProducts.length}</div>
                <div className="text-sm text-gray-600">Favorites</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{orderHistory.length}</div>
                <div className="text-sm text-gray-600">Orders</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Information Card */}
            <Card>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <User className="h-5 w-5 mr-2 text-purple-600" />
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{displayUser.email}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{displayUser.phone}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{displayUser.location}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Member Since: {displayUser.account_created_date}</span>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <Button variant="outline" size="sm">
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button variant="outline" size="sm">
                    <Shield className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Circle Membership Card */}
            <Card className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3">
                    <Gift className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-white">Circle Membership</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-purple-100 mb-4">
                  You are a proud {displayUser.membership_tier} member! Enjoy exclusive benefits and early access to new collections.
                </p>
                <div className="flex space-x-3">
                  <Button variant="secondary" size="sm">
                    View Benefits
                  </Button>
                  <Button variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10">
                    Learn More
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Style Preferences Card */}
            <Card>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <Heart className="h-5 w-5 mr-2 text-purple-600" />
                <CardTitle>Style Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Favorite Colors</h4>
                  <div className="flex flex-wrap gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        onClick={() => {
                          if (selectedColors.includes(color)) {
                            setSelectedColors(selectedColors.filter(c => c !== color));
                          } else {
                            setSelectedColors([...selectedColors, color]);
                          }
                        }}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          selectedColors.includes(color)
                            ? 'bg-purple-600 text-white'
                            : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Product Categories</h4>
                  <div className="flex flex-wrap gap-2">
                    {categoryOptions.map((category) => (
                      <button
                        key={category}
                        onClick={() => {
                          if (selectedCategories.includes(category)) {
                            setSelectedCategories(selectedCategories.filter(c => c !== category));
                          } else {
                            setSelectedCategories([...selectedCategories, category]);
                          }
                        }}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          selectedCategories.includes(category)
                            ? 'bg-purple-600 text-white'
                            : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Bag Sizes</h4>
                  <div className="flex flex-wrap gap-2">
                    {sizeOptions.map((size) => (
                      <button
                        key={size}
                        onClick={() => {
                          if (selectedSizes.includes(size)) {
                            setSelectedSizes(selectedSizes.filter(s => s !== size));
                          } else {
                            setSelectedSizes([...selectedSizes, size]);
                          }
                        }}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          selectedSizes.includes(size)
                            ? 'bg-purple-600 text-white'
                            : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <Button onClick={handleSavePreferences} className="w-full">
                  Save Preferences
                </Button>
              </CardContent>
            </Card>

            {/* Favorite Products Card */}
            <Card>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <Heart className="h-5 w-5 mr-2 text-purple-600" />
                <CardTitle>Favorite Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {favoriteProducts.map((product) => (
                    <div key={product.id} className="text-center">
                      <div className="w-full h-32 bg-gray-200 rounded-lg mb-2 overflow-hidden">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h4 className="font-medium text-sm text-gray-900 mb-1">{product.name}</h4>
                      <p className="text-xs text-gray-600 mb-1">{product.category}</p>
                      <p className="font-semibold text-purple-600 mb-1">{product.price}</p>
                      <div className="flex items-center justify-center space-x-1">
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        <span className="text-xs text-gray-600">
                          {product.rating} ({product.reviews})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Recent Looks Card */}
            <Card>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <Camera className="h-5 w-5 mr-2 text-purple-600" />
                <CardTitle>Recent Looks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {recentLooks.slice(0, 4).map((look) => (
                    <div key={look.id} className="text-center">
                      <div className="w-full h-24 bg-gray-200 rounded-lg mb-2 overflow-hidden">
                        <img
                          src={look.image}
                          alt={look.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h4 className="font-medium text-xs text-gray-900 mb-1">{look.title}</h4>
                      <p className="text-xs text-gray-600">{look.price}</p>
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  View All Recent Looks
                </Button>
              </CardContent>
            </Card>

            {/* Order History Card */}
            <Card>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <ShoppingBag className="h-5 w-5 mr-2 text-purple-600" />
                <CardTitle>Order History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {orderHistory.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm text-gray-900">{order.id}</p>
                        <p className="text-xs text-gray-600">{order.date} • {order.items.length} item(s)</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm text-gray-900">{order.total}</p>
                        <Badge variant="secondary" className="text-xs">
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions Card */}
            <Card>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <div className="w-5 h-5 bg-gradient-to-r from-purple-600 to-pink-600 rounded mr-2" />
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => navigate('/quiz')}
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Take Personality Quiz
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => navigate('/circle')}
                >
                  <Gift className="h-4 w-4 mr-2" />
                  View Circle Benefits
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Notification Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 