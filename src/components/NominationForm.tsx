import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Upload, ChevronDown } from "lucide-react";

interface NominationFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const NominationForm: React.FC<NominationFormProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    nominationType: "",
    nominatorName: "",
    nominatorEmail: "",
    nominatorPhone: "",
    nomineeName: "",
    nomineeEmail: "",
    nomineePhone: "",
    instagramUrl: "",
    linkedinUrl: "",
    portfolioUrl: "",
    awardCategory: "",
    nominationReason: "",
    achievementsImpact: "",
    supportingMaterials: null as File | null,
    confirmation: false
  });

  const [charCounts, setCharCounts] = useState({
    nominationReason: 0,
    achievementsImpact: 0
  });

  const awardCategories = [
    "Professional Achievement",
    "Leadership Excellence", 
    "Social Responsibility & CSR",
    "Women's Empowerment",
    "Community Influencer",
    "Sustainability Champion",
    "Environmental Stewardship",
    "Arts & Culture Patron",
    "Fashion & Style Icon",
    "Innovation Pioneer",
    "Digital Impact Icon",
    "Emerging Flame Icon"
  ];

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTextChange = (field: string, value: string, maxLength: number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setCharCounts(prev => ({ ...prev, [field]: value.length }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, supportingMaterials: file }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log("Form submitted:", formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Submit Your Nomination</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            All fields marked with an asterisk (*) are required.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Nomination Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Are you nominating yourself or someone else?*
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="nominationType"
                  value="self"
                  checked={formData.nominationType === "self"}
                  onChange={(e) => handleInputChange("nominationType", e.target.value)}
                  className="mr-2"
                />
                Self
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="nominationType"
                  value="someone-else"
                  checked={formData.nominationType === "someone-else"}
                  onChange={(e) => handleInputChange("nominationType", e.target.value)}
                  className="mr-2"
                />
                Someone Else
              </label>
            </div>
          </div>

          {/* Nominator Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Full Name*
                </label>
                <input
                  type="text"
                  required
                  value={formData.nominatorName}
                  onChange={(e) => handleInputChange("nominatorName", e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Email*
                </label>
                <input
                  type="email"
                  required
                  value={formData.nominatorEmail}
                  onChange={(e) => handleInputChange("nominatorEmail", e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={formData.nominatorPhone}
                  onChange={(e) => handleInputChange("nominatorPhone", e.target.value)}
                  placeholder="Enter your phone number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Nominee Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Nominee's Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nominee's Full Name*
                </label>
                <input
                  type="text"
                  required
                  value={formData.nomineeName}
                  onChange={(e) => handleInputChange("nomineeName", e.target.value)}
                  placeholder="Enter nominee's full name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nominee's Email*
                </label>
                <input
                  type="email"
                  required
                  value={formData.nomineeEmail}
                  onChange={(e) => handleInputChange("nomineeEmail", e.target.value)}
                  placeholder="Enter nominee's email address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nominee's Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={formData.nomineePhone}
                  onChange={(e) => handleInputChange("nomineePhone", e.target.value)}
                  placeholder="Enter nominee's phone number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Social Media Links */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Nominee's Social Media Links</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instagram Profile URL
                </label>
                <input
                  type="url"
                  value={formData.instagramUrl}
                  onChange={(e) => handleInputChange("instagramUrl", e.target.value)}
                  placeholder="e.g., https://instagram.com/nominee_profile"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  LinkedIn Profile URL
                </label>
                <input
                  type="url"
                  value={formData.linkedinUrl}
                  onChange={(e) => handleInputChange("linkedinUrl", e.target.value)}
                  placeholder="e.g., https://linkedin.com/in/nominee_profile"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Other Website/Portfolio URL
                </label>
                <input
                  type="url"
                  value={formData.portfolioUrl}
                  onChange={(e) => handleInputChange("portfolioUrl", e.target.value)}
                  placeholder="e.g., https://nominee_portfolio.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Award Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Award Category*
            </label>
            <div className="relative">
              <select
                required
                value={formData.awardCategory}
                onChange={(e) => handleInputChange("awardCategory", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
              >
                <option value="">Select an award category</option>
                {awardCategories.map((category, index) => (
                  <option key={index} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Nomination Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Why are you nominating her?*
            </label>
            <p className="text-sm text-gray-600 mb-2">
              Briefly explain why this woman inspires you. (250-300 characters)
            </p>
            <textarea
              required
              value={formData.nominationReason}
              onChange={(e) => handleTextChange("nominationReason", e.target.value, 300)}
              rows={4}
              maxLength={300}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-500 text-right">
              {charCounts.nominationReason}/300 characters
            </p>
          </div>

          {/* Achievements & Impact */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Achievements & Impact*
            </label>
            <p className="text-sm text-gray-600 mb-2">
              Describe her key achievements, leadership qualities, and the positive impact she has made. (500-1000 characters)
            </p>
            <textarea
              required
              value={formData.achievementsImpact}
              onChange={(e) => handleTextChange("achievementsImpact", e.target.value, 1000)}
              rows={6}
              maxLength={1000}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-500 text-right">
              {charCounts.achievementsImpact}/1000 characters
            </p>
          </div>

          {/* Supporting Materials */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Supporting Materials (Optional)</h3>
            <p className="text-sm text-gray-600 mb-4">
              Upload documents, photos, or other relevant files.
            </p>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <input
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                multiple
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer text-purple-600 hover:text-purple-700 font-medium"
              >
                Click to upload files
              </label>
              <p className="text-sm text-gray-500 mt-1">
                or drag and drop files here
              </p>
              {formData.supportingMaterials && (
                <p className="text-sm text-gray-600 mt-2">
                  Selected: {formData.supportingMaterials.name}
                </p>
              )}
            </div>
          </div>

          {/* Confirmation */}
          <div>
            <label className="flex items-start">
              <input
                type="checkbox"
                required
                checked={formData.confirmation}
                onChange={(e) => handleInputChange("confirmation", e.target.checked)}
                className="mr-2 mt-1"
              />
              <span className="text-sm text-gray-700">
                I confirm that the information provided is accurate to the best of my knowledge.*
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg text-lg font-semibold"
          >
            Submit Nomination
          </Button>

          {/* Disclaimer */}
          <p className="text-sm text-gray-600 text-center">
            Our jury will carefully review each nomination. Winners will be announced in January 2026.
          </p>
        </form>
      </div>
    </div>
  );
};

export default NominationForm;
