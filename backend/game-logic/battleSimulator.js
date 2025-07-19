import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

function getRandom(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function performAction(playerId, enemyId, action) {
  const player = await prisma.user.findUnique({ where: { id: playerId } });
  const enemy = await prisma.user.findUnique({ where: { id: enemyId } });
  if (!player || !enemy) {
    throw new Error('Player or enemy not found');
  }
  
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
  
  // Update player and enemy in the database
  await prisma.user.update({ where: { id: playerId }, data: { currentHp: player.currentHp, currentMp: player.currentMp } });
  await prisma.user.update({ where: { id: enemyId }, data: { currentHp: enemy.currentHp } });
  
  return log;
}

export async function resetAllPlayersStats() {
  await prisma.user.updateMany({
    data: {
      currentHp: 100,
      currentMp: 10
    }
  });
  
  return 'Game started! All players HP and MP reset to maximum.';
}