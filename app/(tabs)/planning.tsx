import { BORDER_RADIUS, COLORS, SHADOWS, SPACING } from '@/constants/ThemeColors';
import { useAuth } from '@/hooks/useAuth';
import { animalsApi, mealsApi, planningApi } from '@/utils/BaseAPI';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function PlanningScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [applyToAllDays, setApplyToAllDays] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [meals, setMeals] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  // Fonctions utilitaires pour le calendrier
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

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
  const dayLabels = ['DIM', 'LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM'];

  // Générer les jours du calendrier
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Jours vides avant le 1er du mois
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Jours du mois
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const isSelectedDate = (day: number | null) => {
    if (!day) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentMonth.getMonth() &&
      selectedDate.getFullYear() === currentMonth.getFullYear()
    );
  };

  const selectDate = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelectedDate(newDate);
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const goToToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setCurrentMonth(today);
  };

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, []),
  );

  const loadData = async () => {
    try {
      setLoading(true);
      console.log("[Planning] Début du chargement des données pour l'utilisateur:", user?.id);

      // Charger les repas de l'utilisateur courant
      const mealsData = user?.id ? await mealsApi.getByUser(user.id) : await mealsApi.getAll();

      const animalsData = user?.id
        ? await animalsApi.getByUser(user.id)
        : await animalsApi.getAll();

      const planningData = await planningApi.getAll();

      console.log('[Planning] Repas chargés:', mealsData);
      console.log('[Planning] Planning chargé:', planningData);
      console.log('[Planning] Animaux chargés:', animalsData);

      setMeals(mealsData || []);
      setAnimals(animalsData || []);

      // Charger les paramètres du planning
      if (planningData) {
        setApplyToAllDays(planningData.applyToAllDays !== false);
        if (planningData.selectedDate) {
          setSelectedDate(new Date(planningData.selectedDate));
          setCurrentMonth(new Date(planningData.selectedDate));
        }
      }

      console.log('[Planning] Chargement réussi');
    } catch (error) {
      console.error('[Planning] Erreur:', error);
      Alert.alert('Erreur', 'Impossible de charger le planning');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getAnimalName = (animalId: number) => {
    const animal = animals.find((a) => a.id === animalId);
    return animal ? animal.name : 'Inconnu';
  };

  const toggleMeal = async (mealId: number) => {
    const updatedMeals = meals.map((meal) =>
      meal.id === mealId ? { ...meal, enabled: !meal.enabled } : meal,
    );
    setMeals(updatedMeals);

    // Sauvegarder immédiatement le changement
    try {
      const mealToUpdate = updatedMeals.find((m) => m.id === mealId);
      if (mealToUpdate) {
        console.log('[Planning] Mise à jour du repas:', mealToUpdate);
        await mealsApi.update(mealId, mealToUpdate);
        console.log('[Planning] Repas mis à jour avec succès');
      }
    } catch (error) {
      console.error('[Planning] Erreur lors de la mise à jour:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour le repas');
      // Revenir à l'état précédent
      await loadData();
    }
  };

  const savePlanning = async () => {
    try {
      console.log('[Planning] Début de la sauvegarde...');

      const planningData = {
        id: 1, // L'ID du planning (généralement 1 pour une single resource)
        applyToAllDays,
        selectedDate: selectedDate.toISOString(),
        meals: meals.filter((meal) => meal.enabled).map((meal) => meal.id),
      };

      console.log('[Planning] Données à sauvegarder:', planningData);

      // PUT /planning/1 pour mettre à jour la ressource
      await planningApi.update(1, planningData);

      console.log('[Planning] Sauvegarde réussie');
      Alert.alert('Succès', 'Planning sauvegardé avec succès');
    } catch (error: any) {
      console.error('[Planning] Erreur sauvegarde:', error);
      Alert.alert('Erreur', error.message || 'Erreur lors de la sauvegarde');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Planning</Text>
      </View>

      {loading ? (
        <View style={[styles.content, styles.centerContent]}>
          <ActivityIndicator size="large" color="#4ECDC4" />
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
          <View style={styles.optionContainer}>
            <Text style={styles.optionText}>Appliquer ce planning à tous les jours</Text>
            <Switch
              value={applyToAllDays}
              onValueChange={setApplyToAllDays}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={applyToAllDays ? '#007AFF' : '#f4f3f4'}
            />
          </View>

          {/* Calendrier */}
          <View style={styles.calendarContainer}>
            <View style={styles.calendarHeader}>
              <TouchableOpacity onPress={goToPreviousMonth}>
                <Text style={styles.calendarNav}>←</Text>
              </TouchableOpacity>
              <Text style={styles.calendarTitle}>
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </Text>
              <TouchableOpacity onPress={goToNextMonth}>
                <Text style={styles.calendarNav}>→</Text>
              </TouchableOpacity>
            </View>

            {/* Jours de la semaine */}
            <View style={styles.weekDaysContainer}>
              {dayLabels.map((day) => (
                <Text key={day} style={styles.weekDayLabel}>
                  {day}
                </Text>
              ))}
            </View>

            {/* Jours du mois */}
            <View style={styles.calendarGrid}>
              {generateCalendarDays().map((day, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.calendarDay,
                    day && isSelectedDate(day) && styles.calendarDaySelected,
                    !day && styles.calendarDayEmpty,
                  ]}
                  onPress={() => day && selectDate(day)}
                  disabled={!day}>
                  <Text
                    style={[
                      styles.calendarDayText,
                      day && isSelectedDate(day) && styles.calendarDayTextSelected,
                    ]}>
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Bouton "Aujourd'hui" */}
            <TouchableOpacity style={styles.todayButton} onPress={goToToday}>
              <Text style={styles.todayButtonText}>
                📅 {selectedDate.getDate()} {monthNames[selectedDate.getMonth()]}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Liste des repas */}
          <View style={styles.mealsContainer}>
            {meals.length > 0 ? (
              <>
                {meals.map((meal, index) => (
                  <View key={meal.id} style={styles.mealItem}>
                    <View style={styles.mealNumber}>
                      <Text style={styles.mealNumberText}>{index + 1}</Text>
                    </View>
                    <View style={styles.mealDetails}>
                      <Text style={styles.mealName}>{meal.name}</Text>
                      <Text style={styles.mealInfo}>
                        {getAnimalName(meal.animalId)} • {meal.time} •{' '}
                        {meal.quantity || meal.amount || '0'}g
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.mealToggle, meal.enabled && styles.mealToggleEnabled]}
                      onPress={() => toggleMeal(meal.id)}>
                      <View
                        style={[
                          styles.mealToggleInner,
                          meal.enabled && styles.mealToggleInnerEnabled,
                        ]}
                      />
                    </TouchableOpacity>
                  </View>
                ))}
              </>
            ) : (
              <Text style={styles.noMealsText}>Aucun repas configuré</Text>
            )}

            <TouchableOpacity
              style={styles.addMealButton}
              onPress={() => router.push('/modals/add-meal')}>
              <Text style={styles.addMealText}>+ Ajouter un repas</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={savePlanning}>
            <Text style={styles.saveButtonText}>Enregistrer les modifications</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.white,
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
  content: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionContainer: {
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    marginTop: 10,
  },
  optionText: {
    fontSize: 16,
    color: COLORS.text,
  },
  calendarContainer: {
    backgroundColor: COLORS.white,
    marginTop: 10,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  calendarNav: {
    fontSize: 24,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  weekDaysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekDayLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    width: '14.28%',
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.small,
    marginBottom: 4,
  },
  calendarDayEmpty: {
    opacity: 0,
  },
  calendarDaySelected: {
    backgroundColor: COLORS.primary,
  },
  calendarDayText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  calendarDayTextSelected: {
    color: COLORS.white,
  },
  todayButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.medium,
    alignItems: 'center',
    ...SHADOWS.primary,
  },
  todayButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  mealsContainer: {
    backgroundColor: COLORS.white,
    marginTop: 10,
    paddingVertical: SPACING.lg,
  },
  mealItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.white,
    marginBottom: 4,
    marginHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.medium,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    ...SHADOWS.small,
  },
  mealNumber: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.lg,
    ...SHADOWS.small,
  },
  mealNumberText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  mealDetails: {
    flex: 1,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  mealInfo: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  mealToggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  mealToggleEnabled: {
    backgroundColor: COLORS.primary,
  },
  mealToggleInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.white,
  },
  mealToggleInnerEnabled: {
    alignSelf: 'flex-end',
  },
  noMealsText: {
    textAlign: 'center',
    color: COLORS.textTertiary,
    paddingVertical: SPACING.xl,
    fontSize: 14,
  },
  addMealButton: {
    marginHorizontal: SPACING.xl,
    marginTop: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    borderRadius: BORDER_RADIUS.medium,
    alignItems: 'center',
  },
  addMealText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    marginHorizontal: SPACING.xl,
    marginTop: SPACING.lg,
    marginBottom: 30,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.round,
    alignItems: 'center',
    ...SHADOWS.primary,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
