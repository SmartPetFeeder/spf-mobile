import { BORDER_RADIUS, COLORS, SHADOWS, SPACING } from '@/constants/ThemeColors';
import { useAuth } from '@/hooks/useAuth';
import { Animal, CurrentStats, Statistic } from '@/types';
import { animalsApi, statisticsApi } from '@/utils/BaseAPI';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function AnalysisScreen() {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('Jour');
  const today = new Date();
  const dayNames = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  const monthNames = [
    'Janvier',
    'Février',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
    'Juillet',
    'Août',
    'Septembre',
    'Octobre',
    'Novembre',
    'Décembre',
  ];
  const currentDateStr = `${dayNames[today.getDay()]} ${today.getDate()} ${monthNames[today.getMonth()]}`;

  const [selectedDate, setSelectedDate] = useState(currentDateStr);
  const [selectedAnimal, setSelectedAnimal] = useState('Tous');
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [statistics, setStatistics] = useState<Statistic[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentStats, setCurrentStats] = useState<CurrentStats>({
    meals: '0/0',
    consumed: '0g',
    speed: '0g/min',
    goal: '0%',
    totalDistributed: 0,
    averageTime: 0,
    successRate: 100,
  });

  const periods = ['Jour', 'Semaine', 'Mois', 'Année'];
  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  const calculatePeriodStats = useCallback((statsData: Statistic[]): CurrentStats => {
    if (statsData.length === 0) {
      return {
        meals: '0/0',
        consumed: '0g',
        speed: '0g/min',
        goal: '0%',
        totalDistributed: 0,
        averageTime: 0,
        successRate: 100,
      };
    }

    const totalConsumed = statsData.reduce(
      (sum: number, stat) => sum + (stat.totalConsumed || 0),
      0,
    );
    const totalDistributed = statsData.reduce(
      (sum: number, stat) => sum + (stat.totalDistributed || 0),
      0,
    );
    const totalMeals = statsData.reduce((sum: number, stat) => sum + (stat.mealsCount || 0), 0);
    const averageTime =
      statsData.reduce((sum: number, stat) => sum + (stat.averageConsumptionTime || 0), 0) /
      statsData.length;
    const averageRegularity =
      statsData.reduce((sum: number, stat) => sum + (stat.regularity || 0), 0) / statsData.length;

    // Calcul de la vitesse moyenne (g/min)
    const speed = averageTime > 0 ? (totalConsumed / totalMeals / averageTime).toFixed(1) : 0;

    // Taux de réussite basé sur consumed/distributed
    const successRate =
      totalDistributed > 0 ? Math.round((totalConsumed / totalDistributed) * 100) : 100;

    return {
      meals: `${totalMeals}/${totalMeals}`, // Ajuster selon la logique métier
      consumed: `${totalConsumed}g`,
      speed: `${speed}g/min`,
      goal: `${Math.round(averageRegularity)}%`,
      totalDistributed,
      averageTime: Math.round(averageTime),
      successRate,
    };
  }, []);

  const processStatistics = useCallback(
    (statsData: Statistic[]) => {
      console.log('[Analysis] Traitement des stats - données reçues:', statsData);
      console.log('[Analysis] Animal sélectionné:', selectedAnimal);

      if (statsData.length === 0) {
        console.warn('[Analysis] Aucune statistique disponible');
        setCurrentStats({
          meals: '0/0',
          consumed: '0g',
          speed: '0g/min',
          goal: '0%',
          totalDistributed: 0,
          averageTime: 0,
          successRate: 100,
        });
        return;
      }

      // Filtrer par animal si sélectionné
      let filteredStats = statsData;
      if (selectedAnimal !== 'Tous') {
        const selectedAnimalData = animals.find((a) => a.name === selectedAnimal);
        console.log('[Analysis] Animal sélectionné:', selectedAnimalData);
        if (selectedAnimalData) {
          filteredStats = statsData.filter((s) => s.animalId === selectedAnimalData.id);
        }
      }

      console.log('[Analysis] Stats filtrées:', filteredStats);

      // Calculer les statistiques selon la période
      let processedStats = calculatePeriodStats(filteredStats);
      console.log('[Analysis] Stats calculées:', processedStats);

      setCurrentStats(processedStats);
    },
    [animals, selectedAnimal, calculatePeriodStats],
  );

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      console.log("[Analysis] Début du chargement des données pour l'utilisateur:", user?.id);

      // Charger les animaux et statistiques de l'utilisateur courant
      const animalsData = user?.id
        ? await animalsApi.getByUser(user.id)
        : await animalsApi.getAll();

      const statsData = user?.id
        ? await statisticsApi.getByUser(user.id)
        : await statisticsApi.getAll();

      console.log('[Analysis] Animaux chargés:', animalsData);
      console.log('[Analysis] Statistiques chargées:', statsData);

      setAnimals(animalsData || []);
      setStatistics(statsData || []);

      console.log('[Analysis] Chargement réussi');
    } catch (error) {
      console.error('[Analysis] Erreur:', error);
      Alert.alert('Erreur', "Impossible de charger les données d'analyse");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Charger les données au montage du composant uniquement
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Traiter les statistiques quand les filtres ou les données changent
  useEffect(() => {
    if (statistics.length === 0) {
      console.warn('[Analysis] Aucune statistique disponible');
      setCurrentStats({
        meals: '0/0',
        consumed: '0g',
        speed: '0g/min',
        goal: '0%',
        totalDistributed: 0,
        averageTime: 0,
        successRate: 100,
      });
      return;
    }

    console.log('[Analysis] Traitement des stats - données:', statistics);
    console.log('[Analysis] Animal sélectionné:', selectedAnimal);

    // Filtrer par animal si sélectionné
    let filteredStats = statistics;
    if (selectedAnimal !== 'Tous') {
      const selectedAnimalData = animals.find((a) => a.name === selectedAnimal);
      if (selectedAnimalData) {
        filteredStats = statistics.filter((s) => s.animalId === selectedAnimalData.id);
      }
    }

    console.log('[Analysis] Stats filtrées:', filteredStats);

    // Calculer les statistiques selon la période
    const processedStats = calculatePeriodStats(filteredStats);
    console.log('[Analysis] Stats calculées:', processedStats);

    setCurrentStats(processedStats);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statistics, selectedAnimal, animals]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const exportData = async () => {
    try {
      // Simuler l'exportation des données
      // En production, ici on enverrait les données à un service d'exportation
      Alert.alert(
        'Exportation réussie',
        `Les données ${selectedPeriod.toLowerCase()} ont été exportées avec succès.\n\nPériode: ${selectedPeriod}\nAnimal: ${selectedAnimal}\nConsommation: ${currentStats.consumed}`,
        [{ text: 'OK' }],
      );
    } catch {
      Alert.alert('Erreur', "Erreur lors de l'exportation des données");
    }
  };

  const navigateDate = (direction: 'previous' | 'next') => {
    const newDate = new Date(today);

    if (direction === 'previous') {
      if (selectedPeriod === 'Jour') {
        newDate.setDate(today.getDate() - 1);
      } else if (selectedPeriod === 'Semaine') {
        newDate.setDate(today.getDate() - 7);
      } else if (selectedPeriod === 'Mois') {
        newDate.setMonth(today.getMonth() - 1);
      } else if (selectedPeriod === 'Année') {
        newDate.setFullYear(today.getFullYear() - 1);
      }
    } else {
      if (selectedPeriod === 'Jour') {
        newDate.setDate(today.getDate() + 1);
      } else if (selectedPeriod === 'Semaine') {
        newDate.setDate(today.getDate() + 7);
      } else if (selectedPeriod === 'Mois') {
        newDate.setMonth(today.getMonth() + 1);
      } else if (selectedPeriod === 'Année') {
        newDate.setFullYear(today.getFullYear() + 1);
      }
    }

    const newDateStr = `${dayNames[newDate.getDay()]} ${newDate.getDate()} ${monthNames[newDate.getMonth()]}`;
    setSelectedDate(newDateStr);
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {/* Sélecteur de période */}
        <View style={styles.periodSelector}>
          {periods.map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.selectedPeriodButton,
              ]}
              onPress={() => setSelectedPeriod(period)}>
              <Text
                style={[styles.periodText, selectedPeriod === period && styles.selectedPeriodText]}>
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
                selectedAnimal === 'Tous' && styles.selectedAnimalButton,
              ]}
              onPress={() => setSelectedAnimal('Tous')}>
              <Text
                style={[
                  styles.animalButtonText,
                  selectedAnimal === 'Tous' && styles.selectedAnimalButtonText,
                ]}>
                Tous
              </Text>
            </TouchableOpacity>
            {animals.map((animal) => (
              <TouchableOpacity
                key={animal.id}
                style={[
                  styles.animalButton,
                  selectedAnimal === animal.name && styles.selectedAnimalButton,
                ]}
                onPress={() => setSelectedAnimal(animal.name)}>
                <Text
                  style={[
                    styles.animalButtonText,
                    selectedAnimal === animal.name && styles.selectedAnimalButtonText,
                  ]}>
                  {animal.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Navigation de date */}
        <View style={styles.dateContainer}>
          <TouchableOpacity style={styles.dateNavButton} onPress={() => navigateDate('previous')}>
            <Text style={styles.dateNavIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.dateText}>{selectedDate}</Text>
          <TouchableOpacity style={styles.dateNavButton} onPress={() => navigateDate('next')}>
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
                        backgroundColor: index === 1 ? '#007AFF' : '#4ECDC4', // Highlight mardi
                      },
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
            <Text
              style={[
                styles.detailValue,
                {
                  color:
                    currentStats.successRate >= 90
                      ? '#4CD964'
                      : currentStats.successRate >= 70
                        ? '#FF9500'
                        : '#FF3B30',
                },
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
                  ? 'Excellent! Vos animaux consomment régulièrement leur nourriture.'
                  : currentStats.successRate >= 70
                    ? "Bon rythme de consommation, mais il y a de la marge d'amélioration."
                    : 'Attention: taux de consommation faible. Vérifiez la santé de vos animaux.'}
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
                    : 'Vitesse de consommation normale et saine.'}
              </Text>
            </View>
          </View>

          {selectedAnimal !== 'Tous' && (
            <View style={styles.insightCard}>
              <Ionicons name="heart" size={24} color="#FF3B30" />
              <View style={styles.insightContent}>
                <Text style={styles.insightText}>
                  Conseils personnalisés pour {selectedAnimal} :
                  {parseInt(currentStats.goal) >= 90
                    ? ' Continuez cette excellente routine !'
                    : " Essayez d'établir des horaires plus réguliers."}
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
    backgroundColor: COLORS.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  header: {
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: 60,
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  exportButton: {
    padding: SPACING.sm,
  },
  content: {
    flex: 1,
  },
  periodSelector: {
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.lg,
    marginTop: SPACING.md,
  },
  periodButton: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.border,
  },
  selectedPeriodButton: {
    backgroundColor: COLORS.secondary,
  },
  periodText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  selectedPeriodText: {
    color: COLORS.white,
  },
  animalSelector: {
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.lg,
    marginTop: SPACING.sm,
  },
  animalButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.medium,
    backgroundColor: COLORS.border,
    marginLeft: SPACING.md,
  },
  selectedAnimalButton: {
    backgroundColor: COLORS.accent,
  },
  animalButtonText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  selectedAnimalButtonText: {
    color: COLORS.white,
  },
  dateContainer: {
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    marginTop: SPACING.sm,
  },
  dateNavButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateNavIcon: {
    fontSize: 18,
    color: COLORS.accent,
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  summaryContainer: {
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.xl,
    marginTop: SPACING.md,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: SPACING.xl,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  chartContainer: {
    backgroundColor: COLORS.white,
    marginTop: SPACING.md,
    paddingVertical: SPACING.xl,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  chartArea: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.xl,
    height: 120,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 20,
    borderRadius: 10,
    marginBottom: SPACING.md,
  },
  barLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  detailsContainer: {
    backgroundColor: COLORS.white,
    marginTop: SPACING.md,
    paddingVertical: SPACING.xl,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  detailCard: {
    marginHorizontal: SPACING.xl,
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.medium,
    ...SHADOWS.small,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  detailCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: SPACING.md,
  },
  detailValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.accent,
    marginBottom: SPACING.sm,
  },
  detailDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  insightsContainer: {
    backgroundColor: COLORS.white,
    marginTop: SPACING.md,
    paddingVertical: SPACING.xl,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: SPACING.xl,
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.medium,
    ...SHADOWS.small,
  },
  insightContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  insightText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  exportDetailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondary,
    marginHorizontal: SPACING.xl,
    marginTop: SPACING.xl,
    marginBottom: 30,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.round,
    ...SHADOWS.small,
  },
  exportDetailButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: SPACING.md,
  },
});
