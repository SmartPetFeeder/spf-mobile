import { BORDER_RADIUS, COLORS, SHADOWS, SPACING } from '@/constants/ThemeColors';
import { useAuth } from '@/hooks/useAuth';
import { Notification } from '@/types';
import { animalsApi, distributorApi, mealsApi, notificationsApi } from '@/utils/BaseAPI';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function NotificationsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const loadNotifications = useCallback(async () => {
    try {
      if (!user?.id) return;

      // Charger les notifications existantes depuis BD
      const storedNotifications = await notificationsApi.getByUser(user.id);

      // Charger les données
      const [mealsData, animalsData, distributorsData] = await Promise.all([
        mealsApi.getByUser(user.id),
        animalsApi.getByUser(user.id),
        distributorApi.getByUser(user.id),
      ]);

      const generatedNotifications: Notification[] = [];
      const notificationsToCreate: any[] = [];

      // 1. Notifications des repas actifs à venir
      if (mealsData && mealsData.length > 0) {
        const enabledMeals = mealsData.filter((meal: any) => meal.enabled);
        const now = new Date();
        const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        enabledMeals.forEach((meal: any) => {
          const animal = animalsData?.find((a: any) => a.id === meal.animalId);
          const mealTime = meal.time;
          const notifId = `meal-reminder-${meal.id}`;
          const existingNotif = storedNotifications?.find((n: any) => n.id === notifId);

          // Ne pas régénérer si supprimée
          if (existingNotif?.deleted) return;

          if (mealTime > currentTimeStr) {
            const [hours, mins] = mealTime.split(':').map(Number);
            const mealDate = new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate(),
              hours,
              mins,
            );
            const diffMins = Math.round((mealDate.getTime() - now.getTime()) / 60000);

            if (diffMins <= 30 && diffMins > 0) {
              generatedNotifications.push({
                id: notifId,
                type: 'reminder',
                title: 'Rappel repas',
                message: `${meal.name} de ${animal?.name || "l'animal"} dans ${diffMins}m`,
                timestamp: new Date(existingNotif?.createdAt || now),
                read: existingNotif?.read || false,
                icon: '⏰',
                color: COLORS.warning,
                actionId: meal.id.toString(),
              });

              // Ajouter à la queue de création si elle n'existe pas
              if (!existingNotif) {
                notificationsToCreate.push({
                  id: notifId,
                  type: 'reminder',
                  title: 'Rappel repas',
                  message: `${meal.name} de ${animal?.name || "l'animal"} dans ${diffMins}m`,
                  read: false,
                  userId: user.id,
                });
              }
            }
          }
        });
      }

      // 2. Notifications des mangeoires
      if (distributorsData && distributorsData.length > 0) {
        distributorsData.forEach((distributor: any) => {
          // Stock faible
          if (distributor.currentLevel < 30) {
            const notifId = `low-food-${distributor.id}`;
            const existingNotif = storedNotifications?.find((n: any) => n.id === notifId);

            // Ne pas régénérer si supprimée
            if (!existingNotif?.deleted) {
              generatedNotifications.push({
                id: notifId,
                type: 'lowFood',
                title: 'Stock faible ⚠️',
                message: `${distributor.name || 'Mangeoire'}: ${distributor.currentLevel}% restant`,
                timestamp: new Date(existingNotif?.createdAt || new Date()),
                read: existingNotif?.read || false,
                icon: '⚠️',
                color: COLORS.danger,
                actionId: distributor.id.toString(),
              });

              // Ajouter à la queue si elle n'existe pas
              if (!existingNotif) {
                notificationsToCreate.push({
                  id: notifId,
                  type: 'lowFood',
                  title: 'Stock faible ⚠️',
                  message: `${distributor.name || 'Mangeoire'}: ${distributor.currentLevel}% restant`,
                  read: false,
                  userId: user.id,
                });
              }
            }
          }

          // Mangeoire déconnectée
          if (!distributor.connected) {
            const notifId = `connection-${distributor.id}`;
            const existingNotif = storedNotifications?.find((n: any) => n.id === notifId);

            // Ne pas régénérer si supprimée
            if (!existingNotif?.deleted) {
              generatedNotifications.push({
                id: notifId,
                type: 'connection',
                title: 'Mangeoire déconnectée',
                message: `${distributor.name || 'Mangeoire'} n'est pas connectée`,
                timestamp: new Date(existingNotif?.createdAt || new Date()),
                read: existingNotif?.read || false,
                icon: '📡',
                color: COLORS.danger,
                actionId: distributor.id.toString(),
              });

              // Ajouter à la queue si elle n'existe pas
              if (!existingNotif) {
                notificationsToCreate.push({
                  id: notifId,
                  type: 'connection',
                  title: 'Mangeoire déconnectée',
                  message: `${distributor.name || 'Mangeoire'} n'est pas connectée`,
                  read: false,
                  userId: user.id,
                });
              }
            }
          }
        });
      }

      // Créer les notifications en arrière-plan (non-bloquant)
      if (notificationsToCreate.length > 0) {
        Promise.all(
          notificationsToCreate.map((notif) =>
            notificationsApi.create(notif).catch((e) => {
              console.log('[Notifications] Notification existante ou erreur:', e);
            }),
          ),
        ).catch((e) => console.log('[Notifications] Erreur batch:', e));
      }

      // Trier par date (plus récent en premier)
      generatedNotifications.sort((a, b) => {
        const timeA =
          a.timestamp instanceof Date ? a.timestamp.getTime() : new Date(a.timestamp).getTime();
        const timeB =
          b.timestamp instanceof Date ? b.timestamp.getTime() : new Date(b.timestamp).getTime();
        return timeB - timeA;
      });
      setNotifications(generatedNotifications);
    } catch (error) {
      console.error('[Notifications] Erreur:', error);
    }
  }, [user?.id]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const markAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)),
    );
    // Sauvegarder en BD
    try {
      await notificationsApi.markAsRead(id);
    } catch (error) {
      console.error('[Notifications] Erreur:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
    // Marquer comme supprimée en BD (au lieu de la supprimer)
    try {
      await notificationsApi.update(id, { deleted: true });
    } catch (error) {
      console.error('[Notifications] Erreur:', error);
    }
  };

  const markAllAsRead = async () => {
    const allNotifs = notifications;
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
    try {
      await Promise.all(
        allNotifs.filter((n) => !n.read).map((n) => notificationsApi.markAsRead(n.id)),
      );
    } catch (error) {
      console.error('[Notifications] Erreur:', error);
    }
  };

  const clearAll = async () => {
    const allNotifs = notifications;
    setNotifications([]);
    try {
      await Promise.all(allNotifs.map((n) => notificationsApi.delete(n.id)));
    } catch (error) {
      console.error('[Notifications] Erreur:', error);
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}j ago`;
    return date.toLocaleDateString('fr-FR');
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[styles.notificationItem, !item.read && styles.notificationItemUnread]}
      onPress={() => markAsRead(String(item.id))}>
      <View style={[styles.iconContainer, { backgroundColor: `${item.color}20` }]}>
        <Text style={styles.icon}>{item.icon}</Text>
      </View>

      <View style={styles.notificationContent}>
        <Text style={[styles.notificationTitle, !item.read && styles.notificationTitleUnread]}>
          {item.title}
        </Text>
        <Text style={styles.notificationMessage} numberOfLines={2}>
          {item.message}
        </Text>
        <Text style={styles.notificationTime}>
          {formatTime(item.timestamp instanceof Date ? item.timestamp : new Date(item.timestamp))}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteNotification(String(item.id))}>
        <Ionicons name="close" size={18} color={COLORS.textTertiary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity onPress={markAllAsRead} style={styles.headerAction}>
          <Text style={styles.headerActionText}>Tout lire</Text>
        </TouchableOpacity>
      </View>

      {unreadCount > 0 && (
        <View style={styles.unreadBanner}>
          <Text style={styles.unreadBannerText}>
            {unreadCount} notification{unreadCount > 1 ? 's' : ''} non lue
            {unreadCount > 1 ? 's' : ''}
          </Text>
        </View>
      )}

      {notifications.length > 0 ? (
        <>
          <FlatList
            data={notifications}
            renderItem={renderNotification}
            keyExtractor={(item) => String(item.id)}
            scrollEnabled={false}
            contentContainerStyle={styles.listContent}
          />

          <TouchableOpacity style={styles.clearAllButton} onPress={clearAll}>
            <Text style={styles.clearAllButtonText}>Effacer tout</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔔</Text>
          <Text style={styles.emptyTitle}>Aucune notification</Text>
          <Text style={styles.emptyMessage}>
            Vous serez notifié des mises à jour importantes ici
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xxl + 20,
    paddingBottom: SPACING.lg,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    fontSize: 24,
    color: COLORS.accent,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
    textAlign: 'center',
  },
  headerAction: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  headerActionText: {
    fontSize: 14,
    color: COLORS.accent,
    fontWeight: '600',
  },
  unreadBanner: {
    backgroundColor: `${COLORS.accent}10`,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: `${COLORS.accent}20`,
  },
  unreadBannerText: {
    fontSize: 14,
    color: COLORS.accent,
    fontWeight: '600',
    textAlign: 'center',
  },
  listContent: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.large,
    padding: SPACING.md,
    ...SHADOWS.small,
    gap: SPACING.md,
  },
  notificationItemUnread: {
    backgroundColor: `${COLORS.accent}05`,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.accent,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.medium,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 24,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  notificationTitleUnread: {
    color: COLORS.text,
    fontWeight: '700',
  },
  notificationMessage: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: SPACING.xs,
  },
  notificationTime: {
    fontSize: 12,
    color: COLORS.textTertiary,
    fontStyle: 'italic',
  },
  deleteButton: {
    padding: SPACING.sm,
  },
  clearAllButton: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: `${COLORS.danger}15`,
    borderRadius: BORDER_RADIUS.medium,
    alignItems: 'center',
  },
  clearAllButtonText: {
    fontSize: 14,
    color: COLORS.danger,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
