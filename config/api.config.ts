// Configuration de l'API
export const API_CONFIG = {
  // URL de base - pour développement, utiliser le mock-server
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001',

  // Endpoints
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      FORGOT_PASSWORD: '/auth/forgot-password',
    },
    ANIMALS: '/animals',
    MEALS: '/meals',
    DISTRIBUTORS: '/distributorStatus',
    STATISTICS: '/statistics',
    PLANNING: '/planning',
    NOTIFICATIONS: '/notifications',
    BEHAVIOR: '/behaviorAnalysis',
  },

  // Timeouts
  REQUEST_TIMEOUT: 30000, // 30 secondes

  // Retry config
  RETRY: {
    MAX_ATTEMPTS: 3,
    DELAY: 1000, // 1 seconde
  },

  // Feature flags
  FEATURES: {
    NOTIFICATIONS_ENABLED: false, // Désactivé pour Expo Go
    OFFLINE_MODE: false,
  },
};
