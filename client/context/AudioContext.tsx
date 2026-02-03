import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect, useRef } from "react";
import { useAudioPlayer } from "expo-audio";
import { useProfile } from "@/context/ProfileContext";

const backgroundMusic = require("../../assets/sounds/background-music.mp3");
const feudMusic = require("../../assets/sounds/feud_music.mp3");
const iqMusic = require("../../assets/sounds/iq-background-music.mp3");
const intenseMusic = require("../../assets/sounds/intense-music.mp3");

type GameMusicType = "feud" | "iq" | "lastturn" | null;

interface AudioContextType {
  isGameMusicPlaying: boolean;
  currentGameMusic: GameMusicType;
  startGameMusic: (type: GameMusicType) => void;
  stopGameMusic: () => void;
  setLastTurnActive: (active: boolean) => void;
  isLastTurnActive: boolean;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: ReactNode }) {
  const { settings } = useProfile();
  const [isLastTurnActive, setIsLastTurnActive] = useState(false);
  const [currentGameMusic, setCurrentGameMusic] = useState<GameMusicType>(null);
  const musicStartedRef = useRef(false);

  const backgroundPlayer = useAudioPlayer(backgroundMusic);
  const feudPlayer = useAudioPlayer(feudMusic);
  const iqPlayer = useAudioPlayer(iqMusic);
  const lastTurnPlayer = useAudioPlayer(intenseMusic);

  useEffect(() => {
    if (backgroundPlayer) {
      backgroundPlayer.loop = true;
      backgroundPlayer.volume = settings.musicVolume;
    }
    if (feudPlayer) {
      feudPlayer.loop = true;
      feudPlayer.volume = 0.5;
    }
    if (iqPlayer) {
      iqPlayer.loop = true;
      iqPlayer.volume = 0.5;
    }
    if (lastTurnPlayer) {
      lastTurnPlayer.loop = true;
      lastTurnPlayer.volume = 0.5;
    }
  }, [backgroundPlayer, feudPlayer, iqPlayer, lastTurnPlayer, settings.musicVolume]);

  useEffect(() => {
    if (!backgroundPlayer) return;

    if (settings.musicEnabled && !isLastTurnActive && currentGameMusic === null) {
      backgroundPlayer.play();
    } else {
      backgroundPlayer.pause();
    }
  }, [isLastTurnActive, currentGameMusic, backgroundPlayer, settings.musicEnabled]);

  const stopAllGameMusic = useCallback(() => {
    try {
      if (feudPlayer?.playing) feudPlayer.pause();
      if (iqPlayer?.playing) iqPlayer.pause();
      if (lastTurnPlayer?.playing) lastTurnPlayer.pause();
    } catch (e) {
      console.log("Error stopping game music:", e);
    }
  }, [feudPlayer, iqPlayer, lastTurnPlayer]);

  const startGameMusic = useCallback((type: GameMusicType) => {
    if (type === currentGameMusic && musicStartedRef.current) {
      return;
    }

    stopAllGameMusic();
    setIsLastTurnActive(true);
    setCurrentGameMusic(type);
    musicStartedRef.current = true;

    if (!settings.musicEnabled) return;

    try {
      if (type === "feud" && feudPlayer) {
        feudPlayer.seekTo(0);
        feudPlayer.play();
      } else if (type === "iq" && iqPlayer) {
        iqPlayer.seekTo(0);
        iqPlayer.play();
      } else if (type === "lastturn" && lastTurnPlayer) {
        lastTurnPlayer.seekTo(0);
        lastTurnPlayer.play();
      }
    } catch (e) {
      console.log("Error starting game music:", e);
    }
  }, [currentGameMusic, feudPlayer, iqPlayer, lastTurnPlayer, stopAllGameMusic, settings.musicEnabled]);

  const stopGameMusic = useCallback(() => {
    stopAllGameMusic();
    setIsLastTurnActive(false);
    setCurrentGameMusic(null);
    musicStartedRef.current = false;
  }, [stopAllGameMusic]);

  const setLastTurnActive = useCallback((active: boolean) => {
    setIsLastTurnActive(active);
  }, []);

  return (
    <AudioContext.Provider value={{ 
      isGameMusicPlaying: currentGameMusic !== null,
      currentGameMusic,
      startGameMusic,
      stopGameMusic,
      setLastTurnActive,
      isLastTurnActive
    }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudioContext() {
  const context = useContext(AudioContext);
  if (!context) {
    return { 
      isGameMusicPlaying: false,
      currentGameMusic: null as GameMusicType,
      startGameMusic: () => {},
      stopGameMusic: () => {},
      isLastTurnActive: false, 
      setLastTurnActive: () => {} 
    };
  }
  return context;
}
