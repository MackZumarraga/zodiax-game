import 'dotenv/config.js';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { handleAttack, handleBlock, handleHeal, handleCurse, handleStartGame } from './game-logic/battleController.js';

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany();
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

app.listen(4000, () => console.log('Zodiax backend running on port 4000'));
