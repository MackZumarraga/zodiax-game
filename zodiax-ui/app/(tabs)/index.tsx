import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Button, View, SafeAreaView, ScrollView } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { attackCommand, blockCommand, healCommand, curseCommand } from '../manager/basic-commands-handler';

export default function HomeScreen() {
  const [user, setUser] = useState<any>(null);
  const [enemy, setEnemy] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://192.168.0.104:4000/users');
      const data = await res.json();
      if (data && data.length >= 2) {
        setUser(data[0]);
        setEnemy(data[1]);
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
                <ThemedText type="title" style={styles.whiteText}>
                  HP: {enemy?.currentHp || 100}/{enemy?.maxHp || 100}
                </ThemedText>
                <ThemedText type="title" style={styles.whiteText}>
                  MP: {enemy?.currentMp || 100}/{enemy?.maxMp || 100}
                </ThemedText>
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
                <ThemedText type="title" style={styles.whiteText}>
                  HP: {user?.currentHp || 100}/{user?.maxHp || 100}
                </ThemedText>
                <ThemedText type="title" style={styles.whiteText}>
                  MP: {user?.currentMp || 100}/{user?.maxMp || 100}
                </ThemedText>
              </>
            )}
          </ThemedView>
        </View>
        <View style={styles.buttonContainer}>
          <Button title="Attack" onPress={handleAttack} />
          <Button title="Block" onPress={handleBlock} />
          <Button title="Heal" onPress={handleHeal} />
          <Button title="Curse" onPress={handleCurse} />
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
    paddingBottom: 400,
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
    marginBottom: 10,
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
    height: 150,
    width: 150,
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 16,
  },
  commandCenter: {
    position: 'absolute',
    bottom: 90,
    left: 0,
    right: 0,
    paddingVertical: 15,
    paddingTop: 20,
    backgroundColor: '#000000',
    zIndex: 10,
    elevation: 10,
    borderTopWidth: 2,
    borderTopColor: '#ffffff',
    minHeight: 250,
  },
});
