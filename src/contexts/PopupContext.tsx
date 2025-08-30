import React, { createContext, useContext, useState, ReactNode } from 'react';

interface PopupContextType {
  hasShownProductPopup: boolean;
  setHasShownProductPopup: (shown: boolean) => void;
  showProductPopup: () => boolean;
}

const PopupContext = createContext<PopupContextType | undefined>(undefined);

export const usePopup = () => {
  const context = useContext(PopupContext);
  if (context === undefined) {
    throw new Error('usePopup must be used within a PopupProvider');
  }
  return context;
};

interface PopupProviderProps {
  children: ReactNode;
}

export const PopupProvider: React.FC<PopupProviderProps> = ({ children }) => {
  const [hasShownProductPopup, setHasShownProductPopup] = useState(false);

  const showProductPopup = (): boolean => {
    if (!hasShownProductPopup) {
      setHasShownProductPopup(true);
      return true; // Popup should be shown
    }
    return false; // Popup should not be shown
  };

  return (
    <PopupContext.Provider
      value={{
        hasShownProductPopup,
        setHasShownProductPopup,
        showProductPopup,
      }}
    >
      {children}
    </PopupContext.Provider>
  );
};
