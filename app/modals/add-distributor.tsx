import { useAuth } from '@/hooks/useAuth';
import { animalsApi, distributorApi } from '@/utils/BaseAPI';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function AddDistributorScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    animalId: null,
    maxCapacity: '2000',
    location: '',
  });
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAnimals();
  }, []);

  const loadAnimals = async () => {
    try {
      const animalsData = user?.id
        ? await animalsApi.getByUser(user.id)
        : await animalsApi.getAll();
      setAnimals(animalsData || []);
      if (animalsData && animalsData.length > 0) {
        setFormData((prev) => ({ ...prev, animalId: animalsData[0].id }));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des animaux:', error);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer le nom de la mangeoire');
      return;
    }

    if (!formData.animalId) {
      Alert.alert('Erreur', 'Veuillez sélectionner un animal');
      return;
    }

    if (!formData.maxCapacity || parseInt(formData.maxCapacity) <= 0) {
      Alert.alert('Erreur', 'Veuillez entrer une capacité valide');
      return;
    }

    setLoading(true);
    try {
      const newDistributor = {
        userId: user?.id,
        animalId: formData.animalId,
        name: formData.name.trim(),
        maxCapacity: parseInt(formData.maxCapacity),
        location: formData.location.trim(),
        currentLevel: 100,
        autonomyDays: 15,
        lastRefill: new Date().toISOString(),
        connected: true,
        firmwareVersion: '2.4.1',
      };

      await distributorApi.create(newDistributor);

      Alert.alert('Succès', 'Mangeoire ajoutée avec succès', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('Erreur', error.message || "Erreur lors de l'ajout de la mangeoire");
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
        <Text style={styles.headerTitle}>Ajouter une mangeoire</Text>
        <TouchableOpacity onPress={handleSave} disabled={loading}>
          <Text style={[styles.saveButton, loading && styles.saveButtonDisabled]}>
            {loading ? 'Ajout...' : 'Ajouter'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Icône de mangeoire */}
        <View style={styles.iconSection}>
          <View style={styles.iconContainer}>
            <Text style={styles.iconText}>🍽️</Text>
          </View>
        </View>

        {/* Animal */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Animal</Text>
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

        {/* Nom de la mangeoire */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Nom de la mangeoire</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Mangeoire salon"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
          />
        </View>

        {/* Capacité maximale */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Capacité maximale (grammes)</Text>
          <TextInput
            style={styles.input}
            placeholder="2000"
            value={formData.maxCapacity}
            onChangeText={(text) => setFormData({ ...formData, maxCapacity: text })}
            keyboardType="numeric"
          />
          <Text style={styles.helperText}>
            Capacité totale de nourriture que peut contenir la mangeoire
          </Text>
        </View>

        {/* Localisation */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Localisation (optionnel)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Salon, Cuisine, Balcon..."
            value={formData.location}
            onChangeText={(text) => setFormData({ ...formData, location: text })}
          />
          <Text style={styles.helperText}>Où se trouve cette mangeoire dans votre domicile</Text>
        </View>

        {/* Informations de configuration */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Configuration initiale</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>• Niveau initial : 100% (pleine)</Text>
            <Text style={styles.infoText}>• Autonomie estimée : 15 jours</Text>
            <Text style={styles.infoText}>• Connexion : Automatique</Text>
            <Text style={styles.infoText}>• Firmware : Version 2.4.1</Text>
          </View>
        </View>

        {/* Note importante */}
        <View style={styles.noteSection}>
          <Text style={styles.noteTitle}>📌 Note importante</Text>
          <Text style={styles.noteText}>
            Assurez-vous que votre mangeoire est connectée au Wi-Fi et qu'elle est allumée avant de
            l'ajouter à l'application.
          </Text>
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
  iconSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#4ECDC4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 60,
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
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
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
  infoSection: {
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4ECDC4',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  noteSection: {
    backgroundColor: '#fff3cd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 8,
  },
  noteText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
});
