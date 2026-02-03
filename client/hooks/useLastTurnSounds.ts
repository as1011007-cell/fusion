import { useCallback } from "react";
import { useAudioPlayer } from "expo-audio";
import { useAudioContext } from "@/context/AudioContext";

const pullSafeSound = require("../../assets/sounds/pull-safe.mp3");
const pullCrashSound = require("../../assets/sounds/pull-crash.mp3");
const skipSound = require("../../assets/sounds/skip.mp3");
const forceSound = require("../../assets/sounds/force.mp3");
const revengeSound = require("../../assets/sounds/revenge.mp3");
const roundStartSound = require("../../assets/sounds/round-start.mp3");
const timerWarningSound = require("../../assets/sounds/timer-warning.mp3");

export type LastTurnSoundType = "pull-safe" | "pull-crash" | "skip" | "force" | "revenge" | "round-start" | "timer-warning";

export function useLastTurnSounds() {
  const { startGameMusic, stopGameMusic } = useAudioContext();
  
  const pullSafePlayer = useAudioPlayer(pullSafeSound);
  const pullCrashPlayer = useAudioPlayer(pullCrashSound);
  const skipPlayer = useAudioPlayer(skipSound);
  const forcePlayer = useAudioPlayer(forceSound);
  const revengePlayer = useAudioPlayer(revengeSound);
  const roundStartPlayer = useAudioPlayer(roundStartSound);
  const timerWarningPlayer = useAudioPlayer(timerWarningSound);

  const playSound = useCallback((type: LastTurnSoundType) => {
    const players: Record<LastTurnSoundType, typeof pullSafePlayer> = {
      "pull-safe": pullSafePlayer,
      "pull-crash": pullCrashPlayer,
      "skip": skipPlayer,
      "force": forcePlayer,
      "revenge": revengePlayer,
      "round-start": roundStartPlayer,
      "timer-warning": timerWarningPlayer,
    };

    const player = players[type];
    if (player) {
      try {
        player.seekTo(0);
        player.volume = 1.0;
        player.play();
      } catch (error) {
        console.log("Error playing sound:", type, error);
      }
    }
  }, [pullSafePlayer, pullCrashPlayer, skipPlayer, forcePlayer, revengePlayer, roundStartPlayer, timerWarningPlayer]);

  const startGameAudio = useCallback(() => {
    startGameMusic("lastturn");
  }, [startGameMusic]);

  const stopGameAudio = useCallback(() => {
    stopGameMusic();
  }, [stopGameMusic]);

  return { playSound, startGameAudio, stopGameAudio };
}
