import { DistributorSettings } from '@/types';
import { distributorApi } from '@/utils/BaseAPI';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

export default function DistributorSettingsScreen() {
  const router = useRouter();
  const [distributors, setDistributors] = useState<DistributorSettings[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDistributorSettings();
  }, []);

  const loadDistributorSettings = async () => {
    try {
      setLoading(true);
      const data = await distributorApi.getStatus();
      // Transformer les données pour inclure les paramètres
      const settings = data.map((distributor: any) => ({
        id: distributor.id,
        name: distributor.name || `Mangeoire ${distributor.animalType}`,
        animalType: distributor.animalType,
        autoCalibration: distributor.autoCalibration ?? true,
        lowLevelAlert: distributor.lowLevelAlert ?? 20,
        maintenanceReminder: distributor.maintenanceReminder ?? true,
        soundEnabled: distributor.soundEnabled ?? true,
        ledEnabled: distributor.ledEnabled ?? true,
      }));
      setDistributors(settings);
    } catch (error: any) {
      Alert.alert('Erreur', 'Impossible de charger les paramètres');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateDistributorSetting = async (id: number, setting: string, value: any) => {
    try {
      const updatedDistributors = distributors.map((d) =>
        d.id === id ? { ...d, [setting]: value } : d,
      );
      setDistributors(updatedDistributors);

      // Mettre à jour sur le serveur
      const distributor = updatedDistributors.find((d) => d.id === id);
      if (distributor) {
        await distributorApi.update(id, { [setting]: value });
      }
    } catch (error: any) {
      Alert.alert('Erreur', 'Impossible de mettre à jour le paramètre');
      console.error(error);
      // Restaurer l'état précédent en cas d'erreur
      loadDistributorSettings();
    }
  };

  const handleCalibrateAll = async () => {
    Alert.alert(
      'Calibrer toutes les mangeoires',
      'Cette opération va calibrer toutes les mangeoires connectées. Continuer ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Calibrer',
          onPress: async () => {
            try {
              await distributorApi.calibrate();
              Alert.alert('Succès', 'Calibrage de toutes les mangeoires terminé');
            } catch (error: any) {
              Alert.alert('Erreur', error.message || 'Erreur lors du calibrage');
            }
          },
        },
      ],
    );
  };

  const handleUpdateFirmware = async () => {
    Alert.alert(
      'Mise à jour du firmware',
      'Cette opération va mettre à jour le firmware de toutes les mangeoires. Continuer ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Mettre à jour',
          onPress: async () => {
            try {
              await distributorApi.updateFirmware();
              Alert.alert('Succès', 'Firmware mis à jour avec succès');
            } catch (error: any) {
              Alert.alert('Erreur', error.message || 'Erreur lors de la mise à jour');
            }
          },
        },
      ],
    );
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Paramètres des mangeoires</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Actions globales */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions globales</Text>

          <TouchableOpacity style={styles.actionItem} onPress={handleCalibrateAll}>
            <View style={styles.actionIcon}>
              <Ionicons name="settings" size={20} color="#007AFF" />
            </View>
            <Text style={styles.actionText}>Calibrer toutes les mangeoires</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={handleUpdateFirmware}>
            <View style={styles.actionIcon}>
              <Ionicons name="download" size={20} color="#007AFF" />
            </View>
            <Text style={styles.actionText}>Mettre à jour le firmware</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>

        {/* Paramètres par mangeoire */}
        {distributors.map((distributor) => (
          <View key={distributor.id} style={styles.section}>
            <Text style={styles.sectionTitle}>{distributor.name}</Text>

            <View style={styles.settingItem}>
              <View style={styles.settingContent}>
                <Text style={styles.settingText}>Calibrage automatique</Text>
                <Text style={styles.settingDescription}>
                  Calibrer automatiquement lors du remplissage
                </Text>
              </View>
              <Switch
                value={distributor.autoCalibration}
                onValueChange={(value) =>
                  updateDistributorSetting(distributor.id as number, 'autoCalibration', value)
                }
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={distributor.autoCalibration ? '#007AFF' : '#f4f3f4'}
              />
            </View>

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingContent}>
                <Text style={styles.settingText}>Seuil d'alerte niveau bas</Text>
                <Text style={styles.settingValue}>{distributor.lowLevelAlert}%</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>

            <View style={styles.settingItem}>
              <View style={styles.settingContent}>
                <Text style={styles.settingText}>Rappels de maintenance</Text>
                <Text style={styles.settingDescription}>
                  Notifications pour la maintenance périodique
                </Text>
              </View>
              <Switch
                value={distributor.maintenanceReminder}
                onValueChange={(value) =>
                  updateDistributorSetting(distributor.id as number, 'maintenanceReminder', value)
                }
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={distributor.maintenanceReminder ? '#007AFF' : '#f4f3f4'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingContent}>
                <Text style={styles.settingText}>Son lors de la distribution</Text>
                <Text style={styles.settingDescription}>
                  Émettre un son lors de la distribution
                </Text>
              </View>
              <Switch
                value={distributor.soundEnabled}
                onValueChange={(value) =>
                  updateDistributorSetting(distributor.id as number, 'soundEnabled', value)
                }
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={distributor.soundEnabled ? '#007AFF' : '#f4f3f4'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingContent}>
                <Text style={styles.settingText}>Témoin LED</Text>
                <Text style={styles.settingDescription}>Indicateur lumineux de statut</Text>
              </View>
              <Switch
                value={distributor.ledEnabled}
                onValueChange={(value) =>
                  updateDistributorSetting(distributor.id as number, 'ledEnabled', value)
                }
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={distributor.ledEnabled ? '#007AFF' : '#f4f3f4'}
              />
            </View>
          </View>
        ))}

        {distributors.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Aucune mangeoire configurée</Text>
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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 10,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingContent: {
    flex: 1,
  },
  settingText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  settingValue: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});
