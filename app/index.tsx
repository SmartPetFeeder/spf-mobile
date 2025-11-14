import { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');

      setTimeout(() => {
        if (token) {
          router.replace('/(tabs)');
        } else if (hasSeenOnboarding) {
          router.replace('/auth/login');
        } else {
          router.replace('/onboarding');
        }
      }, 3000);
    } catch (error) {
      console.error('Erreur vérification auth:', error);
      router.replace('/onboarding');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Smart Pet Feeder</Text>
      <Text style={styles.subtitle}>Nourrissez intelligemment, prenez soin avec précision</Text>
      
      <View style={styles.logoContainer}>
        <Image 
                  source={require('@/assets/images/logo.png')} 
                  style={styles.logoImage}
                  resizeMode="contain"
                />
      </View>
      
      <Text style={styles.version}>Version 1.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: 60,
  },
  logoContainer: {
    width: 150,
    height: 150,
    backgroundColor: '#4ECDC4',
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 80,
  },
  logoImage: {
    width: 150,
    height: 150,
  },
  version: {
    position: 'absolute',
    bottom: 50,
    color: '#fff',
    fontSize: 16,
  },
});