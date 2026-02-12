import { useCallback } from 'react';
import NotificationService from '@/services/NotificationService';

export const useNotifications = () => {
  const notifyMealDistributed = useCallback(
    async (animalName: string, mealName: string, quantity: number) => {
      try {
        await NotificationService.sendMealDistributedNotification(animalName, mealName, quantity);
      } catch (error) {
        console.error('Erreur envoi notification repas distribué:', error);
      }
    },
    [],
  );

  const notifyLowFood = useCallback(async (animalType: string, daysLeft: number) => {
    try {
      await NotificationService.sendLowFoodAlert(animalType, daysLeft);
    } catch (error) {
      console.error('Erreur envoi notification niveau bas:', error);
    }
  }, []);

  const scheduleMealReminder = useCallback(
    async (animalName: string, mealName: string, time: string) => {
      try {
        await NotificationService.scheduleMealReminder(animalName, mealName, time);
      } catch (error) {
        console.error('Erreur programmation rappel repas:', error);
      }
    },
    [],
  );

  const notifyConnection = useCallback(async (deviceName: string, isConnected: boolean) => {
    try {
      await NotificationService.sendConnectionAlert(deviceName, isConnected);
    } catch (error) {
      console.error('Erreur notification connexion:', error);
    }
  }, []);

  const cancelAllNotifications = useCallback(async () => {
    try {
      await NotificationService.cancelAllNotifications();
    } catch (error) {
      console.error('Erreur annulation notifications:', error);
    }
  }, []);

  return {
    notifyMealDistributed,
    notifyLowFood,
    scheduleMealReminder,
    notifyConnection,
    cancelAllNotifications,
  };
};
