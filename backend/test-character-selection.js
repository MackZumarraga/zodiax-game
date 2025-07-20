import { io } from 'socket.io-client';

// Test the character selection system
async function testCharacterSelection() {
  console.log('Testing Character Selection System...\n');

  // Create two test clients
  const client1 = io('http://localhost:4000');
  const client2 = io('http://localhost:4000');

  return new Promise((resolve) => {
    let client1Connected = false;
    let client2Connected = false;
    let gameStarted = false;

    // Client 1 setup
    client1.on('connect', () => {
      console.log('Client 1 connected');
      client1Connected = true;
    });

    client1.on('availableCharacters', (data) => {
      console.log('Client 1 received available characters:', data);
      
      // Client 1 selects Shay Shay
      setTimeout(() => {
        console.log('Client 1 selecting Shay Shay...');
        client1.emit('selectCharacter', { character: 'Shay Shay' });
      }, 500);
    });

    client1.on('characterSelected', (data) => {
      console.log('Character selected event:', data);
    });

    client1.on('waitingForMatch', () => {
      console.log('Client 1 is waiting for match...');
    });

    client1.on('gameFound', (data) => {
      console.log('Client 1 game found:', {
        player: data.player.name,
        opponent: data.opponent.name,
        isYourTurn: data.isYourTurn
      });
      
      if (!gameStarted) {
        gameStarted = true;
        console.log('\n✅ Character selection system working!');
        console.log(`Player 1: ${data.player.name}`);
        console.log(`Player 2: ${data.opponent.name}`);
        
        // Clean up and resolve
        setTimeout(() => {
          client1.disconnect();
          client2.disconnect();
          resolve(true);
        }, 1000);
      }
    });

    // Client 2 setup
    client2.on('connect', () => {
      console.log('Client 2 connected');
      client2Connected = true;
    });

    client2.on('availableCharacters', (data) => {
      console.log('Client 2 received available characters:', data);
      
      // Client 2 selects Charlotte after a delay
      setTimeout(() => {
        console.log('Client 2 selecting Charlotte...');
        client2.emit('selectCharacter', { character: 'Charlotte' });
      }, 1500);
    });

    client2.on('gameFound', (data) => {
      console.log('Client 2 game found:', {
        player: data.player.name,
        opponent: data.opponent.name,
        isYourTurn: data.isYourTurn
      });
    });

    client2.on('characterTaken', (data) => {
      console.log('Client 2 got character taken:', data);
    });

    // Error handling
    client1.on('error', (error) => console.error('Client 1 error:', error));
    client2.on('error', (error) => console.error('Client 2 error:', error));

    // Timeout to prevent hanging
    setTimeout(() => {
      console.log('Test timeout - cleaning up...');
      client1.disconnect();
      client2.disconnect();
      resolve(false);
    }, 10000);
  });
}

// Run the test
testCharacterSelection().then((success) => {
  console.log(success ? '\n✅ Test passed!' : '\n❌ Test failed!');
  process.exit(success ? 0 : 1);
}).catch((error) => {
  console.error('Test error:', error);
  process.exit(1);
});