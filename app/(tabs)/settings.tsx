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
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { distributorApi } from '@/utils/BaseAPI';

export default function SettingsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const [autoFeeding, setAutoFeeding] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [distributorCount, setDistributorCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Charger le nombre de mangeoires
      const distributors = await distributorApi.getStatus();
      setDistributorCount(distributors.length);
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error);
    }
  };

  const handleContactSupport = () => {
    Alert.alert(
      'Contacter le support',
      'Comment souhaitez-vous nous contacter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Email', onPress: () => Alert.alert('Support', 'Redirection vers mail@smart-pet-feeder.com...') },
        { text: 'Chat', onPress: () => Alert.alert('Support', 'Ouverture du chat en direct...') },
        { text: 'Téléphone', onPress: () => Alert.alert('Support', 'Appel vers +33 1 23 45 67 89...') },
      ]
    );
  };

  const handleLogout = async () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Déconnexion', 
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('/auth/login');
            } catch (error) {
              console.error('Erreur lors de la déconnexion:', error);
              Alert.alert('Erreur', 'Impossible de se déconnecter. Veuillez réessayer.');
            }
          }
        }
      ]
    );
  };

  const handleResetApp = () => {
    Alert.alert(
      'Réinitialiser l\'application',
      'Cette action supprimera toutes vos données locales. Êtes-vous sûr ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Réinitialiser', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Réinitialisation', 'Application réinitialisée avec succès');
          }
        }
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      'Export des données',
      'Vos données vont être préparées pour l\'export. Vous recevrez un email avec le fichier.',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Exporter', 
          onPress: () => {
            Alert.alert('Export', 'Export en cours... Vous recevrez un email sous peu.');
          }
        }
      ]
    );
  };

  const toggleNotification = (value) => {
    setNotifications(value);
    if (!value) {
      Alert.alert(
        'Notifications désactivées',
        'Vous ne recevrez plus d\'alertes pour les repas et les niveaux de nourriture.'
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Réglages</Text>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications" size={24} color="#333" />
          {notifications && <View style={styles.notificationBadge} />}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Profil utilisateur */}
        <View style={styles.section}>
          <View style={styles.userInfo}>
            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarText}>
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{user?.name || 'Utilisateur'}</Text>
              <Text style={styles.userEmail}>{user?.email || 'email@example.com'}</Text>
            </View>
            <TouchableOpacity style={styles.editButton}>
              <Ionicons name="pencil" size={16} color="#007AFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Section Device */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mes appareils</Text>
          <View style={styles.deviceInfo}>
            <View style={styles.deviceIcon}>
              <Text style={styles.deviceIconText}>🏠</Text>
            </View>
            <View style={styles.deviceDetails}>
              <Text style={styles.deviceName}>Smart Pet Feeder</Text>
              <Text style={styles.deviceStatus}>
                {distributorCount} mangeoire{distributorCount > 1 ? 's' : ''} connectée{distributorCount > 1 ? 's' : ''} • Firmware v2.4.1
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.detailsButton}
              onPress={() => router.push('/distributor-management')}
            >
              <Text style={styles.detailsButtonText}>Gérer</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Paramètres généraux */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Paramètres généraux</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Ionicons name="paw" size={20} color="#666" />
            </View>
            <Text style={styles.settingText}>Profil des animaux</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => router.push('/distributor-management')}
          >
            <View style={styles.settingIcon}>
              <Ionicons name="hardware-chip" size={20} color="#666" />
            </View>
            <Text style={styles.settingText}>Gestion des mangeoires</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => router.push('/distributor-settings')}
          >
            <View style={styles.settingIcon}>
              <Ionicons name="options" size={20} color="#666" />
            </View>
            <Text style={styles.settingText}>Paramètres des mangeoires</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <View style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Ionicons name="notifications" size={20} color="#666" />
            </View>
            <Text style={styles.settingText}>Notifications</Text>
            <Switch
              value={notifications}
              onValueChange={toggleNotification}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={notifications ? '#007AFF' : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Ionicons name="restaurant" size={20} color="#666" />
            </View>
            <Text style={styles.settingText}>Alimentation automatique</Text>
            <Switch
              value={autoFeeding}
              onValueChange={setAutoFeeding}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={autoFeeding ? '#007AFF' : '#f4f3f4'}
            />
          </View>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Ionicons name="scale" size={20} color="#666" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingText}>Unités de mesure</Text>
              <Text style={styles.settingValue}>Grammes</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Ionicons name="wifi" size={20} color="#666" />
            </View>
            <Text style={styles.settingText}>Connectivité Wi-Fi</Text>
            <View style={styles.wifiStatus}>
              <View style={styles.wifiIndicator} />
              <Text style={styles.wifiText}>Connecté</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Paramètres avancés */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Paramètres avancés</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Ionicons name="volume-high" size={20} color="#666" />
            </View>
            <Text style={styles.settingText}>Sons de distribution</Text>
            <Switch
              value={soundEnabled}
              onValueChange={setSoundEnabled}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={soundEnabled ? '#007AFF' : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Ionicons name="moon" size={20} color="#666" />
            </View>
            <Text style={styles.settingText}>Mode sombre</Text>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={darkMode ? '#007AFF' : '#f4f3f4'}
            />
          </View>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Ionicons name="settings" size={20} color="#666" />
            </View>
            <Text style={styles.settingText}>Calibrage du distributeur</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Ionicons name="refresh" size={20} color="#666" />
            </View>
            <Text style={styles.settingText}>Mise à jour du firmware</Text>
            <View style={styles.updateBadge}>
              <Text style={styles.updateText}>À jour</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={handleExportData}
          >
            <View style={styles.settingIcon}>
              <Ionicons name="archive" size={20} color="#666" />
            </View>
            <Text style={styles.settingText}>Gestion des données</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>

        {/* Section Compte */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Compte</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Ionicons name="person" size={20} color="#666" />
            </View>
            <Text style={styles.settingText}>Informations personnelles</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Ionicons name="lock-closed" size={20} color="#666" />
            </View>
            <Text style={styles.settingText}>Changer le mot de passe</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Ionicons name="shield-checkmark" size={20} color="#666" />
            </View>
            <Text style={styles.settingText}>Confidentialité</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={handleExportData}
          >
            <View style={styles.settingIcon}>
              <Ionicons name="download" size={20} color="#666" />
            </View>
            <Text style={styles.settingText}>Exporter mes données</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          {/* Bouton de déconnexion */}
          <TouchableOpacity 
            style={[styles.settingItem, styles.logoutItem]} 
            onPress={handleLogout}
          >
            <View style={[styles.settingIcon, styles.logoutIcon]}>
              <Ionicons name="log-out" size={20} color="#FF3B30" />
            </View>
            <Text style={[styles.settingText, styles.logoutText]}>Déconnexion</Text>
          </TouchableOpacity>
        </View>

        {/* Section Aide */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aide et support</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Ionicons name="book" size={20} color="#666" />
            </View>
            <Text style={styles.settingText}>Guide d'utilisation</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Ionicons name="chatbubble" size={20} color="#666" />
            </View>
            <Text style={styles.settingText}>FAQ</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={handleContactSupport}
          >
            <View style={styles.settingIcon}>
              <Ionicons name="mail" size={20} color="#666" />
            </View>
            <Text style={styles.settingText}>Contacter le support</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Ionicons name="star" size={20} color="#666" />
            </View>
            <Text style={styles.settingText}>Évaluer l'application</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>

        {/* Section Danger */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Zone de danger</Text>
          
          <TouchableOpacity 
            style={[styles.settingItem, styles.dangerItem]}
            onPress={handleResetApp}
          >
            <View style={[styles.settingIcon, styles.dangerIcon]}>
              <Ionicons name="refresh" size={20} color="#FF3B30" />
            </View>
            <Text style={[styles.settingText, styles.dangerText]}>Réinitialiser l'application</Text>
          </TouchableOpacity>
        </View>

        {/* Bouton support */}
        <TouchableOpacity style={styles.supportButton} onPress={handleContactSupport}>
          <Ionicons name="help-circle" size={20} color="#fff" style={styles.supportIcon} />
          <Text style={styles.supportButtonText}>Besoin d'aide ?</Text>
        </TouchableOpacity>

        {/* Informations sur l'application */}
        <View style={styles.appInfo}>
          <Text style={styles.appName}>Smart Pet Feeder</Text>
          <Text style={styles.versionText}>Version 1.0.0 (Build 2024.1)</Text>
          <Text style={styles.copyrightText}>© 2024 Smart Pet Solutions</Text>
          <TouchableOpacity style={styles.linkButton}>
            <Text style={styles.linkText}>Conditions d'utilisation</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkButton}>
            <Text style={styles.linkText}>Politique de confidentialité</Text>
          </TouchableOpacity>
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  notificationButton: {
    position: 'relative',
    padding: 10,
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 12,
    height: 12,
    backgroundColor: '#FF3B30',
    borderRadius: 6,
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
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userAvatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  editButton: {
    padding: 8,
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  deviceIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4ECDC4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  deviceIconText: {
    fontSize: 24,
  },
  deviceDetails: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  deviceStatus: {
    fontSize: 12,
    color: '#666',
  },
  detailsButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  detailsButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  settingContent: {
    flex: 1,
  },
  settingValue: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  wifiStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  wifiIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CD964',
    marginRight: 6,
  },
  wifiText: {
    fontSize: 14,
    color: '#4CD964',
  },
  updateBadge: {
    backgroundColor: '#4CD964',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  updateText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  logoutItem: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginTop: 8,
  },
  logoutIcon: {
    backgroundColor: '#ffebee',
  },
  logoutText: {
    color: '#FF3B30',
    fontWeight: '500',
  },
  dangerItem: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  dangerIcon: {
    backgroundColor: '#ffebee',
  },
  dangerText: {
    color: '#FF3B30',
    fontWeight: '500',
  },
  supportButton: {
    backgroundColor: '#4ECDC4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 25,
  },
  supportIcon: {
    marginRight: 8,
  },
  supportButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  appName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  versionText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  copyrightText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 16,
  },
  linkButton: {
    marginVertical: 4,
  },
  linkText: {
    fontSize: 14,
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
});