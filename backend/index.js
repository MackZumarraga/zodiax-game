import 'dotenv/config.js';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { handleAttack, handleBlock, handleHeal, handleCurse, handleStartGame } from './game-logic/battleController.js';

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

// Socket connection handling
io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);

  socket.on('findMatch', (playerData) => {
    console.log('Player looking for match:', playerData.name);
    
    if (waitingPlayers.length === 0) {
      // First player waiting
      waitingPlayers.push({
        socketId: socket.id,
        socket: socket,
        name: playerData.name,
        hp: 100,
        mp: 10,
        maxHp: 100,
        maxMp: 10
      });
      socket.emit('waitingForMatch');
    } else {
      // Second player found, create game room
      const player1 = waitingPlayers.pop();
      const player2 = {
        socketId: socket.id,
        socket: socket,
        name: playerData.name,
        hp: 100,
        mp: 10,
        maxHp: 100,
        maxMp: 10
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

  socket.on('playerAction', (actionData) => {
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
    let actionResult = processGameAction(currentPlayer, opponent, action, value);
    
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
    
    // Remove from waiting players
    const waitingIndex = waitingPlayers.findIndex(p => p.socketId === socket.id);
    if (waitingIndex !== -1) {
      waitingPlayers.splice(waitingIndex, 1);
    }

    // Handle disconnection from active games
    for (const [roomId, room] of gameRooms.entries()) {
      if (room.player1.socketId === socket.id || room.player2.socketId === socket.id) {
        const otherPlayer = room.player1.socketId === socket.id ? room.player2 : room.player1;
        otherPlayer.socket.emit('opponentDisconnected');
        gameRooms.delete(roomId);
        break;
      }
    }
  });
});

function processGameAction(currentPlayer, opponent, action, value) {
  const result = { action, success: false, message: '', damage: 0, healing: 0 };

  switch (action) {
    case 'attack':
      const damage = Math.floor(Math.random() * 49) + 1;
      opponent.hp = Math.max(0, opponent.hp - damage);
      result.success = true;
      result.damage = damage;
      result.message = `${currentPlayer.name} attacks for ${damage} damage!`;
      break;

    case 'heal':
      if (currentPlayer.mp < 5) {
        result.message = 'Not enough MP to heal!';
        return result;
      }
      const healing = Math.floor(Math.random() * (currentPlayer.maxHp * 0.2)) + Math.floor(currentPlayer.maxHp * 0.2);
      currentPlayer.mp -= 5;
      currentPlayer.hp = Math.min(currentPlayer.maxHp, currentPlayer.hp + healing);
      result.success = true;
      result.healing = healing;
      result.message = `${currentPlayer.name} heals for ${healing} HP!`;
      break;

    case 'curse':
      if (currentPlayer.mp < 7) {
        result.message = 'Not enough MP to curse!';
        return result;
      }
      const curseDamage = Math.floor(Math.random() * (opponent.maxHp * 0.2)) + Math.floor(opponent.maxHp * 0.6);
      currentPlayer.mp -= 7;
      opponent.hp = Math.max(0, opponent.hp - curseDamage);
      result.success = true;
      result.damage = curseDamage;
      result.message = `${currentPlayer.name} curses ${opponent.name} for ${curseDamage} damage!`;
      break;

    case 'block':
      result.success = true;
      result.message = `${currentPlayer.name} blocks and prepares for defense!`;
      break;

    case 'charge':
      const mpGain = Math.floor(Math.random() * 3) + 3;
      currentPlayer.mp = Math.min(currentPlayer.maxMp, currentPlayer.mp + mpGain);
      result.success = true;
      result.message = `${currentPlayer.name} charges and gains ${mpGain} MP!`;
      break;
  }

  return result;
}

server.listen(4000, () => console.log('Zodiax backend running on port 4000 with Socket.IO'));
