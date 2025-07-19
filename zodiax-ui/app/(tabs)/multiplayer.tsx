import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Button, View, SafeAreaView, ScrollView, TouchableOpacity, Text, TextInput, Alert } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { socketManager } from '../manager/socket-handler';

export default function MultiplayerScreen() {
  const [playerName, setPlayerName] = useState('');
  const [gameState, setGameState] = useState<'menu' | 'searching' | 'playing'>('menu');
  const [gameData, setGameData] = useState<any>(null);
  const [player, setPlayer] = useState<any>(null);
  const [opponent, setOpponent] = useState<any>(null);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [lastAction, setLastAction] = useState<any>(null);
  const [roomId, setRoomId] = useState<string>('');

  useEffect(() => {
    // Setup socket callbacks
    socketManager.setGameCallbacks({
      onWaitingForMatch: () => {
        setGameState('searching');
      },
      onGameFound: (data: any) => {
        console.log('Game found:', data);
        setGameData(data);
        setPlayer(data.player);
        setOpponent(data.opponent);
        setIsMyTurn(data.isYourTurn);
        setRoomId(data.roomId);
        setGameState('playing');
      },
      onGameUpdate: (data: any) => {
        console.log('Game update:', data);
        setPlayer(data.player);
        setOpponent(data.opponent);
        setIsMyTurn(data.isYourTurn);
        setLastAction(data.lastAction);
        
        if (data.gameState === 'ended') {
          Alert.alert(
            'Game Over!',
            data.lastAction.winner === player?.name ? 'You Won!' : 'You Lost!',
            [{ text: 'OK', onPress: () => setGameState('menu') }]
          );
        }
      },
      onOpponentDisconnected: () => {
        Alert.alert(
          'Opponent Disconnected',
          'Your opponent has left the game.',
          [{ text: 'OK', onPress: () => setGameState('menu') }]
        );
      },
      onError: (error: any) => {
        Alert.alert('Error', error.message);
      }
    });

    // Connect to server when component mounts
    socketManager.connect();

    return () => {
      socketManager.disconnect();
    };
  }, []);

  const handleFindMatch = () => {
    if (!playerName.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    socketManager.findMatch(playerName.trim());
  };

  const handleAction = (action: string) => {
    if (!isMyTurn || !roomId) return;
    
    // Check MP requirements
    if (action === 'heal' && player.mp < 5) {
      Alert.alert('Error', 'Not enough MP to heal!');
      return;
    }
    if (action === 'curse' && player.mp < 7) {
      Alert.alert('Error', 'Not enough MP to curse!');
      return;
    }

    socketManager.sendPlayerAction(roomId, action);
  };

  const handleBackToMenu = () => {
    socketManager.disconnect();
    setGameState('menu');
    setGameData(null);
    setPlayer(null);
    setOpponent(null);
    setRoomId('');
    setLastAction(null);
    socketManager.connect();
  };

  if (gameState === 'menu') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.menuContainer}>
          <ThemedText type="title" style={styles.titleText}>
            Multiplayer Battle
          </ThemedText>
          <TextInput
            style={styles.nameInput}
            placeholder="Enter your name"
            placeholderTextColor="#666"
            value={playerName}
            onChangeText={setPlayerName}
            maxLength={20}
          />
          <Button title="Find Match" onPress={handleFindMatch} />
        </View>
      </SafeAreaView>
    );
  }

  if (gameState === 'searching') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.searchingContainer}>
          <ThemedText type="title" style={styles.titleText}>
            Searching for opponent...
          </ThemedText>
          <ThemedText style={styles.whiteText}>
            Please wait while we find you a match
          </ThemedText>
          <Button title="Cancel" onPress={handleBackToMenu} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.mainContent}>
        <View style={styles.enemySection}>
          <ThemedText type="title" style={[styles.sectionTitle, styles.whiteText]}>
            {opponent?.name || 'Opponent'}
          </ThemedText>
          <Image
            source={require('@/assets/images/charlotte.png')}
            style={styles.enemyPhoto}
          />
          <ThemedView style={styles.enemyInfo}>
            <ThemedText type="title" style={[styles.whiteText, styles.hpMpText]}>
              HP: {opponent?.hp || 100}/{opponent?.maxHp || 100}
            </ThemedText>
            <ThemedText type="title" style={[styles.whiteText, styles.hpMpText]}>
              MP: {opponent?.mp || 10}/{opponent?.maxMp || 10}
            </ThemedText>
          </ThemedView>
        </View>
        
        {lastAction && (
          <View style={styles.actionMessage}>
            <ThemedText style={styles.actionText}>
              {lastAction.message}
            </ThemedText>
          </View>
        )}
        
        <View style={styles.turnIndicator}>
          <ThemedText style={[styles.turnText, isMyTurn ? styles.yourTurn : styles.opponentTurn]}>
            {isMyTurn ? "Your Turn" : `${opponent?.name}'s Turn`}
          </ThemedText>
        </View>
      </ScrollView>
      
      <View style={styles.commandCenter}>
        <View style={styles.userSection}>
          <ThemedText type="title" style={[styles.sectionTitle, styles.whiteText]}>
            {player?.name || 'You'}
          </ThemedText>
          <Image
            source={require('@/assets/images/shayshay.png')}
            style={styles.userPhoto}
          />
          <ThemedView style={styles.userInfo}>
            <ThemedText type="title" style={[styles.whiteText, styles.hpMpText]}>
              HP: {player?.hp || 100}/{player?.maxHp || 100}
            </ThemedText>
            <ThemedText type="title" style={[styles.whiteText, styles.hpMpText]}>
              MP: {player?.mp || 10}/{player?.maxMp || 10}
            </ThemedText>
          </ThemedView>
        </View>
        
        <View style={styles.buttonContainer}>
          <Button 
            title="Attack" 
            onPress={() => handleAction('attack')} 
            disabled={!isMyTurn}
          />
          <Button 
            title="Block" 
            onPress={() => handleAction('block')} 
            disabled={!isMyTurn}
          />
          <TouchableOpacity
            style={[
              styles.customButton,
              !isMyTurn || (player?.mp || 0) < 5 ? styles.disabledButton : styles.enabledButton
            ]}
            onPress={() => handleAction('heal')}
            disabled={!isMyTurn || (player?.mp || 0) < 5}
          >
            <Text style={[
              styles.buttonText,
              !isMyTurn || (player?.mp || 0) < 5 ? styles.disabledButtonText : styles.enabledButtonText
            ]}>
              Heal (5 MP)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.customButton,
              !isMyTurn || (player?.mp || 0) < 7 ? styles.disabledButton : styles.enabledButton
            ]}
            onPress={() => handleAction('curse')}
            disabled={!isMyTurn || (player?.mp || 0) < 7}
          >
            <Text style={[
              styles.buttonText,
              !isMyTurn || (player?.mp || 0) < 7 ? styles.disabledButtonText : styles.enabledButtonText
            ]}>
              Curse (7 MP)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.customButton,
              !isMyTurn ? styles.disabledButton : styles.enabledButton
            ]}
            onPress={() => handleAction('charge')}
            disabled={!isMyTurn}
          >
            <Text style={[
              styles.buttonText,
              !isMyTurn ? styles.disabledButtonText : styles.enabledButtonText
            ]}>
              Charge MP
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.menuButtonContainer}>
          <Button title="Back to Menu" onPress={handleBackToMenu} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  menuContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 20,
  },
  searchingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 20,
  },
  mainContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 280,
    backgroundColor: '#000000',
  },
  enemySection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 5,
    backgroundColor: '#000000',
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  userSection: {
    alignItems: 'center',
    marginBottom: 5,
  },
  sectionTitle: {
    marginBottom: 15,
    fontWeight: 'bold',
  },
  titleText: {
    color: '#ffffff',
    fontSize: 24,
    textAlign: 'center',
  },
  nameInput: {
    backgroundColor: '#333',
    color: '#fff',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    fontSize: 16,
  },
  enemyPhoto: {
    height: 150,
    width: 150,
    resizeMode: 'contain',
  },
  userPhoto: {
    height: 100,
    width: 100,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  userInfo: {
    alignItems: 'center',
    marginVertical: 5,
    backgroundColor: '#000000',
  },
  enemyInfo: {
    alignItems: 'center',
    marginVertical: 10,
    paddingBottom: 20,
    backgroundColor: '#000000',
  },
  whiteText: {
    color: '#ffffff',
  },
  hpMpText: {
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  commandCenter: {
    position: 'absolute',
    bottom: 90,
    left: 0,
    right: 0,
    paddingVertical: 10,
    paddingTop: 15,
    backgroundColor: '#000000',
    zIndex: 10,
    elevation: 10,
    borderTopWidth: 2,
    borderTopColor: '#ffffff',
    minHeight: 220,
  },
  customButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  enabledButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  disabledButton: {
    backgroundColor: '#666666',
    borderColor: '#666666',
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  enabledButtonText: {
    color: '#FFFFFF',
  },
  disabledButtonText: {
    color: '#CCCCCC',
  },
  actionMessage: {
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  actionText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
  },
  turnIndicator: {
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  turnText: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  yourTurn: {
    color: '#00ff00',
  },
  opponentTurn: {
    color: '#ff6600',
  },
  menuButtonContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
});