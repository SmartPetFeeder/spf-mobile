import { useAuth } from '@/hooks/useAuth';
import { distributorApi, mealsApi } from '@/utils/BaseAPI';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function AddMealModalScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    time: '08:00',
    quantity: '50',
    distributorId: null,
    recurrence: 'Tous les jours',
    enabled: true,
  });
  const [distributors, setDistributors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const recurrenceOptions = [
    'Tous les jours',
    'Lundi au vendredi',
    'Week-end seulement',
    'Personnalisé',
  ];

  const mealPresets = [
    { name: 'Petit déjeuner', time: '08:00', quantity: '40' },
    { name: 'Déjeuner', time: '12:30', quantity: '60' },
    { name: 'Goûter', time: '15:30', quantity: '30' },
    { name: 'Dîner', time: '19:00', quantity: '60' },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const distributorsData = user?.id
        ? await distributorApi.getByUser(user.id)
        : await distributorApi.getStatus();
      setDistributors(distributorsData || []);
      if (distributorsData && distributorsData.length > 0) {
        setFormData((prev) => ({ ...prev, distributorId: distributorsData[0].id }));
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    }
  };

  const handlePresetSelect = (preset) => {
    setFormData({
      ...formData,
      name: preset.name,
      time: preset.time,
      quantity: preset.quantity,
    });
  };

  const handleTimeChange = (hours, minutes) => {
    const time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    setFormData({ ...formData, time });
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer le nom du repas');
      return;
    }

    if (!formData.quantity || parseInt(formData.quantity) <= 0) {
      Alert.alert('Erreur', 'Veuillez entrer une quantité valide');
      return;
    }

    if (!formData.distributorId) {
      Alert.alert('Erreur', 'Veuillez sélectionner une mangoire');
      return;
    }

    setLoading(true);
    try {
      await mealsApi.create({
        userId: user?.id,
        name: formData.name.trim(),
        time: formData.time,
        quantity: parseInt(formData.quantity),
        distributorId: formData.distributorId,
        recurrence: formData.recurrence,
        enabled: formData.enabled,
      });

      Alert.alert('Succès', 'Repas ajouté avec succès', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('Erreur', error.message || "Erreur lors de l'ajout du repas");
    } finally {
      setLoading(false);
    }
  };

  const renderTimePicker = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const minutes = [0, 15, 30, 45];
    const [currentHour, currentMinute] = formData.time.split(':').map(Number);

    return (
      <View style={styles.timePickerContainer}>
        <View style={styles.timePickerRow}>
          <View style={styles.timePickerColumn}>
            <Text style={styles.timePickerLabel}>Heure</Text>
            <Picker
              selectedValue={currentHour}
              style={styles.timePicker}
              onValueChange={(hour) => handleTimeChange(hour, currentMinute)}>
              {hours.map((hour) => (
                <Picker.Item key={hour} label={hour.toString().padStart(2, '0')} value={hour} />
              ))}
            </Picker>
          </View>
          <View style={styles.timePickerColumn}>
            <Text style={styles.timePickerLabel}>Minutes</Text>
            <Picker
              selectedValue={currentMinute}
              style={styles.timePicker}
              onValueChange={(minute) => handleTimeChange(currentHour, minute)}>
              {minutes.map((minute) => (
                <Picker.Item
                  key={minute}
                  label={minute.toString().padStart(2, '0')}
                  value={minute}
                />
              ))}
            </Picker>
          </View>
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
        <Text style={styles.headerTitle}>Ajouter un repas</Text>
        <TouchableOpacity onPress={handleSave} disabled={loading}>
          <Text style={[styles.saveButton, loading && styles.saveButtonDisabled]}>
            {loading ? 'Ajout...' : 'Ajouter'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Presets rapides */}
        <View style={styles.presetsSection}>
          <Text style={styles.sectionTitle}>Repas prédéfinis</Text>
          <View style={styles.presetsContainer}>
            {mealPresets.map((preset, index) => (
              <TouchableOpacity
                key={index}
                style={styles.presetButton}
                onPress={() => handlePresetSelect(preset)}>
                <Text style={styles.presetName}>{preset.name}</Text>
                <Text style={styles.presetDetails}>
                  {preset.time} • {preset.quantity}g
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Nom du repas */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Nom du repas</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Petit déjeuner"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
          />
        </View>

        {/* Mangoire */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Mangoire</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.distributorId}
              style={styles.picker}
              onValueChange={(distributorId) => setFormData({ ...formData, distributorId })}>
              <Picker.Item label="Sélectionner une mangoire" value={null} />
              {distributors.map((distributor) => (
                <Picker.Item key={distributor.id} label={distributor.name} value={distributor.id} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Heure */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Heure du repas</Text>
          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => setShowTimePicker(!showTimePicker)}>
            <Text style={styles.timeButtonText}>{formData.time}</Text>
            <Text style={styles.timeButtonIcon}>🕒</Text>
          </TouchableOpacity>
          {showTimePicker && renderTimePicker()}
        </View>

        {/* Quantité */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Quantité (grammes)</Text>
          <TextInput
            style={styles.input}
            placeholder="50"
            value={formData.quantity}
            onChangeText={(text) => setFormData({ ...formData, quantity: text })}
            keyboardType="numeric"
          />
          <Text style={styles.helperText}>Quantité de nourriture à distribuer pour ce repas</Text>
        </View>

        {/* Récurrence */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Récurrence</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.recurrence}
              style={styles.picker}
              onValueChange={(recurrence) => setFormData({ ...formData, recurrence })}>
              {recurrenceOptions.map((option) => (
                <Picker.Item key={option} label={option} value={option} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Activation */}
        <View style={styles.switchSection}>
          <View style={styles.switchContainer}>
            <View style={styles.switchText}>
              <Text style={styles.switchLabel}>Activer ce repas</Text>
              <Text style={styles.switchDescription}>
                Le repas sera automatiquement distribué selon la programmation
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.switch, formData.enabled && styles.switchEnabled]}
              onPress={() => setFormData({ ...formData, enabled: !formData.enabled })}>
              <View style={[styles.switchThumb, formData.enabled && styles.switchThumbEnabled]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Résumé */}
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>Résumé du repas</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Repas :</Text>
              <Text style={styles.summaryValue}>{formData.name || 'Non défini'}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Mangoire :</Text>
              <Text style={styles.summaryValue}>
                {distributors.find((d) => d.id === formData.distributorId)?.name ||
                  'Non sélectionnée'}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Heure :</Text>
              <Text style={styles.summaryValue}>{formData.time}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Quantité :</Text>
              <Text style={styles.summaryValue}>{formData.quantity}g</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Récurrence :</Text>
              <Text style={styles.summaryValue}>{formData.recurrence}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Statut :</Text>
              <Text
                style={[styles.summaryValue, { color: formData.enabled ? '#4CD964' : '#FF3B30' }]}>
                {formData.enabled ? 'Activé' : 'Désactivé'}
              </Text>
            </View>
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  presetsSection: {
    paddingVertical: 20,
  },
  presetsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  presetButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  presetName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  presetDetails: {
    fontSize: 12,
    color: '#666',
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
  timeButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  timeButtonText: {
    fontSize: 16,
    color: '#333',
  },
  timeButtonIcon: {
    fontSize: 20,
  },
  timePickerContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  timePickerRow: {
    flexDirection: 'row',
    gap: 16,
  },
  timePickerColumn: {
    flex: 1,
  },
  timePickerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  timePicker: {
    height: 120,
  },
  switchSection: {
    marginBottom: 20,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  switchText: {
    flex: 1,
    marginRight: 16,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  switchDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  switch: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  switchEnabled: {
    backgroundColor: '#4ECDC4',
  },
  switchThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  switchThumbEnabled: {
    alignSelf: 'flex-end',
  },
  summarySection: {
    marginBottom: 30,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
});
