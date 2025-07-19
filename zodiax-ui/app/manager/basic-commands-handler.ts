export async function attackCommand(playerId: number, enemyId: number) {
  try {
    const res = await fetch('http://192.168.0.104:4000/battle/attack', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, enemyId })
    });
    return await res.json();
  } catch (error) {
    console.error('Error during attack:', error);
    throw error;
  }
}

export async function blockCommand(playerId: number, enemyId: number) {
  try {
    const res = await fetch('http://192.168.0.104:4000/battle/block', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, enemyId })
    });
    return await res.json();
  } catch (error) {
    console.error('Error during block:', error);
    throw error;
  }
}

export async function healCommand(playerId: number, enemyId: number) {
  try {
    const res = await fetch('http://192.168.0.104:4000/battle/heal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, enemyId })
    });
    return await res.json();
  } catch (error) {
    console.error('Error during heal:', error);
    throw error;
  }
}

export async function curseCommand(playerId: number, enemyId: number) {
  try {
    const res = await fetch('http://192.168.0.104:4000/battle/curse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, enemyId })
    });
    return await res.json();
  } catch (error) {
    console.error('Error during curse:', error);
    throw error;
  }
}

export async function startGameCommand() {
  try {
    const res = await fetch('http://192.168.0.104:4000/game/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return await res.json();
  } catch (error) {
    console.error('Error starting game:', error);
    throw error;
  }
}