import React, { createContext, useContext, useState, useEffect, useRef, ReactNode, useCallback } from "react";
import { getApiUrl } from "@/lib/query-client";

export interface MultiplayerPlayer {
  id: string;
  name: string;
  avatarId: string;
  score: number;
  ready: boolean;
}

export interface RoomState {
  id: string;
  code: string;
  hostId: string;
  status: "waiting" | "playing" | "finished";
  currentQuestion: number;
  currentPanel: string;
  selectedPanelId: string;
  selectedPanelName: string;
  maxPlayers: number;
  players: MultiplayerPlayer[];
}

export interface RoundResult {
  playerId: string;
  playerName: string;
  answer: string;
  isCorrect: boolean;
  newScore: number;
}

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  message: string;
  timestamp: number;
}

interface MultiplayerContextType {
  connected: boolean;
  playerId: string | null;
  room: RoomState | null;
  error: string | null;
  currentQuestion: any | null;
  roundResults: RoundResult[] | null;
  answeredCount: number;
  gameFinished: boolean;
  gameStarted: boolean;
  roomReset: boolean;
  finalScores: { id: string; name: string; score: number }[];
  winner: { id: string; name: string; score: number } | null;
  isDraw: boolean;
  chatMessages: ChatMessage[];
  createRoom: (playerName: string, avatarId: string, maxPlayers?: number) => void;
  joinRoom: (roomCode: string, playerName: string, avatarId: string) => void;
  setReady: (ready: boolean) => void;
  selectPanel: (panelId: string, panelName: string) => void;
  startGame: (questions: any[], panel: string) => void;
  submitAnswer: (answer: string, correctAnswer: string, points: number) => void;
  nextQuestion: () => void;
  leaveRoom: () => void;
  playAgain: () => void;
  sendChatMessage: (message: string) => void;
  clearError: () => void;
  clearResults: () => void;
  resetGameStarted: () => void;
  clearRoomReset: () => void;
}

const MultiplayerContext = createContext<MultiplayerContextType | undefined>(undefined);

export function MultiplayerProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [room, setRoom] = useState<RoomState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<any | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [roundResults, setRoundResults] = useState<RoundResult[] | null>(null);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);
  const [roomReset, setRoomReset] = useState(false);
  const [finalScores, setFinalScores] = useState<{ id: string; name: string; score: number }[]>([]);
  const [winner, setWinner] = useState<{ id: string; name: string; score: number } | null>(null);
  const [isDraw, setIsDraw] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getWebSocketUrl = useCallback(() => {
    const apiUrl = getApiUrl();
    const wsProtocol = apiUrl.startsWith("https") ? "wss" : "ws";
    const wsHost = apiUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
    return `${wsProtocol}://${wsHost}/ws/multiplayer`;
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const wsUrl = getWebSocketUrl();
    console.log("Connecting to WebSocket:", wsUrl);
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected");
      setConnected(true);
      setError(null);
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
      setConnected(false);
      reconnectTimeoutRef.current = setTimeout(() => {
        if (room) {
          connect();
        }
      }, 3000);
    };

    ws.onerror = (e) => {
      console.error("WebSocket error:", e);
      setError("Connection error. Please try again.");
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        handleMessage(message);
      } catch (e) {
        console.error("Failed to parse message:", e);
      }
    };
  }, [getWebSocketUrl, room]);

  const handleMessage = useCallback((message: any) => {
    switch (message.type) {
      case "ROOM_CREATED":
        setPlayerId(message.playerId);
        setRoom(message.room);
        break;

      case "ROOM_JOINED":
        setPlayerId(message.playerId);
        setRoom(message.room);
        break;

      case "PLAYER_JOINED":
      case "PLAYER_READY_UPDATE":
      case "PANEL_SELECTED":
        setRoom(message.room);
        break;

      case "PLAYER_LEFT":
        setRoom(message.room);
        // If host changed, update context so UI reflects new host
        break;

      case "GAME_STARTED":
        setRoom(message.room);
        setCurrentQuestion(message.question);
        setRoundResults(null);
        setAnsweredCount(0);
        setGameFinished(false);
        setGameStarted(true);
        break;

      case "PLAYER_ANSWERED":
        setAnsweredCount(message.answeredCount);
        break;

      case "ROUND_RESULTS":
        setRoundResults(message.results);
        setRoom(message.room);
        break;

      case "NEW_QUESTION":
        setCurrentQuestion(message.question);
        setRoundResults(null);
        setAnsweredCount(0);
        break;

      case "GAME_FINISHED":
        setGameFinished(true);
        setFinalScores(message.finalScores);
        setWinner(message.winner);
        setIsDraw(message.isDraw || false);
        break;

      case "ROOM_RESET":
        setRoom(message.room);
        setGameFinished(false);
        setCurrentQuestion(null);
        setRoundResults(null);
        setAnsweredCount(0);
        setFinalScores([]);
        setWinner(null);
        setIsDraw(false);
        setChatMessages([]);
        setRoomReset(true);
        break;

      case "CHAT_MESSAGE":
        setChatMessages(prev => [...prev.slice(-49), message.message]);
        break;

      case "ROOM_EXPIRED":
        setRoom(null);
        setError("Room has expired");
        break;

      case "ERROR":
        setError(message.message);
        break;
    }
  }, []);

  const send = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      setError("Not connected. Please try again.");
    }
  }, []);

  const waitForConnection = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }
      
      connect();
      
      let attempts = 0;
      const maxAttempts = 20;
      const checkConnection = setInterval(() => {
        attempts++;
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          clearInterval(checkConnection);
          resolve();
        } else if (attempts >= maxAttempts) {
          clearInterval(checkConnection);
          reject(new Error("Connection timeout"));
        }
      }, 100);
    });
  }, [connect]);

  const createRoom = useCallback(async (playerName: string, avatarId: string, maxPlayers = 8) => {
    try {
      await waitForConnection();
      send({
        type: "CREATE_ROOM",
        playerName,
        avatarId,
        maxPlayers,
      });
    } catch (e) {
      setError("Could not connect. Please try again.");
    }
  }, [waitForConnection, send]);

  const joinRoom = useCallback(async (roomCode: string, playerName: string, avatarId: string) => {
    try {
      await waitForConnection();
      send({
        type: "JOIN_ROOM",
        roomCode,
        playerName,
        avatarId,
      });
    } catch (e) {
      setError("Could not connect. Please try again.");
    }
  }, [waitForConnection, send]);

  const setReady = useCallback((ready: boolean) => {
    send({ type: "PLAYER_READY", ready });
  }, [send]);

  const selectPanel = useCallback((panelId: string, panelName: string) => {
    send({ type: "SELECT_PANEL", panelId, panelName });
  }, [send]);

  const startGame = useCallback((questions: any[], panel: string) => {
    send({ type: "START_GAME", questions, panel });
  }, [send]);

  const submitAnswer = useCallback((answer: string, correctAnswer: string, points: number) => {
    send({ type: "SUBMIT_ANSWER", answer, correctAnswer, points });
  }, [send]);

  const nextQuestion = useCallback(() => {
    send({ type: "NEXT_QUESTION" });
  }, [send]);

  const leaveRoom = useCallback(() => {
    send({ type: "LEAVE_ROOM" });
    setRoom(null);
    setPlayerId(null);
    setCurrentQuestion(null);
    setRoundResults(null);
    setGameFinished(false);
    setGameStarted(false);
    setFinalScores([]);
    setWinner(null);
    setIsDraw(false);
    setChatMessages([]);
    wsRef.current?.close();
  }, [send]);

  const playAgain = useCallback(() => {
    send({ type: "PLAY_AGAIN" });
  }, [send]);

  const sendChatMessage = useCallback((message: string) => {
    if (message.trim()) {
      send({ type: "CHAT_MESSAGE", message: message.trim() });
    }
  }, [send]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearResults = useCallback(() => {
    setRoundResults(null);
  }, []);

  const resetGameStarted = useCallback(() => {
    setGameStarted(false);
  }, []);

  const clearRoomReset = useCallback(() => {
    setRoomReset(false);
  }, []);

  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      wsRef.current?.close();
    };
  }, []);

  return (
    <MultiplayerContext.Provider
      value={{
        connected,
        playerId,
        room,
        error,
        currentQuestion,
        roundResults,
        answeredCount,
        gameFinished,
        gameStarted,
        roomReset,
        finalScores,
        winner,
        isDraw,
        chatMessages,
        createRoom,
        joinRoom,
        setReady,
        selectPanel,
        startGame,
        submitAnswer,
        nextQuestion,
        leaveRoom,
        playAgain,
        sendChatMessage,
        clearError,
        clearResults,
        resetGameStarted,
        clearRoomReset,
      }}
    >
      {children}
    </MultiplayerContext.Provider>
  );
}

export function useMultiplayer() {
  const context = useContext(MultiplayerContext);
  if (!context) {
    throw new Error("useMultiplayer must be used within a MultiplayerProvider");
  }
  return context;
}
