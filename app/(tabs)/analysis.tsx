import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  Dimensions,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { statisticsApi, animalsApi, distributorApi } from '@/utils/BaseAPI';

const { width: screenWidth } = Dimensions.get('window');

export default function AnalysisScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState('Jour');
  const [selectedDate, setSelectedDate] = useState('Mardi 23 Avril');
  const [selectedAnimal, setSelectedAnimal] = useState('Tous');
  const [animals, setAnimals] = useState([]);
  const [statistics, setStatistics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentStats, setCurrentStats] = useState({
    meals: '0/0',
    consumed: '0g',
    speed: '0g/min',
    goal: '0%',
    totalDistributed: 0,
    averageTime: 0,
    successRate: 100
  });

  const periods = ['Jour', 'Semaine', 'Mois', 'Année'];
  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  useEffect(() => {
    loadData();
  }, [selectedPeriod, selectedAnimal]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [animalsData, statsData] = await Promise.all([
        animalsApi.getAll(),
        statisticsApi.getAll()
      ]);
      
      setAnimals(animalsData || []);
      setStatistics(statsData || []);
      processStatistics(statsData || []);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      Alert.alert('Erreur', 'Impossible de charger les données d\'analyse');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const processStatistics = (statsData) => {
    if (statsData.length === 0) {
      setCurrentStats({
        meals: '0/0',
        consumed: '0g',
        speed: '0g/min',
        goal: '0%',
        totalDistributed: 0,
        averageTime: 0,
        successRate: 100
      });
      return;
    }

    // Filtrer par animal si sélectionné
    let filteredStats = statsData;
    if (selectedAnimal !== 'Tous') {
      const selectedAnimalData = animals.find(a => a.name === selectedAnimal);
      if (selectedAnimalData) {
        filteredStats = statsData.filter(s => s.animalId === selectedAnimalData.id);
      }
    }

    // Calculer les statistiques selon la période
    let processedStats = calculatePeriodStats(filteredStats);
    setCurrentStats(processedStats);
  };

  const calculatePeriodStats = (statsData) => {
    if (statsData.length === 0) {
      return {
        meals: '0/0',
        consumed: '0g',
        speed: '0g/min',
        goal: '0%',
        totalDistributed: 0,
        averageTime: 0,
        successRate: 100
      };
    }

    const totalConsumed = statsData.reduce((sum, stat) => sum + (stat.totalConsumed || 0), 0);
    const totalDistributed = statsData.reduce((sum, stat) => sum + (stat.totalDistributed || 0), 0);
    const totalMeals = statsData.reduce((sum, stat) => sum + (stat.mealsCount || 0), 0);
    const averageTime = statsData.reduce((sum, stat) => sum + (stat.averageConsumptionTime || 0), 0) / statsData.length;
    const averageRegularity = statsData.reduce((sum, stat) => sum + (stat.regularity || 0), 0) / statsData.length;
    
    // Calcul de la vitesse moyenne (g/min)
    const speed = averageTime > 0 ? (totalConsumed / totalMeals / averageTime).toFixed(1) : 0;
    
    // Taux de réussite basé sur consumed/distributed
    const successRate = totalDistributed > 0 ? Math.round((totalConsumed / totalDistributed) * 100) : 100;

    return {
      meals: `${totalMeals}/${totalMeals}`, // Ajuster selon la logique métier
      consumed: `${totalConsumed}g`,
      speed: `${speed}g/min`,
      goal: `${Math.round(averageRegularity)}%`,
      totalDistributed,
      averageTime: Math.round(averageTime),
      successRate
    };
  };

  const exportData = async () => {
    try {
      // Simuler l'exportation des données
      const exportData = {
        period: selectedPeriod,
        animal: selectedAnimal,
        date: selectedDate,
        statistics: currentStats,
        timestamp: new Date().toISOString()
      };

      // En production, ici on enverrait les données à un service d'exportation
      Alert.alert(
        'Exportation réussie', 
        `Les données ${selectedPeriod.toLowerCase()} ont été exportées avec succès.\n\nPériode: ${selectedPeriod}\nAnimal: ${selectedAnimal}\nConsommation: ${currentStats.consumed}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de l\'exportation des données');
    }
  };

  const navigateDate = (direction) => {
    // Logique pour naviguer entre les dates selon la période
    // Pour la démo, on garde la même date
    console.log(`Navigation ${direction} pour la période ${selectedPeriod}`);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Chargement des analyses...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analyse</Text>
        <TouchableOpacity style={styles.exportButton} onPress={exportData}>
          <Ionicons name="download" size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Sélecteur de période */}
        <View style={styles.periodSelector}>
          {periods.map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.selectedPeriodButton
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text style={[
                styles.periodText,
                selectedPeriod === period && styles.selectedPeriodText
              ]}>
                {period}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sélecteur d'animal */}
        <View style={styles.animalSelector}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[
                styles.animalButton,
                selectedAnimal === 'Tous' && styles.selectedAnimalButton
              ]}
              onPress={() => setSelectedAnimal('Tous')}
            >
              <Text style={[
                styles.animalButtonText,
                selectedAnimal === 'Tous' && styles.selectedAnimalButtonText
              ]}>
                Tous
              </Text>
            </TouchableOpacity>
            {animals.map((animal) => (
              <TouchableOpacity
                key={animal.id}
                style={[
                  styles.animalButton,
                  selectedAnimal === animal.name && styles.selectedAnimalButton
                ]}
                onPress={() => setSelectedAnimal(animal.name)}
              >
                <Text style={[
                  styles.animalButtonText,
                  selectedAnimal === animal.name && styles.selectedAnimalButtonText
                ]}>
                  {animal.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Navigation de date */}
        <View style={styles.dateContainer}>
          <TouchableOpacity 
            style={styles.dateNavButton}
            onPress={() => navigateDate('previous')}
          >
            <Text style={styles.dateNavIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.dateText}>{selectedDate}</Text>
          <TouchableOpacity 
            style={styles.dateNavButton}
            onPress={() => navigateDate('next')}
          >
            <Text style={styles.dateNavIcon}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Résumé des statistiques */}
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Résumé {selectedPeriod.toLowerCase()}</Text>
          <View style={styles.summaryStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Repas</Text>
              <Text style={styles.statValue}>{currentStats.meals}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Consommé</Text>
              <Text style={styles.statValue}>{currentStats.consumed}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Vitesse</Text>
              <Text style={styles.statValue}>{currentStats.speed}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Régularité</Text>
              <Text style={styles.statValue}>{currentStats.goal}</Text>
            </View>
          </View>
        </View>

        {/* Graphique simple (représentation visuelle) */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Consommation sur 7 jours</Text>
          <View style={styles.chartArea}>
            {weekDays.map((day, index) => {
              const height = Math.random() * 100 + 20; // Données simulées
              return (
                <View key={day} style={styles.barContainer}>
                  <View 
                    style={[
                      styles.bar, 
                      { 
                        height: height,
                        backgroundColor: index === 1 ? '#007AFF' : '#4ECDC4' // Highlight mardi
                      }
                    ]} 
                  />
                  <Text style={styles.barLabel}>{day}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Détails avancés */}
        <View style={styles.detailsContainer}>
          <Text style={styles.detailsTitle}>Détails avancés</Text>
          
          <View style={styles.detailCard}>
            <View style={styles.detailHeader}>
              <Ionicons name="time" size={20} color="#007AFF" />
              <Text style={styles.detailCardTitle}>Temps de consommation</Text>
            </View>
            <Text style={styles.detailValue}>{currentStats.averageTime} min</Text>
            <Text style={styles.detailDescription}>Temps moyen par repas</Text>
          </View>

          <View style={styles.detailCard}>
            <View style={styles.detailHeader}>
              <Ionicons name="trending-up" size={20} color="#4CD964" />
              <Text style={styles.detailCardTitle}>Taux de réussite</Text>
            </View>
            <Text style={[
              styles.detailValue,
              { color: currentStats.successRate >= 90 ? '#4CD964' : currentStats.successRate >= 70 ? '#FF9500' : '#FF3B30' }
            ]}>
              {currentStats.successRate}%
            </Text>
            <Text style={styles.detailDescription}>Nourriture consommée vs distribuée</Text>
          </View>

          <View style={styles.detailCard}>
            <View style={styles.detailHeader}>
              <Ionicons name="scale" size={20} color="#FF6B35" />
              <Text style={styles.detailCardTitle}>Quantité distribuée</Text>
            </View>
            <Text style={styles.detailValue}>{currentStats.totalDistributed}g</Text>
            <Text style={styles.detailDescription}>Total pour la période</Text>
          </View>
        </View>

        {/* Tendances et insights */}
        <View style={styles.insightsContainer}>
          <Text style={styles.insightsTitle}>Insights et tendances</Text>
          
          <View style={styles.insightCard}>
            <Ionicons name="analytics" size={24} color="#007AFF" />
            <View style={styles.insightContent}>
              <Text style={styles.insightText}>
                {currentStats.successRate >= 90 
                  ? "Excellent! Vos animaux consomment régulièrement leur nourriture."
                  : currentStats.successRate >= 70
                  ? "Bon rythme de consommation, mais il y a de la marge d'amélioration."
                  : "Attention: taux de consommation faible. Vérifiez la santé de vos animaux."
                }
              </Text>
            </View>
          </View>

          <View style={styles.insightCard}>
            <Ionicons name="time" size={24} color="#4ECDC4" />
            <View style={styles.insightContent}>
              <Text style={styles.insightText}>
                {currentStats.averageTime < 30
                  ? "Vos animaux mangent rapidement. Surveillez qu'ils mâchent bien."
                  : currentStats.averageTime > 60
                  ? "Prise de repas lente, cela peut être normal selon l'animal."
                  : "Vitesse de consommation normale et saine."
                }
              </Text>
            </View>
          </View>

          {selectedAnimal !== 'Tous' && (
            <View style={styles.insightCard}>
              <Ionicons name="heart" size={24} color="#FF3B30" />
              <View style={styles.insightContent}>
                <Text style={styles.insightText}>
                  Conseils personnalisés pour {selectedAnimal} : 
                  {currentStats.goal >= 90
                    ? " Continuez cette excellente routine !"
                    : " Essayez d'établir des horaires plus réguliers."
                  }
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Bouton d'exportation détaillée */}
        <TouchableOpacity style={styles.exportDetailButton} onPress={exportData}>
          <Ionicons name="download" size={20} color="#fff" />
          <Text style={styles.exportDetailButtonText}>Exporter le rapport complet</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
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
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  exportButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  periodSelector: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    marginTop: 10,
  },
  periodButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  selectedPeriodButton: {
    backgroundColor: '#4ECDC4',
  },
  periodText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  selectedPeriodText: {
    color: '#fff',
  },
  animalSelector: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    marginTop: 2,
  },
  animalButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    marginLeft: 12,
  },
  selectedAnimalButton: {
    backgroundColor: '#007AFF',
  },
  animalButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  selectedAnimalButtonText: {
    color: '#fff',
  },
  dateContainer: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginTop: 2,
  },
  dateNavButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateNavIcon: {
    fontSize: 18,
    color: '#007AFF',
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  summaryContainer: {
    backgroundColor: '#fff',
    paddingVertical: 20,
    marginTop: 10,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
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
  chartContainer: {
    backgroundColor: '#fff',
    marginTop: 10,
    paddingVertical: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  chartArea: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    height: 120,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 20,
    borderRadius: 10,
    marginBottom: 8,
  },
  barLabel: {
    fontSize: 12,
    color: '#666',
  },
  detailsContainer: {
    backgroundColor: '#fff',
    marginTop: 10,
    paddingVertical: 20,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  detailCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  detailValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  detailDescription: {
    fontSize: 12,
    color: '#666',
  },
  insightsContainer: {
    backgroundColor: '#fff',
    marginTop: 10,
    paddingVertical: 20,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  insightContent: {
    flex: 1,
    marginLeft: 12,
  },
  insightText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  exportDetailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4ECDC4',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 30,
    paddingVertical: 16,
    borderRadius: 25,
  },
  exportDetailButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});