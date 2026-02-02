import { useCallback } from "react";
import { useAudioPlayer } from "expo-audio";

const pullSafeSound = require("../../assets/sounds/pull-safe.mp3");
const pullCrashSound = require("../../assets/sounds/pull-crash.mp3");
const skipSound = require("../../assets/sounds/skip.mp3");
const forceSound = require("../../assets/sounds/force.mp3");
const revengeSound = require("../../assets/sounds/revenge.mp3");

export type LastTurnSoundType = "pull-safe" | "pull-crash" | "skip" | "force" | "revenge";

export function useLastTurnSounds() {
  const pullSafePlayer = useAudioPlayer(pullSafeSound);
  const pullCrashPlayer = useAudioPlayer(pullCrashSound);
  const skipPlayer = useAudioPlayer(skipSound);
  const forcePlayer = useAudioPlayer(forceSound);
  const revengePlayer = useAudioPlayer(revengeSound);

  const playSound = useCallback((type: LastTurnSoundType) => {
    const players: Record<LastTurnSoundType, typeof pullSafePlayer> = {
      "pull-safe": pullSafePlayer,
      "pull-crash": pullCrashPlayer,
      "skip": skipPlayer,
      "force": forcePlayer,
      "revenge": revengePlayer,
    };

    const player = players[type];
    if (player) {
      try {
        player.seekTo(0);
        player.volume = 0.7;
        player.play();
      } catch (error) {
        console.log("Error playing sound:", type, error);
      }
    }
  }, [pullSafePlayer, pullCrashPlayer, skipPlayer, forcePlayer, revengePlayer]);

  return { playSound };
}
