import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  Image,
  RefreshControl 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { animalsApi, distributorApi, mealsApi, statisticsApi } from '@/utils/BaseAPI';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/useAuth';

export default function HomeScreen() {
  const router = useRouter();
  const { notifyMealDistributed, notifyLowFood } = useNotifications();
  const { user } = useAuth();
  const [animals, setAnimals] = useState([]);
  const [distributorStatus, setDistributorStatus] = useState([]);
  const [nextMeal, setNextMeal] = useState(null);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [animalsData, statusData, mealsData, statsData] = await Promise.all([
        animalsApi.getAll(),
        distributorApi.getStatus(),
        mealsApi.getAll(),
        statisticsApi.getAll(),
      ]);

      setAnimals(animalsData || []);
      setDistributorStatus(statusData || []);

      // Traiter le prochain repas
      if (mealsData && mealsData.length > 0) {
        const enabledMeals = mealsData.filter(meal => meal.enabled);
        if (enabledMeals.length > 0) {
          // Trier par heure pour obtenir le prochain
          const sortedMeals = enabledMeals.sort((a, b) => a.time.localeCompare(b.time));
          const meal = sortedMeals[0];
          setNextMeal({
            time: meal.time,
            meal: meal.name,
            amount: `${meal.quantity}g`
          });
        } else {
          setNextMeal(null);
        }
      } else {
        setNextMeal(null);
      }

      // Traiter les statistiques
      if (statsData && statsData.length > 0) {
        const todayStats = statsData[0];
        setStats({
          consumption: `${todayStats.totalConsumed}g`,
          regularity: `${todayStats.regularity}%`
        });
      } else {
        setStats({
          consumption: '0g',
          regularity: '0%'
        });
      }

    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      Alert.alert('Erreur', 'Impossible de charger les données');
      
      // Données de fallback
      setAnimals([]);
      setDistributorStatus([]);
      setNextMeal(null);
      setStats({ consumption: '0g', regularity: '0%' });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleDistributeNow = async () => {
    Alert.alert(
      'Distribution immédiate',
      'Voulez-vous distribuer de la nourriture maintenant ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Distribuer', 
          onPress: async () => {
            try {
              await mealsApi.distributeNow();
              await notifyMealDistributed('Animal', 'Distribution manuelle', 60);
              Alert.alert('Succès', 'Distribution en cours...');
              loadData();
            } catch (error) {
              Alert.alert('Erreur', error.message || 'Erreur lors de la distribution');
            }
          }
        }
      ]
    );
  };

  const formatLastRefill = (dateString) => {
    if (!dateString) return 'Inconnu';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Aujourd\'hui';
    if (diffDays === 1) return 'Hier';
    return `Il y a ${diffDays} jours`;
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>
            Bonjour{user?.name ? ` ${user.name}` : ''}
          </Text>
          <Text style={styles.subGreeting}>
            Gérez vos animaux en toute simplicité
          </Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications" size={24} color="#333" />
          <View style={styles.notificationBadge} />
        </TouchableOpacity>
      </View>

      {/* Section Animaux */}
<View style={styles.section}>
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>Animaux</Text>
    <TouchableOpacity onPress={() => router.push('/animal-management')}>
      <Text style={styles.seeAll}>Gérer</Text>
    </TouchableOpacity>
  </View>
  
  {animals.length > 0 ? (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {animals.map((animal) => (
        <View key={animal.id} style={styles.animalCard}>
          <View style={styles.animalPhoto}>
            {animal.photo ? (
              <Image source={{ uri: animal.photo }} style={styles.animalImage} />
            ) : (
              <Text style={styles.animalEmoji}>
                {animal.type === 'Chien' ? '🐕' : animal.type === 'Chat' ? '🐱' : '🐰'}
              </Text>
            )}
          </View>
          <Text style={styles.animalName}>{animal.name}</Text>
          <Text style={[
            styles.animalType, 
            { color: animal.type === 'Chien' ? '#007AFF' : animal.type === 'Chat' ? '#FF6B6B' : '#4ECDC4' }
          ]}>
            {animal.type}
          </Text>
          <Text style={styles.animalWeight}>{animal.weight}kg</Text>
        </View>
      ))}
    </ScrollView>
  ) : (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>🐾</Text>
      <Text style={styles.emptyText}>Aucun animal ajouté</Text>
      <TouchableOpacity 
        style={styles.emptyButton}
        onPress={() => router.push('/animal-management')}
      >
        <Text style={styles.emptyButtonText}>Ajouter un animal</Text>
      </TouchableOpacity>
    </View>
  )}
</View>

      {/* État distributeur */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>État distributeur</Text>
          <TouchableOpacity onPress={() => router.push('/distributor-management')}>
            <Text style={styles.seeAll}>Gérer</Text>
          </TouchableOpacity>
        </View>
        
        {distributorStatus.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {distributorStatus.map((distributor) => (
              <View key={distributor.id} style={styles.distributorCard}>
                <View style={styles.distributorHeader}>
                  <Text style={styles.distributorLabel}>
                    {distributor.name || `Mangeoire ${distributor.animalType}`}
                  </Text>
                  <View style={[
                    styles.connectionIndicator,
                    { backgroundColor: distributor.connected ? '#4CD964' : '#FF3B30' }
                  ]} />
                </View>
                
                <View style={styles.distributorContent}>
                  <View style={styles.levelContainer}>
                    <Text style={styles.levelLabel}>Niveau</Text>
                    <Text style={[
                      styles.levelValue,
                      { color: distributor.currentLevel < 30 ? '#FF3B30' : '#4CD964' }
                    ]}>
                      {distributor.currentLevel}%
                    </Text>
                  </View>
                  
                  <View style={styles.levelBar}>
                    <View 
                      style={[
                        styles.levelFill, 
                        { 
                          width: `${distributor.currentLevel}%`,
                          backgroundColor: distributor.currentLevel < 30 ? '#FF3B30' : '#4CD964'
                        }
                      ]} 
                    />
                  </View>
                  
                  <View style={styles.distributorStats}>
                    <Text style={styles.statText}>
                      Autonomie: {distributor.autonomyDays} jours
                    </Text>
                    <Text style={styles.statText}>
                      Dernier remplissage: {formatLastRefill(distributor.lastRefill)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🏠</Text>
            <Text style={styles.emptyText}>Aucune mangeoire configurée</Text>
            <TouchableOpacity 
              style={styles.emptyButton}
              onPress={() => router.push('/distributor-management')}
            >
              <Text style={styles.emptyButtonText}>Ajouter une mangeoire</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Prochain repas */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Prochain repas</Text>
          <TouchableOpacity onPress={() => router.push('/modals/add-meal')}>
            <Text style={styles.seeAll}>Ajouter</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.nextMealCard}>
          <View style={styles.nextMealTime}>
            {nextMeal ? (
              <>
                <Text style={styles.nextMealTimeText}>{nextMeal.time}</Text>
                <Text style={styles.nextMealDate}>
                  {nextMeal.meal} • {nextMeal.amount}
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.nextMealTimeText}>--:--</Text>
                <Text style={styles.nextMealDate}>Aucun repas programmé</Text>
              </>
            )}
          </View>
          <TouchableOpacity 
            style={[styles.distributeButton, !nextMeal && styles.distributeButtonDisabled]} 
            onPress={handleDistributeNow}
            disabled={!nextMeal}
          >
            <Ionicons name="play" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Statistiques récentes */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Statistiques du jour</Text>
          <TouchableOpacity onPress={() => router.push('/analysis')}>
            <Text style={styles.seeAll}>Voir tout</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>📊</Text>
            <Text style={styles.statLabel}>Consommation</Text>
            <Text style={styles.statValue}>{stats.consumption || '0g'}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🎯</Text>
            <Text style={styles.statLabel}>Régularité</Text>
            <Text style={styles.statValue}>{stats.regularity || '0%'}</Text>
          </View>
        </View>
      </View>

      {/* Actions rapides */}
<View style={styles.section}>
  <Text style={styles.sectionTitle}>Actions rapides</Text>
  <View style={styles.quickActions}>
    <TouchableOpacity 
      style={styles.quickActionButton}
      onPress={() => router.push('/modals/add-animal')}
    >
      <Ionicons name="paw" size={24} color="#007AFF" />
      <Text style={styles.quickActionText}>Animal</Text>
    </TouchableOpacity>
    
    <TouchableOpacity 
      style={styles.quickActionButton}
      onPress={() => router.push('/modals/add-distributor')}
    >
      <Ionicons name="hardware-chip" size={24} color="#007AFF" />
      <Text style={styles.quickActionText}>Distributeur</Text>
    </TouchableOpacity>
    
    <TouchableOpacity 
      style={styles.quickActionButton}
      onPress={() => router.push('/modals/add-meal')}
    >
      <Ionicons name="restaurant" size={24} color="#007AFF" />
      <Text style={styles.quickActionText}>Repas</Text>
    </TouchableOpacity>
  </View>
</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subGreeting: {
    fontSize: 14,
    color: '#666',
  },
  notificationButton: {
    position: 'relative',
    padding: 10,
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 12,
    height: 12,
    backgroundColor: '#FF3B30',
    borderRadius: 6,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 10,
    paddingVertical: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  seeAll: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  animalCard: {
    alignItems: 'center',
    marginLeft: 20,
    width: 120,
  },
  animalPhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  animalImage: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  animalEmoji: {
    fontSize: 40,
  },
  animalName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  animalType: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  animalWeight: {
    fontSize: 12,
    color: '#999',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  emptyButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  distributorCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginLeft: 20,
    minWidth: 200,
  },
  distributorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  distributorLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  connectionIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  distributorContent: {
    gap: 8,
  },
  levelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  levelLabel: {
    fontSize: 14,
    color: '#666',
  },
  levelValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  levelBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  levelFill: {
    height: '100%',
    borderRadius: 3,
  },
  distributorStats: {
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#666',
  },
  nextMealCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
  },
  nextMealTime: {
    flex: 1,
  },
  nextMealTimeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  nextMealDate: {
    fontSize: 14,
    color: '#666',
  },
  distributeButton: {
    backgroundColor: '#FF6B35',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  distributeButtonDisabled: {
    backgroundColor: '#ccc',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
});