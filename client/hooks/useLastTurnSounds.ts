import { useCallback, useEffect, useRef } from "react";
import { useAudioPlayer } from "expo-audio";
import { useAudioContext } from "@/context/AudioContext";

const pullSafeSound = require("../../assets/sounds/pull-safe.mp3");
const pullCrashSound = require("../../assets/sounds/pull-crash.mp3");
const skipSound = require("../../assets/sounds/skip.mp3");
const forceSound = require("../../assets/sounds/force.mp3");
const revengeSound = require("../../assets/sounds/revenge.mp3");
const intenseMusic = require("../../assets/sounds/intense-music.mp3");
const roundStartSound = require("../../assets/sounds/round-start.m4a");

export type LastTurnSoundType = "pull-safe" | "pull-crash" | "skip" | "force" | "revenge" | "round-start";

export function useLastTurnSounds() {
  const { setLastTurnActive } = useAudioContext();
  const isGameActive = useRef(false);
  
  const pullSafePlayer = useAudioPlayer(pullSafeSound);
  const pullCrashPlayer = useAudioPlayer(pullCrashSound);
  const skipPlayer = useAudioPlayer(skipSound);
  const forcePlayer = useAudioPlayer(forceSound);
  const revengePlayer = useAudioPlayer(revengeSound);
  const intenseMusicPlayer = useAudioPlayer(intenseMusic);
  const roundStartPlayer = useAudioPlayer(roundStartSound);

  useEffect(() => {
    if (intenseMusicPlayer) {
      intenseMusicPlayer.loop = true;
      intenseMusicPlayer.volume = 0.5;
    }
  }, [intenseMusicPlayer]);

  const playSound = useCallback((type: LastTurnSoundType) => {
    const players: Record<LastTurnSoundType, typeof pullSafePlayer> = {
      "pull-safe": pullSafePlayer,
      "pull-crash": pullCrashPlayer,
      "skip": skipPlayer,
      "force": forcePlayer,
      "revenge": revengePlayer,
      "round-start": roundStartPlayer,
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
  }, [pullSafePlayer, pullCrashPlayer, skipPlayer, forcePlayer, revengePlayer, roundStartPlayer]);

  const startGameAudio = useCallback(() => {
    setLastTurnActive(true);
    isGameActive.current = true;
    if (intenseMusicPlayer) {
      try {
        intenseMusicPlayer.seekTo(0);
        intenseMusicPlayer.play();
      } catch (error) {
        console.log("Error playing intense music:", error);
      }
    }
  }, [setLastTurnActive, intenseMusicPlayer]);

  const stopGameAudio = useCallback(() => {
    setLastTurnActive(false);
    isGameActive.current = false;
    if (intenseMusicPlayer) {
      try {
        intenseMusicPlayer.pause();
      } catch (error) {
        console.log("Error stopping intense music:", error);
      }
    }
  }, [setLastTurnActive, intenseMusicPlayer]);

  return { playSound, startGameAudio, stopGameAudio };
}
