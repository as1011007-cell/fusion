import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { IQQuestion, iqQuestions, IQDifficulty, IQCategory } from "@/data/iqQuestions";

export type { IQQuestion, IQDifficulty, IQCategory };

type DifficultyFilter = "all" | IQDifficulty;

type AnswerRecord = {
  questionId: string;
  selectedIndex: number;
  correct: boolean;
  timeSpent: number;
  points: number;
};

type IQGameState = {
  questions: IQQuestion[];
  currentQuestionIndex: number;
  score: number;
  timeRemaining: number;
  isGameActive: boolean;
  difficulty: DifficultyFilter;
  category: string;
  answers: AnswerRecord[];
  sessionAnsweredIds: Set<string>;
};

type IQGameResult = {
  finalScore: number;
  correctCount: number;
  avgTime: number;
  iqEstimate: number;
  totalQuestions: number;
  categoryBreakdown: Record<string, { correct: number; total: number }>;
};

type IQContextType = {
  currentQuestion: IQQuestion | null;
  questionNumber: number;
  totalQuestions: number;
  score: number;
  timeRemaining: number;
  isGameActive: boolean;
  difficulty: DifficultyFilter;
  category: string;
  startGame: (difficulty: DifficultyFilter, category: string, questionCount: number) => void;
  answerQuestion: (selectedIndex: number, timeSpent: number) => { correct: boolean; points: number };
  nextQuestion: () => boolean;
  endGame: () => IQGameResult;
  resetGame: () => void;
  getRandomQuestions: (count: number, difficulty?: string, category?: string) => IQQuestion[];
  markQuestionsAnswered: (questionIds: string[]) => void;
};

const initialGameState: IQGameState = {
  questions: [],
  currentQuestionIndex: 0,
  score: 0,
  timeRemaining: 0,
  isGameActive: false,
  difficulty: "all",
  category: "all",
  answers: [],
  sessionAnsweredIds: new Set(),
};

const IQContext = createContext<IQContextType | undefined>(undefined);

export function IQProvider({ children }: { children: ReactNode }) {
  const [gameState, setGameState] = useState<IQGameState>(initialGameState);

  useEffect(() => {
    loadSessionData();
  }, []);

  const loadSessionData = async () => {
    try {
      const sessionIds = await AsyncStorage.getItem("iqSessionAnsweredIds");
      if (sessionIds) {
        setGameState(prev => ({
          ...prev,
          sessionAnsweredIds: new Set(JSON.parse(sessionIds)),
        }));
      }
    } catch (error) {
      console.error("Error loading IQ session data:", error);
    }
  };

  const saveSessionData = async (answeredIds: Set<string>) => {
    try {
      await AsyncStorage.setItem(
        "iqSessionAnsweredIds",
        JSON.stringify([...answeredIds])
      );
    } catch (error) {
      console.error("Error saving IQ session data:", error);
    }
  };

  const getRandomQuestions = useCallback((
    count: number,
    difficulty?: string,
    category?: string
  ): IQQuestion[] => {
    // Filter questions based on difficulty and category
    let filtered = iqQuestions;
    
    if ((difficulty && difficulty !== "all") || (category && category !== "all")) {
      filtered = iqQuestions.filter(q => 
        (difficulty === "all" || !difficulty || q.difficulty === difficulty) &&
        (category === "all" || !category || q.category === category)
      );
      // Fall back to all questions if filters return nothing
      if (filtered.length === 0) {
        filtered = iqQuestions;
      }
    }

    // Prefer unanswered questions
    const unanswered = filtered.filter(
      q => !gameState.sessionAnsweredIds.has(q.id)
    );

    const source = unanswered.length >= count ? unanswered : filtered;
    const actualCount = Math.min(count, source.length);

    // Fisher-Yates shuffle (only shuffle what we need) - O(count) instead of O(n log n)
    const result: typeof source = [];
    const indices = new Set<number>();
    
    while (result.length < actualCount && indices.size < source.length) {
      const idx = Math.floor(Math.random() * source.length);
      if (!indices.has(idx)) {
        indices.add(idx);
        result.push(source[idx]);
      }
    }
    
    return result;
  }, [gameState.sessionAnsweredIds]);

  const startGame = useCallback((
    difficulty: DifficultyFilter,
    category: string,
    questionCount: number
  ) => {
    const questions = getRandomQuestions(questionCount, difficulty, category);

    if (questions.length === 0) {
      console.warn("No questions available for the selected filters");
      return;
    }

    const firstQuestion = questions[0];
    
    setGameState(prev => ({
      ...prev,
      questions,
      currentQuestionIndex: 0,
      score: 0,
      timeRemaining: firstQuestion.timeLimit,
      isGameActive: true,
      difficulty,
      category,
      answers: [],
    }));
  }, [getRandomQuestions]);

  const calculatePoints = (
    correct: boolean,
    difficulty: IQDifficulty,
    timeSpent: number,
    timeLimit: number
  ): number => {
    if (!correct) return 0;

    const difficultyMultiplier: Record<IQDifficulty, number> = {
      easy: 1,
      medium: 2,
      hard: 3,
    };

    const basePoints = 100 * difficultyMultiplier[difficulty];

    const timeRatio = Math.max(0, (timeLimit - timeSpent) / timeLimit);
    const speedBonus = Math.floor(basePoints * timeRatio * 0.5);

    return basePoints + speedBonus;
  };

  const answerQuestion = useCallback((
    selectedIndex: number,
    timeSpent: number
  ): { correct: boolean; points: number } => {
    const currentQuestion = gameState.questions[gameState.currentQuestionIndex];
    
    if (!currentQuestion) {
      return { correct: false, points: 0 };
    }

    const correct = selectedIndex === currentQuestion.correctIndex;
    const points = calculatePoints(
      correct,
      currentQuestion.difficulty,
      timeSpent,
      currentQuestion.timeLimit
    );

    const answerRecord: AnswerRecord = {
      questionId: currentQuestion.id,
      selectedIndex,
      correct,
      timeSpent,
      points,
    };

    const newAnsweredIds = new Set(gameState.sessionAnsweredIds);
    newAnsweredIds.add(currentQuestion.id);

    setGameState(prev => ({
      ...prev,
      score: prev.score + points,
      answers: [...prev.answers, answerRecord],
      sessionAnsweredIds: newAnsweredIds,
    }));

    saveSessionData(newAnsweredIds);

    return { correct, points };
  }, [gameState.questions, gameState.currentQuestionIndex, gameState.sessionAnsweredIds]);

  const nextQuestion = useCallback((): boolean => {
    const nextIndex = gameState.currentQuestionIndex + 1;
    
    if (nextIndex >= gameState.questions.length) {
      return false;
    }

    const nextQ = gameState.questions[nextIndex];
    
    setGameState(prev => ({
      ...prev,
      currentQuestionIndex: nextIndex,
      timeRemaining: nextQ.timeLimit,
    }));

    return true;
  }, [gameState.currentQuestionIndex, gameState.questions]);

  const calculateIQEstimate = (
    correctCount: number,
    totalQuestions: number,
    avgTime: number,
    answers: AnswerRecord[]
  ): number => {
    const accuracyRatio = correctCount / totalQuestions;

    let baseIQ = 100;

    baseIQ += (accuracyRatio - 0.5) * 40;

    const difficultyBonus = answers.reduce((acc, answer) => {
      if (!answer.correct) return acc;
      const question = iqQuestions.find(q => q.id === answer.questionId);
      if (!question) return acc;
      
      const bonus: Record<IQDifficulty, number> = {
        easy: 1,
        medium: 2,
        hard: 4,
      };
      return acc + bonus[question.difficulty];
    }, 0);

    baseIQ += difficultyBonus;

    const avgTimeLimit = answers.reduce((acc, answer) => {
      const question = iqQuestions.find(q => q.id === answer.questionId);
      return acc + (question?.timeLimit || 20);
    }, 0) / Math.max(answers.length, 1);

    if (avgTime < avgTimeLimit * 0.5) {
      baseIQ += 10;
    } else if (avgTime < avgTimeLimit * 0.75) {
      baseIQ += 5;
    }

    return Math.max(70, Math.min(160, Math.round(baseIQ)));
  };

  const endGame = useCallback((): IQGameResult => {
    const { answers, score, questions } = gameState;
    
    const correctCount = answers.filter(a => a.correct).length;
    const totalTime = answers.reduce((acc, a) => acc + a.timeSpent, 0);
    const avgTime = answers.length > 0 ? totalTime / answers.length : 0;
    
    const iqEstimate = calculateIQEstimate(
      correctCount,
      answers.length,
      avgTime,
      answers
    );

    const categoryBreakdown: Record<string, { correct: number; total: number }> = {};
    answers.forEach((answer) => {
      const question = iqQuestions.find(q => q.id === answer.questionId);
      if (question) {
        const cat = question.category;
        if (!categoryBreakdown[cat]) {
          categoryBreakdown[cat] = { correct: 0, total: 0 };
        }
        categoryBreakdown[cat].total += 1;
        if (answer.correct) {
          categoryBreakdown[cat].correct += 1;
        }
      }
    });

    setGameState(prev => ({
      ...prev,
      isGameActive: false,
    }));

    return {
      finalScore: score,
      correctCount,
      avgTime: Math.round(avgTime * 10) / 10,
      iqEstimate,
      totalQuestions: answers.length,
      categoryBreakdown,
    };
  }, [gameState]);

  const resetGame = useCallback(() => {
    setGameState(prev => ({
      ...initialGameState,
      sessionAnsweredIds: prev.sessionAnsweredIds,
    }));
  }, []);

  const markQuestionsAnswered = useCallback((questionIds: string[]) => {
    if (questionIds.length === 0) return;
    
    setGameState(prev => {
      const newAnsweredIds = new Set(prev.sessionAnsweredIds);
      questionIds.forEach(id => newAnsweredIds.add(id));
      saveSessionData(newAnsweredIds);
      return { ...prev, sessionAnsweredIds: newAnsweredIds };
    });
  }, []);

  const currentQuestion = gameState.questions[gameState.currentQuestionIndex] || null;
  const questionNumber = gameState.currentQuestionIndex + 1;
  const totalQuestions = gameState.questions.length;

  const contextValue: IQContextType = {
    currentQuestion,
    questionNumber,
    totalQuestions,
    score: gameState.score,
    timeRemaining: gameState.timeRemaining,
    isGameActive: gameState.isGameActive,
    difficulty: gameState.difficulty,
    category: gameState.category,
    startGame,
    answerQuestion,
    nextQuestion,
    endGame,
    resetGame,
    getRandomQuestions,
    markQuestionsAnswered,
  };

  return (
    <IQContext.Provider value={contextValue}>
      {children}
    </IQContext.Provider>
  );
}

export function useIQ() {
  const context = useContext(IQContext);
  if (context === undefined) {
    throw new Error("useIQ must be used within an IQProvider");
  }
  return context;
}
