import React, { createContext, useContext, useState, useEffect, useRef, ReactNode, useCallback } from "react";
import { getApiUrl } from "@/lib/query-client";

export interface LastTurnPlayer {
  id: string;
  name: string;
  avatarId: string;
  lives: number;
  ready: boolean;
  hasForceToken: boolean;
  hasPassToken: boolean;
  hasRevengeToken: boolean;
}

export interface LastTurnRoomState {
  id: string;
  code: string;
  hostId: string;
  status: "waiting" | "playing" | "finished";
  players: LastTurnPlayer[];
  currentTurnPlayerId: string | null;
  currentRound: number;
  chamberSlots: boolean[]; // 6 slots, one is "crash"
  revealedSlots: number[]; // indices of revealed slots
  crashSlotIndex: number; // the slot that causes crash
  gameMode: "classic" | "silent" | "countdown" | "truth";
  turnTimer: number; // seconds remaining for current turn
  maxPlayers: number;
  forcedPlayerId: string | null; // player being forced to pull
  lastCrashPlayerId: string | null; // player who got last crash (for revenge)
  truthQuestion: string | null; // for truth-or-risk mode
}

export interface TurnAction {
  type: "pull" | "pass" | "force";
  playerId: string;
  targetPlayerId?: string; // for force action
  slotIndex?: number; // which slot was revealed
  wasCrash?: boolean;
  truthAnswer?: string;
}

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  message: string;
  timestamp: number;
}

interface LastTurnContextType {
  connected: boolean;
  playerId: string | null;
  room: LastTurnRoomState | null;
  error: string | null;
  gameStarted: boolean;
  gameFinished: boolean;
  lastAction: TurnAction | null;
  winner: LastTurnPlayer | null;
  chatMessages: ChatMessage[];
  createRoom: (playerName: string, avatarId: string, gameMode: string) => void;
  joinRoom: (roomCode: string, playerName: string, avatarId: string) => void;
  setReady: (ready: boolean) => void;
  setGameMode: (mode: string) => void;
  startGame: () => void;
  pullSlot: () => void;
  passAction: () => void;
  forcePlayer: (targetPlayerId: string) => void;
  answerTruth: (answer: string) => void;
  sendChatMessage: (message: string) => void;
  leaveRoom: () => void;
  playAgain: () => void;
  clearError: () => void;
  resetGameState: () => void;
}

const LastTurnContext = createContext<LastTurnContextType | undefined>(undefined);

export function LastTurnProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [room, setRoom] = useState<LastTurnRoomState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [lastAction, setLastAction] = useState<TurnAction | null>(null);
  const [winner, setWinner] = useState<LastTurnPlayer | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const wsRef = useRef<WebSocket | null>(null);

  const getWebSocketUrl = useCallback(() => {
    const apiUrl = getApiUrl();
    const wsProtocol = apiUrl.startsWith("https") ? "wss" : "ws";
    const wsHost = apiUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
    return `${wsProtocol}://${wsHost}/ws/lastturn`;
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN || 
        wsRef.current?.readyState === WebSocket.CONNECTING) {
      return;
    }

    const wsUrl = getWebSocketUrl();
    console.log("Connecting to Last Turn WebSocket:", wsUrl);
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    let heartbeatInterval: NodeJS.Timeout | null = null;

    ws.onopen = () => {
      console.log("Last Turn WebSocket connected");
      setConnected(true);
      setError(null);
      
      heartbeatInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "HEARTBEAT" }));
        }
      }, 20000);
    };

    ws.onclose = () => {
      console.log("Last Turn WebSocket disconnected");
      setConnected(false);
      wsRef.current = null;
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
      }
    };

    ws.onerror = (e) => {
      console.error("Last Turn WebSocket error:", e);
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        handleMessage(message);
      } catch (e) {
        console.error("Failed to parse Last Turn message:", e);
      }
    };
  }, [getWebSocketUrl]);

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
      case "GAME_MODE_CHANGED":
        setRoom(message.room);
        break;

      case "PLAYER_LEFT":
        setRoom(message.room);
        break;

      case "GAME_STARTED":
        setRoom(message.room);
        setGameFinished(false);
        setGameStarted(true);
        setLastAction(null);
        break;

      case "TURN_ACTION":
        setLastAction(message.action);
        setRoom(message.room);
        break;

      case "NEW_ROUND":
        setRoom(message.room);
        setLastAction(null);
        break;

      case "TRUTH_QUESTION":
        setRoom(prev => prev ? { ...prev, truthQuestion: message.question } : null);
        break;

      case "GAME_FINISHED":
        setGameFinished(true);
        setWinner(message.winner);
        setRoom(message.room);
        break;

      case "ROOM_RESET":
        setRoom(message.room);
        setGameFinished(false);
        setGameStarted(false);
        setLastAction(null);
        setWinner(null);
        break;

      case "ROOM_EXPIRED":
        setRoom(null);
        setError("Room has expired");
        break;

      case "CHAT_MESSAGE":
        setChatMessages(prev => [...prev.slice(-49), message.message]);
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
      
      if (wsRef.current?.readyState === WebSocket.CONNECTING) {
        let attempts = 0;
        const maxAttempts = 30;
        const checkConnection = setInterval(() => {
          attempts++;
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            clearInterval(checkConnection);
            resolve();
          } else if (attempts >= maxAttempts || wsRef.current?.readyState === WebSocket.CLOSED) {
            clearInterval(checkConnection);
            connect();
            waitForOpen(resolve, reject);
          }
        }, 100);
        return;
      }
      
      connect();
      waitForOpen(resolve, reject);
    });
    
    function waitForOpen(resolve: () => void, reject: (e: Error) => void) {
      let attempts = 0;
      const maxAttempts = 30;
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
    }
  }, [connect]);

  const createRoom = useCallback(async (playerName: string, avatarId: string, gameMode: string) => {
    try {
      await waitForConnection();
      send({
        type: "CREATE_ROOM",
        playerName,
        avatarId,
        gameMode,
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

  const setGameMode = useCallback((mode: string) => {
    send({ type: "SET_GAME_MODE", gameMode: mode });
  }, [send]);

  const startGame = useCallback(() => {
    send({ type: "START_GAME" });
  }, [send]);

  const pullSlot = useCallback(() => {
    send({ type: "PULL_SLOT" });
  }, [send]);

  const passAction = useCallback(() => {
    send({ type: "PASS_ACTION" });
  }, [send]);

  const forcePlayer = useCallback((targetPlayerId: string) => {
    send({ type: "FORCE_PLAYER", targetPlayerId });
  }, [send]);

  const answerTruth = useCallback((answer: string) => {
    send({ type: "ANSWER_TRUTH", answer });
  }, [send]);

  const sendChatMessage = useCallback((message: string) => {
    if (message.trim()) {
      send({ type: "CHAT_MESSAGE", message: message.trim() });
    }
  }, [send]);

  const leaveRoom = useCallback(() => {
    send({ type: "LEAVE_ROOM" });
    setRoom(null);
    setPlayerId(null);
    setGameFinished(false);
    setGameStarted(false);
    setLastAction(null);
    setWinner(null);
    setChatMessages([]);
    setError(null);
    wsRef.current?.close();
    wsRef.current = null;
  }, [send]);

  const playAgain = useCallback(() => {
    send({ type: "PLAY_AGAIN" });
  }, [send]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const resetGameState = useCallback(() => {
    setGameStarted(false);
    setGameFinished(false);
    setLastAction(null);
    setWinner(null);
  }, []);

  useEffect(() => {
    return () => {
      wsRef.current?.close();
    };
  }, []);

  return (
    <LastTurnContext.Provider
      value={{
        connected,
        playerId,
        room,
        error,
        gameStarted,
        gameFinished,
        lastAction,
        winner,
        chatMessages,
        createRoom,
        joinRoom,
        setReady,
        setGameMode,
        startGame,
        pullSlot,
        passAction,
        forcePlayer,
        answerTruth,
        sendChatMessage,
        leaveRoom,
        playAgain,
        clearError,
        resetGameState,
      }}
    >
      {children}
    </LastTurnContext.Provider>
  );
}

export function useLastTurn() {
  const context = useContext(LastTurnContext);
  if (!context) {
    throw new Error("useLastTurn must be used within a LastTurnProvider");
  }
  return context;
}
