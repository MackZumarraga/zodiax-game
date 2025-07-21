import { PrismaClient } from '@prisma/client';
import { skillBattleSystem } from './skills/index.js';
const prisma = new PrismaClient();

// Turn system state - randomized each battle
let currentTurn = Math.random() < 0.5 ? 'player' : 'enemy'; // Randomized starting turn
let gameState = 'waiting'; // 'waiting', 'active', 'ended'

function getRandom(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function performAction(playerId, enemyId, action) {
  // Check if it's player's turn
  if (currentTurn !== 'player' || gameState !== 'active') {
    throw new Error('Not your turn or game not active');
  }

  const player = await prisma.user.findUnique({ where: { id: playerId } });
  const enemy = await prisma.user.findUnique({ where: { id: enemyId } });
  if (!player || !enemy) {
    throw new Error('Player or enemy not found');
  }
  
  console.log(`Before ${action}: Player HP=${player.currentHp}, Enemy HP=${enemy.currentHp}`);
  
  // Create temporary player objects for the skill system
  const playerObj = {
    name: 'Player',
    hp: player.currentHp,
    mp: player.currentMp,
    maxHp: player.maxHp,
    maxMp: player.maxMp
  };
  
  const enemyObj = {
    name: 'Enemy',
    hp: enemy.currentHp,
    mp: enemy.currentMp || 15,
    maxHp: enemy.maxHp,
    maxMp: enemy.maxMp || 15
  };

  // Execute the action using the skill system
  const result = await skillBattleSystem.executeAction(playerObj, enemyObj, action);
  
  // Update the original objects with new values
  player.currentHp = playerObj.hp;
  player.currentMp = playerObj.mp;
  enemy.currentHp = enemyObj.hp;
  
  let log = result.message || 'Unknown action';
  
  console.log(`After ${action}: Player HP=${player.currentHp}, Enemy HP=${enemy.currentHp}`);
  
  // Update player in the database
  await prisma.user.update({ where: { id: playerId }, data: { currentHp: player.currentHp, currentMp: player.currentMp } });
  
  // Only update enemy if it was actually modified (attacked or cursed)
  if (action === 'attack' || action === 'curse') {
    await prisma.user.update({ where: { id: enemyId }, data: { currentHp: enemyObj.hp } });
  }
  
  // Check win conditions (only for actions that damage enemy)
  if ((action === 'attack' || action === 'curse') && enemyObj.hp <= 0) {
    gameState = 'ended';
    log += ' - Enemy defeated! You win!';
    return log;
  }
  
  // Switch to enemy turn
  currentTurn = 'enemy';
  
  // Process enemy AI turn immediately
  const aiLog = await processEnemyTurn(playerId, enemyId);
  
  return log + '\n' + aiLog;
}

// AI function that always attacks
async function processEnemyTurn(playerId, enemyId) {
  const player = await prisma.user.findUnique({ where: { id: playerId } });
  const enemy = await prisma.user.findUnique({ where: { id: enemyId } });
  
  const damage = getRandom(1, 49);
  player.currentHp -= damage;
  
  // Update player in database
  await prisma.user.update({ where: { id: playerId }, data: { currentHp: player.currentHp } });
  
  let log = `Enemy attacked you for ${damage} damage`;
  
  // Check if player died
  if (player.currentHp <= 0) {
    gameState = 'ended';
    log += ' - You have been defeated! Game over!';
    return log;
  }
  
  // Switch back to player turn
  currentTurn = 'player';
  
  return log;
}

export async function resetAllPlayersStats() {
  await prisma.user.updateMany({
    data: {
      currentHp: 100,
      maxHp: 100,
      currentMp: 15,
      maxMp: 15
    }
  });
  
  // Reset game state with random turn order
  currentTurn = Math.random() < 0.5 ? 'player' : 'enemy';
  gameState = 'active';
  
  return 'Game started! All players HP and MP reset to maximum.';
}