import { useCallback } from "react";
import { useAudioContext } from "@/context/AudioContext";

export function useFeudGameSounds() {
  const { startGameMusic, stopGameMusic } = useAudioContext();

  const startGameAudio = useCallback(() => {
    startGameMusic("feud");
  }, [startGameMusic]);

  const stopGameAudio = useCallback(() => {
    stopGameMusic();
  }, [stopGameMusic]);

  return { startGameAudio, stopGameAudio };
}
