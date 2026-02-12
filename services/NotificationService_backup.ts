import { API_CONFIG } from '@/config/api.config';

// Mock service pour Expo Go - pas d'appels directs aux notifications natives
class NotificationService {
  private isSupported = API_CONFIG.FEATURES.NOTIFICATIONS_ENABLED;

  constructor() {
    if (this.isSupported) {
      this.initializeNotifications();
    } else {
      console.log('[Notifications] Désactivées pour le développement');
    }
  }

  private async initializeNotifications() {
    try {
      // Sera implémenté quand les notifications seront supportées
      console.log('[Notifications] Service initialisé');
    } catch (error) {
      console.warn('[Notifications] Erreur initialisation:', error);
      this.isSupported = false;
    }
  }

  async registerForPushNotificationsAsync() {
    if (!this.isSupported) {
      console.log('[Notifications] Push notifications désactivées');
      return null;
    }

    try {
      // TODO: Implémenter quand les notifications seront supportées
      return null;
    } catch (error) {
      console.error('[Notifications] Erreur registration:', error);
      return null;
    }
  }

  setupNotificationListeners() {
    if (!this.isSupported) return;
    // TODO: Implémenter les listeners quand les notifications seront supportées
  }

  async scheduleMealReminder(animalName: string, mealName: string, time: string) {
    if (!this.isSupported) return;
    console.log(`[Notifications] Rappel programmé: ${mealName} pour ${animalName} à ${time}`);
  }

  async sendMealDistributedNotification(animalName: string, mealName: string, quantity: number) {
    if (!this.isSupported) return;
    console.log(`[Notifications] Repas distribué: ${quantity}g de ${mealName} pour ${animalName}`);
  }

  async sendLowFoodAlert(animalType: string, daysLeft: number) {
    if (!this.isSupported) return;
    console.log(`[Notifications] Alerte nourriture: ${daysLeft} jours restants pour ${animalType}`);
  }

  async sendConnectionAlert(deviceName: string, isConnected: boolean) {
    if (!this.isSupported) return;
    console.log(
      `[Notifications] Alerte connexion: ${deviceName} ${isConnected ? 'connecté' : 'déconnecté'}`,
    );
  }

  async cancelAllNotifications() {
    if (!this.isSupported) return;
    console.log('[Notifications] Toutes les notifications annulées');
  }

  async cancelNotificationsByCategory(category: string) {
    if (!this.isSupported) return;
    console.log(`[Notifications] Notifications annulées pour: ${category}`);
  }
}

export default new NotificationService();
