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

interface TruthQuestion {
  question: string;
  choices: string[];
}

interface VotingState {
  playerId: string;
  playerName: string;
  selectedChoice: number;
  votes: Map<string, boolean>; // playerId -> accept (true) / reject (false)
  votingTimer: number;
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
  gameMode: 'classic' | 'countdown' | 'truth';
  turnTimer: number;
  truthAnswerTimer: number; // seconds to select answer in truth mode
  awaitingTruthAnswer: boolean; // waiting for player to select answer
  lastTruthAnswer: { playerId: string; playerName: string; answer: string } | null;
  maxPlayers: number;
  turnOrder: string[];
  currentTurnIndex: number;
  forcedPlayerId: string | null;
  lastCrashPlayerId: string | null;
  truthQuestions: TruthQuestion[];
  currentTruthQuestion: TruthQuestion | null;
  turnTimerInterval: NodeJS.Timeout | null;
  truthAnswerTimerInterval: NodeJS.Timeout | null;
  votingState: VotingState | null;
  votingTimerInterval: NodeJS.Timeout | null;
  chatMessages: ChatMessage[];
  createdAt: Date;
}

const rooms = new Map<string, LastTurnRoom>();
const playerRooms = new Map<string, string>();

const TRUTH_QUESTIONS: TruthQuestion[] = [
  { question: "What's the most embarrassing song on your playlist?", choices: ["Baby Shark on repeat", "Barbie Girl by Aqua", "My Heart Will Go On (I cry every time)", "The Macarena"] },
  { question: "What's the weirdest thing you've done when home alone?", choices: ["Had full conversations with my pets as if they answered", "Ate an entire cake and blamed it on nobody", "Practiced my Oscar acceptance speech", "Danced naked to 80s music"] },
  { question: "What's the most childish thing you still do?", choices: ["Sleep with a stuffed animal", "Eat cereal for dinner regularly", "Watch cartoons meant for toddlers", "Throw tantrums when I don't get my way"] },
  { question: "What's the most embarrassing thing you've googled?", choices: ["Is it illegal to marry myself", "How to tell if I'm a vampire", "Why does my belly button smell weird", "Am I a lizard person"] },
  { question: "What's the worst outfit you've worn thinking you looked good?", choices: ["Full denim head to toe", "Crocs with socks at a wedding", "A fedora with flame shirt combo", "Matching velour tracksuit in public"] },
  { question: "What's the pettiest reason you've stopped talking to someone?", choices: ["They chewed too loudly", "They didn't like my favorite movie", "They used the wrong 'your/you're'", "They took too long to text back once"] },
  { question: "What's something you pretend to understand but don't?", choices: ["How taxes actually work", "Cryptocurrency and blockchain", "What my job title actually means", "Why people like golf"] },
  { question: "What's the dumbest thing you've cried over?", choices: ["A commercial about dogs", "Running out of my favorite snack", "Losing a game on my phone", "A sunset that was too beautiful"] },
  { question: "What's the longest you've gone without showering?", choices: ["Three days (work from home life)", "A full week during a gaming binge", "I lost count honestly", "Two days but used a LOT of body spray"] },
  { question: "What's the weirdest food combination you secretly enjoy?", choices: ["Pickles dipped in peanut butter", "Pizza with ranch and hot sauce", "Ice cream on french fries", "Chips in my sandwich for crunch"] },
  { question: "What's the most ridiculous thing you've done to impress someone?", choices: ["Pretended to like hiking", "Faked knowing a foreign language", "Lied about reading a famous book", "Claimed I was related to a celebrity"] },
  { question: "What's the worst date you've ever been on?", choices: ["They brought their mom", "They talked about their ex the whole time", "They asked me to pay and then left", "They tried to sell me supplements"] },
  { question: "What's the most embarrassing thing you've said to a crush?", choices: ["I practiced this conversation in the mirror", "You smell different when you're awake", "I've already named our future kids", "I stalked all your social media"] },
  { question: "What's the laziest thing you've ever done?", choices: ["Ordered delivery from a restaurant next door", "Used a grabber stick to avoid getting up", "Wore dirty clothes inside out", "Called my roommate instead of walking to their room"] },
  { question: "What's the most money you've wasted on something stupid?", choices: ["In-game purchases I regret", "A gym membership I never used", "Clothes I've never worn with tags still on", "A gadget I used once"] },
  { question: "What's a weird habit you hope nobody notices?", choices: ["I smell my food before every bite", "I talk to myself constantly", "I count my steps to avoid certain numbers", "I make faces at myself in reflections"] },
  { question: "What's the biggest lie you've told on a dating app?", choices: ["Added several inches to my height", "Said I love hiking (I don't)", "Used photos from five years ago", "Listed a fake job title"] },
  { question: "What's something you've blamed on someone else?", choices: ["A fart that cleared the room", "Eating the last slice of pizza", "Breaking something expensive", "Forgetting an important event"] },
  { question: "What's the most embarrassing thing in your camera roll?", choices: ["Hundreds of failed selfies", "Screenshots of exes' profiles", "Pictures of my food diary", "Motivational quotes I made for myself"] },
  { question: "What's your guilty pleasure TV show?", choices: ["Reality dating shows", "Cheesy soap operas", "Kids' cartoons", "Infomercials at 3am"] },
  { question: "What's the pettiest thing you've done for revenge?", choices: ["Unfollowed them on everything", "Gave them slightly wrong directions", "Ate their labeled food in the fridge", "Left them on read for weeks"] },
  { question: "What's the worst excuse you've used to skip plans?", choices: ["My fish is sick", "I need to wash my hair", "My horoscope said to stay home", "I accidentally double-booked with myself"] },
  { question: "What's the most embarrassing way you've tried to get attention?", choices: ["Fake laughed really loud", "Posted thirst traps", "Started drama for no reason", "Pretended to be on an important call"] },
  { question: "What's the worst haircut you've ever had?", choices: ["Bowl cut in high school", "DIY bangs gone wrong", "Frosted tips era", "Accidentally went bald"] },
  { question: "What's the most cringe pickup line you've used?", choices: ["Are you a parking ticket? You've got fine written all over you", "Did it hurt when you fell from heaven?", "Are you a campfire? You're hot and I want s'more", "Is your dad a boxer? Because you're a knockout"] },
  { question: "What's the most embarrassing thing you've done at work?", choices: ["Called my boss 'mom' or 'dad'", "Sent a personal text to the wrong chat", "Fell asleep during a meeting", "Waved back at someone not waving at me"] },
  { question: "What's the longest you've stalked someone's profile?", choices: ["Went back years into their photos", "Made a fake account to follow them", "Checked their LinkedIn, Facebook, AND Instagram daily", "Found their family members' profiles too"] },
  { question: "What's the most desperate thing you've done when hungry?", choices: ["Ate stale cereal without milk", "Combined random condiments as a meal", "Eaten food that was questionably expired", "Drank cooking oil for calories"] },
  { question: "What's the worst advice you've ever given?", choices: ["Just be yourself (to someone clearly struggling)", "Send them a double text, it shows confidence", "Money doesn't matter, follow your dreams", "Ignore red flags, give them a chance"] },
  { question: "What's something you pretend not to like but secretly love?", choices: ["Pop music from the 2000s", "Gossip and drama", "Romantic comedies", "Taking naps like a toddler"] },
  { question: "What's the most embarrassing thing you've done tired?", choices: ["Put orange juice in my cereal", "Tried to unlock my door with my car keys", "Answered a banana as if it were my phone", "Forgot my own name momentarily"] },
  { question: "What's the silliest thing you're competitive about?", choices: ["Board games with family", "Who gets the better parking spot", "Who can eat faster", "Instagram likes compared to friends"] },
  { question: "What's the most embarrassing thing in your notes app?", choices: ["Poetry I wrote about my crush", "A list of people I'm annoyed with", "Affirmations I read to myself", "Revenge plans I'll never execute"] },
  { question: "What's the most dramatic thing you've done over something small?", choices: ["Cried because my food order was wrong", "Had an existential crisis over a parking ticket", "Declared I'm never eating there again", "Wrote a novel-length complaint review"] },
  { question: "What's something weird that gives you the ick?", choices: ["When people say 'yummy'", "Open-mouth chewing", "Running in jeans", "Calling their parents 'mommy' and 'daddy' as adults"] },
  { question: "What's your most irrational fear?", choices: ["Balloons popping near me", "Butterflies or moths touching me", "The dark under my bed", "Escalators"] },
  { question: "What's the longest grudge you've held?", choices: ["Still mad about a toy stolen in kindergarten", "Someone ate my clearly-labeled lunch 5 years ago", "Never forgave a friend for a comment from college", "Still remember someone who cut in line years ago"] },
  { question: "What's something you've done that you'd judge others for?", choices: ["Taken food from the office fridge", "Pretended not to see someone I know in public", "Returned used clothes to a store", "Ghosted someone who really liked me"] },
  { question: "What's the most embarrassing voicemail you've left?", choices: ["Rambled for way too long", "Called them the wrong name", "Accidentally confessed feelings", "Forgot who I was calling mid-message"] },
  { question: "What's the most childish argument you've had?", choices: ["Who got the bigger slice of pizza", "Whether a hotdog is a sandwich", "Who called shotgun first", "Who mom loves more"] },
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
  // Clear turn timer if running (we're switching to truth mode timer)
  if (room.turnTimerInterval) {
    clearInterval(room.turnTimerInterval);
    room.turnTimerInterval = null;
  }
  
  // Clear any existing voting state
  if (room.votingTimerInterval) {
    clearInterval(room.votingTimerInterval);
    room.votingTimerInterval = null;
  }
  room.votingState = null;
  
  // Pick a random question and remove it from the list (no repeats)
  if (room.truthQuestions.length === 0) {
    room.truthQuestions = shuffleArray([...TRUTH_QUESTIONS]);
  }
  
  const question = room.truthQuestions.pop() || TRUTH_QUESTIONS[0];
  room.currentTruthQuestion = question;
  room.awaitingTruthAnswer = true;
  room.truthAnswerTimer = 30; // 30 seconds to select an answer
  
  const player = room.players.get(playerId);
  
  // Broadcast question with choices to all players
  broadcastToRoom(room, {
    type: 'TRUTH_QUESTION',
    question: question.question,
    choices: question.choices,
    playerId,
    playerName: player?.name || 'Player',
    room: getRoomState(room),
  });
  
  // Start truth answer timer
  startTruthAnswerTimer(room);
}

function startTruthAnswerTimer(room: LastTurnRoom) {
  // Clear any existing timers to prevent conflicts
  if (room.truthAnswerTimerInterval) {
    clearInterval(room.truthAnswerTimerInterval);
    room.truthAnswerTimerInterval = null;
  }
  if (room.turnTimerInterval) {
    clearInterval(room.turnTimerInterval);
    room.turnTimerInterval = null;
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

function startVoting(room: LastTurnRoom, playerId: string, playerName: string, selectedChoice: number) {
  // Clear any existing timers
  if (room.truthAnswerTimerInterval) {
    clearInterval(room.truthAnswerTimerInterval);
    room.truthAnswerTimerInterval = null;
  }
  if (room.votingTimerInterval) {
    clearInterval(room.votingTimerInterval);
    room.votingTimerInterval = null;
  }
  
  // Create voting state
  room.votingState = {
    playerId,
    playerName,
    selectedChoice,
    votes: new Map(),
    votingTimer: 15, // 15 seconds to vote
  };
  
  const answerText = room.currentTruthQuestion?.choices[selectedChoice] || 'Unknown answer';
  
  // Check if there are any eligible voters (other alive players)
  const eligibleVoters = Array.from(room.players.keys()).filter(id => 
    id !== playerId && room.players.get(id)?.lives && room.players.get(id)!.lives > 0
  );
  
  // If no eligible voters (solo play or only player left), auto-accept the answer
  if (eligibleVoters.length === 0) {
    room.votingState = null;
    room.awaitingTruthAnswer = false;
    
    // Store last answer
    room.lastTruthAnswer = {
      playerId,
      playerName,
      answer: answerText,
    };
    
    // Broadcast auto-accepted result
    broadcastToRoom(room, {
      type: 'VOTING_RESULT',
      playerId,
      playerName,
      answerText,
      accepted: true,
      acceptCount: 0,
      rejectCount: 0,
      acceptedBy: [],
      rejectedBy: [],
      room: getRoomState(room),
    });
    
    // Move to next player after a short delay
    setTimeout(() => {
      if (room.status === 'playing') {
        room.forcedPlayerId = null;
        room.currentTruthQuestion = null;
        room.currentTurnPlayerId = getNextPlayer(room);
        room.turnTimer = 30;
        
        if (room.revealedSlots.length >= 5) {
          startNewRound(room);
        } else if (room.currentTurnPlayerId) {
          sendTruthQuestion(room, room.currentTurnPlayerId);
        }
      }
    }, 2000);
    return;
  }
  
  // Broadcast voting started to all players
  broadcastToRoom(room, {
    type: 'VOTING_STARTED',
    playerId,
    playerName,
    selectedChoice,
    answerText,
    votingTimer: 15,
    room: getRoomState(room),
  });
  
  // Start voting timer
  room.votingTimerInterval = setInterval(() => {
    if (!room.votingState) {
      if (room.votingTimerInterval) {
        clearInterval(room.votingTimerInterval);
        room.votingTimerInterval = null;
      }
      return;
    }
    
    room.votingState.votingTimer--;
    
    // Broadcast timer update
    if (room.votingState.votingTimer % 5 === 0 || room.votingState.votingTimer <= 5) {
      broadcastToRoom(room, {
        type: 'VOTING_TIMER_UPDATE',
        timer: room.votingState.votingTimer,
        room: getRoomState(room),
      });
    }
    
    if (room.votingState.votingTimer <= 0) {
      // Time's up - resolve voting
      if (room.votingTimerInterval) {
        clearInterval(room.votingTimerInterval);
        room.votingTimerInterval = null;
      }
      finishVoting(room);
    }
  }, 1000);
}

function handleVote(room: LastTurnRoom, voterId: string, accept: boolean) {
  if (!room.votingState) return;
  
  // Can't vote on your own answer
  if (voterId === room.votingState.playerId) return;
  
  room.votingState.votes.set(voterId, accept);
  
  const voter = room.players.get(voterId);
  
  // Broadcast vote received
  broadcastToRoom(room, {
    type: 'VOTE_RECEIVED',
    voterId,
    voterName: voter?.name || 'Player',
    accept,
    totalVotes: room.votingState.votes.size,
    room: getRoomState(room),
  });
  
  // Check if all other players have voted
  const eligibleVoters = Array.from(room.players.keys()).filter(id => 
    id !== room.votingState?.playerId && room.players.get(id)?.lives && room.players.get(id)!.lives > 0
  );
  
  if (room.votingState.votes.size >= eligibleVoters.length) {
    // All votes are in - resolve immediately
    if (room.votingTimerInterval) {
      clearInterval(room.votingTimerInterval);
      room.votingTimerInterval = null;
    }
    finishVoting(room);
  }
}

function finishVoting(room: LastTurnRoom) {
  if (!room.votingState) return;
  
  const votes = Array.from(room.votingState.votes.entries());
  const acceptCount = votes.filter(([_, v]) => v === true).length;
  const rejectCount = votes.filter(([_, v]) => v === false).length;
  
  // Collect voter names for display
  const acceptedBy: string[] = [];
  const rejectedBy: string[] = [];
  votes.forEach(([voterId, accepted]) => {
    const voter = room.players.get(voterId);
    const name = voter?.name || 'Player';
    if (accepted) {
      acceptedBy.push(name);
    } else {
      rejectedBy.push(name);
    }
  });
  
  // Majority rejects = player must pull, otherwise accepted
  const accepted = acceptCount >= rejectCount;
  
  const answeringPlayerId = room.votingState.playerId;
  const answeringPlayerName = room.votingState.playerName;
  const selectedChoice = room.votingState.selectedChoice;
  const answerText = room.currentTruthQuestion?.choices[selectedChoice] || 'Unknown answer';
  
  // Clear voting state
  room.votingState = null;
  room.awaitingTruthAnswer = false;
  
  // Store last answer
  room.lastTruthAnswer = {
    playerId: answeringPlayerId,
    playerName: answeringPlayerName,
    answer: answerText,
  };
  
  // Broadcast voting result with voter names
  broadcastToRoom(room, {
    type: 'VOTING_RESULT',
    playerId: answeringPlayerId,
    playerName: answeringPlayerName,
    answerText,
    accepted,
    acceptCount,
    rejectCount,
    acceptedBy,
    rejectedBy,
    room: getRoomState(room),
  });
  
  if (accepted) {
    // Answer was accepted - move to next player
    setTimeout(() => {
      if (room.status === 'playing') {
        room.forcedPlayerId = null;
        room.currentTruthQuestion = null;
        room.currentTurnPlayerId = getNextPlayer(room);
        room.turnTimer = 30;
        
        // Check if all slots revealed
        if (room.revealedSlots.length >= 5) {
          startNewRound(room);
        } else if (room.currentTurnPlayerId) {
          // Send next question to next player
          sendTruthQuestion(room, room.currentTurnPlayerId);
        }
      }
    }, 2000);
  } else {
    // Answer was rejected - player must pull the chamber
    setTimeout(() => {
      if (room.status === 'playing' && answeringPlayerId) {
        room.currentTruthQuestion = null;
        
        // Broadcast that player must pull
        broadcastToRoom(room, {
          type: 'MUST_PULL_AFTER_REJECT',
          playerId: answeringPlayerId,
          playerName: answeringPlayerName,
          room: getRoomState(room),
        });
        
        // Give them 10 seconds to pull, then auto-pull
        room.turnTimer = 10;
        startTurnTimer(room);
      }
    }, 2000);
  }
}

function startTurnTimer(room: LastTurnRoom) {
  // Clear any existing timers to prevent conflicts
  if (room.turnTimerInterval) {
    clearInterval(room.turnTimerInterval);
    room.turnTimerInterval = null;
  }
  if (room.truthAnswerTimerInterval) {
    clearInterval(room.truthAnswerTimerInterval);
    room.truthAnswerTimerInterval = null;
  }
  if (room.votingTimerInterval) {
    clearInterval(room.votingTimerInterval);
    room.votingTimerInterval = null;
  }
  
  // Clear truth mode state since we're starting a regular turn timer
  room.awaitingTruthAnswer = false;
  room.currentTruthQuestion = null;
  room.votingState = null;
  
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
  
  // Clear truth mode state when pulling (regardless of how we got here)
  if (room.truthAnswerTimerInterval) {
    clearInterval(room.truthAnswerTimerInterval);
    room.truthAnswerTimerInterval = null;
  }
  room.awaitingTruthAnswer = false;
  room.currentTruthQuestion = null;
  
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
      
      // Clear all timers
      if (room.turnTimerInterval) {
        clearInterval(room.turnTimerInterval);
        room.turnTimerInterval = null;
      }
      if (room.truthAnswerTimerInterval) {
        clearInterval(room.truthAnswerTimerInterval);
        room.truthAnswerTimerInterval = null;
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
    
    // If all slots except crash revealed, start new round
    if (room.revealedSlots.length >= 5) {
      setTimeout(() => {
        if (room.status === 'playing') {
          startNewRound(room);
        }
      }, 1000);
    } else if (room.gameMode === 'truth' && room.currentTurnPlayerId) {
      // In truth mode, send a question to the next player
      sendTruthQuestion(room, room.currentTurnPlayerId);
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
              votingState: null,
              votingTimerInterval: null,
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

            const validModes = ['classic', 'countdown', 'truth'];
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

            // Clear turn timer before pull
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

            // Clear any existing timers
            if (room.turnTimerInterval) {
              clearInterval(room.turnTimerInterval);
              room.turnTimerInterval = null;
            }
            if (room.truthAnswerTimerInterval) {
              clearInterval(room.truthAnswerTimerInterval);
              room.truthAnswerTimerInterval = null;
            }
            
            // Clear truth mode state
            room.awaitingTruthAnswer = false;
            room.currentTruthQuestion = null;

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

            // Start appropriate timer for next player
            if (room.gameMode === 'truth' && room.currentTurnPlayerId) {
              sendTruthQuestion(room, room.currentTurnPlayerId);
            } else {
              startTurnTimer(room);
            }
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

            // Clear any existing timers
            if (room.turnTimerInterval) {
              clearInterval(room.turnTimerInterval);
              room.turnTimerInterval = null;
            }
            if (room.truthAnswerTimerInterval) {
              clearInterval(room.truthAnswerTimerInterval);
              room.truthAnswerTimerInterval = null;
            }
            
            // Clear truth mode state - forced player must pull, no question
            room.awaitingTruthAnswer = false;
            room.currentTruthQuestion = null;

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
            const selectedChoice = typeof message.selectedChoice === 'number' ? message.selectedChoice : 0;

            // Start voting phase - other players vote to accept or reject
            startVoting(room, playerId, player?.name || 'Player', selectedChoice);
            break;
          }

          case 'VOTE_TRUTH': {
            if (!currentRoomCode || !playerId) return;
            const room = rooms.get(currentRoomCode);
            if (!room || room.status !== 'playing' || room.gameMode !== 'truth') return;
            if (!room.votingState) return;

            const accept = message.accept === true;
            handleVote(room, playerId, accept);
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
            
            // Clear truth mode state
            room.currentTruthQuestion = null;
            room.awaitingTruthAnswer = false;
            room.lastTruthAnswer = null;
            room.truthAnswerTimer = 45;
            room.truthQuestions = shuffleArray([...TRUTH_QUESTIONS]);
            
            // Clear all timers
            if (room.turnTimerInterval) {
              clearInterval(room.turnTimerInterval);
              room.turnTimerInterval = null;
            }
            if (room.truthAnswerTimerInterval) {
              clearInterval(room.truthAnswerTimerInterval);
              room.truthAnswerTimerInterval = null;
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
      // Clear all timers when room is empty
      if (room.turnTimerInterval) {
        clearInterval(room.turnTimerInterval);
        room.turnTimerInterval = null;
      }
      if (room.truthAnswerTimerInterval) {
        clearInterval(room.truthAnswerTimerInterval);
        room.truthAnswerTimerInterval = null;
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
      // Clear truth mode state
      if (room.truthAnswerTimerInterval) {
        clearInterval(room.truthAnswerTimerInterval);
        room.truthAnswerTimerInterval = null;
      }
      room.awaitingTruthAnswer = false;
      room.currentTruthQuestion = null;
      
      room.currentTurnPlayerId = getNextPlayer(room);
      
      // Start appropriate timer for next player
      if (room.gameMode === 'truth' && room.currentTurnPlayerId) {
        sendTruthQuestion(room, room.currentTurnPlayerId);
      } else {
        startTurnTimer(room);
      }
    }

    // Check if game should end
    if (room.status === 'playing') {
      const alivePlayers = Array.from(room.players.values()).filter(p => p.lives > 0);
      if (alivePlayers.length <= 1) {
        room.status = 'finished';
        // Clear all timers
        if (room.turnTimerInterval) {
          clearInterval(room.turnTimerInterval);
          room.turnTimerInterval = null;
        }
        if (room.truthAnswerTimerInterval) {
          clearInterval(room.truthAnswerTimerInterval);
          room.truthAnswerTimerInterval = null;
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
