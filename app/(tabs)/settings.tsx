import { BORDER_RADIUS, COLORS, SHADOWS, SPACING } from '@/constants/ThemeColors';
import { useAuth } from '@/hooks/useAuth';
import { distributorApi } from '@/utils/BaseAPI';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
  const router = useRouter();
  const [distributorCount, setDistributorCount] = useState(0);
  const { user, logout } = useAuth();

  const loadSettings = React.useCallback(async () => {
    try {
      console.log('[Settings] Chargement des paramètres pour utilisateur:', user?.id);
      // Charger le nombre de mangeoires de l'utilisateur
      const distributors = user?.id
        ? await distributorApi.getByUser(user.id)
        : await distributorApi.getStatus();
      console.log('[Settings] Distributeurs chargés:', distributors);
      setDistributorCount(distributors.length);
      console.log('[Settings] Nombre de distributeurs:', distributors.length);
    } catch (error) {
      console.error('[Settings] Erreur lors du chargement:', error);
    }
  }, [user?.id]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleContactSupport = () => {
    Alert.alert(
      'Contacter le support',
      'Pour toute question, veuillez nous envoyer un email à support@smart-pet-feeder.com',
      [{ text: 'Fermer', style: 'default' }],
    );
  };

  const handleLogout = async () => {
    Alert.alert('Déconnexion', 'Êtes-vous sûr de vouloir vous déconnecter ?', [
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
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Réglages</Text>
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
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => router.push('/user-profile')}>
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
                {distributorCount} mangeoire{distributorCount > 1 ? 's' : ''} connectée
                {distributorCount > 1 ? 's' : ''}
              </Text>
            </View>
          </View>
        </View>

        {/* Paramètres généraux */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Paramètres généraux</Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push('/animal-management')}>
            <View style={styles.settingIcon}>
              <Ionicons name="paw" size={20} color="#666" />
            </View>
            <Text style={styles.settingText}>Gestion des animaux</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push('/animal-types-management')}>
            <View style={styles.settingIcon}>
              <Ionicons name="list" size={20} color="#666" />
            </View>
            <Text style={styles.settingText}>Gestion des types d'animaux</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push('/animal-breeds-management')}>
            <View style={styles.settingIcon}>
              <Ionicons name="filter" size={20} color="#666" />
            </View>
            <Text style={styles.settingText}>Gestion des races</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push('/distributor-management')}>
            <View style={styles.settingIcon}>
              <Ionicons name="hardware-chip" size={20} color="#666" />
            </View>
            <Text style={styles.settingText}>Gestion des mangeoires</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push('/meals-management')}>
            <View style={styles.settingIcon}>
              <Ionicons name="restaurant" size={20} color="#666" />
            </View>
            <Text style={styles.settingText}>Gestion des repas</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>

        {/* Section Compte */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Compte</Text>

          <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/user-profile')}>
            <View style={styles.settingIcon}>
              <Ionicons name="person" size={20} color="#666" />
            </View>
            <Text style={styles.settingText}>Informations personnelles</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push('/change-password')}>
            <View style={styles.settingIcon}>
              <Ionicons name="lock-closed" size={20} color="#666" />
            </View>
            <Text style={styles.settingText}>Changer le mot de passe</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          {/* Bouton de déconnexion */}
          <TouchableOpacity style={[styles.settingItem, styles.logoutItem]} onPress={handleLogout}>
            <View style={[styles.settingIcon, styles.logoutIcon]}>
              <Ionicons name="log-out" size={20} color="#FF3B30" />
            </View>
            <Text style={[styles.settingText, styles.logoutText]}>Déconnexion</Text>
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
          <Text style={styles.copyrightText}>© 2025 Smart Pet Solutions</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  notificationButton: {
    position: 'relative',
    padding: SPACING.sm,
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 12,
    height: 12,
    backgroundColor: COLORS.danger,
    borderRadius: 6,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: COLORS.white,
    marginTop: SPACING.md,
    paddingVertical: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.lg,
    ...SHADOWS.medium,
  },
  userAvatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  editButton: {
    padding: SPACING.sm,
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  deviceIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.lg,
    ...SHADOWS.small,
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
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  deviceStatus: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  detailsButton: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.medium,
  },
  detailsButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  settingContent: {
    flex: 1,
  },
  settingValue: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  wifiStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  wifiIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
    marginRight: SPACING.sm,
  },
  wifiText: {
    fontSize: 14,
    color: COLORS.success,
  },
  updateBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.small,
  },
  updateText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '500',
  },
  logoutItem: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: SPACING.md,
  },
  logoutIcon: {
    backgroundColor: '#ffebee',
  },
  logoutText: {
    color: COLORS.danger,
    fontWeight: '500',
  },
  dangerItem: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  dangerIcon: {
    backgroundColor: '#ffebee',
  },
  dangerText: {
    color: COLORS.danger,
    fontWeight: '500',
  },
  supportButton: {
    backgroundColor: COLORS.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: SPACING.xl,
    marginTop: SPACING.xl,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.round,
    ...SHADOWS.small,
  },
  supportIcon: {
    marginRight: SPACING.md,
  },
  supportButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: SPACING.xl,
  },
  appName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  versionText: {
    fontSize: 12,
    color: COLORS.textTertiary,
    marginBottom: SPACING.sm,
  },
  copyrightText: {
    fontSize: 12,
    color: COLORS.textTertiary,
    marginBottom: SPACING.lg,
  },
  linkButton: {
    marginVertical: SPACING.sm,
  },
  linkText: {
    fontSize: 14,
    color: COLORS.accent,
    textDecorationLine: 'underline',
  },
});
