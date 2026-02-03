import { useCallback, useEffect, useRef } from "react";
import { useAudioPlayer } from "expo-audio";
import { useAudioContext } from "@/context/AudioContext";

const feudBackgroundMusic = require("../../assets/sounds/feud_music.mp3");

export function useFeudGameSounds() {
  const { setLastTurnActive } = useAudioContext();
  const isGameActive = useRef(false);
  
  const feudMusicPlayer = useAudioPlayer(feudBackgroundMusic);

  useEffect(() => {
    if (feudMusicPlayer) {
      feudMusicPlayer.loop = true;
      feudMusicPlayer.volume = 0.5;
    }
  }, [feudMusicPlayer]);

  const startGameAudio = useCallback(() => {
    setLastTurnActive(true);
    isGameActive.current = true;
    if (feudMusicPlayer) {
      try {
        feudMusicPlayer.seekTo(0);
        feudMusicPlayer.play();
      } catch (error) {
        console.log("Error playing Feud music:", error);
      }
    }
  }, [setLastTurnActive, feudMusicPlayer]);

  const stopGameAudio = useCallback(() => {
    setLastTurnActive(false);
    isGameActive.current = false;
    if (feudMusicPlayer) {
      try {
        feudMusicPlayer.pause();
      } catch (error) {
        console.log("Error stopping Feud music:", error);
      }
    }
  }, [setLastTurnActive, feudMusicPlayer]);

  return { startGameAudio, stopGameAudio };
}
