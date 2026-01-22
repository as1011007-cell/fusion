import React, { createContext, useContext, useState, ReactNode } from "react";

export type Panel = {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
};

export type AnswerLayer = "common" | "honest" | "embarrassing";

export type PowerCard = {
  id: string;
  name: string;
  description: string;
  icon: string;
  count: number;
};

export type Question = {
  id: string;
  text: string;
  panelId: string;
  answers: {
    common: string[];
    honest: string[];
    embarrassing: string[];
  };
};

export type GameState = {
  currentRound: number;
  totalRounds: number;
  score: number;
  streak: number;
  selectedPanel: Panel | null;
  selectedLayer: AnswerLayer;
  currentQuestion: Question | null;
  powerCards: PowerCard[];
  isPlaying: boolean;
  playerAnswer: string;
  showResults: boolean;
  lastResult: {
    correct: boolean;
    points: number;
    correctAnswer: string;
  } | null;
};

type GameContextType = {
  gameState: GameState;
  panels: Panel[];
  setSelectedPanel: (panel: Panel) => void;
  setSelectedLayer: (layer: AnswerLayer) => void;
  startGame: () => void;
  submitAnswer: (answer: string) => void;
  nextRound: () => void;
  usePowerCard: (cardId: string) => void;
  resetGame: () => void;
  totalCoins: number;
  addCoins: (amount: number) => void;
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

const questions: Question[] = [
  {
    id: "1",
    text: "What's the first thing you do when you wake up?",
    panelId: "gen-z",
    answers: {
      common: ["Check phone", "Scroll TikTok", "Hit snooze"],
      honest: ["Doomscroll for 30 min", "Skip breakfast", "Ignore alarms"],
      embarrassing: ["Text ex at 3am", "Cry in bed", "Call in sick again"],
    },
  },
  {
    id: "2",
    text: "What do you secretly judge others for?",
    panelId: "desi-parents",
    answers: {
      common: ["Bad grades", "Messy house", "Not calling elders"],
      honest: ["Their kids' choices", "Cooking skills", "Not saving money"],
      embarrassing: ["Not owning a house", "Unmarried at 25", "Eating out too much"],
    },
  },
  {
    id: "3",
    text: "What's your guilty pleasure?",
    panelId: "hustlers",
    answers: {
      common: ["Expensive coffee", "Networking events", "Self-help books"],
      honest: ["Checking bank balance", "LinkedIn stalking", "Bragging subtly"],
      embarrassing: ["Sleeping in", "Netflix binges", "Ordering takeout"],
    },
  },
  {
    id: "4",
    text: "What inspires your creative work?",
    panelId: "artists",
    answers: {
      common: ["Nature", "Music", "Emotions"],
      honest: ["Deadlines", "Rent due", "Caffeine"],
      embarrassing: ["Jealousy of others", "Spite", "Procrastination anxiety"],
    },
  },
  {
    id: "5",
    text: "What gets you through Monday?",
    panelId: "office-workers",
    answers: {
      common: ["Coffee", "Colleagues", "Countdown to Friday"],
      honest: ["Paycheck thoughts", "Memes in group chat", "Long lunch breaks"],
      embarrassing: ["Job searching at desk", "Crying in bathroom", "Faking enthusiasm"],
    },
  },
];

const initialPowerCards: PowerCard[] = [
  {
    id: "mute",
    name: "Mute",
    description: "Skip a difficult question",
    icon: "volume-x",
    count: 2,
  },
  {
    id: "steal",
    name: "Steal",
    description: "Copy the top answer",
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
  currentRound: 0,
  totalRounds: 5,
  score: 0,
  streak: 0,
  selectedPanel: null,
  selectedLayer: "common",
  currentQuestion: null,
  powerCards: initialPowerCards,
  isPlaying: false,
  playerAnswer: "",
  showResults: false,
  lastResult: null,
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [totalCoins, setTotalCoins] = useState(100);

  const setSelectedPanel = (panel: Panel) => {
    setGameState((prev) => ({ ...prev, selectedPanel: panel }));
  };

  const setSelectedLayer = (layer: AnswerLayer) => {
    setGameState((prev) => ({ ...prev, selectedLayer: layer }));
  };

  const startGame = () => {
    const panelQuestions = questions.filter(
      (q) => q.panelId === gameState.selectedPanel?.id
    );
    const randomQuestion =
      panelQuestions[Math.floor(Math.random() * panelQuestions.length)] ||
      questions[0];

    setGameState((prev) => ({
      ...prev,
      isPlaying: true,
      currentRound: 1,
      score: 0,
      streak: 0,
      currentQuestion: randomQuestion,
      showResults: false,
      lastResult: null,
      powerCards: initialPowerCards,
    }));
  };

  const submitAnswer = (answer: string) => {
    if (!gameState.currentQuestion) return;

    const correctAnswers =
      gameState.currentQuestion.answers[gameState.selectedLayer];
    const isCorrect = correctAnswers.some(
      (a) => a.toLowerCase().includes(answer.toLowerCase()) ||
             answer.toLowerCase().includes(a.toLowerCase())
    );

    const basePoints = gameState.selectedLayer === "common" ? 100 :
                       gameState.selectedLayer === "honest" ? 200 : 300;
    const streakBonus = gameState.streak * 50;
    const points = isCorrect ? basePoints + streakBonus : 0;

    setGameState((prev) => ({
      ...prev,
      playerAnswer: answer,
      showResults: true,
      score: prev.score + points,
      streak: isCorrect ? prev.streak + 1 : 0,
      lastResult: {
        correct: isCorrect,
        points,
        correctAnswer: correctAnswers[0],
      },
    }));

    if (isCorrect) {
      addCoins(Math.floor(points / 10));
    }
  };

  const nextRound = () => {
    if (gameState.currentRound >= gameState.totalRounds) {
      setGameState((prev) => ({
        ...prev,
        isPlaying: false,
        showResults: false,
      }));
      return;
    }

    const availableQuestions = questions.filter(
      (q) => q.id !== gameState.currentQuestion?.id
    );
    const randomQuestion =
      availableQuestions[Math.floor(Math.random() * availableQuestions.length)];

    setGameState((prev) => ({
      ...prev,
      currentRound: prev.currentRound + 1,
      currentQuestion: randomQuestion,
      playerAnswer: "",
      showResults: false,
      lastResult: null,
    }));
  };

  const usePowerCard = (cardId: string) => {
    setGameState((prev) => ({
      ...prev,
      powerCards: prev.powerCards.map((card) =>
        card.id === cardId ? { ...card, count: Math.max(0, card.count - 1) } : card
      ),
    }));
  };

  const resetGame = () => {
    setGameState(initialGameState);
  };

  const addCoins = (amount: number) => {
    setTotalCoins((prev) => prev + amount);
  };

  return (
    <GameContext.Provider
      value={{
        gameState,
        panels,
        setSelectedPanel,
        setSelectedLayer,
        startGame,
        submitAnswer,
        nextRound,
        usePowerCard,
        resetGame,
        totalCoins,
        addCoins,
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
