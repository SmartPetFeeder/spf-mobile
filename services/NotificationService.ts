import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

class NotificationService {
  constructor() {
    this.configureNotifications();
  }

  private configureNotifications() {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  }

  async registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });

      await Notifications.setNotificationChannelAsync('meals', {
        name: 'Notifications de repas',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
      });

      await Notifications.setNotificationChannelAsync('alerts', {
        name: 'Alertes système',
        importance: Notifications.AndroidImportance.MAX,
        sound: 'default',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        Alert.alert('Erreur', 'Les notifications sont nécessaires pour le bon fonctionnement de l\'app');
        return;
      }
      
      token = (await Notifications.getExpoPushTokenAsync()).data;
      await AsyncStorage.setItem('pushToken', token);
    }

    return token;
  }

  setupNotificationListeners() {
    // Notification reçue en foreground
    Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification reçue:', notification);
    });

    // Notification clickée
    Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification clickée:', response);
      // Ici on peut naviguer vers l'écran approprié
    });
  }

  async scheduleMealReminder(animalName: string, mealName: string, time: string) {
    const [hours, minutes] = time.split(':').map(Number);
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `Heure du repas pour ${animalName}`,
        body: `Il est temps de donner ${mealName} à ${animalName}`,
        categoryIdentifier: 'meals',
        sound: 'default',
      },
      trigger: {
        hour: hours,
        minute: minutes,
        repeats: true,
      },
    });
  }

  async sendMealDistributedNotification(animalName: string, mealName: string, quantity: number) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Repas distribué',
        body: `${quantity}g de ${mealName} ont été distribués à ${animalName}`,
        categoryIdentifier: 'meals',
        sound: 'default',
      },
      trigger: null, // Notification immédiate
    });
  }

  async sendLowFoodAlert(animalType: string, daysLeft: number) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Niveau de nourriture bas',
        body: `Plus que ${daysLeft} jours d'autonomie pour le distributeur ${animalType}`,
        categoryIdentifier: 'alerts',
        sound: 'default',
      },
      trigger: null,
    });
  }

  async sendConnectionAlert(deviceName: string, isConnected: boolean) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: isConnected ? 'Appareil reconnecté' : 'Appareil déconnecté',
        body: `${deviceName} ${isConnected ? 'est maintenant connecté' : 'a perdu la connexion'}`,
        categoryIdentifier: 'alerts',
        sound: 'default',
      },
      trigger: null,
    });
  }

  async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  async cancelNotificationsByCategory(category: string) {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    const toCancel = scheduledNotifications
      .filter(notif => notif.content.categoryIdentifier === category)
      .map(notif => notif.identifier);
    
    await Promise.all(toCancel.map(id => Notifications.cancelScheduledNotificationAsync(id)));
  }
}

export default new NotificationService();