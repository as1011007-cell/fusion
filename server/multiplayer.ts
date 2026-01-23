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

interface GameRoom {
  id: string;
  code: string;
  hostId: string;
  players: Map<string, Player>;
  status: 'waiting' | 'playing' | 'finished';
  currentQuestion: number;
  questions: any[];
  currentPanel: string;
  roundAnswers: Map<string, { answer: string; timestamp: number }>;
  maxPlayers: number;
  createdAt: Date;
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
              roundAnswers: new Map(),
              maxPlayers: message.maxPlayers || 8,
              createdAt: new Date(),
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

              broadcastToRoom(room, {
                type: 'GAME_FINISHED',
                finalScores,
                winner: finalScores[0],
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

    if (room.hostId === playerId) {
      const newHost = room.players.keys().next().value;
      if (newHost) {
        room.hostId = newHost;
      }
    }

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
