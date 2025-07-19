import { Image, StyleSheet, Button, View, SafeAreaView, ScrollView } from 'react-native';
import { useEffect, useState } from 'react';

import { HelloWave } from '@/components/HelloWave';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await fetch('http://192.168.0.104:4000/users');
      const data = await res.json();
      setUser(data && data.length > 0 ? data[0] : { name: 'Guest' });
    } catch (err) {
      console.error('API error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleAttack = async () => console.log('Attack initiated');
  const handleBlock = async () => console.log('Block initiated');
  const handleHeal = async () => console.log('Heal initiated');
  const handleCurse = async () => console.log('Curse initiated');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.mainContent}>
        <View style={styles.enemySection}>
          <ThemedText type="title" style={[styles.sectionTitle, styles.whiteText]}>Enemy</ThemedText>
          <Image
            source={require('@/assets/images/charlotte.png')}
            style={styles.enemyPhoto}
          />
        </View>
      </ScrollView>
      <View style={styles.commandCenter}>
        <View style={styles.userSection}>
          <ThemedText type="title" style={[styles.sectionTitle, styles.whiteText]}>Your Character</ThemedText>
          <Image
            source={require('@/assets/images/shayshay.png')}
            style={styles.userPhoto}
          />
          <ThemedView style={styles.userInfo}>
            {loading ? (
              <ThemedText style={styles.whiteText}>Loading user...</ThemedText>
            ) : (
              <ThemedText type="title" style={styles.whiteText}>
                HP: 100/100
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
    paddingTop: 40,
    paddingBottom: 400, // extra bottom padding so content doesn't get hidden behind the commandCenter
    backgroundColor: '#000000',
  },
  enemySection: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#000000',
    borderRadius: 10,
    margin: 20,
    // borderWidth: 2,
    // borderColor: '#f44336',
  },
  userSection: {
    alignItems: 'center',
    marginBottom: 20,
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
    height: 200,
    width: 200,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  userInfo: {
    alignItems: 'center',
    marginVertical: 10,
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
    paddingVertical: 20,
    paddingTop: 30,
    backgroundColor: '#000000',
    zIndex: 10,     // ensures the command center stays on top
    elevation: 10,  // for Android
    borderTopWidth: 2,
    borderTopColor: '#ffffff',
    minHeight: 300,
  },
});
