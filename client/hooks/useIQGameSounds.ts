import { useCallback } from "react";
import { useAudioContext } from "@/context/AudioContext";

export function useIQGameSounds() {
  const { startGameMusic, stopGameMusic } = useAudioContext();

  const startGameAudio = useCallback(() => {
    startGameMusic("iq");
  }, [startGameMusic]);

  const stopGameAudio = useCallback(() => {
    stopGameMusic();
  }, [stopGameMusic]);

  return { startGameAudio, stopGameAudio };
}
