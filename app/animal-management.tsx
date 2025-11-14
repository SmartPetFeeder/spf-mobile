import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  Modal,
  TextInput,
  Image,
  RefreshControl
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { animalsApi } from '@/utils/BaseAPI';

interface Animal {
  id: number;
  name: string;
  type: string;
  breed: string;
  gender: string;
  age: number;
  ageUnit: string;
  weight: number;
  activityLevel: number;
  photo?: string;
}

export default function AnimalManagementScreen() {
  const router = useRouter();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState<Animal | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Chien',
    breed: 'Labrador Retriever',
    gender: 'Mâle',
    age: '3',
    ageUnit: 'Années',
    weight: '25.5',
    activityLevel: 3,
    photo: null,
  });

  const animalTypes = [
    { icon: '🐕', label: 'Chien' },
    { icon: '🐱', label: 'Chat' },
    { icon: '🐰', label: 'Lapin' },
    { icon: '🦊', label: 'Renard' },
  ];

  const activityLevels = [
    { level: 1, label: 'Peu actif', description: 'Repos principalement' },
    { level: 2, label: 'Légèrement actif', description: 'Courtes promenades' },
    { level: 3, label: 'Moyennement actif', description: 'Promenades quotidiennes' },
    { level: 4, label: 'Actif', description: 'Exercice régulier, jeux' },
    { level: 5, label: 'Très actif', description: 'Exercice intense quotidien' },
  ];

  useEffect(() => {
    loadAnimals();
  }, []);

  const loadAnimals = async () => {
    try {
      setLoading(true);
      const data = await animalsApi.getAll();
      setAnimals(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des animaux:', error);
      Alert.alert('Erreur', 'Impossible de charger les animaux');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnimals();
    setRefreshing(false);
  };

  const handleAddAnimal = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer le nom de l\'animal');
      return;
    }

    if (!formData.age || parseInt(formData.age) <= 0) {
      Alert.alert('Erreur', 'Veuillez entrer un âge valide');
      return;
    }

    if (!formData.weight || parseFloat(formData.weight) <= 0) {
      Alert.alert('Erreur', 'Veuillez entrer un poids valide');
      return;
    }

    try {
      await animalsApi.create({
        name: formData.name.trim(),
        type: formData.type,
        breed: formData.breed,
        gender: formData.gender,
        age: parseInt(formData.age),
        ageUnit: formData.ageUnit,
        weight: parseFloat(formData.weight),
        activityLevel: formData.activityLevel,
        photo: formData.photo,
      });

      setShowAddModal(false);
      resetForm();
      loadAnimals();
      Alert.alert('Succès', 'Animal ajouté avec succès');
    } catch (error) {
      Alert.alert('Erreur', error.message || 'Erreur lors de l\'ajout');
    }
  };

  const handleEditAnimal = async () => {
    if (!editingAnimal || !formData.name.trim()) return;

    try {
      await animalsApi.update(editingAnimal.id, {
        name: formData.name.trim(),
        type: formData.type,
        breed: formData.breed,
        gender: formData.gender,
        age: parseInt(formData.age),
        ageUnit: formData.ageUnit,
        weight: parseFloat(formData.weight),
        activityLevel: formData.activityLevel,
        photo: formData.photo,
      });

      setEditingAnimal(null);
      resetForm();
      loadAnimals();
      Alert.alert('Succès', 'Animal modifié avec succès');
    } catch (error) {
      Alert.alert('Erreur', error.message || 'Erreur lors de la modification');
    }
  };

  const handleDeleteAnimal = (animal: Animal) => {
    Alert.alert(
      'Supprimer l\'animal',
      `Êtes-vous sûr de vouloir supprimer "${animal.name}" ? Cette action supprimera aussi tous ses repas programmés.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await animalsApi.delete(animal.id);
              loadAnimals();
              Alert.alert('Succès', 'Animal supprimé avec succès');
            } catch (error) {
              Alert.alert('Erreur', error.message || 'Erreur lors de la suppression');
            }
          }
        }
      ]
    );
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setFormData({ ...formData, photo: result.assets[0].uri });
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'accéder à la galerie photo');
    }
  };

  const openEditModal = (animal: Animal) => {
    setEditingAnimal(animal);
    setFormData({
      name: animal.name,
      type: animal.type,
      breed: animal.breed,
      gender: animal.gender,
      age: animal.age.toString(),
      ageUnit: animal.ageUnit || 'Années',
      weight: animal.weight.toString(),
      activityLevel: animal.activityLevel,
      photo: animal.photo || null,
    });
    setShowAddModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'Chien',
      breed: 'Labrador Retriever',
      gender: 'Mâle',
      age: '3',
      ageUnit: 'Années',
      weight: '25.5',
      activityLevel: 3,
      photo: null,
    });
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingAnimal(null);
    resetForm();
  };

  const getAnimalIcon = (type: string) => {
    switch (type) {
      case 'Chien': return '🐕';
      case 'Chat': return '🐱';
      case 'Lapin': return '🐰';
      case 'Renard': return '🦊';
      default: return '🐾';
    }
  };

  const getActivityLevelColor = (level: number) => {
    if (level <= 2) return '#FF9500';
    if (level <= 3) return '#4ECDC4';
    return '#4CD964';
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gestion des animaux</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {animals.length > 0 ? animals.map((animal) => (
          <View key={animal.id} style={styles.animalCard}>
            {/* Header de la carte */}
            <View style={styles.animalHeader}>
              <View style={styles.animalPhotoContainer}>
                {animal.photo ? (
                  <Image source={{ uri: animal.photo }} style={styles.animalPhoto} />
                ) : (
                  <View style={styles.animalPhotoPlaceholder}>
                    <Text style={styles.animalEmoji}>{getAnimalIcon(animal.type)}</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.animalInfo}>
                <Text style={styles.animalName}>{animal.name}</Text>
                <Text style={[
                  styles.animalType,
                  { color: animal.type === 'Chien' ? '#007AFF' : animal.type === 'Chat' ? '#FF6B6B' : '#4ECDC4' }
                ]}>
                  {animal.type} • {animal.breed}
                </Text>
                <Text style={styles.animalDetails}>
                  {animal.gender} • {animal.age} {animal.ageUnit} • {animal.weight}kg
                </Text>
              </View>
            </View>

            {/* Niveau d'activité */}
            <View style={styles.activitySection}>
              <Text style={styles.activityLabel}>Niveau d'activité</Text>
              <View style={styles.activityLevelContainer}>
                {[1, 2, 3, 4, 5].map((level) => (
                  <View
                    key={level}
                    style={[
                      styles.activityDot,
                      { 
                        backgroundColor: animal.activityLevel >= level 
                          ? getActivityLevelColor(animal.activityLevel)
                          : '#ddd'
                      }
                    ]}
                  />
                ))}
                <Text style={styles.activityText}>
                  {activityLevels.find(level => level.level === animal.activityLevel)?.label}
                </Text>
              </View>
            </View>

            {/* Actions */}
            <View style={styles.animalActions}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => router.push(`/planning?animalId=${animal.id}`)}
              >
                <Ionicons name="calendar" size={16} color="#007AFF" />
                <Text style={styles.actionText}>Planning</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => router.push(`/analysis?animalId=${animal.id}`)}
              >
                <Ionicons name="bar-chart" size={16} color="#007AFF" />
                <Text style={styles.actionText}>Analyse</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => openEditModal(animal)}
              >
                <Ionicons name="pencil" size={16} color="#007AFF" />
                <Text style={styles.actionText}>Modifier</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDeleteAnimal(animal)}
              >
                <Ionicons name="trash" size={16} color="#FF3B30" />
                <Text style={[styles.actionText, styles.deleteText]}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          </View>
        )) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🐾</Text>
            <Text style={styles.emptyText}>Aucun animal enregistré</Text>
            <TouchableOpacity 
              style={styles.emptyButton}
              onPress={() => setShowAddModal(true)}
            >
              <Text style={styles.emptyButtonText}>Ajouter votre premier animal</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Modal d'ajout/modification */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeModal}>
              <Text style={styles.modalCancel}>Annuler</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingAnimal ? 'Modifier l\'animal' : 'Ajouter un animal'}
            </Text>
            <TouchableOpacity 
              onPress={editingAnimal ? handleEditAnimal : handleAddAnimal}
            >
              <Text style={styles.modalSave}>
                {editingAnimal ? 'Modifier' : 'Ajouter'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Photo */}
            <View style={styles.photoSection}>
              <TouchableOpacity style={styles.photoContainer} onPress={pickImage}>
                {formData.photo ? (
                  <Image source={{ uri: formData.photo }} style={styles.modalPhoto} />
                ) : (
                  <View style={styles.modalPhotoPlaceholder}>
                    <Text style={styles.photoIcon}>📷</Text>
                    <Text style={styles.photoText}>Ajouter une photo</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Nom */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nom</Text>
              <TextInput
                style={styles.textInput}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Nom de l'animal"
              />
            </View>

            {/* Type d'animal */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Type d'animal</Text>
              <View style={styles.animalTypeButtons}>
                {animalTypes.map((type) => (
                  <TouchableOpacity
                    key={type.label}
                    style={[
                      styles.animalTypeButton,
                      formData.type === type.label && styles.selectedAnimalType
                    ]}
                    onPress={() => setFormData({ ...formData, type: type.label })}
                  >
                    <Text style={styles.animalTypeIcon}>{type.icon}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Sexe */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Sexe</Text>
              <View style={styles.genderButtons}>
                {['Mâle', 'Femelle'].map((gender) => (
                  <TouchableOpacity
                    key={gender}
                    style={[
                      styles.genderButton,
                      formData.gender === gender && styles.selectedGender
                    ]}
                    onPress={() => setFormData({ ...formData, gender })}
                  >
                    <Text style={[
                      styles.genderText,
                      formData.gender === gender && styles.selectedGenderText
                    ]}>
                      {gender}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Race */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Race</Text>
              <TextInput
                style={styles.textInput}
                value={formData.breed}
                onChangeText={(text) => setFormData({ ...formData, breed: text })}
                placeholder="Ex: Labrador Retriever"
              />
            </View>

            {/* Âge et Poids */}
            <View style={styles.rowInputs}>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Âge</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.age}
                  onChangeText={(text) => setFormData({ ...formData, age: text })}
                  placeholder="3"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Poids (kg)</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.weight}
                  onChangeText={(text) => setFormData({ ...formData, weight: text })}
                  placeholder="25.5"
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            {/* Niveau d'activité */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Niveau d'activité</Text>
              <Text style={styles.activityCurrentLabel}>
                {activityLevels.find(level => level.level === formData.activityLevel)?.label}
              </Text>
              
              <View style={styles.modalActivityContainer}>
                {[1, 2, 3, 4, 5].map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.modalActivityDot,
                      formData.activityLevel >= level ? styles.modalActivityDotActive : styles.modalActivityDotInactive
                    ]}
                    onPress={() => setFormData({ ...formData, activityLevel: level })}
                  />
                ))}
              </View>

              <View style={styles.modalActivityDescription}>
                <Text style={styles.modalActivityDescriptionTitle}>
                  {activityLevels.find(level => level.level === formData.activityLevel)?.label}
                </Text>
                <Text style={styles.modalActivityDescriptionText}>
                  {activityLevels.find(level => level.level === formData.activityLevel)?.description}
                </Text>
              </View>
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
  backButton: {
    fontSize: 24,
    color: '#007AFF',
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
    marginRight: 44,
  },
  addButton: {
    backgroundColor: '#007AFF',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  animalCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  animalHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  animalPhotoContainer: {
    marginRight: 16,
  },
  animalPhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  animalPhotoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  animalEmoji: {
    fontSize: 40,
  },
  animalInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  animalName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  animalType: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  animalDetails: {
    fontSize: 14,
    color: '#666',
  },
  activitySection: {
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  activityLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  activityLevelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  activityText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginLeft: 8,
  },
  animalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
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
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
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
  // Modal styles
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
  photoSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  photoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
  },
  modalPhoto: {
    width: '100%',
    height: '100%',
  },
  modalPhotoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4ECDC4',
    borderStyle: 'dashed',
    borderRadius: 60,
  },
  photoIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  photoText: {
    fontSize: 12,
    color: '#4ECDC4',
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 20,
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
    gap: 12,
  },
  animalTypeButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedAnimalType: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  animalTypeIcon: {
    fontSize: 24,
  },
  genderButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  selectedGender: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  genderText: {
    fontSize: 16,
    color: '#666',
  },
  selectedGenderText: {
    color: '#fff',
    fontWeight: '600',
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  halfInput: {
    flex: 1,
  },
  activityCurrentLabel: {
    fontSize: 14,
    color: '#4ECDC4',
    marginBottom: 12,
  },
  modalActivityContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  modalActivityDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  modalActivityDotActive: {
    backgroundColor: '#4ECDC4',
  },
  modalActivityDotInactive: {
    backgroundColor: '#ddd',
  },
  modalActivityDescription: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
  },
  modalActivityDescriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  modalActivityDescriptionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});