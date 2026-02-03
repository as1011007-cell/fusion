import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect, useRef } from "react";
import { useAudioPlayer, setAudioModeAsync } from "expo-audio";
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

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
    });
  }, []);

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

  const stopAllGameMusic = useCallback(async () => {
    try {
      if (feudPlayer) {
        feudPlayer.pause();
        feudPlayer.seekTo(0);
      }
      if (iqPlayer) {
        iqPlayer.pause();
        iqPlayer.seekTo(0);
      }
      if (lastTurnPlayer) {
        lastTurnPlayer.pause();
        lastTurnPlayer.seekTo(0);
      }
    } catch (e) {
      console.log("Error stopping game music:", e);
    }
  }, [feudPlayer, iqPlayer, lastTurnPlayer]);

  const startGameMusic = useCallback(async (type: GameMusicType) => {
    if (type === null) return;
    
    if (type === currentGameMusic && musicStartedRef.current) {
      return;
    }

    await stopAllGameMusic();
    
    await new Promise(resolve => setTimeout(resolve, 50));
    
    setIsLastTurnActive(true);
    setCurrentGameMusic(type);
    musicStartedRef.current = true;

    if (!settings.musicEnabled) return;

    try {
      let player = null;
      if (type === "feud") player = feudPlayer;
      else if (type === "iq") player = iqPlayer;
      else if (type === "lastturn") player = lastTurnPlayer;
      
      if (player) {
        player.seekTo(0);
        await new Promise(resolve => setTimeout(resolve, 20));
        player.play();
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
