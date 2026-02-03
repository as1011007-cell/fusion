import { useCallback, useEffect, useRef } from "react";
import { useAudioPlayer } from "expo-audio";
import { useAudioContext } from "@/context/AudioContext";

const iqBackgroundMusic = require("../../assets/sounds/iq-background-music.mp3");

export function useIQGameSounds() {
  const { setLastTurnActive } = useAudioContext();
  const isGameActive = useRef(false);
  
  const iqMusicPlayer = useAudioPlayer(iqBackgroundMusic);

  useEffect(() => {
    if (iqMusicPlayer) {
      iqMusicPlayer.loop = true;
      iqMusicPlayer.volume = 0.5;
    }
  }, [iqMusicPlayer]);

  const startGameAudio = useCallback(() => {
    setLastTurnActive(true);
    isGameActive.current = true;
    if (iqMusicPlayer) {
      try {
        iqMusicPlayer.seekTo(0);
        iqMusicPlayer.play();
      } catch (error) {
        console.log("Error playing IQ music:", error);
      }
    }
  }, [setLastTurnActive, iqMusicPlayer]);

  const stopGameAudio = useCallback(() => {
    setLastTurnActive(false);
    isGameActive.current = false;
    if (iqMusicPlayer) {
      try {
        iqMusicPlayer.pause();
      } catch (error) {
        console.log("Error stopping IQ music:", error);
      }
    }
  }, [setLastTurnActive, iqMusicPlayer]);

  return { startGameAudio, stopGameAudio };
}
