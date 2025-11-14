import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(0);

  const pages = [
    {
      title: 'prenez soin avec précision',
      subtitle: 'Nourrissez intelligemment',
    },
    {
      title: 'Nourrissez intelligemment',
      subtitle: 'prenez soin avec précision',
    },
  ];

  const handleNext = async () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      router.replace('/auth/login');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Smart Pet Feeder</Text>
      <Text style={styles.subtitle}>Nourrissez intelligemment</Text>
      
      <View style={styles.logoContainer}>
        <Image 
                  source={require('@/assets/images/logo.png')} 
                  style={styles.logoImage}
                  resizeMode="contain"
                />
      </View>
      
      <Text style={styles.mainText}>{pages[currentPage].title}</Text>
      
      <View style={styles.pagination}>
        {pages.map((_, index) => (
          <View 
            key={index}
            style={[
              styles.dot,
              index === currentPage ? styles.activeDot : styles.inactiveDot
            ]}
          />
        ))}
      </View>
      
      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>
          {currentPage === pages.length - 1 ? 'Commencez maintenant !' : 'Suivant'}
        </Text>
        <Text style={styles.arrow}>→</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 60,
  },
  logoContainer: {
    width: 120,
    height: 120,
    backgroundColor: '#4ECDC4',
    borderRadius: 60,
    marginBottom: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: 150,
    height: 150,
  },
  mainText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 60,
  },
  pagination: {
    flexDirection: 'row',
    marginBottom: 40,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: '#007AFF',
  },
  inactiveDot: {
    backgroundColor: '#ddd',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  nextButtonText: {
    fontSize: 16,
    color: '#333',
    marginRight: 8,
  },
  arrow: {
    fontSize: 16,
    color: '#007AFF',
  },
});