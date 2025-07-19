import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Turn system state
let currentTurn = 'player'; // 'player' or 'enemy'
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
  
  let log = '';
  switch (action) {
    case 'attack': {
      const damage = getRandom(1, 49);
      enemy.currentHp -= damage;
      log = `Player attacked enemy for ${damage} damage`;
      break;
    }
    case 'block': {
      const blockPercent = getRandom(20, 40);
      log = `Player is blocking, reducing incoming damage by ${blockPercent}%`;
      break;
    }
    case 'heal': {
      if (player.currentMp < 5) {
        log = 'Not enough MP to heal';
        break;
      }
      player.currentMp -= 5;
      const healPercent = getRandom(20, 40);
      const healAmount = Math.floor(player.maxHp * (healPercent / 100));
      player.currentHp = Math.min(player.maxHp, player.currentHp + healAmount);
      log = `Player healed for ${healAmount} HP`;
      break;
    }
    case 'charge': {
      const chargeAmount = getRandom(3, 5);
      player.currentMp = Math.min(player.maxMp, player.currentMp + chargeAmount);
      log = `Player charged ${chargeAmount} MP`;
      break;
    }
    case 'curse': {
      if (player.currentMp < 7) {
        log = 'Not enough MP to curse';
        break;
      }
      player.currentMp -= 7;
      const curseDamagePercent = getRandom(60, 80);
      const curseDamage = Math.floor(enemy.maxHp * (curseDamagePercent / 100));
      enemy.currentHp -= curseDamage;
      log = `Player cursed enemy for ${curseDamage} damage`;
      break;
    }
    default:
      log = 'Unknown action';
  }
  
  console.log(`After ${action}: Player HP=${player.currentHp}, Enemy HP=${enemy.currentHp}`);
  
  // Update player in the database
  await prisma.user.update({ where: { id: playerId }, data: { currentHp: player.currentHp, currentMp: player.currentMp } });
  
  // Only update enemy if it was actually modified (attacked or cursed)
  if (action === 'attack' || action === 'curse') {
    await prisma.user.update({ where: { id: enemyId }, data: { currentHp: enemy.currentHp } });
  }
  
  // Check win conditions (only for actions that damage enemy)
  if ((action === 'attack' || action === 'curse') && enemy.currentHp <= 0) {
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
      currentMp: 10,
      maxMp: 10
    }
  });
  
  // Reset game state
  currentTurn = 'player';
  gameState = 'active';
  
  return 'Game started! All players HP and MP reset to maximum.';
}