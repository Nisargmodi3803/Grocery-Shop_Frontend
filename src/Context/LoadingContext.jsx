import React, { createContext, useState, useContext, useEffect } from "react";
import "./LoadingContext.css";

// Create a Loading Context
const LoadingContext = createContext();

// Custom Hook to use loading
export const useLoading = () => useContext(LoadingContext);

// Provider Component to Wrap Around App
export const LoadingProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);

  // Show loading on page refresh
  useEffect(() => {
    const handleRefresh = () => setLoading(true);
    window.addEventListener("beforeunload", handleRefresh);

    return () => {
      window.removeEventListener("beforeunload", handleRefresh);
    };
  }, []);

  return (
    <LoadingContext.Provider value={{ loading, setLoading }}>
      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
        </div>
      )}
      {children}
    </LoadingContext.Provider>
  );
};
