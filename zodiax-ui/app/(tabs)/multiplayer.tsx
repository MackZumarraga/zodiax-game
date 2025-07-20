import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Button, View, SafeAreaView, ScrollView, TouchableOpacity, Text, TextInput, Alert } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { socketManager } from '../manager/socket-handler';

// Helper function to get avatar image based on character name
const getAvatarImage = (characterName: string) => {
  if (characterName === 'Shay Shay') {
    return require('@/assets/images/shayshay.png');
  } else if (characterName === 'Charlotte') {
    return require('@/assets/images/charlotte.png');
  }
  // Default fallback
  return require('@/assets/images/shayshay.png');
};

export default function MultiplayerScreen() {
  const [gameState, setGameState] = useState<'menu' | 'searching' | 'playing'>('menu');
  const [availableCharacters, setAvailableCharacters] = useState<string[]>([]);
  const [takenCharacters, setTakenCharacters] = useState<string[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<string>('');
  const [gameData, setGameData] = useState<any>(null);
  const [player, setPlayer] = useState<any>(null);
  const [opponent, setOpponent] = useState<any>(null);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [lastAction, setLastAction] = useState<any>(null);
  const [roomId, setRoomId] = useState<string>('');

  useEffect(() => {
    // Setup socket callbacks
    socketManager.setGameCallbacks({
      onAvailableCharacters: (data: any) => {
        console.log('Available characters:', data);
        setAvailableCharacters(data.characters);
        setTakenCharacters(data.taken);
      },
      onCharacterTaken: (data: any) => {
        Alert.alert('Character Taken', `${data.character} has already been selected by another player.`);
      },
      onCharacterSelected: (data: any) => {
        console.log('Character selected:', data);
        setTakenCharacters(prev => [...prev, data.character]);
      },
      onCharacterFreed: (data: any) => {
        console.log('Character freed:', data);
        setTakenCharacters(prev => prev.filter(char => char !== data.character));
      },
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
            [{ text: 'OK', onPress: () => handleBackToMenu() }]
          );
        }
      },
      onOpponentDisconnected: () => {
        Alert.alert(
          'Opponent Disconnected',
          'Your opponent has left the game.',
          [{ text: 'OK', onPress: () => handleBackToMenu() }]
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

  const handleCharacterSelect = (character: string) => {
    if (takenCharacters.includes(character)) {
      Alert.alert('Character Taken', `${character} has already been selected by another player.`);
      return;
    }
    setSelectedCharacter(character);
    socketManager.selectCharacter(character);
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
    setSelectedCharacter('');
    setGameData(null);
    setPlayer(null);
    setOpponent(null);
    setRoomId('');
    setLastAction(null);
    setTakenCharacters([]);
    socketManager.connect();
  };

  if (gameState === 'menu') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.menuContainer}>
          <ThemedText type="title" style={styles.titleText}>
            Choose Your Character
          </ThemedText>
          <ThemedText style={styles.subtitleText}>
            Select a character to begin your battle!
          </ThemedText>
          
          <View style={styles.characterSelection}>
            {availableCharacters.map((character) => {
              const isCharacterTaken = takenCharacters.includes(character);
              const isSelected = selectedCharacter === character;
              
              return (
                <TouchableOpacity
                  key={character}
                  style={[
                    styles.characterCard,
                    isCharacterTaken && styles.characterCardTaken,
                    isSelected && styles.characterCardSelected
                  ]}
                  onPress={() => handleCharacterSelect(character)}
                  disabled={isCharacterTaken}
                >
                  <Image
                    source={getAvatarImage(character)}
                    style={[
                      styles.characterImage,
                      isCharacterTaken && styles.characterImageTaken
                    ]}
                  />
                  <ThemedText style={[
                    styles.characterName,
                    isCharacterTaken && styles.characterNameTaken,
                    isSelected && styles.characterNameSelected
                  ]}>
                    {character}
                  </ThemedText>
                  {isCharacterTaken && (
                    <ThemedText style={styles.takenText}>TAKEN</ThemedText>
                  )}
                  {isSelected && (
                    <ThemedText style={styles.selectedText}>SELECTED</ThemedText>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
          
          {selectedCharacter && (
            <ThemedText style={styles.waitingText}>
              Waiting for opponent to select their character...
            </ThemedText>
          )}
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
            source={getAvatarImage(opponent?.name)}
            style={styles.enemyPhoto}
          />
          <ThemedView style={styles.enemyInfo}>
            <ThemedText type="title" style={[styles.whiteText, styles.hpMpText]}>
              HP: {opponent?.hp ?? 100}/{opponent?.maxHp ?? 100}
            </ThemedText>
            <ThemedText type="title" style={[styles.whiteText, styles.hpMpText]}>
              MP: {opponent?.mp ?? 10}/{opponent?.maxMp ?? 10}
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
            source={getAvatarImage(player?.name)}
            style={styles.userPhoto}
          />
          <ThemedView style={styles.userInfo}>
            <ThemedText type="title" style={[styles.whiteText, styles.hpMpText]}>
              HP: {player?.hp ?? 100}/{player?.maxHp ?? 100}
            </ThemedText>
            <ThemedText type="title" style={[styles.whiteText, styles.hpMpText]}>
              MP: {player?.mp ?? 10}/{player?.maxMp ?? 10}
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
  subtitleText: {
    color: '#cccccc',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  characterSelection: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 20,
  },
  characterCard: {
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 120,
  },
  characterCardSelected: {
    borderColor: '#00ff00',
    backgroundColor: '#004400',
  },
  characterCardTaken: {
    backgroundColor: '#222',
    opacity: 0.6,
  },
  characterImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  characterImageTaken: {
    opacity: 0.5,
  },
  characterName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  characterNameSelected: {
    color: '#00ff00',
  },
  characterNameTaken: {
    color: '#666',
  },
  selectedText: {
    color: '#00ff00',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 5,
  },
  takenText: {
    color: '#ff0000',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 5,
  },
  waitingText: {
    color: '#ffff00',
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
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