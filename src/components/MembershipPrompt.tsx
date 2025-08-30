import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, Star, Zap, Gift, ArrowRight } from 'lucide-react';

interface MembershipPromptProps {
  onJoinCircle: () => void;
  onClose?: () => void;
  showCloseButton?: boolean;
}

const MembershipPrompt: React.FC<MembershipPromptProps> = ({
  onJoinCircle,
  onClose,
  showCloseButton = false
}) => {
  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg">
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-3">
          <div className="text-4xl">🚫</div>
        </div>
        <CardTitle className="text-xl font-bold text-purple-800">
          Limited Access
        </CardTitle>
        <p className="text-gray-600 mt-2">
          To view this result, please join the <strong>Anuschka Silver Circle</strong>.
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Benefits Section */}
        <div className="space-y-3">
          <h3 className="font-semibold text-purple-800 text-center">
            Silver members get:
          </h3>
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center space-x-3 p-3 bg-white/50 rounded-lg">
              <Crown className="h-5 w-5 text-purple-600" />
              <span className="text-gray-700">Full result access</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-white/50 rounded-lg">
              <Star className="h-5 w-5 text-purple-600" />
              <span className="text-gray-700">Priority features</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-white/50 rounded-lg">
              <Zap className="h-5 w-5 text-purple-600" />
              <span className="text-gray-700">Early previews</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-white/50 rounded-lg">
              <Gift className="h-5 w-5 text-purple-600" />
              <span className="text-gray-700">20% discount on purchases</span>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center space-y-4">
          <p className="text-purple-700 font-medium">
            🎉 Don't miss out — it only takes a minute to join!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={onJoinCircle}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-6 py-3"
            >
              <Crown className="h-4 w-4 mr-2" />
              Join Silver Circle
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            
            {showCloseButton && onClose && (
              <Button
                onClick={onClose}
                variant="outline"
                className="border-purple-300 text-purple-700 hover:bg-purple-50"
              >
                Maybe Later
              </Button>
            )}
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Free to join • No credit card required • Cancel anytime
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MembershipPrompt;
