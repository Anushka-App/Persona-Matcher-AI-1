import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, ChevronDown } from "lucide-react";

interface AmbassadorFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const AmbassadorForm: React.FC<AmbassadorFormProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    email: "",
    circleTier: "Silver",
    tracks: {
      communityReferral: false,
      influencerReferral: false,
      ugcProgram: false,
      microCreator: false
    },
    primaryPlatforms: "",
    handlesUrls: ""
  });

  const circleTiers = ["Silver", "Gold", "Platinum"];
  const trackOptions = [
    { key: "communityReferral", label: "Community Referral" },
    { key: "influencerReferral", label: "Influencer Referral" },
    { key: "ugcProgram", label: "UGC Program" },
    { key: "microCreator", label: "Micro-Creator" }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTrackChange = (trackKey: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      tracks: {
        ...prev.tracks,
        [trackKey]: checked
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log("Ambassador form submitted:", formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Join the Ambassador Program</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Apply to become an Anuschka Circle Ambassador and help us grow our vibrant community.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email*
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="john.doe@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-600 mt-1">
                We'll send important updates and program communications to this email.
              </p>
            </div>
          </div>

          {/* Program Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Program Details</h3>
            
            {/* Circle Tier */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Circle Tier*
              </label>
              <div className="relative">
                <select
                  required
                  value={formData.circleTier}
                  onChange={(e) => handleInputChange("circleTier", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
                >
                  {circleTiers.map((tier) => (
                    <option key={tier} value={tier}>
                      {tier}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Select Tracks */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select track(s)*
              </label>
              <div className="space-y-2">
                {trackOptions.map((track) => (
                  <label key={track.key} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.tracks[track.key as keyof typeof formData.tracks]}
                      onChange={(e) => handleTrackChange(track.key, e.target.checked)}
                      className="mr-2 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">{track.label}</span>
                  </label>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Choose the areas where you'd like to contribute.
              </p>
            </div>

            {/* Primary Platforms */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Primary platforms
              </label>
              <input
                type="text"
                value={formData.primaryPlatforms}
                onChange={(e) => handleInputChange("primaryPlatforms", e.target.value)}
                placeholder="e.g., Instagram, YouTube, TikTok"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-600 mt-1">
                List your primary social media platforms (e.g., Instagram, YouTube, TikTok).
              </p>
            </div>

            {/* Handles/URLs */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Handles/URLs
              </label>
              <input
                type="text"
                value={formData.handlesUrls}
                onChange={(e) => handleInputChange("handlesUrls", e.target.value)}
                placeholder="e.g., instagram.com/anuschkacircle, youtube.com/anuschkacircle"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-600 mt-1">
                Provide direct links to your profiles for verification.
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg text-lg font-semibold"
          >
            Submit Application
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AmbassadorForm;
