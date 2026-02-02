import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

interface LastTurnPlayer {
  id: string;
  name: string;
  avatarId: string;
  lives: number;
  ws: WebSocket;
  ready: boolean;
  hasForceToken: boolean;
  hasPassToken: boolean;
  hasRevengeToken: boolean;
}

interface LastTurnRoom {
  id: string;
  code: string;
  hostId: string;
  players: Map<string, LastTurnPlayer>;
  status: 'waiting' | 'playing' | 'finished';
  currentTurnPlayerId: string | null;
  currentRound: number;
  chamberSlots: boolean[]; // true = crash slot
  revealedSlots: number[];
  crashSlotIndex: number;
  gameMode: 'classic' | 'silent' | 'countdown' | 'truth';
  turnTimer: number;
  maxPlayers: number;
  turnOrder: string[];
  currentTurnIndex: number;
  forcedPlayerId: string | null;
  lastCrashPlayerId: string | null;
  truthQuestions: string[];
  currentTruthQuestion: string | null;
  turnTimerInterval: NodeJS.Timeout | null;
  createdAt: Date;
}

const rooms = new Map<string, LastTurnRoom>();
const playerRooms = new Map<string, string>();

const TRUTH_QUESTIONS = [
  "What's the most embarrassing thing you've done in public?",
  "Have you ever lied to get out of work or school?",
  "What's a secret you've never told anyone?",
  "Who was your first celebrity crush?",
  "What's the dumbest thing you've argued about?",
  "Have you ever pretended to like a gift you hated?",
  "What's the longest you've gone without showering?",
  "Have you ever snooped through someone's phone?",
  "What's your most irrational fear?",
  "Have you ever blamed someone else for something you did?",
  "What's the weirdest thing you've eaten?",
  "Have you ever had a crush on a friend's partner?",
  "What's the most childish thing you still do?",
  "Have you ever ghosted someone?",
  "What's your most embarrassing autocorrect fail?",
];

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function generatePlayerId(): string {
  return 'lt_player_' + Math.random().toString(36).substring(2, 11);
}

function generateChamber(): { slots: boolean[], crashIndex: number } {
  const slots = Array(6).fill(false);
  const crashIndex = Math.floor(Math.random() * 6);
  slots[crashIndex] = true;
  return { slots, crashIndex };
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function broadcastToRoom(room: LastTurnRoom, message: any, excludePlayerId?: string) {
  room.players.forEach((player, playerId) => {
    if (playerId !== excludePlayerId && player.ws.readyState === WebSocket.OPEN) {
      player.ws.send(JSON.stringify(message));
    }
  });
}

function getRoomState(room: LastTurnRoom) {
  return {
    id: room.id,
    code: room.code,
    hostId: room.hostId,
    status: room.status,
    currentTurnPlayerId: room.currentTurnPlayerId,
    currentRound: room.currentRound,
    chamberSlots: room.chamberSlots,
    revealedSlots: room.revealedSlots,
    crashSlotIndex: room.status === 'finished' ? room.crashSlotIndex : -1, // Only reveal at end
    gameMode: room.gameMode,
    turnTimer: room.turnTimer,
    maxPlayers: room.maxPlayers,
    forcedPlayerId: room.forcedPlayerId,
    lastCrashPlayerId: room.lastCrashPlayerId,
    truthQuestion: room.currentTruthQuestion,
    players: Array.from(room.players.values()).map(p => ({
      id: p.id,
      name: p.name,
      avatarId: p.avatarId,
      lives: p.lives,
      ready: p.ready,
      hasForceToken: p.hasForceToken,
      hasPassToken: p.hasPassToken,
      hasRevengeToken: p.hasRevengeToken,
    })),
  };
}

function getNextPlayer(room: LastTurnRoom): string | null {
  const alivePlayers = room.turnOrder.filter(pid => {
    const player = room.players.get(pid);
    return player && player.lives > 0;
  });
  
  if (alivePlayers.length === 0) return null;
  
  room.currentTurnIndex = (room.currentTurnIndex + 1) % alivePlayers.length;
  return alivePlayers[room.currentTurnIndex % alivePlayers.length];
}

function startNewRound(room: LastTurnRoom) {
  const { slots, crashIndex } = generateChamber();
  room.chamberSlots = slots;
  room.crashSlotIndex = crashIndex;
  room.revealedSlots = [];
  room.currentRound++;
  room.forcedPlayerId = null;
  room.currentTruthQuestion = null;
  
  // Get next player for the new round
  const nextPlayer = getNextPlayer(room);
  room.currentTurnPlayerId = nextPlayer;
  
  // Reset turn timer for countdown mode
  if (room.gameMode === 'countdown') {
    room.turnTimer = Math.max(15 - room.currentRound, 5); // Decreases each round, min 5 seconds
  } else {
    room.turnTimer = 30;
  }
  
  broadcastToRoom(room, {
    type: 'NEW_ROUND',
    room: getRoomState(room),
  });
  
  // Start turn timer
  startTurnTimer(room);
}

function startTurnTimer(room: LastTurnRoom) {
  if (room.turnTimerInterval) {
    clearInterval(room.turnTimerInterval);
  }
  
  room.turnTimerInterval = setInterval(() => {
    room.turnTimer--;
    
    if (room.turnTimer <= 0) {
      // Auto-pull on timer expiry
      if (room.currentTurnPlayerId) {
        handlePull(room, room.currentTurnPlayerId);
      }
      if (room.turnTimerInterval) {
        clearInterval(room.turnTimerInterval);
        room.turnTimerInterval = null;
      }
    }
  }, 1000);
}

function handlePull(room: LastTurnRoom, playerId: string) {
  const player = room.players.get(playerId);
  if (!player) return;
  
  // Find first unrevealed slot
  let slotIndex = -1;
  for (let i = 0; i < 6; i++) {
    if (!room.revealedSlots.includes(i)) {
      slotIndex = i;
      break;
    }
  }
  
  if (slotIndex === -1) {
    // All slots revealed, start new round
    startNewRound(room);
    return;
  }
  
  room.revealedSlots.push(slotIndex);
  const wasCrash = slotIndex === room.crashSlotIndex;
  
  if (wasCrash) {
    player.lives--;
    room.lastCrashPlayerId = playerId;
    
    // Give revenge token to crashed player
    player.hasRevengeToken = true;
    
    // Check for game over
    const alivePlayers = Array.from(room.players.values()).filter(p => p.lives > 0);
    if (alivePlayers.length <= 1) {
      room.status = 'finished';
      if (room.turnTimerInterval) {
        clearInterval(room.turnTimerInterval);
        room.turnTimerInterval = null;
      }
      
      broadcastToRoom(room, {
        type: 'TURN_ACTION',
        action: {
          type: 'pull',
          playerId,
          slotIndex,
          wasCrash: true,
        },
        room: getRoomState(room),
      });
      
      broadcastToRoom(room, {
        type: 'GAME_FINISHED',
        winner: alivePlayers[0] || null,
        room: getRoomState(room),
      });
      return;
    }
    
    // Broadcast crash and start new round
    broadcastToRoom(room, {
      type: 'TURN_ACTION',
      action: {
        type: 'pull',
        playerId,
        slotIndex,
        wasCrash: true,
      },
      room: getRoomState(room),
    });
    
    // Short delay before new round
    setTimeout(() => {
      if (room.status === 'playing') {
        startNewRound(room);
      }
    }, 2000);
  } else {
    // Safe pull, next player's turn
    room.forcedPlayerId = null;
    room.currentTurnPlayerId = getNextPlayer(room);
    
    if (room.gameMode === 'countdown') {
      room.turnTimer = Math.max(15 - room.currentRound, 5);
    } else {
      room.turnTimer = 30;
    }
    
    broadcastToRoom(room, {
      type: 'TURN_ACTION',
      action: {
        type: 'pull',
        playerId,
        slotIndex,
        wasCrash: false,
      },
      room: getRoomState(room),
    });
    
    // If truth mode and all slots except crash revealed, start new round
    if (room.revealedSlots.length >= 5) {
      setTimeout(() => {
        if (room.status === 'playing') {
          startNewRound(room);
        }
      }, 1000);
    } else {
      startTurnTimer(room);
    }
  }
}

export function setupLastTurnMultiplayer(server: Server) {
  const wss = new WebSocketServer({ server, path: '/ws/lastturn' });

  console.log('Last Turn WebSocket server initialized');

  const pingInterval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping();
      }
    });
  }, 25000);

  wss.on('close', () => {
    clearInterval(pingInterval);
  });

  wss.on('connection', (ws: WebSocket) => {
    let playerId: string | null = null;
    let currentRoomCode: string | null = null;

    ws.on('pong', () => {});

    ws.ping();

    ws.on('message', (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        
        switch (message.type) {
          case 'HEARTBEAT':
            break;

          case 'CREATE_ROOM': {
            playerId = generatePlayerId();
            const roomCode = generateRoomCode();
            const roomId = 'lt_room_' + Date.now();
            
            const { slots, crashIndex } = generateChamber();
            
            const room: LastTurnRoom = {
              id: roomId,
              code: roomCode,
              hostId: playerId,
              players: new Map(),
              status: 'waiting',
              currentTurnPlayerId: null,
              currentRound: 0,
              chamberSlots: slots,
              revealedSlots: [],
              crashSlotIndex: crashIndex,
              gameMode: message.gameMode || 'classic',
              turnTimer: 30,
              maxPlayers: 6,
              turnOrder: [],
              currentTurnIndex: -1,
              forcedPlayerId: null,
              lastCrashPlayerId: null,
              truthQuestions: shuffleArray([...TRUTH_QUESTIONS]),
              currentTruthQuestion: null,
              turnTimerInterval: null,
              createdAt: new Date(),
            };

            const player: LastTurnPlayer = {
              id: playerId,
              name: message.playerName || 'Player',
              avatarId: message.avatarId || 'avatar-1',
              lives: 3,
              ws,
              ready: true,
              hasForceToken: true,
              hasPassToken: true,
              hasRevengeToken: false,
            };

            room.players.set(playerId, player);
            rooms.set(roomCode, room);
            playerRooms.set(playerId, roomCode);
            currentRoomCode = roomCode;

            ws.send(JSON.stringify({
              type: 'ROOM_CREATED',
              playerId,
              room: getRoomState(room),
            }));
            break;
          }

          case 'JOIN_ROOM': {
            const roomCode = message.roomCode?.toUpperCase();
            const room = rooms.get(roomCode);

            if (!room) {
              ws.send(JSON.stringify({ type: 'ERROR', message: 'Room not found' }));
              return;
            }

            if (room.status !== 'waiting') {
              ws.send(JSON.stringify({ type: 'ERROR', message: 'Game already in progress' }));
              return;
            }

            if (room.players.size >= room.maxPlayers) {
              ws.send(JSON.stringify({ type: 'ERROR', message: 'Room is full (max 6 players)' }));
              return;
            }

            playerId = generatePlayerId();
            const player: LastTurnPlayer = {
              id: playerId,
              name: message.playerName || 'Player',
              avatarId: message.avatarId || 'avatar-1',
              lives: 3,
              ws,
              ready: false,
              hasForceToken: true,
              hasPassToken: true,
              hasRevengeToken: false,
            };

            room.players.set(playerId, player);
            playerRooms.set(playerId, roomCode);
            currentRoomCode = roomCode;

            ws.send(JSON.stringify({
              type: 'ROOM_JOINED',
              playerId,
              room: getRoomState(room),
            }));

            broadcastToRoom(room, {
              type: 'PLAYER_JOINED',
              player: {
                id: playerId,
                name: player.name,
                avatarId: player.avatarId,
                lives: player.lives,
                ready: false,
                hasForceToken: true,
                hasPassToken: true,
                hasRevengeToken: false,
              },
              room: getRoomState(room),
            }, playerId);
            break;
          }

          case 'PLAYER_READY': {
            if (!currentRoomCode || !playerId) return;
            const room = rooms.get(currentRoomCode);
            if (!room) return;

            const player = room.players.get(playerId);
            if (player) {
              player.ready = message.ready;
              broadcastToRoom(room, {
                type: 'PLAYER_READY_UPDATE',
                playerId,
                ready: message.ready,
                room: getRoomState(room),
              });
            }
            break;
          }

          case 'SET_GAME_MODE': {
            if (!currentRoomCode || !playerId) return;
            const room = rooms.get(currentRoomCode);
            if (!room || room.hostId !== playerId) return;

            const validModes = ['classic', 'silent', 'countdown', 'truth'];
            if (validModes.includes(message.gameMode)) {
              room.gameMode = message.gameMode;
              broadcastToRoom(room, {
                type: 'GAME_MODE_CHANGED',
                gameMode: room.gameMode,
                room: getRoomState(room),
              });
            }
            break;
          }

          case 'START_GAME': {
            if (!currentRoomCode || !playerId) return;
            const room = rooms.get(currentRoomCode);
            if (!room || room.hostId !== playerId) return;

            const allReady = Array.from(room.players.values()).every(p => p.ready);
            if (!allReady || room.players.size < 2) {
              ws.send(JSON.stringify({ type: 'ERROR', message: 'Need at least 2 players and all must be ready' }));
              return;
            }

            room.status = 'playing';
            room.currentRound = 0;
            room.turnOrder = shuffleArray(Array.from(room.players.keys()));
            room.currentTurnIndex = -1;
            
            // Reset all players
            room.players.forEach(player => {
              player.lives = 3;
              player.hasForceToken = true;
              player.hasPassToken = true;
              player.hasRevengeToken = false;
            });

            broadcastToRoom(room, {
              type: 'GAME_STARTED',
              room: getRoomState(room),
            });

            // Start first round
            setTimeout(() => {
              startNewRound(room);
            }, 1000);
            break;
          }

          case 'PULL_SLOT': {
            if (!currentRoomCode || !playerId) return;
            const room = rooms.get(currentRoomCode);
            if (!room || room.status !== 'playing') return;

            // Check if it's this player's turn (or they're being forced)
            if (room.currentTurnPlayerId !== playerId && room.forcedPlayerId !== playerId) {
              ws.send(JSON.stringify({ type: 'ERROR', message: 'Not your turn' }));
              return;
            }

            if (room.turnTimerInterval) {
              clearInterval(room.turnTimerInterval);
              room.turnTimerInterval = null;
            }

            handlePull(room, playerId);
            break;
          }

          case 'PASS_ACTION': {
            if (!currentRoomCode || !playerId) return;
            const room = rooms.get(currentRoomCode);
            if (!room || room.status !== 'playing') return;

            if (room.currentTurnPlayerId !== playerId) {
              ws.send(JSON.stringify({ type: 'ERROR', message: 'Not your turn' }));
              return;
            }

            const player = room.players.get(playerId);
            if (!player || !player.hasPassToken) {
              ws.send(JSON.stringify({ type: 'ERROR', message: 'No pass token available' }));
              return;
            }

            player.hasPassToken = false;
            room.currentTurnPlayerId = getNextPlayer(room);

            if (room.turnTimerInterval) {
              clearInterval(room.turnTimerInterval);
            }

            if (room.gameMode === 'countdown') {
              room.turnTimer = Math.max(15 - room.currentRound, 5);
            } else {
              room.turnTimer = 30;
            }

            broadcastToRoom(room, {
              type: 'TURN_ACTION',
              action: {
                type: 'pass',
                playerId,
              },
              room: getRoomState(room),
            });

            startTurnTimer(room);
            break;
          }

          case 'FORCE_PLAYER': {
            if (!currentRoomCode || !playerId) return;
            const room = rooms.get(currentRoomCode);
            if (!room || room.status !== 'playing') return;

            if (room.currentTurnPlayerId !== playerId) {
              ws.send(JSON.stringify({ type: 'ERROR', message: 'Not your turn' }));
              return;
            }

            const player = room.players.get(playerId);
            const targetPlayer = room.players.get(message.targetPlayerId);
            
            if (!player || !targetPlayer) {
              ws.send(JSON.stringify({ type: 'ERROR', message: 'Invalid target' }));
              return;
            }

            // Check if has force token or revenge token
            if (!player.hasForceToken && !player.hasRevengeToken) {
              ws.send(JSON.stringify({ type: 'ERROR', message: 'No force token available' }));
              return;
            }

            if (targetPlayer.lives <= 0) {
              ws.send(JSON.stringify({ type: 'ERROR', message: 'Cannot force eliminated player' }));
              return;
            }

            // Use revenge token first if available
            if (player.hasRevengeToken) {
              player.hasRevengeToken = false;
            } else {
              player.hasForceToken = false;
            }

            room.forcedPlayerId = message.targetPlayerId;
            room.currentTurnPlayerId = message.targetPlayerId;

            if (room.turnTimerInterval) {
              clearInterval(room.turnTimerInterval);
            }

            room.turnTimer = 15; // Forced players get less time

            broadcastToRoom(room, {
              type: 'TURN_ACTION',
              action: {
                type: 'force',
                playerId,
                targetPlayerId: message.targetPlayerId,
              },
              room: getRoomState(room),
            });

            startTurnTimer(room);
            break;
          }

          case 'ANSWER_TRUTH': {
            if (!currentRoomCode || !playerId) return;
            const room = rooms.get(currentRoomCode);
            if (!room || room.status !== 'playing' || room.gameMode !== 'truth') return;

            if (room.currentTurnPlayerId !== playerId) return;

            room.currentTruthQuestion = null;

            broadcastToRoom(room, {
              type: 'TRUTH_ANSWERED',
              playerId,
              answer: message.answer,
              room: getRoomState(room),
            });
            break;
          }

          case 'LEAVE_ROOM': {
            if (!currentRoomCode || !playerId) return;
            handlePlayerLeave(playerId, currentRoomCode);
            currentRoomCode = null;
            playerId = null;
            break;
          }

          case 'PLAY_AGAIN': {
            if (!currentRoomCode || !playerId) return;
            const room = rooms.get(currentRoomCode);
            if (!room) return;

            if (room.hostId !== playerId && room.players.size > 1) {
              ws.send(JSON.stringify({ type: 'ERROR', message: 'Only host can restart' }));
              return;
            }

            // Reset room
            room.status = 'waiting';
            room.currentRound = 0;
            room.revealedSlots = [];
            room.currentTurnPlayerId = null;
            room.forcedPlayerId = null;
            room.lastCrashPlayerId = null;
            room.currentTruthQuestion = null;
            
            if (room.turnTimerInterval) {
              clearInterval(room.turnTimerInterval);
              room.turnTimerInterval = null;
            }

            const { slots, crashIndex } = generateChamber();
            room.chamberSlots = slots;
            room.crashSlotIndex = crashIndex;

            room.players.forEach((player, pid) => {
              player.lives = 3;
              player.ready = pid === room.hostId;
              player.hasForceToken = true;
              player.hasPassToken = true;
              player.hasRevengeToken = false;
            });

            broadcastToRoom(room, {
              type: 'ROOM_RESET',
              room: getRoomState(room),
            });

            ws.send(JSON.stringify({
              type: 'ROOM_RESET',
              room: getRoomState(room),
            }));
            break;
          }
        }
      } catch (error) {
        console.error('Last Turn WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      if (playerId && currentRoomCode) {
        handlePlayerLeave(playerId, currentRoomCode);
      }
    });

    ws.on('error', (error) => {
      console.error('Last Turn WebSocket error:', error);
    });
  });

  function handlePlayerLeave(playerId: string, roomCode: string) {
    const room = rooms.get(roomCode);
    if (!room) return;

    room.players.delete(playerId);
    playerRooms.delete(playerId);

    if (room.players.size === 0) {
      if (room.turnTimerInterval) {
        clearInterval(room.turnTimerInterval);
      }
      rooms.delete(roomCode);
      return;
    }

    // If host left, assign new host
    if (room.hostId === playerId) {
      const newHost = room.players.keys().next().value;
      if (newHost) {
        room.hostId = newHost;
        const newHostPlayer = room.players.get(newHost);
        if (newHostPlayer && room.status === 'waiting') {
          newHostPlayer.ready = true;
        }
      }
    }

    // If current turn player left
    if (room.currentTurnPlayerId === playerId && room.status === 'playing') {
      room.currentTurnPlayerId = getNextPlayer(room);
      startTurnTimer(room);
    }

    // Check if game should end
    if (room.status === 'playing') {
      const alivePlayers = Array.from(room.players.values()).filter(p => p.lives > 0);
      if (alivePlayers.length <= 1) {
        room.status = 'finished';
        if (room.turnTimerInterval) {
          clearInterval(room.turnTimerInterval);
          room.turnTimerInterval = null;
        }
        broadcastToRoom(room, {
          type: 'GAME_FINISHED',
          winner: alivePlayers[0] || null,
          room: getRoomState(room),
        });
        return;
      }
    }

    broadcastToRoom(room, {
      type: 'PLAYER_LEFT',
      playerId,
      newHostId: room.hostId,
      room: getRoomState(room),
    });
  }

  // Cleanup old rooms
  setInterval(() => {
    const now = Date.now();
    rooms.forEach((room, code) => {
      if (now - room.createdAt.getTime() > 2 * 60 * 60 * 1000) {
        if (room.turnTimerInterval) {
          clearInterval(room.turnTimerInterval);
        }
        room.players.forEach(player => {
          player.ws.send(JSON.stringify({ type: 'ROOM_EXPIRED' }));
          player.ws.close();
        });
        rooms.delete(code);
      }
    });
  }, 60000);
}
