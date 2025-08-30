import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, ChevronDown } from "lucide-react";

interface QuickNominationFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const QuickNominationForm: React.FC<QuickNominationFormProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    nomineeName: "",
    nomineeEmail: "",
    awardCategory: "",
    nominationReason: "",
    nominatorName: "",
    nominatorEmail: ""
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log("Quick nomination submitted:", formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Quick Nomination</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Get started with a quick nomination. You can always add more details later.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Nominee Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Nominee Details</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nominee's Name*
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
                  placeholder="Enter nominee's email"
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

          {/* Quick Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Why are you nominating her?*
            </label>
            <textarea
              required
              value={formData.nominationReason}
              onChange={(e) => handleInputChange("nominationReason", e.target.value)}
              rows={3}
              placeholder="Briefly explain why this woman inspires you..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Nominator Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Details</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name*
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
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg text-lg font-semibold mt-6"
          >
            Submit Quick Nomination
          </Button>

          {/* Note */}
          <p className="text-sm text-gray-600 text-center">
            Need to add more details? You'll receive an email to complete your submission.
          </p>
        </form>
      </div>
    </div>
  );
};

export default QuickNominationForm;
