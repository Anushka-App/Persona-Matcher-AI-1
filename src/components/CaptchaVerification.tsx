import React, { useRef, useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

interface CaptchaVerificationProps {
  onVerify: (token: string | null) => void;
  isVerified: boolean;
  className?: string;
}

const CaptchaVerification: React.FC<CaptchaVerificationProps> = ({ 
  onVerify, 
  isVerified, 
  className = "" 
}) => {
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCaptchaChange = (token: string | null) => {
    setIsLoading(true);
    onVerify(token);
    setIsLoading(false);
  };

  const handleExpired = () => {
    onVerify(null);
  };

  const handleError = () => {
    onVerify(null);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex justify-center">
        <ReCAPTCHA
          ref={recaptchaRef}
          sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"}
          onChange={handleCaptchaChange}
          onExpired={handleExpired}
          onError={handleError}
          theme="light"
          size="normal"
        />
      </div>
      
      {isVerified && (
        <div className="text-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Verification Complete
          </div>
        </div>
      )}
      
      {!isVerified && (
        <p className="text-sm text-gray-600 text-center">
          Please complete the captcha verification to continue
        </p>
      )}
    </div>
  );
};

export default CaptchaVerification;
