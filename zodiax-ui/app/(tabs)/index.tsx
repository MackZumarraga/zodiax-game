import { Image, StyleSheet, Button, View, SafeAreaView, ScrollView } from 'react-native';
import { useEffect, useState } from 'react';

import { HelloWave } from '@/components/HelloWave';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

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
      } else {
        setUser({ name: 'Guest', currentHp: 100, maxHp: 100 });
        setEnemy({ name: 'Enemy', currentHp: 100, maxHp: 100 });
      }
    } catch (err) {
      console.error('API error:', err);
      setUser({ name: 'Guest', currentHp: 100, maxHp: 100 });
      setEnemy({ name: 'Enemy', currentHp: 100, maxHp: 100 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAttack = async () => console.log('Attack initiated');
  const handleBlock = async () => console.log('Block initiated');
  const handleHeal = async () => console.log('Heal initiated');
  const handleCurse = async () => console.log('Curse initiated');

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
              <ThemedText type="title" style={styles.whiteText}>
                HP: {enemy?.currentHp || 100}/{enemy?.maxHp || 100}
              </ThemedText>
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
              <ThemedText type="title" style={styles.whiteText}>
                HP: {user?.currentHp || 100}/{user?.maxHp || 100}
              </ThemedText>
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
    paddingBottom: 400, // extra bottom padding so content doesn't get hidden behind the commandCenter
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
    // borderWidth: 2,
    // borderColor: '#f44336',
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
    zIndex: 10,     // ensures the command center stays on top
    elevation: 10,  // for Android
    borderTopWidth: 2,
    borderTopColor: '#ffffff',
    minHeight: 250,
  },
});
