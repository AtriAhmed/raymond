import React, { ReactNode, useContext, useEffect, useState } from "react";

type AppContextType = {
  showMobileNavbar: boolean;
  setShowMobileNavbar: React.Dispatch<React.SetStateAction<boolean>>;
};

const AppContext = React.createContext<AppContextType | undefined>(undefined);

type AppProviderProps = {
  children: ReactNode;
};

function AppProvider({ children }: AppProviderProps) {
  const [showMobileNavbar, setShowMobileNavbar] = useState(false);
  // const [chatSidebarOpen, setChatSidebarOpen] = useState(false);

  // useEffect(() => {
  //   function handleResize() {
  //     if (chatSidebarOpen && window.innerWidth > 800) {
  //       setChatSidebarOpen(false);
  //     }
  //   }

  //   window.addEventListener("resize", handleResize);

  //   return () => {
  //     window.removeEventListener("resize", handleResize);
  //   };
  // }, [chatSidebarOpen]);

  useEffect(() => {
    function handleResize() {
      if (showMobileNavbar && window.innerWidth > 800) {
        setShowMobileNavbar(false);
      }
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [showMobileNavbar]);

  // useEffect(() => {
  //   if (showMobileNavbar) {
  //     document.querySelector("body")!.style.overflow = "hidden";
  //   } else {
  //     document.querySelector("body")!.style.overflow = "visible";
  //   }
  // }, [showMobileNavbar, chatSidebarOpen]);

  useEffect(() => {
    function handleKeydown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setShowMobileNavbar(false);
      }
    }

    if (showMobileNavbar) {
      document.addEventListener("keydown", handleKeydown);

      return () => {
        document.removeEventListener("keydown", handleKeydown);
      };
    }
  }, [showMobileNavbar]);

  const value = {
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
