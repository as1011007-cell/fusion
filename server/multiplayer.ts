import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

interface Player {
  id: string;
  name: string;
  avatarId: string;
  score: number;
  ws: WebSocket;
  ready: boolean;
}

interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  message: string;
  timestamp: number;
}

interface GameRoom {
  id: string;
  code: string;
  hostId: string;
  players: Map<string, Player>;
  status: 'waiting' | 'playing' | 'finished';
  currentQuestion: number;
  questions: any[];
  currentPanel: string;
  selectedPanelId: string;
  selectedPanelName: string;
  roundAnswers: Map<string, { answer: string; timestamp: number }>;
  maxPlayers: number;
  createdAt: Date;
  chatMessages: ChatMessage[];
}

const rooms = new Map<string, GameRoom>();
const playerRooms = new Map<string, string>();

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function generatePlayerId(): string {
  return 'player_' + Math.random().toString(36).substring(2, 11);
}

function broadcastToRoom(room: GameRoom, message: any, excludePlayerId?: string) {
  room.players.forEach((player, playerId) => {
    if (playerId !== excludePlayerId && player.ws.readyState === WebSocket.OPEN) {
      player.ws.send(JSON.stringify(message));
    }
  });
}

function getRoomState(room: GameRoom) {
  return {
    id: room.id,
    code: room.code,
    hostId: room.hostId,
    status: room.status,
    currentQuestion: room.currentQuestion,
    currentPanel: room.currentPanel,
    selectedPanelId: room.selectedPanelId,
    selectedPanelName: room.selectedPanelName,
    maxPlayers: room.maxPlayers,
    players: Array.from(room.players.values()).map(p => ({
      id: p.id,
      name: p.name,
      avatarId: p.avatarId,
      score: p.score,
      ready: p.ready,
    })),
  };
}

export function setupMultiplayer(server: Server) {
  const wss = new WebSocketServer({ server, path: '/ws/multiplayer' });

  console.log('WebSocket server initialized for multiplayer');

  wss.on('connection', (ws: WebSocket) => {
    let playerId: string | null = null;
    let currentRoomCode: string | null = null;

    ws.on('message', (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        
        switch (message.type) {
          case 'CREATE_ROOM': {
            playerId = generatePlayerId();
            const roomCode = generateRoomCode();
            const roomId = 'room_' + Date.now();
            
            const room: GameRoom = {
              id: roomId,
              code: roomCode,
              hostId: playerId,
              players: new Map(),
              status: 'waiting',
              currentQuestion: 0,
              questions: [],
              currentPanel: '',
              selectedPanelId: 'mixed',
              selectedPanelName: 'Mixed',
              roundAnswers: new Map(),
              maxPlayers: message.maxPlayers || 8,
              createdAt: new Date(),
              chatMessages: [],
            };

            const player: Player = {
              id: playerId,
              name: message.playerName || 'Player',
              avatarId: message.avatarId || 'avatar-1',
              score: 0,
              ws,
              ready: true,
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
              ws.send(JSON.stringify({ type: 'ERROR', message: 'Room is full' }));
              return;
            }

            playerId = generatePlayerId();
            const player: Player = {
              id: playerId,
              name: message.playerName || 'Player',
              avatarId: message.avatarId || 'avatar-1',
              score: 0,
              ws,
              ready: false,
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
              player: { id: playerId, name: player.name, avatarId: player.avatarId, score: 0, ready: false },
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

          case 'SELECT_PANEL': {
            if (!currentRoomCode || !playerId) return;
            const room = rooms.get(currentRoomCode);
            if (!room || room.hostId !== playerId) return;

            room.selectedPanelId = message.panelId || 'mixed';
            room.selectedPanelName = message.panelName || 'Mixed';

            broadcastToRoom(room, {
              type: 'PANEL_SELECTED',
              panelId: room.selectedPanelId,
              panelName: room.selectedPanelName,
              room: getRoomState(room),
            });
            break;
          }

          case 'START_GAME': {
            if (!currentRoomCode || !playerId) return;
            const room = rooms.get(currentRoomCode);
            if (!room || room.hostId !== playerId) return;

            const allReady = Array.from(room.players.values()).every(p => p.ready);
            if (!allReady || room.players.size < 2) {
              ws.send(JSON.stringify({ type: 'ERROR', message: 'All players must be ready' }));
              return;
            }

            room.status = 'playing';
            room.questions = message.questions || [];
            room.currentPanel = message.panel || 'Gen Z';
            room.currentQuestion = 0;

            broadcastToRoom(room, {
              type: 'GAME_STARTED',
              room: getRoomState(room),
              question: room.questions[0],
              panel: room.currentPanel,
            });
            break;
          }

          case 'SUBMIT_ANSWER': {
            if (!currentRoomCode || !playerId) return;
            const room = rooms.get(currentRoomCode);
            if (!room || room.status !== 'playing') return;

            room.roundAnswers.set(playerId, {
              answer: message.answer,
              timestamp: Date.now(),
            });

            broadcastToRoom(room, {
              type: 'PLAYER_ANSWERED',
              playerId,
              answeredCount: room.roundAnswers.size,
              totalPlayers: room.players.size,
            });

            if (room.roundAnswers.size === room.players.size) {
              const results = Array.from(room.roundAnswers.entries()).map(([pid, ans]) => {
                const player = room.players.get(pid);
                const isCorrect = ans.answer === message.correctAnswer;
                if (isCorrect && player) {
                  player.score += message.points || 100;
                }
                return {
                  playerId: pid,
                  playerName: player?.name,
                  answer: ans.answer,
                  isCorrect,
                  newScore: player?.score || 0,
                };
              });

              broadcastToRoom(room, {
                type: 'ROUND_RESULTS',
                results,
                correctAnswer: message.correctAnswer,
                room: getRoomState(room),
              });

              room.roundAnswers.clear();
            }
            break;
          }

          case 'NEXT_QUESTION': {
            if (!currentRoomCode || !playerId) return;
            const room = rooms.get(currentRoomCode);
            if (!room || room.status !== 'playing') return;

            const nextQuestionIndex = room.currentQuestion + 1;
            
            if (nextQuestionIndex >= room.questions.length) {
              room.status = 'finished';
              room.currentQuestion = nextQuestionIndex;
              
              const finalScores = Array.from(room.players.values())
                .map(p => ({ id: p.id, name: p.name, score: p.score, avatarId: p.avatarId }))
                .sort((a, b) => b.score - a.score);

              console.log('Game finished! Final scores:', finalScores);

              // Check for tie - if top 2+ players have same score, it's a draw
              const topScore = finalScores[0]?.score || 0;
              const playersWithTopScore = finalScores.filter(p => p.score === topScore);
              const isDraw = playersWithTopScore.length > 1;

              broadcastToRoom(room, {
                type: 'GAME_FINISHED',
                finalScores,
                winner: isDraw ? null : finalScores[0],
                isDraw,
                room: getRoomState(room),
              });
            } else {
              room.currentQuestion = nextQuestionIndex;
              room.roundAnswers.clear();
              
              broadcastToRoom(room, {
                type: 'NEW_QUESTION',
                questionIndex: room.currentQuestion,
                question: room.questions[room.currentQuestion],
              });
            }
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

            // Reset room state for a new game
            room.status = 'waiting';
            room.currentQuestion = 0;
            room.questions = [];
            room.roundAnswers.clear();
            room.chatMessages = [];
            
            // Reset all player scores and ready states (host stays ready)
            room.players.forEach((player, pid) => {
              player.score = 0;
              player.ready = pid === room.hostId;
            });

            broadcastToRoom(room, {
              type: 'ROOM_RESET',
              room: getRoomState(room),
            });
            break;
          }

          case 'CHAT_MESSAGE': {
            if (!currentRoomCode || !playerId) return;
            const room = rooms.get(currentRoomCode);
            if (!room || room.status !== 'waiting') return;

            const player = room.players.get(playerId);
            if (!player) return;

            const chatMsg: ChatMessage = {
              id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
              playerId,
              playerName: player.name,
              message: message.message?.slice(0, 200) || '',
              timestamp: Date.now(),
            };

            room.chatMessages.push(chatMsg);
            // Keep only the last 50 messages
            if (room.chatMessages.length > 50) {
              room.chatMessages = room.chatMessages.slice(-50);
            }

            broadcastToRoom(room, {
              type: 'CHAT_MESSAGE',
              message: chatMsg,
            });
            break;
          }
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      if (playerId && currentRoomCode) {
        handlePlayerLeave(playerId, currentRoomCode);
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  function handlePlayerLeave(playerId: string, roomCode: string) {
    const room = rooms.get(roomCode);
    if (!room) return;

    room.players.delete(playerId);
    playerRooms.delete(playerId);

    if (room.players.size === 0) {
      rooms.delete(roomCode);
      return;
    }

    // If host left, assign new host
    if (room.hostId === playerId) {
      const newHost = room.players.keys().next().value;
      if (newHost) {
        room.hostId = newHost;
        // Make new host ready if in waiting state
        const newHostPlayer = room.players.get(newHost);
        if (newHostPlayer && room.status === 'waiting') {
          newHostPlayer.ready = true;
        }
      }
    }

    // If game was finished and someone left, allow remaining players to play again
    // by keeping room in finished state but notifying all players of the change
    
    broadcastToRoom(room, {
      type: 'PLAYER_LEFT',
      playerId,
      newHostId: room.hostId,
      room: getRoomState(room),
    });
  }

  setInterval(() => {
    const now = Date.now();
    rooms.forEach((room, code) => {
      if (now - room.createdAt.getTime() > 2 * 60 * 60 * 1000) {
        room.players.forEach(player => {
          player.ws.send(JSON.stringify({ type: 'ROOM_EXPIRED' }));
          player.ws.close();
        });
        rooms.delete(code);
      }
    });
  }, 60000);
}
