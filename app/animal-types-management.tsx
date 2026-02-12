import { animalTypesApi } from '@/utils/BaseAPI';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
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

export default function AnimalTypesManagementScreen() {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    label: '',
    icon: '',
    description: '',
  });
  const [searchText, setSearchText] = useState('');
  const [filteredTypes, setFilteredTypes] = useState([]);

  const commonEmojis = ['🐕', '🐱', '🐰', '🦊', '🐶', '🐈', '🦝', '🐇', '🦨', '🦡'];

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, []),
  );

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('[AnimalTypes] Chargement des types...');
      const typesList = await animalTypesApi.getAll();
      console.log('[AnimalTypes] Types chargés:', typesList);
      setTypes(typesList || []);
      setFilteredTypes(typesList || []);
    } catch (error) {
      console.error('[AnimalTypes] Erreur lors du chargement:', error);
      Alert.alert('Erreur', 'Impossible de charger les types');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text) => {
    setSearchText(text);
    const filtered = types.filter(
      (type) =>
        type.label.toLowerCase().includes(text.toLowerCase()) ||
        type.description.toLowerCase().includes(text.toLowerCase()),
    );
    setFilteredTypes(filtered);
  };

  const handleEdit = (type) => {
    setEditingId(type.id);
    setFormData({
      label: type.label,
      icon: type.icon,
      description: type.description,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ label: '', icon: '', description: '' });
  };

  const handleSaveEdit = async () => {
    if (!formData.label.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer le nom du type');
      return;
    }

    if (!formData.icon.trim()) {
      Alert.alert('Erreur', 'Veuillez sélectionner une icône');
      return;
    }

    try {
      await animalTypesApi.update(editingId, {
        label: formData.label.trim(),
        icon: formData.icon,
        description: formData.description.trim(),
      });

      const updatedTypes = types.map((t) =>
        t.id === editingId
          ? {
              ...t,
              label: formData.label.trim(),
              icon: formData.icon,
              description: formData.description.trim(),
            }
          : t,
      );
      setTypes(updatedTypes);
      handleSearch(searchText);
      setEditingId(null);
      setFormData({ label: '', icon: '', description: '' });
      Alert.alert('Succès', 'Type modifié avec succès');
    } catch (error) {
      Alert.alert('Erreur', error.message || 'Impossible de modifier le type');
    }
  };

  const handleDelete = (type) => {
    Alert.alert('Supprimer', `Êtes-vous sûr de vouloir supprimer "${type.label}"?`, [
      { text: 'Annuler', onPress: () => {} },
      {
        text: 'Supprimer',
        onPress: async () => {
          try {
            await animalTypesApi.delete(type.id);
            const updatedTypes = types.filter((t) => t.id !== type.id);
            setTypes(updatedTypes);
            handleSearch(searchText);
            Alert.alert('Succès', 'Type supprimé avec succès');
          } catch (error) {
            Alert.alert('Erreur', error.message || 'Impossible de supprimer le type');
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const handleAddNew = async () => {
    if (!formData.label.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer le nom du type');
      return;
    }

    if (!formData.icon.trim()) {
      Alert.alert('Erreur', 'Veuillez sélectionner une icône');
      return;
    }

    try {
      const newType = await animalTypesApi.create({
        label: formData.label.trim(),
        icon: formData.icon,
        description: formData.description.trim(),
      });

      const updatedTypes = [...types, newType];
      setTypes(updatedTypes);
      handleSearch(searchText);
      setFormData({ label: '', icon: '', description: '' });
      Alert.alert('Succès', 'Type ajouté avec succès');
    } catch (error) {
      Alert.alert('Erreur', error.message || "Impossible d'ajouter le type");
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
          <Text style={styles.headerTitle}>Gestion des types</Text>
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
        <Text style={styles.headerTitle}>Gestion des types</Text>
        <Text style={styles.headerSubtitle}>{filteredTypes.length} type(s)</Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}>
        {/* Formulaire d'ajout/modification */}
        <View style={styles.formSection}>
          <Text style={styles.formTitle}>{editingId ? 'Modifier le type' : 'Ajouter un type'}</Text>

          <Text style={styles.label}>Nom du type *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Chien, Chat, Lapin..."
            value={formData.label}
            onChangeText={(text) => setFormData({ ...formData, label: text })}
          />

          <Text style={styles.label}>Icône * (sélectionnez ou tapez)</Text>
          <View style={styles.emojiContainer}>
            {commonEmojis.map((emoji, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.emojiButton, formData.icon === emoji && styles.emojiButtonSelected]}
                onPress={() => setFormData({ ...formData, icon: emoji })}>
                <Text style={styles.emojiText}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={[styles.input, styles.smallInput]}
            placeholder="Ou tapez un emoji"
            value={formData.icon}
            onChangeText={(text) => setFormData({ ...formData, icon: text })}
            maxLength={2}
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Description du type"
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
              style={[styles.submitButton, editingId && styles.submitButtonFlex]}
              onPress={editingId ? handleSaveEdit : handleAddNew}>
              <Text style={styles.submitButtonText}>{editingId ? 'Modifier' : 'Ajouter'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Barre de recherche */}
        <View style={styles.searchSection}>
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un type..."
            value={searchText}
            onChangeText={handleSearch}
          />
        </View>

        {/* Liste des types */}
        {filteredTypes.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>🐾</Text>
            <Text style={styles.emptyStateTitle}>Aucun type trouvé</Text>
            <Text style={styles.emptyStateText}>Ajoutez un type via le formulaire ci-dessus</Text>
          </View>
        ) : (
          <View style={styles.typesContainer}>
            {filteredTypes.map((type) => (
              <View key={type.id} style={styles.typeCard}>
                <View style={styles.typeContent}>
                  <Text style={styles.typeIcon}>{type.icon}</Text>
                  <View style={styles.typeInfo}>
                    <Text style={styles.typeLabel}>{type.label}</Text>
                    {type.description && (
                      <Text style={styles.typeDescription}>{type.description}</Text>
                    )}
                  </View>
                </View>
                <View style={styles.typeActions}>
                  <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(type)}>
                    <Text style={styles.editButtonText}>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(type)}>
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
  smallInput: {
    marginTop: 8,
  },
  textArea: {
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  emojiContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  emojiButton: {
    width: '18%',
    aspectRatio: 1,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emojiButtonSelected: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  emojiText: {
    fontSize: 24,
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
  },
  typesContainer: {
    gap: 12,
    paddingBottom: 20,
  },
  typeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  typeContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  typeIcon: {
    fontSize: 32,
  },
  typeInfo: {
    flex: 1,
  },
  typeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  typeDescription: {
    fontSize: 12,
    color: '#999',
  },
  typeActions: {
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
