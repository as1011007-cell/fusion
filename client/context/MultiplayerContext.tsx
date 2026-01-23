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

interface MultiplayerContextType {
  connected: boolean;
  playerId: string | null;
  room: RoomState | null;
  error: string | null;
  currentQuestion: any | null;
  roundResults: RoundResult[] | null;
  answeredCount: number;
  gameFinished: boolean;
  finalScores: { id: string; name: string; score: number }[];
  winner: { id: string; name: string; score: number } | null;
  createRoom: (playerName: string, avatarId: string, maxPlayers?: number) => void;
  joinRoom: (roomCode: string, playerName: string, avatarId: string) => void;
  setReady: (ready: boolean) => void;
  startGame: (questions: any[], panel: string) => void;
  submitAnswer: (answer: string, correctAnswer: string, points: number) => void;
  nextQuestion: () => void;
  leaveRoom: () => void;
  clearError: () => void;
  clearResults: () => void;
}

const MultiplayerContext = createContext<MultiplayerContextType | undefined>(undefined);

export function MultiplayerProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [room, setRoom] = useState<RoomState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<any | null>(null);
  const [roundResults, setRoundResults] = useState<RoundResult[] | null>(null);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);
  const [finalScores, setFinalScores] = useState<{ id: string; name: string; score: number }[]>([]);
  const [winner, setWinner] = useState<{ id: string; name: string; score: number } | null>(null);
  
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
      case "PLAYER_LEFT":
        setRoom(message.room);
        break;

      case "GAME_STARTED":
        setRoom(message.room);
        setCurrentQuestion(message.question);
        setRoundResults(null);
        setAnsweredCount(0);
        setGameFinished(false);
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

  const createRoom = useCallback((playerName: string, avatarId: string, maxPlayers = 8) => {
    connect();
    setTimeout(() => {
      send({
        type: "CREATE_ROOM",
        playerName,
        avatarId,
        maxPlayers,
      });
    }, 500);
  }, [connect, send]);

  const joinRoom = useCallback((roomCode: string, playerName: string, avatarId: string) => {
    connect();
    setTimeout(() => {
      send({
        type: "JOIN_ROOM",
        roomCode,
        playerName,
        avatarId,
      });
    }, 500);
  }, [connect, send]);

  const setReady = useCallback((ready: boolean) => {
    send({ type: "PLAYER_READY", ready });
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
    setFinalScores([]);
    setWinner(null);
    wsRef.current?.close();
  }, [send]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearResults = useCallback(() => {
    setRoundResults(null);
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
        finalScores,
        winner,
        createRoom,
        joinRoom,
        setReady,
        startGame,
        submitAnswer,
        nextQuestion,
        leaveRoom,
        clearError,
        clearResults,
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
