import 'dotenv/config.js';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { handleAttack, handleBlock, handleHeal, handleCurse, handleStartGame } from './game-logic/battleController.js';
import { skillBattleSystem } from './game-logic/skills/index.js';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { id: 'asc' }
    });
    console.log('Users returned from DB:', users.map(u => `ID: ${u.id}, Name: ${u.name}`));
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/battle/attack', handleAttack);
app.post('/battle/block', handleBlock);
app.post('/battle/heal', handleHeal);
app.post('/battle/curse', handleCurse);
app.post('/game/start', handleStartGame);

// Game rooms storage
const gameRooms = new Map();
const waitingPlayers = [];
const selectedCharacters = new Set(); // Track which characters are taken

// Socket connection handling
io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);

  // Send available characters when client connects
  socket.emit('availableCharacters', {
    characters: ['Shay Shay', 'Charlotte'],
    taken: Array.from(selectedCharacters)
  });

  socket.on('selectCharacter', (characterData) => {
    const { character } = characterData;
    console.log('Player selecting character:', character);

    // Check if character is available
    if (selectedCharacters.has(character)) {
      socket.emit('characterTaken', { character });
      return;
    }

    // Add character to selected set
    selectedCharacters.add(character);
    
    // Notify all clients about character selection
    io.emit('characterSelected', { character, socketId: socket.id });

    if (waitingPlayers.length === 0) {
      // First player waiting
      waitingPlayers.push({
        socketId: socket.id,
        socket: socket,
        name: character,
        character: character,
        hp: 100,
        mp: 15,
        maxHp: 100,
        maxMp: 15
      });
      socket.emit('waitingForMatch');
    } else {
      // Second player found, create game room
      const player1 = waitingPlayers.pop();
      const player2 = {
        socketId: socket.id,
        socket: socket,
        name: character,
        character: character,
        hp: 100,
        mp: 15,
        maxHp: 100,
        maxMp: 15
      };

      const roomId = `room_${Date.now()}`;
      gameRooms.set(roomId, {
        player1,
        player2,
        currentTurn: 'player1',
        gameState: 'active'
      });

      // Join both players to the room
      player1.socket.join(roomId);
      player2.socket.join(roomId);

      // Notify both players game started
      const gameData = {
        roomId,
        opponent: { name: player2.name, hp: player2.hp, mp: player2.mp, maxHp: player2.maxHp, maxMp: player2.maxMp },
        player: { name: player1.name, hp: player1.hp, mp: player1.mp, maxHp: player1.maxHp, maxMp: player1.maxMp },
        currentTurn: 'player1',
        isYourTurn: true
      };

      const gameData2 = {
        roomId,
        opponent: { name: player1.name, hp: player1.hp, mp: player1.mp, maxHp: player1.maxHp, maxMp: player1.maxMp },
        player: { name: player2.name, hp: player2.hp, mp: player2.mp, maxHp: player2.maxHp, maxMp: player2.maxMp },
        currentTurn: 'player1',
        isYourTurn: false
      };

      player1.socket.emit('gameFound', gameData);
      player2.socket.emit('gameFound', gameData2);
    }
  });

  socket.on('playerAction', async (actionData) => {
    const { roomId, action, value } = actionData;
    const room = gameRooms.get(roomId);
    
    if (!room || room.gameState !== 'active') return;

    const isPlayer1 = room.player1.socketId === socket.id;
    const currentPlayer = isPlayer1 ? room.player1 : room.player2;
    const opponent = isPlayer1 ? room.player2 : room.player1;

    // Verify it's this player's turn
    if ((room.currentTurn === 'player1' && !isPlayer1) || 
        (room.currentTurn === 'player2' && isPlayer1)) {
      socket.emit('error', { message: 'Not your turn!' });
      return;
    }

    // Process the action
    let actionResult = await processGameAction(currentPlayer, opponent, action, value);
    
    // Check win condition
    if (opponent.hp <= 0) {
      room.gameState = 'ended';
      actionResult.gameEnded = true;
      actionResult.winner = currentPlayer.name;
    }

    // Switch turns
    room.currentTurn = room.currentTurn === 'player1' ? 'player2' : 'player1';

    // Send updates to both players
    const updateData1 = {
      player: { name: room.player1.name, hp: room.player1.hp, mp: room.player1.mp, maxHp: room.player1.maxHp, maxMp: room.player1.maxMp },
      opponent: { name: room.player2.name, hp: room.player2.hp, mp: room.player2.mp, maxHp: room.player2.maxHp, maxMp: room.player2.maxMp },
      currentTurn: room.currentTurn,
      isYourTurn: room.currentTurn === 'player1',
      lastAction: actionResult,
      gameState: room.gameState
    };

    const updateData2 = {
      player: { name: room.player2.name, hp: room.player2.hp, mp: room.player2.mp, maxHp: room.player2.maxHp, maxMp: room.player2.maxMp },
      opponent: { name: room.player1.name, hp: room.player1.hp, mp: room.player1.mp, maxHp: room.player1.maxHp, maxMp: room.player1.maxMp },
      currentTurn: room.currentTurn,
      isYourTurn: room.currentTurn === 'player2',
      lastAction: actionResult,
      gameState: room.gameState
    };

    room.player1.socket.emit('gameUpdate', updateData1);
    room.player2.socket.emit('gameUpdate', updateData2);
  });

  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);
    
    // Remove from waiting players and free up their character
    const waitingIndex = waitingPlayers.findIndex(p => p.socketId === socket.id);
    if (waitingIndex !== -1) {
      const waitingPlayer = waitingPlayers[waitingIndex];
      selectedCharacters.delete(waitingPlayer.character);
      waitingPlayers.splice(waitingIndex, 1);
      
      // Notify all clients that character is available again
      io.emit('characterFreed', { character: waitingPlayer.character });
    }

    // Handle disconnection from active games
    for (const [roomId, room] of gameRooms.entries()) {
      if (room.player1.socketId === socket.id || room.player2.socketId === socket.id) {
        const disconnectedPlayer = room.player1.socketId === socket.id ? room.player1 : room.player2;
        const otherPlayer = room.player1.socketId === socket.id ? room.player2 : room.player1;
        
        // Free up the disconnected player's character
        selectedCharacters.delete(disconnectedPlayer.character);
        selectedCharacters.delete(otherPlayer.character);
        
        otherPlayer.socket.emit('opponentDisconnected');
        gameRooms.delete(roomId);
        
        // Notify all clients that both characters are available again
        io.emit('characterFreed', { character: disconnectedPlayer.character });
        io.emit('characterFreed', { character: otherPlayer.character });
        break;
      }
    }
  });
});

async function processGameAction(currentPlayer, opponent, action, value) {
  return await skillBattleSystem.processGameAction(currentPlayer, opponent, action, value);
}

server.listen(4000, () => console.log('Zodiax backend running on port 4000 with Socket.IO'));
