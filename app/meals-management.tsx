import { BORDER_RADIUS, COLORS, SHADOWS, SPACING } from '@/constants/ThemeColors';
import { useAuth } from '@/hooks/useAuth';
import { Distributor, Meal } from '@/types';
import { distributorApi, mealsApi } from '@/utils/BaseAPI';
import { Picker } from '@react-native-picker/picker';
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
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function MealsManagementScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingData, setEditingData] = useState<Meal | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, []),
  );

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('[MealsManagement] Chargement des données pour utilisateur:', user?.id);

      const [mealsData, distributorsData] = await Promise.all([
        user?.id ? mealsApi.getByUser(user.id) : mealsApi.getAll(),
        user?.id ? distributorApi.getByUser(user.id) : distributorApi.getStatus(),
      ]);

      console.log('[MealsManagement] Repas:', mealsData);
      console.log('[MealsManagement] Mangeoires:', distributorsData);

      setMeals(mealsData || []);
      setDistributors(distributorsData || []);
    } catch (error) {
      console.error('[MealsManagement] Erreur:', error);
      Alert.alert('Erreur', 'Impossible de charger les repas');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const startEdit = (meal: any) => {
    setEditingId(meal.id);
    setEditingData({ ...meal });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingData(null);
  };

  const saveEdit = async () => {
    if (!editingData?.name.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer le nom du repas');
      return;
    }

    if (!editingData?.quantity || editingData.quantity <= 0) {
      Alert.alert('Erreur', 'Veuillez entrer une quantité valide');
      return;
    }

    if (!editingId) return;

    try {
      console.log('[MealsManagement] Mise à jour du repas:', editingData);
      await mealsApi.update(editingId, editingData as Meal);
      console.log('[MealsManagement] Repas mis à jour avec succès');
      Alert.alert('Succès', 'Repas modifié avec succès');
      cancelEdit();
      await loadData();
    } catch (error) {
      console.error('[MealsManagement] Erreur de modification:', error);
      Alert.alert('Erreur', (error as Error).message || 'Erreur lors de la modification');
    }
  };

  const deleteMeal = async (id: number) => {
    Alert.alert('Confirmation', 'Êtes-vous sûr de vouloir supprimer ce repas ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            console.log('[MealsManagement] Suppression du repas:', id);
            await mealsApi.delete(id);
            console.log('[MealsManagement] Repas supprimé avec succès');
            Alert.alert('Succès', 'Repas supprimé avec succès');
            await loadData();
          } catch (error) {
            console.error('[MealsManagement] Erreur de suppression:', error);
            Alert.alert('Erreur', (error as Error).message || 'Erreur lors de la suppression');
          }
        },
      },
    ]);
  };

  const getDistributorName = (distributorId: number) => {
    const distributor = distributors.find((d) => d.id === distributorId);
    return distributor ? distributor.name : 'Inconnu';
  };

  const renderMealItem = (meal: Meal) => {
    if (editingId === meal.id) {
      return (
        <View key={meal.id} style={styles.editingCard}>
          <View style={styles.editingHeader}>
            <Text style={styles.editingTitle}>Modifier le repas</Text>
          </View>

          {editingData && (
            <View style={styles.editingContent}>
              <View style={styles.editingRow}>
                <Text style={styles.editingLabel}>Nom</Text>
                <TextInput
                  style={styles.editingInput}
                  value={editingData.name}
                  onChangeText={(text) => setEditingData({ ...editingData, name: text })}
                  placeholder="Nom du repas"
                />
              </View>

              <View style={styles.editingRow}>
                <Text style={styles.editingLabel}>Mangeoire</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={editingData.distributorId}
                    onValueChange={(distributorId) =>
                      setEditingData({ ...editingData, distributorId })
                    }>
                    {distributors.map((distributor: any) => (
                      <Picker.Item
                        key={distributor.id}
                        label={distributor.name}
                        value={distributor.id}
                      />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.editingRow}>
                <Text style={styles.editingLabel}>Heure</Text>
                <TextInput
                  style={styles.editingInput}
                  value={editingData.time}
                  onChangeText={(text) => setEditingData({ ...editingData, time: text })}
                  placeholder="HH:MM"
                />
              </View>

              <View style={styles.editingRow}>
                <Text style={styles.editingLabel}>Quantité (g)</Text>
                <TextInput
                  style={styles.editingInput}
                  value={editingData.quantity?.toString()}
                  onChangeText={(text) =>
                    setEditingData({ ...editingData, quantity: parseInt(text) || 0 })
                  }
                  placeholder="50"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.editingRow}>
                <Text style={styles.editingLabel}>Activé</Text>
                <Switch
                  value={editingData.enabled ?? true}
                  onValueChange={(value) => setEditingData({ ...editingData, enabled: value })}
                />
              </View>

              <View style={styles.editingButtons}>
                <TouchableOpacity style={styles.cancelButton} onPress={cancelEdit}>
                  <Text style={styles.cancelButtonText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveEditButton} onPress={saveEdit}>
                  <Text style={styles.saveEditButtonText}>Enregistrer</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      );
    }

    return (
      <View key={meal.id} style={styles.mealCard}>
        <View style={styles.mealHeader}>
          <View style={styles.mealInfo}>
            <Text style={styles.mealName}>{meal.name}</Text>
            <Text style={styles.mealAnimal}>{getDistributorName(meal.distributorId)}</Text>
          </View>
          <View
            style={[styles.mealStatus, { backgroundColor: meal.enabled ? '#4ECDC4' : '#FF6B6B' }]}>
            <Text style={styles.mealStatusText}>{meal.enabled ? '✓' : '✕'}</Text>
          </View>
        </View>

        <View style={styles.mealDetails}>
          <View style={styles.mealDetailRow}>
            <Text style={styles.mealDetailLabel}>Heure :</Text>
            <Text style={styles.mealDetailValue}>{meal.time}</Text>
          </View>
          <View style={styles.mealDetailRow}>
            <Text style={styles.mealDetailLabel}>Quantité :</Text>
            <Text style={styles.mealDetailValue}>{meal.quantity || '0'}g</Text>
          </View>
          {meal.days && meal.days.length > 0 && (
            <View style={styles.mealDetailRow}>
              <Text style={styles.mealDetailLabel}>Jours :</Text>
              <Text style={styles.mealDetailValue}>{meal.days.join(', ')}</Text>
            </View>
          )}
        </View>

        <View style={styles.mealActions}>
          <TouchableOpacity style={styles.editButton} onPress={() => startEdit(meal)}>
            <Text style={styles.editButtonText}>Modifier</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={() => deleteMeal(meal.id)}>
            <Text style={styles.deleteButtonText}>Supprimer</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gestion des repas</Text>
        <TouchableOpacity onPress={() => router.push('/modals/add-meal')}>
          <Text style={styles.addButton}>+ Ajouter</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={[styles.content, styles.centerContent]}>
          <ActivityIndicator size="large" color="#4ECDC4" />
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
          {meals.length > 0 ? (
            <View style={styles.mealsList}>{meals.map((meal) => renderMealItem(meal))}</View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>🍽️</Text>
              <Text style={styles.emptyStateTitle}>Aucun repas configuré</Text>
              <Text style={styles.emptyStateDescription}>
                Commencez par ajouter un repas pour votre animal
              </Text>
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={() => router.push('/modals/add-meal')}>
                <Text style={styles.emptyStateButtonText}>+ Ajouter un premier repas</Text>
              </TouchableOpacity>
            </View>
          )}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingTop: 60,
    paddingBottom: SPACING.xl,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    fontSize: 24,
    color: COLORS.accent,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
    textAlign: 'center',
  },
  addButton: {
    fontSize: 16,
    color: COLORS.accent,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  mealsList: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    gap: SPACING.md,
  },
  mealCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.medium,
    padding: SPACING.lg,
    borderWidth: 2,
    borderColor: COLORS.primary,
    marginBottom: SPACING.sm,
    ...SHADOWS.small,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  mealAnimal: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  mealStatus: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mealStatusText: {
    fontSize: 20,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  mealDetails: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  mealDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  mealDetailLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  mealDetailValue: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
  },
  mealActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#4ECDC4',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  editingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4ECDC4',
    overflow: 'hidden',
    marginBottom: 16,
  },
  editingHeader: {
    backgroundColor: '#4ECDC4',
    padding: 16,
  },
  editingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  editingContent: {
    padding: 16,
  },
  editingRow: {
    marginBottom: 16,
  },
  editingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  editingInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#f8f9fa',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    overflow: 'hidden',
  },
  editingButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '600',
  },
  saveEditButton: {
    flex: 1,
    backgroundColor: '#4ECDC4',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveEditButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyStateButton: {
    backgroundColor: '#4ECDC4',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  emptyStateButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
