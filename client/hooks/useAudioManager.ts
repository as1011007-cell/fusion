import { useEffect, useCallback, useState } from "react";
import { useAudioPlayer } from "expo-audio";
import { useProfile } from "@/context/ProfileContext";

const backgroundMusic = require("../../assets/sounds/background-music.mp3");

export function useAudioManager() {
  const { settings } = useProfile();
  const [isReady, setIsReady] = useState(false);
  
  const player = useAudioPlayer(backgroundMusic);

  useEffect(() => {
    if (player) {
      player.loop = true;
      player.volume = settings.musicVolume;
      setIsReady(true);
    }
  }, [player]);

  useEffect(() => {
    if (!isReady || !player) return;

    if (settings.musicEnabled) {
      player.play();
    } else {
      player.pause();
    }
  }, [settings.musicEnabled, isReady, player]);

  useEffect(() => {
    if (player) {
      player.volume = settings.musicVolume;
    }
  }, [settings.musicVolume, player]);

  const playBackgroundMusic = useCallback(() => {
    if (!settings.musicEnabled || !player) return;
    player.play();
  }, [settings.musicEnabled, player]);

  const stopBackgroundMusic = useCallback(() => {
    if (player) {
      player.pause();
    }
  }, [player]);

  return {
    playBackgroundMusic,
    stopBackgroundMusic,
    isPlaying: player?.playing ?? false,
    musicEnabled: settings.musicEnabled,
    volume: settings.musicVolume,
  };
}
