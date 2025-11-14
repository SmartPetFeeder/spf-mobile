import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  Switch 
} from 'react-native';
import { useRouter } from 'expo-router';
import { planningApi } from '@/utils/BaseAPI';

export default function PlanningScreen() {
  const router = useRouter();
  const [applyToAllDays, setApplyToAllDays] = useState(true);
  const [selectedDay, setSelectedDay] = useState(1);
  const [meals, setMeals] = useState([
    { id: 1, name: 'Petit déjeuner', time: '08:00', amount: '40g', enabled: true },
    { id: 2, name: 'Déjeuner', time: '12:30', amount: '60g', enabled: true },
    { id: 3, name: 'Dîner', time: '19:00', amount: '60g', enabled: false },
  ]);

  const days = [
    { label: 'LUN', value: 0 },
    { label: 'MAR', value: 1 },
    { label: 'MER', value: 2 },
    { label: 'JEU', value: 3 },
    { label: 'VEN', value: 4 },
    { label: 'SAM', value: 5 },
    { label: 'DIM', value: 6 },
  ];

  const toggleMeal = (mealId: number) => {
    setMeals(meals.map(meal => 
      meal.id === mealId ? { ...meal, enabled: !meal.enabled } : meal
    ));
  };

  const savePlanning = async () => {
    try {
      await planningApi.update({
        applyToAllDays,
        selectedDay,
        meals: meals.filter(meal => meal.enabled),
      });

      Alert.alert('Succès', 'Planning sauvegardé avec succès');
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Erreur lors de la sauvegarde');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Planning</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.optionContainer}>
          <Text style={styles.optionText}>Appliquer ce planning à tous les jours</Text>
          <Switch
            value={applyToAllDays}
            onValueChange={setApplyToAllDays}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={applyToAllDays ? '#007AFF' : '#f4f3f4'}
          />
        </View>

        <View style={styles.daysContainer}>
          {days.map((day) => (
            <TouchableOpacity
              key={day.value}
              style={[
                styles.dayButton,
                selectedDay === day.value && styles.selectedDayButton
              ]}
              onPress={() => setSelectedDay(day.value)}
            >
              <Text style={[
                styles.dayText,
                selectedDay === day.value && styles.selectedDayText
              ]}>
                {day.label}
              </Text>
              <Text style={[
                styles.dayNumber,
                selectedDay === day.value && styles.selectedDayNumber
              ]}>
                {22 + day.value}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.mealsContainer}>
          {meals.map((meal, index) => (
            <View key={meal.id} style={styles.mealItem}>
              <View style={styles.mealNumber}>
                <Text style={styles.mealNumberText}>{index + 1}</Text>
              </View>
              <View style={styles.mealDetails}>
                <Text style={styles.mealName}>{meal.name}</Text>
                <Text style={styles.mealInfo}>{meal.time} • {meal.amount}</Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.mealToggle,
                  meal.enabled && styles.mealToggleEnabled
                ]}
                onPress={() => toggleMeal(meal.id)}
              >
                <View style={[
                  styles.mealToggleInner,
                  meal.enabled && styles.mealToggleInnerEnabled
                ]} />
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity 
            style={styles.addMealButton}
            onPress={() => router.push('/modals/add-meal')}
          >
            <Text style={styles.addMealText}>+ Ajouter un repas</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={savePlanning}>
          <Text style={styles.saveButtonText}>Enregistrer les modifications</Text>
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
  header: {
    backgroundColor: '#fff',
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
  content: {
    flex: 1,
  },
  optionContainer: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginTop: 10,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  daysContainer: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    marginTop: 10,
  },
  dayButton: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  selectedDayButton: {
    backgroundColor: '#4ECDC4',
  },
  dayText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  selectedDayText: {
    color: '#fff',
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  selectedDayNumber: {
    color: '#fff',
  },
  mealsContainer: {
    backgroundColor: '#fff',
    marginTop: 10,
    paddingVertical: 20,
  },
  mealItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  mealNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4ECDC4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  mealNumberText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  mealDetails: {
    flex: 1,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  mealInfo: {
    fontSize: 14,
    color: '#666',
  },
  mealToggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  mealToggleEnabled: {
    backgroundColor: '#4ECDC4',
  },
  mealToggleInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  mealToggleInnerEnabled: {
    alignSelf: 'flex-end',
  },
  addMealButton: {
    marginHorizontal: 20,
    marginTop: 16,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: '#4ECDC4',
    borderStyle: 'dashed',
    borderRadius: 12,
    alignItems: 'center',
  },
  addMealText: {
    fontSize: 16,
    color: '#4ECDC4',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#FF6B35',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 30,
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});