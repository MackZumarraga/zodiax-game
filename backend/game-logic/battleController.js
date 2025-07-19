import { performAction, resetAllPlayersStats } from './battleSimulator.js';

export async function handleAttack(req, res) {
  try {
    const { playerId, enemyId } = req.body;
    const log = await performAction(playerId, enemyId, 'attack');
    res.json({ success: true, message: log });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function handleBlock(req, res) {
  try {
    const { playerId, enemyId } = req.body;
    const log = await performAction(playerId, enemyId, 'block');
    res.json({ success: true, message: log });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function handleHeal(req, res) {
  try {
    const { playerId, enemyId } = req.body;
    const log = await performAction(playerId, enemyId, 'heal');
    res.json({ success: true, message: log });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function handleCurse(req, res) {
  try {
    const { playerId, enemyId } = req.body;
    const log = await performAction(playerId, enemyId, 'curse');
    res.json({ success: true, message: log });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function handleStartGame(_req, res) {
  try {
    const log = await resetAllPlayersStats();
    res.json({ success: true, message: log });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}