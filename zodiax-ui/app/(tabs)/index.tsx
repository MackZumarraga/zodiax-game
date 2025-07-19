import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Button, View, SafeAreaView, ScrollView, TouchableOpacity, Text } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { attackCommand, blockCommand, healCommand, curseCommand, startGameCommand } from '../manager/basic-commands-handler';

export default function HomeScreen() {
  const [user, setUser] = useState<any>(null);
  const [enemy, setEnemy] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [userPopupText, setUserPopupText] = useState<string | null>(null);
  const [enemyPopupText, setEnemyPopupText] = useState<string | null>(null);
  const [userPopupColor, setUserPopupColor] = useState<string>('#ffffff');
  const [enemyPopupColor, setEnemyPopupColor] = useState<string>('#ffffff');

  const showPopup = (text: string, color: string, isUser: boolean) => {
    if (isUser) {
      setUserPopupText(text);
      setUserPopupColor(color);
      setTimeout(() => setUserPopupText(null), 2000);
    } else {
      setEnemyPopupText(text);
      setEnemyPopupColor(color);
      setTimeout(() => setEnemyPopupText(null), 2000);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://192.168.0.104:4000/users');
      const data = await res.json();
      if (data && data.length >= 2) {
        const previousUser = user;
        const previousEnemy = enemy;
        
        setUser(data[0]);
        setEnemy(data[1]);
        
        if (previousUser && previousEnemy) {
          const userHpChange = data[0].currentHp - previousUser.currentHp;
          const enemyHpChange = data[1].currentHp - previousEnemy.currentHp;
          
          // Show user HP changes (damage from AI or healing)
          if (userHpChange !== 0) {
            const color = userHpChange > 0 ? '#00ff00' : '#ff0000';
            const sign = userHpChange > 0 ? '+' : '';
            showPopup(`${sign}${userHpChange} HP`, color, true);
          }
          
          // Show enemy HP changes (damage from player attacks)
          if (enemyHpChange !== 0) {
            const color = enemyHpChange > 0 ? '#00ff00' : '#ff0000';
            const sign = enemyHpChange > 0 ? '+' : '';
            showPopup(`${sign}${enemyHpChange} HP`, color, false);
          }
        }
        
        if (gameStarted && (data[0]?.currentHp <= 0 || data[1]?.currentHp <= 0)) {
          setGameOver(true);
          setGameStarted(false);
        }
      }
    } catch (err) {
      console.error('API error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAttack = async () => {
    if (user && enemy) {
      try {
        const response = await attackCommand(user.id, enemy.id);
        console.log(response.message);
        await fetchUsers();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleBlock = async () => {
    if (user && enemy) {
      try {
        const response = await blockCommand(user.id, enemy.id);
        console.log(response.message);
        await fetchUsers();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleHeal = async () => {
    if (user && enemy) {
      try {
        const response = await healCommand(user.id, enemy.id);
        console.log(response.message);
        await fetchUsers();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleCurse = async () => {
    if (user && enemy) {
      try {
        const response = await curseCommand(user.id, enemy.id);
        console.log(response.message);
        await fetchUsers();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleStartGame = async () => {
    try {
      await startGameCommand();
      setGameStarted(true);
      setGameOver(false);
      await fetchUsers();
    } catch (error) {
      console.error('Error starting game:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.mainContent}>
        <View style={styles.enemySection}>
          <ThemedText type="title" style={[styles.sectionTitle, styles.whiteText]}>
            {loading ? 'Enemy' : enemy?.name || 'Enemy'}
          </ThemedText>
          <Image
            source={require('@/assets/images/charlotte.png')}
            style={styles.enemyPhoto}
          />
          <ThemedView style={styles.enemyInfo}>
            {loading ? (
              <ThemedText style={styles.whiteText}>Loading...</ThemedText>
            ) : (
              <>
                <ThemedText type="title" style={[styles.whiteText, styles.hpMpText]}>
                  HP: {enemy?.currentHp || 100}/{enemy?.maxHp || 100}
                </ThemedText>
                <ThemedText type="title" style={[styles.whiteText, styles.hpMpText]}>
                  MP: {enemy?.currentMp || 10}/{enemy?.maxMp || 10}
                </ThemedText>
                {enemyPopupText && (
                  <View style={styles.popupText}>
                    <Text style={[styles.popupTextStyle, { color: enemyPopupColor }]}>
                      {enemyPopupText}
                    </Text>
                  </View>
                )}
              </>
            )}
          </ThemedView>
        </View>
      </ScrollView>
      <View style={styles.commandCenter}>
        <View style={styles.userSection}>
          <ThemedText type="title" style={[styles.sectionTitle, styles.whiteText]}>
            {loading ? 'Your Character' : user?.name || 'Your Character'}
          </ThemedText>
          <Image
            source={require('@/assets/images/shayshay.png')}
            style={styles.userPhoto}
          />
          <ThemedView style={styles.userInfo}>
            {loading ? (
              <ThemedText style={styles.whiteText}>Loading user...</ThemedText>
            ) : (
              <>
                <ThemedText type="title" style={[styles.whiteText, styles.hpMpText]}>
                  HP: {user?.currentHp || 100}/{user?.maxHp || 100}
                </ThemedText>
                <ThemedText type="title" style={[styles.whiteText, styles.hpMpText]}>
                  MP: {user?.currentMp || 10}/{user?.maxMp || 10}
                </ThemedText>
                {userPopupText && (
                  <View style={styles.popupText}>
                    <Text style={[styles.popupTextStyle, { color: userPopupColor }]}>
                      {userPopupText}
                    </Text>
                  </View>
                )}
              </>
            )}
          </ThemedView>
        </View>
        <View style={styles.buttonContainer}>
          {!gameStarted && !loading ? (
            <Button title="Start Game" onPress={handleStartGame} />
          ) : gameStarted && !gameOver ? (
            <>
              <Button title="Attack" onPress={handleAttack} />
              <Button title="Block" onPress={handleBlock} />
              <TouchableOpacity
                style={[
                  styles.customButton,
                  (user?.currentMp || 0) < 5 ? styles.disabledButton : styles.enabledButton
                ]}
                onPress={handleHeal}
                disabled={(user?.currentMp || 0) < 5}
              >
                <Text style={[
                  styles.buttonText,
                  (user?.currentMp || 0) < 5 ? styles.disabledButtonText : styles.enabledButtonText
                ]}>
                  Heal (5 MP)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.customButton,
                  (user?.currentMp || 0) < 7 ? styles.disabledButton : styles.enabledButton
                ]}
                onPress={handleCurse}
                disabled={(user?.currentMp || 0) < 7}
              >
                <Text style={[
                  styles.buttonText,
                  (user?.currentMp || 0) < 7 ? styles.disabledButtonText : styles.enabledButtonText
                ]}>
                  Curse (7 MP)
                </Text>
              </TouchableOpacity>
            </>
          ) : gameOver ? (
            <View style={styles.gameOverContainer}>
              <ThemedText type="title" style={[styles.whiteText, styles.gameOverText]}>
                Game Over!
              </ThemedText>
              <Button title="Start New Game" onPress={handleStartGame} />
            </View>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 200,
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
  enemyPhoto: {
    height: 200,
    width: 200,
    resizeMode: 'contain',
  },
  userPhoto: {
    height: 120,
    width: 120,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  userInfo: {
    alignItems: 'center',
    marginVertical: 10,
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
    fontSize: 18,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
    flexWrap: 'wrap',
    gap: 8,
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
    minHeight: 180,
  },
  gameOverContainer: {
    alignItems: 'center',
    gap: 20,
  },
  gameOverText: {
    fontSize: 24,
    marginBottom: 10,
  },
  customButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    minHeight: 36,
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
    fontSize: 16,
    fontWeight: '600',
  },
  enabledButtonText: {
    color: '#FFFFFF',
  },
  disabledButtonText: {
    color: '#CCCCCC',
  },
  popupText: {
    position: 'absolute',
    top: -30,
    alignSelf: 'center',
    zIndex: 100,
  },
  popupTextStyle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
