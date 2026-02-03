import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";

interface AudioContextType {
  isLastTurnActive: boolean;
  setLastTurnActive: (active: boolean) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: ReactNode }) {
  const [isLastTurnActive, setIsLastTurnActive] = useState(false);

  const setLastTurnActive = useCallback((active: boolean) => {
    setIsLastTurnActive(active);
  }, []);

  return (
    <AudioContext.Provider value={{ isLastTurnActive, setLastTurnActive }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudioContext() {
  const context = useContext(AudioContext);
  if (!context) {
    return { isLastTurnActive: false, setLastTurnActive: () => {} };
  }
  return context;
}
