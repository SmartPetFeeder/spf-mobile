import { BORDER_RADIUS, COLORS, SHADOWS, SPACING } from '@/constants/ThemeColors';
import { useAuth } from '@/hooks/useAuth';
import { Animal, Distributor } from '@/types';
import { animalsApi, distributorApi } from '@/utils/BaseAPI';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function DistributorManagementScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDistributor, setEditingDistributor] = useState<Distributor | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    animalId: null as number | null,
    maxCapacity: '2000',
    location: '',
  });

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const distributorsData = user?.id ? await distributorApi.getByUser(user.id) : [];
      const animalsData = user?.id ? await animalsApi.getByUser(user.id) : [];
      setDistributors(distributorsData || []);
      setAnimals(animalsData || []);
    } catch (error: any) {
      Alert.alert('Erreur', 'Impossible de charger les données');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDistributor = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer le nom de la mangeoire');
      return;
    }

    if (!formData.animalId) {
      Alert.alert('Erreur', 'Veuillez sélectionner un animal');
      return;
    }

    try {
      const newDistributor = {
        userId: user?.id,
        animalId: formData.animalId,
        name: formData.name.trim(),
        maxCapacity: parseInt(formData.maxCapacity) || 2000,
        location: formData.location.trim(),
        currentLevel: 100,
        autonomyDays: 15,
        lastRefill: new Date().toISOString(),
        connected: true,
        firmwareVersion: '2.4.1',
      };

      await distributorApi.create(newDistributor);
      setShowAddModal(false);
      resetForm();
      loadData();
      Alert.alert('Succès', 'Mangeoire ajoutée avec succès');
    } catch (error: any) {
      Alert.alert('Erreur', error.message || "Erreur lors de l'ajout");
    }
  };

  const handleEditDistributor = async () => {
    if (!editingDistributor || !formData.name.trim() || !formData.animalId) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs requis');
      return;
    }

    try {
      const updatedDistributor = {
        ...editingDistributor,
        name: formData.name.trim(),
        animalId: formData.animalId,
        maxCapacity: parseInt(formData.maxCapacity) || editingDistributor.maxCapacity,
        location: formData.location.trim(),
      };

      await distributorApi.update(editingDistributor.id as number, updatedDistributor);
      setEditingDistributor(null);
      resetForm();
      loadData();
      Alert.alert('Succès', 'Mangeoire mise à jour avec succès');
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Erreur lors de la mise à jour');
    }
  };

  const handleDeleteDistributor = (distributor: Distributor) => {
    Alert.alert(
      'Supprimer la mangeoire',
      `Êtes-vous sûr de vouloir supprimer "${distributor.name}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await distributorApi.delete(distributor.id as number);
              loadData();
              Alert.alert('Succès', 'Mangeoire supprimée avec succès');
            } catch (error: any) {
              Alert.alert('Erreur', error.message || 'Erreur lors de la suppression');
            }
          },
        },
      ],
    );
  };

  const handleCalibrateDistributor = async (distributor: Distributor) => {
    try {
      await distributorApi.calibrate();
      Alert.alert('Succès', `Calibrage de "${distributor.name}" terminé avec succès`);
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Erreur lors du calibrage');
    }
  };

  const handleRefillDistributor = (distributor: Distributor) => {
    Alert.alert(
      'Confirmer le remplissage',
      `Avez-vous rempli la mangeoire "${distributor.name}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: async () => {
            try {
              const updatedDistributor = {
                ...distributor,
                currentLevel: 100,
                lastRefill: new Date().toISOString(),
                autonomyDays: Math.ceil(distributor.maxCapacity / 100),
              };

              await distributorApi.update(distributor.id as number, updatedDistributor);
              loadData();
              Alert.alert('Succès', 'Niveau mis à jour avec succès');
            } catch (error: any) {
              Alert.alert('Erreur', error.message || 'Erreur lors de la mise à jour');
            }
          },
        },
      ],
    );
  };

  const resetForm = () => {
    setFormData({
      name: '',
      animalId: null,
      maxCapacity: '2000',
      location: '',
    });
  };

  const openEditModal = (distributor: Distributor) => {
    setEditingDistributor(distributor);
    setFormData({
      name: distributor.name,
      animalId: (distributor.animalId as number) || null,
      maxCapacity: distributor.maxCapacity.toString(),
      location: distributor.location || '',
    });
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingDistributor(null);
    resetForm();
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header avec bouton retour */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gestion des mangeoires</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {distributors.map((distributor) => {
          const animal = animals.find((a) => a.id === distributor.animalId);
          return (
            <View key={distributor.id} style={styles.distributorCard}>
              <View style={styles.distributorHeader}>
                <View style={styles.distributorInfo}>
                  <Text style={styles.distributorName}>{distributor.name}</Text>
                  <Text style={styles.distributorType}>{animal?.name || 'Animal inconnu'}</Text>
                </View>

                <View style={styles.connectionStatus}>
                  <View
                    style={[
                      styles.connectionDot,
                      { backgroundColor: distributor.connected ? '#4CD964' : '#FF3B30' },
                    ]}
                  />
                  <Text style={styles.connectionText}>
                    {distributor.connected ? 'Connecté' : 'Déconnecté'}
                  </Text>
                </View>
              </View>

              <View style={styles.distributorStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Niveau</Text>
                  <Text
                    style={[
                      styles.statValue,
                      { color: distributor.currentLevel < 30 ? '#FF3B30' : '#4CD964' },
                    ]}>
                    {distributor.currentLevel}%
                  </Text>
                </View>

                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Autonomie</Text>
                  <Text style={styles.statValue}>{distributor.autonomyDays}j</Text>
                </View>

                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Capacité</Text>
                  <Text style={styles.statValue}>{distributor.maxCapacity}g</Text>
                </View>
              </View>

              <View style={styles.distributorActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleRefillDistributor(distributor)}>
                  <Ionicons name="water" size={16} color="#007AFF" />
                  <Text style={styles.actionText}>Remplir</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleCalibrateDistributor(distributor)}>
                  <Ionicons name="settings" size={16} color="#007AFF" />
                  <Text style={styles.actionText}>Calibrer</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => openEditModal(distributor)}>
                  <Ionicons name="pencil" size={16} color="#007AFF" />
                  <Text style={styles.actionText}>Modifier</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeleteDistributor(distributor)}>
                  <Ionicons name="trash" size={16} color="#FF3B30" />
                  <Text style={[styles.actionText, styles.deleteText]}>Supprimer</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {distributors.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Aucune mangeoire configurée</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={() => setShowAddModal(true)}>
              <Text style={styles.emptyButtonText}>Ajouter une mangeoire</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Modal d'ajout/modification */}
      <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeModal}>
              <Text style={styles.modalCancel}>Annuler</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingDistributor ? 'Modifier la mangeoire' : 'Ajouter une mangeoire'}
            </Text>
            <TouchableOpacity
              onPress={editingDistributor ? handleEditDistributor : handleAddDistributor}>
              <Text style={styles.modalSave}>{editingDistributor ? 'Modifier' : 'Ajouter'}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nom de la mangeoire</Text>
              <TextInput
                style={styles.textInput}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Ex: Mangeoire salon"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Animal</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.animalId}
                  style={styles.picker}
                  onValueChange={(animalId) => setFormData({ ...formData, animalId })}>
                  <Picker.Item label="Sélectionner un animal" value={null} />
                  {animals.map((animal) => (
                    <Picker.Item key={animal.id} label={animal.name} value={animal.id} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Capacité maximale (grammes)</Text>
              <TextInput
                style={styles.textInput}
                value={formData.maxCapacity.toString()}
                onChangeText={(text) => setFormData({ ...formData, maxCapacity: text })}
                placeholder="2000"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Localisation (optionnel)</Text>
              <TextInput
                style={styles.textInput}
                value={formData.location}
                onChangeText={(text) => setFormData({ ...formData, location: text })}
                placeholder="Ex: Salon, Cuisine"
              />
            </View>
          </ScrollView>
        </View>
      </Modal>
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
  header: {
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: 60,
    paddingBottom: SPACING.xl,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    fontSize: 24,
    color: COLORS.accent,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
    textAlign: 'center',
    marginRight: 44,
  },
  addButton: {
    backgroundColor: COLORS.accent,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  content: {
    flex: 1,
    padding: SPACING.xl,
  },
  distributorCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.medium,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.medium,
  },
  distributorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  distributorInfo: {
    flex: 1,
  },
  distributorName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  distributorType: {
    fontSize: 14,
    color: '#666',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  connectionText: {
    fontSize: 12,
    color: '#666',
  },
  distributorStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  distributorActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f0f8ff',
    marginHorizontal: 4,
    marginVertical: 4,
    minWidth: 80,
    justifyContent: 'center',
  },
  deleteButton: {
    backgroundColor: '#fff0f0',
  },
  actionText: {
    fontSize: 12,
    color: '#007AFF',
    marginLeft: 4,
    fontWeight: '500',
  },
  deleteText: {
    color: '#FF3B30',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalCancel: {
    fontSize: 16,
    color: '#007AFF',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalSave: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  animalTypeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  animalTypeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    marginBottom: 8,
  },
  selectedAnimalType: {
    backgroundColor: '#007AFF',
  },
  animalTypeText: {
    fontSize: 14,
    color: '#666',
  },
  selectedAnimalTypeText: {
    color: '#fff',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
});
