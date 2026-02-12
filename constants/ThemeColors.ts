// Palette de couleurs commune
export const COLORS = {
  // Primaires
  primary: '#FF6B35', // Orange vif
  primaryLight: '#FFE8D6', // Orange clair pour fond
  secondary: '#4ECDC4', // Teal
  accent: '#007AFF', // Bleu accent

  // Secondaires
  success: '#4CD964',
  danger: '#FF3B30',
  warning: '#FFA000',

  // Neutres
  text: '#333333',
  textSecondary: '#666666',
  textTertiary: '#999999',
  border: '#E0E0E0',
  background: '#F8F9FA',
  white: '#FFFFFF',

  // Spécialisées
  shadow: '#000000',
};

export const SHADOWS = {
  small: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  primary: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
};

export const BORDER_RADIUS = {
  small: 8,
  medium: 12,
  large: 16,
  round: 25,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};
