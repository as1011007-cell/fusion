import { useEffect, useRef, useCallback, useState } from "react";
import { useAudioPlayer, AudioPlayer } from "expo-audio";
import { useProfile } from "@/context/ProfileContext";

export function useAudioManager() {
  const { settings } = useProfile();
  const [isPlaying, setIsPlaying] = useState(false);

  const playBackgroundMusic = useCallback(() => {
    if (!settings.musicEnabled) return;
    setIsPlaying(true);
  }, [settings.musicEnabled]);

  const stopBackgroundMusic = useCallback(() => {
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    if (settings.musicEnabled) {
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  }, [settings.musicEnabled]);

  return {
    playBackgroundMusic,
    stopBackgroundMusic,
    isPlaying: isPlaying && settings.musicEnabled,
    musicEnabled: settings.musicEnabled,
    volume: settings.musicVolume,
  };
}
