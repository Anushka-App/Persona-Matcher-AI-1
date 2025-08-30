import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Camera, Share2, Heart, ArrowUpRight, Shirt, Tag, ShoppingBag } from "lucide-react";

const ARVRPage = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [currentBag, setCurrentBag] = useState("City of Dreams");
  const [likedBags, setLikedBags] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const styleTags = [
    "Elegant", "Hand Painted", "Earthy Tones", "Artistic",
    "Abstract", "Vibrant", "Unique", "Luxury"
  ];

  // Recommendations should be fetched from LLM API - no static recommendations
  const recommendedBags = [];

  const smartClosetBags = [];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleCameraToggle = () => {
    if (cameraActive) {
      setCameraActive(false);
    } else {
      // Simulate camera access
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
          .then(() => {
            setCameraActive(true);
            alert("Camera activated! You can now try on bags in real-time.");
          })
          .catch(() => {
            alert("Camera access denied. Please allow camera permissions to use this feature.");
          });
      } else {
        setCameraActive(true);
        alert("Camera simulation activated!");
      }
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My Anuschka AR Try-On',
        text: `Check out how I look with the ${currentBag} bag!`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Image link copied to clipboard!');
    }
  };

  const handleBagSelect = (bagName: string) => {
    setCurrentBag(bagName);
  };

  const handleLikeBag = (bagName: string) => {
    setLikedBags(prev =>
      prev.includes(bagName)
        ? prev.filter(name => name !== bagName)
        : [...prev, bagName]
    );
  };

  const handleTryWithLook = (bagName: string) => {
    alert(`Trying ${bagName} with different looks...`);
  };

  const handleShareBag = (bagName: string) => {
    if (navigator.share) {
      navigator.share({
        title: 'Anuschka Bag',
        text: `Check out this beautiful ${bagName} bag!`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(`Check out the ${bagName} bag!`);
      alert('Bag link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="flex h-[calc(100vh-5rem)]">
        {/* Left Sidebar - AR Controls */}
        <div className="w-80 bg-gray-50 border-r border-gray-200 p-6 overflow-y-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-8">AR Controls</h2>

          {/* Upload Image Section */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Upload className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Upload Image</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Upload a photo to see how the bag looks on you.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              id="file-upload"
              className="hidden"
              accept="image/*"
              onChange={handleFileSelect}
            />
            <label htmlFor="file-upload">
              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                Select File
              </Button>
            </label>
            {selectedFile && (
              <p className="text-sm text-green-600 mt-2">
                ✓ {selectedFile.name} selected
              </p>
            )}
          </div>

          {/* Live Camera Feed Section */}
          <div>
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Camera className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Live Camera Feed</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Activate your camera for a real-time try-on experience.
            </p>
            <Button
              onClick={handleCameraToggle}
              className={`w-full ${cameraActive
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-purple-600 hover:bg-purple-700"
                } text-white`}
            >
              {cameraActive ? "Camera Off" : "Camera On"}
            </Button>
            {cameraActive && (
              <p className="text-sm text-blue-600 mt-2">
                📹 Camera is active
              </p>
            )}
          </div>

          {/* Current Bag Info */}
          <div className="mt-8 p-4 bg-white rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-2">Current Bag</h4>
            <p className="text-purple-600 font-medium">{currentBag}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {styleTags.slice(0, 4).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Center Area - Main Display */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Main Image Display */}
          <div className="flex-1 p-6 flex items-center justify-center bg-gray-50">
            <div className="relative max-w-2xl w-full">
              {/* Main Model Image */}
              <div className="relative bg-white rounded-lg shadow-lg overflow-hidden">
                <img
                  src={previewUrl || "/logo.png"}
                  alt="Model with bag"
                  className="w-full h-auto max-h-96 object-cover"
                />

                {/* Bag Highlight Overlay */}
                <div className="absolute top-1/2 right-1/4 w-24 h-24 border-2 border-pink-300 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <div className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center">
                    <img
                      src="/logo.png"
                      alt="Bag detail"
                      className="w-12 h-12 object-cover rounded-full"
                    />
                  </div>
                </div>

                {/* Current Bag Label */}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2">
                  <p className="text-sm font-medium text-gray-800">{currentBag}</p>
                </div>
              </div>

              {/* Share Button */}
              <div className="mt-6 text-center">
                <Button
                  onClick={handleShare}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-full"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Image
                </Button>
              </div>
            </div>
          </div>

          {/* My Smart Closet Section */}
          <div className="border-t border-gray-200 p-6 bg-white">
            <h3 className="text-xl font-bold text-gray-800 mb-4">My Smart Closet</h3>
            <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
              {smartClosetBags.map((bag, index) => (
                <Card key={index} className="min-w-64 flex-shrink-0 border-gray-200 hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="relative mb-3">
                      <img
                        src={bag.mainImage}
                        alt={bag.name}
                        className="w-full h-40 object-cover rounded-lg cursor-pointer"
                        onClick={() => handleBagSelect(bag.name)}
                      />
                      <div className="absolute bottom-2 right-2 w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center">
                        <img
                          src={bag.detailImage}
                          alt="Bag detail"
                          className="w-8 h-8 object-cover rounded-full"
                        />
                      </div>
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-3">{bag.name}</h4>
                    <div className="flex space-x-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`${likedBags.includes(bag.name) ? 'text-red-500' : 'text-gray-500'} hover:text-red-500`}
                        onClick={() => handleLikeBag(bag.name)}
                      >
                        <Heart className={`w-4 h-4 ${likedBags.includes(bag.name) ? 'fill-current' : ''}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 hover:text-purple-500"
                        onClick={() => handleShareBag(bag.name)}
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 hover:text-blue-500"
                        onClick={() => handleTryWithLook(bag.name)}
                      >
                        <Shirt className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Bag Details */}
        <div className="w-80 bg-gray-50 border-l border-gray-200 p-6 overflow-y-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-8">Bag Details</h2>

          {/* Style Information */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                <Tag className="w-4 h-4 text-pink-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Style Information</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {styleTags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-full hover:bg-gray-300 transition-colors cursor-pointer"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* All Recommended Bags */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-pink-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">All Recommended Bags</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {recommendedBags.map((bag, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleBagSelect(bag.name)}
                >
                  <img
                    src={bag.image}
                    alt={bag.name}
                    className="w-full h-24 object-cover rounded-lg mb-2"
                  />
                  <p className="text-sm font-medium text-gray-800 text-center">{bag.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ARVRPage; 