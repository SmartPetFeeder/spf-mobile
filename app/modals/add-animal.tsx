import { useAuth } from '@/hooks/useAuth';
import { animalBreedsApi, animalsApi, animalTypesApi } from '@/utils/BaseAPI';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function AddAnimalScreen() {
  const router = useRouter();
  const { user } = useAuth();
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
  const [animalTypes, setAnimalTypes] = useState([]);
  const [animalBreeds, setAnimalBreeds] = useState([]);
  const [filteredBreeds, setFilteredBreeds] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Filtrer les races en fonction du type sélectionné
    const filtered = animalBreeds.filter((breed) => breed.type === formData.type);
    setFilteredBreeds(filtered);
    // Définir la première race disponible pour ce type
    if (filtered && filtered.length > 0) {
      setFormData((prev) => ({ ...prev, breed: filtered[0].label }));
    }
  }, [formData.type, animalBreeds]);

  const loadData = async () => {
    try {
      console.log('[AddAnimal] Chargement des types et races...');
      const [types, breeds] = await Promise.all([
        animalTypesApi.getAll(),
        animalBreedsApi.getAll(),
      ]);
      console.log('[AddAnimal] Types chargés:', types);
      console.log('[AddAnimal] Races chargées:', breeds);
      setAnimalTypes(types || []);
      setAnimalBreeds(breeds || []);

      // Définir le premier type et sa première race par défaut
      if (types && types.length > 0) {
        setFormData((prev) => ({ ...prev, type: types[0].label }));
        const firstBreeds = (breeds || []).filter((b) => b.type === types[0].label);
        if (firstBreeds.length > 0) {
          setFormData((prev) => ({ ...prev, breed: firstBreeds[0].label }));
        }
      }
    } catch (error) {
      console.error('[AddAnimal] Erreur lors du chargement:', error);
      Alert.alert('Erreur', 'Impossible de charger les données');
    }
  };

  const activityLevels = [
    { level: 1, label: 'Peu actif', description: 'Repos principalement' },
    { level: 2, label: 'Légèrement actif', description: 'Courtes promenades' },
    { level: 3, label: 'Moyennement actif', description: 'Promenades quotidiennes' },
    { level: 4, label: 'Actif', description: 'Exercice régulier, jeux' },
    { level: 5, label: 'Très actif', description: 'Exercice intense quotidien' },
  ];

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
      Alert.alert('Erreur', "Impossible d'accéder à la galerie photo");
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Erreur', "Veuillez entrer le nom de l'animal");
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

    setLoading(true);
    try {
      await animalsApi.create({
        userId: user?.id,
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

      Alert.alert('Succès', 'Animal ajouté avec succès', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('Erreur', error.message || "Erreur lors de l'ajout de l'animal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ajouter un animal</Text>
        <TouchableOpacity onPress={handleSave} disabled={loading}>
          <Text style={[styles.saveButton, loading && styles.saveButtonDisabled]}>
            {loading ? 'Ajout...' : 'Ajouter'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Photo */}
        <View style={styles.photoSection}>
          <TouchableOpacity style={styles.photoContainer} onPress={pickImage}>
            {formData.photo ? (
              <Image source={{ uri: formData.photo }} style={styles.photoImage} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoIcon}>📷</Text>
                <Text style={styles.photoText}>Ajouter une photo</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Nom */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Nom</Text>
          <TextInput
            style={styles.input}
            placeholder="Nom de l'animal"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
          />
        </View>

        {/* Type d'animal */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Type d'animal</Text>
          <View style={styles.animalTypeContainer}>
            {animalTypes.map((type, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.animalTypeButton,
                  formData.type === type.label && styles.selectedAnimalType,
                ]}
                onPress={() => setFormData({ ...formData, type: type.label })}>
                <Text style={styles.animalTypeIcon}>{type.icon}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Sexe */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Sexe</Text>
          <View style={styles.genderContainer}>
            {['Mâle', 'Femelle'].map((gender) => (
              <TouchableOpacity
                key={gender}
                style={[styles.genderButton, formData.gender === gender && styles.selectedGender]}
                onPress={() => setFormData({ ...formData, gender })}>
                <Text
                  style={[
                    styles.genderText,
                    formData.gender === gender && styles.selectedGenderText,
                  ]}>
                  {gender}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Race */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Race</Text>
          {filteredBreeds.length > 0 ? (
            <View style={styles.breedButtonsContainer}>
              {filteredBreeds.map((breed, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.breedButton,
                    formData.breed === breed.label && styles.selectedBreed,
                  ]}
                  onPress={() => setFormData({ ...formData, breed: breed.label })}>
                  <Text
                    style={[
                      styles.breedButtonText,
                      formData.breed === breed.label && styles.selectedBreedText,
                    ]}>
                    {breed.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.noBreedContainer}>
              <Text style={styles.noBreedText}>Aucune race disponible pour ce type</Text>
              <TextInput
                style={styles.input}
                placeholder="Entrez une race personnalisée"
                value={formData.breed}
                onChangeText={(text) => setFormData({ ...formData, breed: text })}
              />
            </View>
          )}
        </View>

        {/* Âge et Poids */}
        <View style={styles.rowInputs}>
          <View style={styles.halfInput}>
            <Text style={styles.label}>Âge</Text>
            <TextInput
              style={styles.input}
              placeholder="3"
              value={formData.age}
              onChangeText={(text) => setFormData({ ...formData, age: text })}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.halfInput}>
            <Text style={styles.label}>Poids (kg)</Text>
            <TextInput
              style={styles.input}
              placeholder="25.5"
              value={formData.weight}
              onChangeText={(text) => setFormData({ ...formData, weight: text })}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        {/* Niveau d'activité */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Niveau d'activité</Text>
          <Text style={styles.activityCurrentLabel}>
            {activityLevels.find((level) => level.level === formData.activityLevel)?.label}
          </Text>

          <View style={styles.activityLevelContainer}>
            {[1, 2, 3, 4, 5].map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.activityDot,
                  formData.activityLevel >= level
                    ? styles.activityDotActive
                    : styles.activityDotInactive,
                ]}
                onPress={() => setFormData({ ...formData, activityLevel: level })}
              />
            ))}
          </View>

          <View style={styles.activityDescription}>
            <Text style={styles.activityDescriptionTitle}>
              {activityLevels.find((level) => level.level === formData.activityLevel)?.label}
            </Text>
            <Text style={styles.activityDescriptionText}>
              {activityLevels.find((level) => level.level === formData.activityLevel)?.description}
            </Text>
          </View>
        </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    fontSize: 24,
    color: '#007AFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  saveButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  photoSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  photoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
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
  inputSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  animalTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  genderContainer: {
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
  activityLevelContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  activityDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  activityDotActive: {
    backgroundColor: '#4ECDC4',
  },
  activityDotInactive: {
    backgroundColor: '#ddd',
  },
  activityDescription: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
  },
  activityDescriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  activityDescriptionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  breedButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  breedButton: {
    flex: 1,
    minWidth: '48%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  selectedBreed: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  breedButtonText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  selectedBreedText: {
    color: '#fff',
    fontWeight: '600',
  },
  noBreedContainer: {
    gap: 8,
  },
  noBreedText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
});
