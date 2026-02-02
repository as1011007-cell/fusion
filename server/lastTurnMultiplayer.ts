import { WebSocketServer, WebSocket } from 'ws';
import { Server, IncomingMessage } from 'http';
import { Duplex } from 'stream';

let wssLastTurn: WebSocketServer;

export function getLastTurnWSS(): WebSocketServer {
  return wssLastTurn;
}

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

interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  message: string;
  timestamp: number;
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
  truthAnswerTimer: number; // seconds to type answer in truth mode
  awaitingTruthAnswer: boolean; // waiting for player to type answer
  lastTruthAnswer: { playerId: string; playerName: string; answer: string } | null;
  maxPlayers: number;
  turnOrder: string[];
  currentTurnIndex: number;
  forcedPlayerId: string | null;
  lastCrashPlayerId: string | null;
  truthQuestions: string[];
  currentTruthQuestion: string | null;
  turnTimerInterval: NodeJS.Timeout | null;
  truthAnswerTimerInterval: NodeJS.Timeout | null;
  chatMessages: ChatMessage[];
  createdAt: Date;
}

const rooms = new Map<string, LastTurnRoom>();
const playerRooms = new Map<string, string>();

const TRUTH_QUESTIONS = [
  "What's the most embarrassing song on your playlist?",
  "What's your most irrational fear that you've never told anyone?",
  "What's the weirdest thing you've done when you were home alone?",
  "What's the most childish thing you still do?",
  "What's a lie you've told that you still feel guilty about?",
  "What's the most embarrassing thing you've googled?",
  "What's the worst outfit you've worn thinking you looked good?",
  "What's the pettiest reason you've stopped talking to someone?",
  "What's the most embarrassing autocorrect fail you've sent?",
  "What's something you pretend to understand but actually don't?",
  "What's the dumbest thing you've cried over?",
  "What's your most embarrassing nickname and how did you get it?",
  "What's the longest you've gone without showering?",
  "What's the weirdest food combination you secretly enjoy?",
  "What's the most ridiculous thing you've done to impress someone?",
  "What's the most embarrassing thing your parents have caught you doing?",
  "What's a secret skill you have that nobody knows about?",
  "What's the worst date you've ever been on?",
  "What's the most embarrassing thing in your search history right now?",
  "What's the cringiest thing you've posted on social media?",
  "What's the weirdest dream you've ever had?",
  "What's the most embarrassing thing you've said to a crush?",
  "What's the longest grudge you've held and why?",
  "What's the laziest thing you've ever done?",
  "What's something you've done that you'd judge someone else for?",
  "What's the most money you've wasted on something stupid?",
  "What's the most embarrassing song you know all the words to?",
  "What's a weird habit you have that you hope nobody notices?",
  "What's the most embarrassing voicemail you've left?",
  "What's the biggest lie you've told on a resume or dating app?",
  "What's the most childish thing you've argued about?",
  "What's something you've blamed on someone else but was actually your fault?",
  "What's the most embarrassing thing you've done in public?",
  "What's the worst gift you've ever received and had to pretend to like?",
  "What's something you do when no one is watching?",
  "What's the most embarrassing thing in your camera roll right now?",
  "What's your guilty pleasure TV show that you're ashamed to admit?",
  "What's the pettiest thing you've done to get revenge?",
  "What's the most ridiculous excuse you've used to get out of something?",
  "What's the most embarrassing way you've tried to get someone's attention?",
  "What's the worst haircut you've ever had?",
  "What's something you're too embarrassed to ask for help with?",
  "What's the most cringe pickup line you've ever used or fallen for?",
  "What's the most embarrassing thing you've done at work or school?",
  "What's something you've stalked someone's profile for way too long?",
  "What's the most embarrassing ringtone you've ever had?",
  "What's the weirdest compliment you've ever received?",
  "What's the most desperate thing you've done when hungry?",
  "What's the worst advice you've ever given?",
  "What's something you pretend not to like but secretly love?",
  "What's the most embarrassing thing you've done drunk or tired?",
  "What's the funniest thing you've accidentally said out loud?",
  "What's the most embarrassing misunderstanding you've had?",
  "What's the silliest thing you're competitive about?",
  "What's the most embarrassing thing saved in your notes app?",
  "What's something you've done to avoid someone you know in public?",
  "What's the most awkward thing you've overheard about yourself?",
  "What's the most embarrassing thing you believed as a kid?",
  "What's the worst fashion trend you followed?",
  "What's something embarrassing you've done to save money?",
  "What's the most cringe thing you've done to seem cool?",
  "What's a question you've always wanted to ask but were too afraid to?",
  "What's the most embarrassing thing you've accidentally liked on social media?",
  "What's the weirdest thing you've collected?",
  "What's the most embarrassing song you've been caught singing?",
  "What's the longest you've binged a show and what show was it?",
  "What's the most awkward text you've sent to the wrong person?",
  "What's something you've pretended to know about to fit in?",
  "What's the most embarrassing photo you still have?",
  "What's the strangest thing you've eaten when nothing else was available?",
  "What's the most embarrassing thing that's happened during a video call?",
  "What's a secret snack combo you love but would never admit?",
  "What's the most embarrassing thing you've done in front of your crush?",
  "What's something you've hidden from your family that you can share now?",
  "What's the most ridiculous thing you've spent hours doing?",
  "What's your most embarrassing habit?",
  "What's the weirdest thing you find attractive?",
  "What's the most embarrassing thing you've done for attention?",
  "What's a movie that made you cry that you're embarrassed about?",
  "What's the most awkward conversation you've ever had?",
  "What's something you thought was cool as a teenager that's cringe now?",
  "What's the most embarrassing thing you've said to someone important?",
  "What's a fear you have that you know is completely irrational?",
  "What's the most embarrassing purchase in your bank statement?",
  "What's the worst thing you've done to avoid exercising?",
  "What's something you've done that you wish you could unsend?",
  "What's the most embarrassing typo you've ever made?",
  "What's the weirdest thing you've done to procrastinate?",
  "What's the most awkward hug or handshake you've experienced?",
  "What's something you've practiced in the mirror?",
  "What's the most embarrassing thing on your bucket list?",
  "What's the dumbest injury you've ever gotten?",
  "What's something you've done to fit in that totally backfired?",
  "What's the most embarrassing thing you've worn by accident?",
  "What's a conspiracy theory you secretly believe?",
  "What's the most embarrassing thing you've asked Siri or Alexa?",
  "What's the longest you've gone pretending to understand something?",
  "What's the most dramatic thing you've done over something small?",
  "What's something weird that gives you the ick?",
  "What's the most embarrassing thing you've said thinking no one could hear?",
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
    truthAnswerTimer: room.truthAnswerTimer,
    awaitingTruthAnswer: room.awaitingTruthAnswer,
    lastTruthAnswer: room.lastTruthAnswer,
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
  room.awaitingTruthAnswer = false;
  room.lastTruthAnswer = null;
  
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
  
  // In truth mode, send a question to the current player
  if (room.gameMode === 'truth' && nextPlayer) {
    sendTruthQuestion(room, nextPlayer);
  } else {
    // Start turn timer for non-truth modes
    startTurnTimer(room);
  }
}

function sendTruthQuestion(room: LastTurnRoom, playerId: string) {
  // Pick a random question and remove it from the list (no repeats)
  if (room.truthQuestions.length === 0) {
    room.truthQuestions = shuffleArray([...TRUTH_QUESTIONS]);
  }
  
  const question = room.truthQuestions.pop() || TRUTH_QUESTIONS[0];
  room.currentTruthQuestion = question;
  room.awaitingTruthAnswer = true;
  room.truthAnswerTimer = 45; // 45 seconds to type answer
  
  const player = room.players.get(playerId);
  
  // Broadcast question to all players
  broadcastToRoom(room, {
    type: 'TRUTH_QUESTION',
    question,
    playerId,
    playerName: player?.name || 'Player',
    room: getRoomState(room),
  });
  
  // Start truth answer timer
  startTruthAnswerTimer(room);
}

function startTruthAnswerTimer(room: LastTurnRoom) {
  if (room.truthAnswerTimerInterval) {
    clearInterval(room.truthAnswerTimerInterval);
  }
  
  room.truthAnswerTimerInterval = setInterval(() => {
    room.truthAnswerTimer--;
    
    // Broadcast timer update every 5 seconds
    if (room.truthAnswerTimer % 5 === 0 || room.truthAnswerTimer <= 10) {
      broadcastToRoom(room, {
        type: 'TRUTH_TIMER_UPDATE',
        timer: room.truthAnswerTimer,
        room: getRoomState(room),
      });
    }
    
    if (room.truthAnswerTimer <= 0) {
      // Time's up - player didn't answer, they must pull
      if (room.truthAnswerTimerInterval) {
        clearInterval(room.truthAnswerTimerInterval);
        room.truthAnswerTimerInterval = null;
      }
      
      room.awaitingTruthAnswer = false;
      
      // Player refused to answer - broadcast this
      const player = room.players.get(room.currentTurnPlayerId || '');
      broadcastToRoom(room, {
        type: 'TRUTH_SKIPPED',
        playerId: room.currentTurnPlayerId,
        playerName: player?.name || 'Player',
        room: getRoomState(room),
      });
      
      // Now they must pull - start regular turn timer
      room.turnTimer = 15; // Less time since they skipped the question
      startTurnTimer(room);
    }
  }, 1000);
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
  wssLastTurn = new WebSocketServer({ noServer: true });

  console.log('Last Turn WebSocket server initialized');

  const pingInterval = setInterval(() => {
    wssLastTurn.clients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping();
      }
    });
  }, 25000);

  wssLastTurn.on('close', () => {
    clearInterval(pingInterval);
  });

  wssLastTurn.on('connection', (ws: WebSocket) => {
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
              truthAnswerTimer: 45,
              awaitingTruthAnswer: false,
              lastTruthAnswer: null,
              maxPlayers: 6,
              turnOrder: [],
              currentTurnIndex: -1,
              forcedPlayerId: null,
              lastCrashPlayerId: null,
              truthQuestions: shuffleArray([...TRUTH_QUESTIONS]),
              currentTruthQuestion: null,
              turnTimerInterval: null,
              truthAnswerTimerInterval: null,
              chatMessages: [],
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
            if (!room.awaitingTruthAnswer) return;

            // Stop the truth answer timer
            if (room.truthAnswerTimerInterval) {
              clearInterval(room.truthAnswerTimerInterval);
              room.truthAnswerTimerInterval = null;
            }

            const player = room.players.get(playerId);
            const answer = (message.answer || '').slice(0, 500); // Limit answer length

            room.awaitingTruthAnswer = false;
            room.currentTruthQuestion = null;
            room.lastTruthAnswer = {
              playerId,
              playerName: player?.name || 'Player',
              answer,
            };

            // Broadcast the answer to all players
            broadcastToRoom(room, {
              type: 'TRUTH_ANSWERED',
              playerId,
              playerName: player?.name || 'Player',
              answer,
              room: getRoomState(room),
            });

            // After answering truth, player skips their pull (answered honestly)
            // Move to next player
            setTimeout(() => {
              if (room.status === 'playing') {
                room.forcedPlayerId = null;
                room.currentTurnPlayerId = getNextPlayer(room);
                room.turnTimer = 30;
                
                // Check if all slots revealed
                if (room.revealedSlots.length >= 5) {
                  startNewRound(room);
                } else {
                  // Send next question to next player
                  if (room.currentTurnPlayerId) {
                    sendTruthQuestion(room, room.currentTurnPlayerId);
                  }
                }
              }
            }, 3000); // 3 second delay to show the answer
            break;
          }

          case 'LEAVE_ROOM': {
            if (!currentRoomCode || !playerId) return;
            handlePlayerLeave(playerId, currentRoomCode);
            currentRoomCode = null;
            playerId = null;
            break;
          }

          case 'CHAT_MESSAGE': {
            if (!currentRoomCode || !playerId) return;
            const room = rooms.get(currentRoomCode);
            if (!room || room.status !== 'waiting') return;
            
            // Silent mode - no chat allowed
            if (room.gameMode === 'silent') return;

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
            if (room.chatMessages.length > 50) {
              room.chatMessages = room.chatMessages.slice(-50);
            }

            broadcastToRoom(room, {
              type: 'CHAT_MESSAGE',
              message: chatMsg,
            });
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
