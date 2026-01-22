import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { allQuestions, getQuestionsForPanel, getDailyChallenge, Question, AnswerLayer } from "@/data/questions";

export type { Question, AnswerLayer };

export type Panel = {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
};

export type PowerCard = {
  id: string;
  name: string;
  description: string;
  icon: string;
  count: number;
};

export type PartyRole = "talker" | "whisperer" | "saboteur";

export type PartyPlayer = {
  id: string;
  name: string;
  role: PartyRole;
  team: "red" | "blue";
  score: number;
};

export type GameMode = "solo" | "party" | "daily";

export type GameState = {
  mode: GameMode;
  currentRound: number;
  totalRounds: number;
  score: number;
  streak: number;
  bestStreak: number;
  selectedPanel: Panel | null;
  selectedLayer: AnswerLayer;
  currentQuestion: Question | null;
  questions: Question[];
  powerCards: PowerCard[];
  isPlaying: boolean;
  selectedOptionIndex: number | null;
  showResults: boolean;
  lastResult: {
    correct: boolean;
    points: number;
    correctAnswer: string;
  } | null;
  partyPlayers: PartyPlayer[];
  currentTeam: "red" | "blue";
  redScore: number;
  blueScore: number;
  dailyChallengeCompleted: boolean;
  dailyChallengeDate: string | null;
  doubleBluffActive: boolean;
};

type GameContextType = {
  gameState: GameState;
  panels: Panel[];
  setSelectedPanel: (panel: Panel) => void;
  setSelectedLayer: (layer: AnswerLayer) => void;
  startGame: (mode: GameMode) => void;
  selectOption: (optionIndex: number) => void;
  nextRound: () => void;
  usePowerCard: (cardId: string) => void;
  resetGame: () => void;
  totalCoins: number;
  addCoins: (amount: number) => void;
  totalGamesPlayed: number;
  highScore: number;
  addPartyPlayer: (name: string, team: "red" | "blue") => void;
  removePartyPlayer: (playerId: string) => void;
  updatePlayerRole: (playerId: string, role: PartyRole) => void;
  switchTeam: () => void;
};

const panels: Panel[] = [
  {
    id: "gen-z",
    name: "Gen Z",
    description: "Digital natives with main character energy",
    icon: "zap",
    color: "#FF006E",
  },
  {
    id: "desi-parents",
    name: "Desi Parents",
    description: "Traditional values meet modern concerns",
    icon: "heart",
    color: "#FFD700",
  },
  {
    id: "hustlers",
    name: "Hustlers",
    description: "Grind culture and entrepreneurial spirit",
    icon: "trending-up",
    color: "#00FF87",
  },
  {
    id: "artists",
    name: "Artists",
    description: "Creative souls seeing the world differently",
    icon: "feather",
    color: "#00F5FF",
  },
  {
    id: "office-workers",
    name: "Office Workers",
    description: "Corporate life and water cooler wisdom",
    icon: "briefcase",
    color: "#A0A8C0",
  },
  {
    id: "small-town",
    name: "Small Town Families",
    description: "Close-knit communities with traditional values",
    icon: "home",
    color: "#FF8C00",
  },
];

const initialPowerCards: PowerCard[] = [
  {
    id: "skip",
    name: "Skip",
    description: "Skip this question",
    icon: "skip-forward",
    count: 2,
  },
  {
    id: "steal",
    name: "Steal",
    description: "Reveal one wrong answer",
    icon: "copy",
    count: 1,
  },
  {
    id: "double-bluff",
    name: "Double Bluff",
    description: "Double your points if correct",
    icon: "zap",
    count: 1,
  },
];

const initialGameState: GameState = {
  mode: "solo",
  currentRound: 0,
  totalRounds: 5,
  score: 0,
  streak: 0,
  bestStreak: 0,
  selectedPanel: null,
  selectedLayer: "common",
  currentQuestion: null,
  questions: [],
  powerCards: initialPowerCards,
  isPlaying: false,
  selectedOptionIndex: null,
  showResults: false,
  lastResult: null,
  partyPlayers: [],
  currentTeam: "red",
  redScore: 0,
  blueScore: 0,
  dailyChallengeCompleted: false,
  dailyChallengeDate: null,
  doubleBluffActive: false,
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [totalCoins, setTotalCoins] = useState(100);
  const [totalGamesPlayed, setTotalGamesPlayed] = useState(0);
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    loadPlayerData();
  }, []);

  const loadPlayerData = async () => {
    try {
      const coins = await AsyncStorage.getItem("totalCoins");
      const games = await AsyncStorage.getItem("totalGamesPlayed");
      const high = await AsyncStorage.getItem("highScore");
      const dailyDate = await AsyncStorage.getItem("dailyChallengeDate");

      if (coins) setTotalCoins(parseInt(coins, 10));
      if (games) setTotalGamesPlayed(parseInt(games, 10));
      if (high) setHighScore(parseInt(high, 10));
      
      const today = new Date().toISOString().split("T")[0];
      if (dailyDate === today) {
        setGameState(prev => ({ ...prev, dailyChallengeCompleted: true, dailyChallengeDate: today }));
      }
    } catch (error) {
      console.error("Error loading player data:", error);
    }
  };

  const savePlayerData = async () => {
    try {
      await AsyncStorage.setItem("totalCoins", totalCoins.toString());
      await AsyncStorage.setItem("totalGamesPlayed", totalGamesPlayed.toString());
      await AsyncStorage.setItem("highScore", highScore.toString());
    } catch (error) {
      console.error("Error saving player data:", error);
    }
  };

  useEffect(() => {
    savePlayerData();
  }, [totalCoins, totalGamesPlayed, highScore]);

  const setSelectedPanel = (panel: Panel) => {
    setGameState((prev) => ({ ...prev, selectedPanel: panel }));
  };

  const setSelectedLayer = (layer: AnswerLayer) => {
    setGameState((prev) => ({ ...prev, selectedLayer: layer }));
  };

  const startGame = (mode: GameMode) => {
    let questions: Question[] = [];
    let totalRounds = 5;

    if (mode === "daily") {
      questions = getDailyChallenge();
      totalRounds = questions.length;
    } else if (mode === "party") {
      questions = allQuestions.sort(() => Math.random() - 0.5).slice(0, 10);
      totalRounds = 10;
    } else if (gameState.selectedPanel) {
      questions = getQuestionsForPanel(
        gameState.selectedPanel.id,
        gameState.selectedLayer,
        5
      );
      totalRounds = 5;
    }

    if (questions.length === 0) {
      questions = allQuestions.sort(() => Math.random() - 0.5).slice(0, 5);
    }

    setGameState((prev) => ({
      ...prev,
      mode,
      isPlaying: true,
      currentRound: 1,
      totalRounds,
      score: 0,
      streak: 0,
      bestStreak: 0,
      currentQuestion: questions[0],
      questions,
      showResults: false,
      lastResult: null,
      selectedOptionIndex: null,
      powerCards: initialPowerCards,
      redScore: 0,
      blueScore: 0,
      currentTeam: "red",
      doubleBluffActive: false,
    }));
  };

  const selectOption = (optionIndex: number) => {
    if (!gameState.currentQuestion || gameState.showResults) return;

    const selectedOption = optionIndex >= 0 
      ? gameState.currentQuestion.options[optionIndex]
      : null;
    const isCorrect = selectedOption?.isCorrect || false;

    const basePoints = gameState.selectedLayer === "common" ? 100 :
                       gameState.selectedLayer === "honest" ? 200 : 300;
    const streakBonus = gameState.streak * 50;
    let points = isCorrect ? basePoints + streakBonus : 0;

    if (gameState.doubleBluffActive && isCorrect) {
      points *= 2;
    }

    const correctOption = gameState.currentQuestion.options.find(o => o.isCorrect);

    const newStreak = isCorrect ? gameState.streak + 1 : 0;
    const newBestStreak = Math.max(gameState.bestStreak, newStreak);

    let newRedScore = gameState.redScore;
    let newBlueScore = gameState.blueScore;

    if (gameState.mode === "party") {
      if (gameState.currentTeam === "red") {
        newRedScore += points;
      } else {
        newBlueScore += points;
      }
    }

    setGameState((prev) => ({
      ...prev,
      selectedOptionIndex: optionIndex,
      showResults: true,
      score: prev.score + points,
      streak: newStreak,
      bestStreak: newBestStreak,
      redScore: newRedScore,
      blueScore: newBlueScore,
      doubleBluffActive: false,
      lastResult: {
        correct: isCorrect,
        points,
        correctAnswer: correctOption?.text || "",
      },
    }));

    if (isCorrect) {
      addCoins(Math.floor(points / 10));
    }
  };

  const nextRound = () => {
    if (gameState.currentRound >= gameState.totalRounds) {
      if (gameState.score > highScore) {
        setHighScore(gameState.score);
      }
      setTotalGamesPlayed(prev => prev + 1);
      
      if (gameState.mode === "daily") {
        const today = new Date().toISOString().split("T")[0];
        AsyncStorage.setItem("dailyChallengeDate", today);
        setGameState(prev => ({ 
          ...prev, 
          isPlaying: false, 
          showResults: false,
          dailyChallengeCompleted: true,
          dailyChallengeDate: today,
        }));
      } else {
        setGameState((prev) => ({
          ...prev,
          isPlaying: false,
          showResults: false,
        }));
      }
      return;
    }

    const nextQuestion = gameState.questions[gameState.currentRound];
    const nextTeam = gameState.mode === "party" 
      ? (gameState.currentTeam === "red" ? "blue" : "red") 
      : gameState.currentTeam;

    setGameState((prev) => ({
      ...prev,
      currentRound: prev.currentRound + 1,
      currentQuestion: nextQuestion,
      selectedOptionIndex: null,
      showResults: false,
      lastResult: null,
      currentTeam: nextTeam,
      doubleBluffActive: false,
    }));
  };

  const usePowerCard = (cardId: string) => {
    const card = gameState.powerCards.find(c => c.id === cardId);
    if (!card || card.count <= 0) return;

    if (cardId === "skip" && gameState.currentRound < gameState.totalRounds) {
      setGameState((prev) => ({
        ...prev,
        powerCards: prev.powerCards.map((c) =>
          c.id === cardId ? { ...c, count: Math.max(0, c.count - 1) } : c
        ),
      }));
      nextRound();
      return;
    }

    if (cardId === "steal" && gameState.currentQuestion) {
      const wrongOptions = gameState.currentQuestion.options
        .map((opt, idx) => ({ opt, idx }))
        .filter(({ opt }) => !opt.isCorrect && !opt.text.startsWith("[X]"));
      
      if (wrongOptions.length > 0) {
        const randomWrong = wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
        const updatedOptions = gameState.currentQuestion.options.map((opt, idx) => 
          idx === randomWrong.idx ? { ...opt, text: `[X] ${opt.text}` } : opt
        );
        setGameState(prev => ({
          ...prev,
          currentQuestion: prev.currentQuestion ? {
            ...prev.currentQuestion,
            options: updatedOptions,
          } : null,
          powerCards: prev.powerCards.map((c) =>
            c.id === cardId ? { ...c, count: Math.max(0, c.count - 1) } : c
          ),
        }));
        return;
      }
    }

    if (cardId === "double-bluff") {
      setGameState((prev) => ({
        ...prev,
        doubleBluffActive: true,
        powerCards: prev.powerCards.map((c) =>
          c.id === cardId ? { ...c, count: Math.max(0, c.count - 1) } : c
        ),
      }));
      return;
    }

    setGameState((prev) => ({
      ...prev,
      powerCards: prev.powerCards.map((c) =>
        c.id === cardId ? { ...c, count: Math.max(0, c.count - 1) } : c
      ),
    }));
  };

  const resetGame = () => {
    setGameState({
      ...initialGameState,
      dailyChallengeCompleted: gameState.dailyChallengeCompleted,
      dailyChallengeDate: gameState.dailyChallengeDate,
      partyPlayers: [],
    });
  };

  const addCoins = (amount: number) => {
    setTotalCoins((prev) => prev + amount);
  };

  const addPartyPlayer = (name: string, team: "red" | "blue") => {
    const newPlayer: PartyPlayer = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      role: "whisperer",
      team,
      score: 0,
    };
    setGameState(prev => ({
      ...prev,
      partyPlayers: [...prev.partyPlayers, newPlayer],
    }));
  };

  const removePartyPlayer = (playerId: string) => {
    setGameState(prev => ({
      ...prev,
      partyPlayers: prev.partyPlayers.filter(p => p.id !== playerId),
    }));
  };

  const updatePlayerRole = (playerId: string, role: PartyRole) => {
    setGameState(prev => ({
      ...prev,
      partyPlayers: prev.partyPlayers.map(p =>
        p.id === playerId ? { ...p, role } : p
      ),
    }));
  };

  const switchTeam = () => {
    setGameState(prev => ({
      ...prev,
      currentTeam: prev.currentTeam === "red" ? "blue" : "red",
    }));
  };

  return (
    <GameContext.Provider
      value={{
        gameState,
        panels,
        setSelectedPanel,
        setSelectedLayer,
        startGame,
        selectOption,
        nextRound,
        usePowerCard,
        resetGame,
        totalCoins,
        addCoins,
        totalGamesPlayed,
        highScore,
        addPartyPlayer,
        removePartyPlayer,
        updatePlayerRole,
        switchTeam,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
