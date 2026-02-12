import { BORDER_RADIUS, COLORS, SHADOWS, SPACING } from '@/constants/ThemeColors';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import {
  animalsApi,
  distributorApi,
  mealsApi,
  notificationsApi,
  statisticsApi,
} from '@/utils/BaseAPI';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
export default function HomeScreen() {
  const router = useRouter();
  const { notifyMealDistributed, notifyLowFood } = useNotifications();
  const { user } = useAuth();
  const [animals, setAnimals] = useState<any[]>([]);
  const [distributorStatus, setDistributorStatus] = useState<any[]>([]);
  const [nextMeal, setNextMeal] = useState<any>(null);
  const [nextMealsByDistributor, setNextMealsByDistributor] = useState<any[]>([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  // Recharger le nombre de notifications quand l'écran est visible
  useFocusEffect(
    useCallback(() => {
      loadUnreadNotificationsCount();
    }, [user?.id]),
  );

  const loadUnreadNotificationsCount = async () => {
    try {
      if (!user?.id) return;
      const allNotifications = await notificationsApi.getByUser(user.id);
      const unreadCount = allNotifications.filter((n: any) => !n.read && !n.deleted).length;
      setUnreadNotificationsCount(unreadCount);
    } catch (error) {
      console.error('[Home] Erreur chargement notifications:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      console.log("[Home] Début du chargement des données pour l'utilisateur:", user?.id);

      // Charger les données de l'utilisateur courant
      const animalsData = user?.id
        ? await animalsApi.getByUser(user.id)
        : await animalsApi.getAll();

      const statusData = user?.id
        ? await distributorApi.getByUser(user.id)
        : await distributorApi.getStatus();

      const mealsData = user?.id ? await mealsApi.getByUser(user.id) : await mealsApi.getAll();

      const statsData = user?.id
        ? await statisticsApi.getByUser(user.id)
        : await statisticsApi.getAll();

      console.log('[Home] Animaux chargés:', animalsData);
      console.log('[Home] État distributeur:', statusData);
      console.log('[Home] Repas chargés:', mealsData);
      console.log('[Home] Statistiques:', statsData);

      setAnimals(animalsData || []);
      setDistributorStatus(statusData || []);

      // Traiter le prochain repas par mangoire
      if (mealsData && mealsData.length > 0 && statusData && statusData.length > 0) {
        const enabledMeals = mealsData.filter((meal) => meal.enabled);
        const now = new Date();
        const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        // Créer une map des prochains repas par mangoire
        const nextMealsByDist = [];

        statusData.forEach((distributor) => {
          // Trouver tous les repas pour cette mangoire
          const mealsForDistributor = enabledMeals
            .filter((meal: any) => meal.distributorId === distributor.id)
            .sort((a: any, b: any) => a.time.localeCompare(b.time));

          if (mealsForDistributor.length > 0) {
            // Chercher le prochain repas après l'heure actuelle
            let nextMealData = mealsForDistributor.find((meal: any) => meal.time > currentTimeStr);

            // Si aucun repas après maintenant, prendre le premier
            if (!nextMealData) {
              nextMealData = mealsForDistributor[0];
            }

            // Obtenir l'animal via la mangeoire (pas via le repas)
            const animal = animalsData.find((a: any) => a.id === distributor.animalId);
            const animalName = animal ? animal.name : 'Animal inconnu';

            nextMealsByDist.push({
              distributorId: distributor.id,
              distributorName: distributor.name,
              time: nextMealData.time,
              meal: nextMealData.name,
              amount: `${nextMealData.quantity}g`,
              animal: animalName,
              mealId: nextMealData.id,
            });
          }
        });

        setNextMealsByDistributor(nextMealsByDist);

        // Garder le premier pour compatibilité avec l'ancien code
        if (nextMealsByDist.length > 0) {
          setNextMeal(nextMealsByDist[0]);
        } else {
          setNextMeal(null);
        }

        console.log('[Home] Prochains repas par mangoire:', nextMealsByDist);
      } else {
        setNextMealsByDistributor([]);
        setNextMeal(null);
        console.log('[Home] Aucun repas ou mangoire disponible');
      }

      // Traiter les statistiques
      if (statsData && statsData.length > 0) {
        const todayStats = statsData[0];
        setStats({
          consumption: `${todayStats.totalConsumed}g`,
          regularity: `${todayStats.regularity}%`,
        });
        console.log(
          '[Home] Stats du jour - Consommation:',
          todayStats.totalConsumed,
          'Régularité:',
          todayStats.regularity,
        );
      } else {
        setStats({
          consumption: '0g',
          regularity: '0%',
        });
        console.log('[Home] Aucune statistique disponible');
      }

      console.log('[Home] Chargement réussi');
    } catch (error) {
      console.error('[Home] Erreur lors du chargement:', error);
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

  const handleDistributeNow = async (mealId) => {
    Alert.alert('Distribution immédiate', 'Voulez-vous distribuer ce repas maintenant ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Distribuer',
        onPress: async () => {
          try {
            // Enregistrer la distribution
            await mealsApi.distributeNow();

            // Créer une entrée de distribution
            const now = new Date().toISOString();
            const distribution = {
              mealId,
              timestamp: now,
              success: true,
            };

            console.log('[Home] Distribution enregistrée:', distribution);

            // Notifier l'utilisateur
            await notifyMealDistributed('Animal', 'Distribution immédiate', 60);
            Alert.alert('Succès', 'Repas distribué avec succès!');

            // Recharger les données pour afficher le prochain repas
            await loadData();
          } catch (error) {
            console.error('[Home] Erreur lors de la distribution:', error);
            Alert.alert('Erreur', error.message || 'Erreur lors de la distribution');
          }
        },
      },
    ]);
  };

  const formatLastRefill = (dateString) => {
    if (!dateString) return 'Inconnu';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Aujourd'hui";
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
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>Bonjour{user?.name ? ` ${user.name}` : ''}</Text>
          <Text style={styles.subGreeting}>Gérez vos animaux en toute simplicité</Text>
        </View>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => {
            router.push('/modals/notifications');
            // Réinitialiser le compteur après avoir cliqué
            setUnreadNotificationsCount(0);
          }}>
          <Ionicons name="notifications" size={24} color="#333" />
          {unreadNotificationsCount > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>
                {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
              </Text>
            </View>
          )}
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
                <Text
                  style={[
                    styles.animalType,
                    {
                      color:
                        animal.type === 'Chien'
                          ? '#007AFF'
                          : animal.type === 'Chat'
                            ? '#FF6B6B'
                            : '#4ECDC4',
                    },
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
              onPress={() => router.push('/animal-management')}>
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
                  <View
                    style={[
                      styles.connectionIndicator,
                      { backgroundColor: distributor.connected ? '#4CD964' : '#FF3B30' },
                    ]}
                  />
                </View>

                <View style={styles.distributorContent}>
                  <View style={styles.levelContainer}>
                    <Text style={styles.levelLabel}>Niveau</Text>
                    <Text
                      style={[
                        styles.levelValue,
                        { color: distributor.currentLevel < 30 ? '#FF3B30' : '#4CD964' },
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
                          backgroundColor: distributor.currentLevel < 30 ? '#FF3B30' : '#4CD964',
                        },
                      ]}
                    />
                  </View>

                  <View style={styles.distributorStats}>
                    <Text style={styles.statText}>Autonomie: {distributor.autonomyDays} jours</Text>
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
              onPress={() => router.push('/distributor-management')}>
              <Text style={styles.emptyButtonText}>Ajouter une mangeoire</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Prochain repas */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Prochains repas par mangoire</Text>
          <TouchableOpacity onPress={() => router.push('/modals/add-meal')}>
            <Text style={styles.seeAll}>Ajouter</Text>
          </TouchableOpacity>
        </View>

        {nextMealsByDistributor.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.mealsScrollView}>
            {nextMealsByDistributor.map((meal) => (
              <View key={meal.distributorId} style={styles.nextMealCard}>
                {/* En-tête avec icône mangoire */}
                <View style={styles.mealCardHeader}>
                  <View style={styles.distributorIconContainer}>
                    <Text style={styles.distributorIcon}>🍽️</Text>
                  </View>
                  <View style={styles.distributorInfo}>
                    <Text style={styles.nextMealDistributorName} numberOfLines={1}>
                      {meal.distributorName}
                    </Text>
                    <View style={styles.mealTimeRow}>
                      <Text style={styles.timeIcon}>🕐</Text>
                      <Text style={styles.nextMealTimeText}>{meal.time}</Text>
                    </View>
                  </View>
                </View>

                {/* Détails du repas */}
                <View style={styles.mealCardDetails}>
                  {/* Animal */}
                  <View style={styles.detailRow}>
                    <Text style={styles.detailIcon}>
                      {meal.animal.includes('Chien')
                        ? '🐕'
                        : meal.animal.includes('Chat')
                          ? '🐱'
                          : '🐰'}
                    </Text>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Animal</Text>
                      <Text style={styles.detailValue}>{meal.animal}</Text>
                    </View>
                  </View>

                  {/* Repas */}
                  <View style={styles.detailRow}>
                    <Text style={styles.detailIcon}>🍖</Text>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Repas</Text>
                      <Text style={styles.detailValue} numberOfLines={1}>
                        {meal.meal}
                      </Text>
                    </View>
                  </View>

                  {/* Quantité */}
                  <View style={styles.detailRow}>
                    <Text style={styles.detailIcon}>📦</Text>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Quantité</Text>
                      <Text style={styles.detailValue}>{meal.amount}</Text>
                    </View>
                  </View>
                </View>

                {/* Bouton de distribution */}
                <TouchableOpacity
                  style={styles.distributeButtonLarge}
                  onPress={() => handleDistributeNow(meal.mealId)}>
                  <Ionicons name="play" size={18} color="#fff" />
                  <Text style={styles.distributeButtonText}>Distribuer</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🍽️</Text>
            <Text style={styles.emptyText}>Aucun repas programmé</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.push('/modals/add-meal')}>
              <Text style={styles.emptyButtonText}>Ajouter un repas</Text>
            </TouchableOpacity>
          </View>
        )}
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
            onPress={() => router.push('/modals/add-animal')}>
            <Ionicons name="paw" size={24} color="#007AFF" />
            <Text style={styles.quickActionText}>Animal</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => router.push('/modals/add-distributor')}>
            <Ionicons name="hardware-chip" size={24} color="#007AFF" />
            <Text style={styles.quickActionText}>Distributeur</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => router.push('/modals/add-meal')}>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: SPACING.xl,
    paddingTop: 60,
    paddingBottom: SPACING.lg,
    backgroundColor: COLORS.white,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  subGreeting: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  notificationButton: {
    position: 'relative',
    padding: 10,
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    backgroundColor: COLORS.danger,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: COLORS.white,
    marginTop: 10,
    paddingVertical: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  seeAll: {
    fontSize: 14,
    color: COLORS.accent,
    fontWeight: '500',
  },
  animalCard: {
    alignItems: 'center',
    marginLeft: SPACING.xl,
    width: 120,
  },
  animalPhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    overflow: 'hidden',
    ...SHADOWS.medium,
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
    color: COLORS.text,
    marginBottom: 4,
  },
  animalType: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  animalWeight: {
    fontSize: 12,
    color: COLORS.textTertiary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: SPACING.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 20,
    textAlign: 'center',
  },
  emptyButton: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: BORDER_RADIUS.round,
    ...SHADOWS.small,
  },
  emptyButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '500',
  },
  distributorCard: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: BORDER_RADIUS.medium,
    padding: SPACING.lg,
    marginLeft: SPACING.xl,
    minWidth: 200,
    ...SHADOWS.medium,
  },
  distributorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  distributorLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
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
    color: COLORS.textSecondary,
  },
  levelValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  levelBar: {
    height: 6,
    backgroundColor: COLORS.border,
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
    color: COLORS.textSecondary,
  },
  nextMealCard: {
    backgroundColor: COLORS.white,
    marginLeft: SPACING.xl,
    marginRight: SPACING.sm,
    borderRadius: BORDER_RADIUS.large,
    padding: SPACING.lg,
    minWidth: 280,
    borderWidth: 2,
    borderColor: COLORS.primary,
    ...SHADOWS.medium,
  },
  mealsScrollView: {
    paddingVertical: 8,
  },
  mealCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  distributorIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.medium,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  distributorIcon: {
    fontSize: 24,
  },
  distributorInfo: {
    flex: 1,
  },
  nextMealDistributorName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  mealTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  nextMealTimeText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  mealCardDetails: {
    gap: 10,
    marginBottom: 14,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIcon: {
    fontSize: 18,
    marginRight: 8,
    width: 24,
    textAlign: 'center',
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: COLORS.textTertiary,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 2,
  },
  distributeButtonLarge: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.medium,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
    ...SHADOWS.primary,
  },
  distributeButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },
  nextMealContent: {
    flex: 1,
  },
  nextMealAnimal: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.accent,
    marginBottom: 2,
  },
  nextMealDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  nextMealAmount: {
    fontSize: 11,
    color: COLORS.textTertiary,
    marginTop: 3,
  },
  distributeButtonMini: {
    backgroundColor: COLORS.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  distributeButton: {
    backgroundColor: COLORS.primary,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.xl,
    gap: SPACING.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.primaryLight,
    borderRadius: BORDER_RADIUS.medium,
    padding: SPACING.lg,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: SPACING.md,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.xl,
    gap: SPACING.lg,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: COLORS.primaryLight,
    borderRadius: BORDER_RADIUS.medium,
    padding: SPACING.lg,
    alignItems: 'center',
    gap: SPACING.md,
    ...SHADOWS.small,
  },
  quickActionText: {
    fontSize: 12,
    color: COLORS.accent,
    fontWeight: '500',
  },
});
