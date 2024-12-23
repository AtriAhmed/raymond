import React, { ReactNode, useContext, useEffect, useState } from "react";

type AppContextType = {
  showMobileNavbar: boolean;
  setShowMobileNavbar: React.Dispatch<React.SetStateAction<boolean>>;
  showMobileSidebar: boolean;
  setShowMobileSidebar: React.Dispatch<React.SetStateAction<boolean>>;
  isMobile: boolean;
};

const AppContext = React.createContext<AppContextType | undefined>(undefined);

type AppProviderProps = {
  children: ReactNode;
};

function AppProvider({ children }: AppProviderProps) {
  const [showMobileNavbar, setShowMobileNavbar] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(typeof window !== "undefined" ? window?.innerWidth < 768 : false);
  const [showMobileSidebar, setShowMobileSidebar] = useState<boolean>(false);

  useEffect(() => {
    function handleResize() {
      if (showMobileSidebar && window.innerWidth > 800) {
        setShowMobileSidebar(false);
      }
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [showMobileSidebar]);

  useEffect(() => {
    function handleResize() {
      if (window?.innerWidth < 768 && !isMobile) {
        setIsMobile(true);
      } else if (window?.innerWidth >= 768 && isMobile) {
        setIsMobile(false);
        setShowMobileSidebar(false);
      }
    }

    window?.addEventListener("resize", handleResize);

    return () => {
      window?.removeEventListener("resize", handleResize);
    };
  }, [isMobile]);

  const value = {
    showMobileSidebar,
    setShowMobileSidebar,
    isMobile,
    showMobileNavbar,
    setShowMobileNavbar,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export default AppProvider;

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useUIContext must be used within a UIProvider");
  }
  return context;
}
