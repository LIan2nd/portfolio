"use client";

import { createContext, useContext, useState, useEffect } from "react";

interface AiVisibilityContextValue {
  isAiVisible: boolean;
  toggleAiVisibility: () => void;
  setAiVisible: (visible: boolean) => void;
}

const AiVisibilityContext = createContext<AiVisibilityContextValue | null>(null);

export function AiVisibilityProvider({ children }: { children: React.ReactNode }) {
  const [isAiVisible, setIsAiVisible] = useState<boolean>(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("ai_assistant_visible");
    if (stored !== null) {
      setIsAiVisible(stored === "true");
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("ai_assistant_visible", String(isAiVisible));
  }, [isAiVisible, mounted]);

  const toggleAiVisibility = () => setIsAiVisible((prev) => !prev);
  const setAiVisible = (visible: boolean) => setIsAiVisible(visible);

  return (
    <AiVisibilityContext.Provider
      value={{
        isAiVisible,
        toggleAiVisibility,
        setAiVisible,
      }}
    >
      {children}
    </AiVisibilityContext.Provider>
  );
}

const defaultContextValue: AiVisibilityContextValue = {
  isAiVisible: true,
  toggleAiVisibility: () => {},
  setAiVisible: () => {},
};

export function useAiVisibility(): AiVisibilityContextValue {
  const ctx = useContext(AiVisibilityContext);
  return ctx || defaultContextValue;
}
