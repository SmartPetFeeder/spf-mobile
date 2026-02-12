import { AnimalBreed, AnimalType } from '@/types';
import { animalBreedsApi, animalTypesApi } from '@/utils/BaseAPI';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function AnimalBreedsManagementScreen() {
  const [breeds, setBreeds] = useState<AnimalBreed[]>([]);
  const [filteredBreeds, setFilteredBreeds] = useState<AnimalBreed[]>([]);
  const [animalTypes, setAnimalTypes] = useState<AnimalType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    label: '',
    type: '',
    description: '',
  });
  const [searchText, setSearchText] = useState('');
  const [selectedType, setSelectedType] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, []),
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const [breedsList, typesList] = await Promise.all([
        animalBreedsApi.getAll(),
        animalTypesApi.getAll(),
      ]);
      setBreeds(breedsList || []);
      setAnimalTypes(typesList || []);
      filterBreeds(breedsList || [], '', '');
    } catch (error) {
      console.error('[AnimalBreeds] Erreur lors du chargement:', error);
      Alert.alert('Erreur', 'Impossible de charger les races');
    } finally {
      setLoading(false);
    }
  };

  const filterBreeds = (breedsList: AnimalBreed[], search: string, type: string) => {
    let filtered = breedsList;

    if (type) {
      filtered = filtered.filter((breed) => breed.type === type);
    }

    if (search.trim()) {
      filtered = filtered.filter(
        (breed) =>
          breed.label.toLowerCase().includes(search.toLowerCase()) ||
          (breed.description?.toLowerCase() || '').includes(search.toLowerCase()),
      );
    }

    setFilteredBreeds(filtered);
  };

  const handleSearch = (text: string) => {
    setSearchText(text);
    filterBreeds(breeds, text, selectedType);
  };

  const handleTypeFilter = (type: string) => {
    const newType = selectedType === type ? '' : type;
    setSelectedType(newType);
    filterBreeds(breeds, searchText, newType);
  };

  const handleEdit = (breed: AnimalBreed) => {
    setEditingId(breed.id);
    setFormData({
      label: breed.label,
      type: breed.type,
      description: breed.description || '',
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ label: '', type: '', description: '' });
  };

  const handleSaveEdit = async () => {
    if (!formData.label.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer le nom de la race');
      return;
    }

    if (!formData.type) {
      Alert.alert('Erreur', "Veuillez sélectionner un type d'animal");
      return;
    }

    if (!editingId) return;

    try {
      await animalBreedsApi.update(editingId, {
        label: formData.label.trim(),
        type: formData.type,
        description: formData.description.trim(),
      });

      const updatedBreeds = breeds.map((b) =>
        b.id === editingId
          ? {
              ...b,
              label: formData.label.trim(),
              type: formData.type,
              description: formData.description.trim(),
            }
          : b,
      );
      setBreeds(updatedBreeds);
      filterBreeds(updatedBreeds, searchText, selectedType);
      setEditingId(null);
      setFormData({ label: '', type: '', description: '' });
      Alert.alert('Succès', 'Race modifiée avec succès');
    } catch (error) {
      Alert.alert('Erreur', (error as Error).message || 'Impossible de modifier la race');
    }
  };

  const handleDelete = (breed: AnimalBreed) => {
    Alert.alert('Supprimer', `Êtes-vous sûr de vouloir supprimer la race "${breed.label}"?`, [
      { text: 'Annuler', onPress: () => {} },
      {
        text: 'Supprimer',
        onPress: async () => {
          try {
            await animalBreedsApi.delete(breed.id);
            const updatedBreeds = breeds.filter((b) => b.id !== breed.id);
            setBreeds(updatedBreeds);
            filterBreeds(updatedBreeds, searchText, selectedType);
            Alert.alert('Succès', 'Race supprimée avec succès');
          } catch (error) {
            Alert.alert('Erreur', (error as Error).message || 'Impossible de supprimer la race');
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const handleAddNew = async () => {
    if (!formData.label.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer le nom de la race');
      return;
    }

    if (!formData.type) {
      Alert.alert('Erreur', "Veuillez sélectionner un type d'animal");
      return;
    }

    try {
      const newBreed = await animalBreedsApi.create({
        label: formData.label.trim(),
        type: formData.type,
        description: formData.description.trim(),
      });

      const updatedBreeds = [...breeds, newBreed];
      setBreeds(updatedBreeds);
      filterBreeds(updatedBreeds, searchText, selectedType);
      setFormData({ label: '', type: '', description: '' });
      Alert.alert('Succès', 'Race ajoutée avec succès');
    } catch (error) {
      Alert.alert('Erreur', (error as Error).message || "Impossible d'ajouter la race");
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Gestion des races</Text>
        </View>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#4ECDC4" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gestion des races</Text>
        <Text style={styles.headerSubtitle}>{filteredBreeds.length} race(s)</Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}>
        {/* Formulaire d'ajout/modification */}
        <View style={styles.formSection}>
          <Text style={styles.formTitle}>
            {editingId ? 'Modifier la race' : 'Ajouter une race'}
          </Text>

          <Text style={styles.label}>Nom de la race *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Labrador Retriever"
            value={formData.label}
            onChangeText={(text) => setFormData({ ...formData, label: text })}
          />

          <Text style={styles.label}>Type d'animal *</Text>
          <View style={styles.typeButtonsContainer}>
            {animalTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.typeButton,
                  formData.type === type.label && styles.typeButtonSelected,
                ]}
                onPress={() => setFormData({ ...formData, type: type.label })}>
                <Text style={styles.typeButtonIcon}>{type.icon}</Text>
                <Text
                  style={[
                    styles.typeButtonText,
                    formData.type === type.label && styles.typeButtonTextSelected,
                  ]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Description de la race"
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            multiline
            numberOfLines={3}
          />

          <View style={styles.formButtonsContainer}>
            {editingId && (
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEdit}>
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.submitButton, editingId ? styles.submitButtonFlex : undefined]}
              onPress={editingId ? handleSaveEdit : handleAddNew}>
              <Text style={styles.submitButtonText}>{editingId ? 'Modifier' : 'Ajouter'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Barre de recherche et filtres */}
        <View style={styles.searchSection}>
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher une race..."
            value={searchText}
            onChangeText={handleSearch}
          />

          <Text style={styles.filterLabel}>Filtrer par type:</Text>
          <View style={styles.filterButtonsContainer}>
            {animalTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.filterButton,
                  selectedType === type.label && styles.filterButtonActive,
                ]}
                onPress={() => handleTypeFilter(type.label)}>
                <Text style={styles.filterButtonIcon}>{type.icon}</Text>
                <Text
                  style={[
                    styles.filterButtonText,
                    selectedType === type.label && styles.filterButtonTextActive,
                  ]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Liste des races */}
        {filteredBreeds.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>🐾</Text>
            <Text style={styles.emptyStateTitle}>Aucune race trouvée</Text>
            <Text style={styles.emptyStateText}>Ajoutez une race via le formulaire ci-dessus</Text>
          </View>
        ) : (
          <View style={styles.breedsContainer}>
            {filteredBreeds.map((breed) => (
              <View key={breed.id} style={styles.breedCard}>
                <View style={styles.breedContent}>
                  <Text style={styles.breedLabel}>{breed.label}</Text>
                  <Text style={styles.breedType}>
                    {animalTypes.find((t) => t.label === breed.type)?.icon} {breed.type}
                  </Text>
                  {breed.description && (
                    <Text style={styles.breedDescription}>{breed.description}</Text>
                  )}
                </View>
                <View style={styles.breedActions}>
                  <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(breed)}>
                    <Text style={styles.editButtonText}>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(breed)}>
                    <Text style={styles.deleteButtonText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#999',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  textArea: {
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  typeButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    flex: 1,
    minWidth: '48%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  typeButtonSelected: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  typeButtonIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  typeButtonText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  typeButtonTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  formButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#4ECDC4',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitButtonFlex: {
    flex: 1,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 14,
  },
  searchSection: {
    marginBottom: 20,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  filterButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  filterButtonActive: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  filterButtonIcon: {
    fontSize: 14,
  },
  filterButtonText: {
    fontSize: 12,
    color: '#666',
  },
  filterButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  breedsContainer: {
    gap: 12,
    paddingBottom: 20,
  },
  breedCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  breedContent: {
    flex: 1,
  },
  breedLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  breedType: {
    fontSize: 12,
    color: '#4ECDC4',
    marginBottom: 4,
  },
  breedDescription: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  breedActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 16,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#ffe0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
  },
});
