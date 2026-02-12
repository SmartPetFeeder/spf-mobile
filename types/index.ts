// ===========================
// Types d'Authentification
// ===========================

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  avatar?: string;
  createdAt?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string, user: User) => Promise<void>;
  logout: () => Promise<boolean>;
  isAuthenticated: boolean;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

export interface UserData {
  id?: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  createdAt?: string;
}

// ===========================
// Types d'Animaux
// ===========================

export interface Animal {
  id: number;
  userId: number;
  name: string;
  type: string;
  breed: string;
  gender: string;
  age: number;
  ageUnit: string;
  weight: number;
  activityLevel: number;
  photo?: string;
}

export interface AnimalType {
  id: number;
  label: string;
  icon: string;
  description?: string;
  createdAt?: string;
}

export interface AnimalBreed {
  id: number;
  label: string;
  type: string;
  description?: string;
  createdAt?: string;
}

// ===========================
// Types de Distributeurs
// ===========================

export interface Distributor {
  id: number;
  userId: number;
  name: string;
  animalId: number;
  currentLevel: number;
  maxCapacity: number;
  autonomyDays: number;
  lastRefill: string;
  connected: boolean;
  firmwareVersion: string;
  location?: string;
}

export interface DistributorSettings {
  id: number;
  name: string;
  animalType: string;
  autoCalibration: boolean;
  lowLevelAlert: number;
  maintenanceReminder: boolean;
  soundEnabled: boolean;
  ledEnabled: boolean;
}

// ===========================
// Types de Repas
// ===========================

export interface Meal {
  id: number;
  userId: number;
  distributorId: number;
  name: string;
  quantity: number;
  time: string;
  enabled: boolean;
  recurrence: string;
  days?: string[]; // Pour la compatibilité avec certaines vues
  amount?: number; // Alias pour quantity (compatibilité)
  createdAt?: string;
  updatedAt?: string;
}

// ===========================
// Types de Notifications
// ===========================

export interface Notification {
  id: string;
  type: 'meal' | 'lowFood' | 'connection' | 'reminder';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  icon: string;
  color: string;
  actionId?: string;
}

// ===========================
// Types d'API
// ===========================

export interface ApiCallOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  endpoint: string;
  body?: any;
  headers?: Record<string, string>;
  requiresAuth?: boolean;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  status: number;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

// ===========================
// Types de Formulaires
// ===========================

export interface AnimalFormData {
  name: string;
  type: string;
  breed: string;
  gender: string;
  age: string;
  ageUnit: string;
  weight: string;
  activityLevel: number;
  photo?: string;
}

export interface DistributorFormData {
  name: string;
  animalId: number | null;
  maxCapacity: string;
  location: string;
}

export interface MealFormData {
  name: string;
  distributorId: number | null;
  quantity: string;
  time: string;
  enabled: boolean;
  days: string[];
}

// ===========================
// Types Utilitaires
// ===========================

export type DayOfWeek = 'Lun' | 'Mar' | 'Mer' | 'Jeu' | 'Ven' | 'Sam' | 'Dim';

export type Gender = 'Mâle' | 'Femelle';

export type AgeUnit = 'mois' | 'ans';

export type ActivityLevel = 1 | 2 | 3 | 4 | 5;

export type NotificationType = 'meal' | 'lowFood' | 'connection' | 'reminder';

// ===========================
// Types de Statistiques
// ===========================

export interface Statistics {
  id: number;
  userId?: number;
  animalId: number;
  date: string;
  totalDistributed: number;
  totalConsumed: number;
  mealsCount: number;
  averageConsumptionTime: number;
  regularity: number;
  createdAt?: string;
}

export interface DashboardStats {
  consumption?: number;
  regularity?: number;
  meals?: string;
  consumed?: string;
  speed?: string;
  goal?: string;
  totalDistributed?: number;
  averageTime?: number;
  successRate?: number;
}

// ===========================
// Types de Réponses API
// ===========================

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterResponse {
  token: string;
  user: User;
}

export interface ForgotPasswordResponse {
  message: string;
}

// ===========================
// Types de Données Additionnels
// ===========================

export interface MealData {
  id: number;
  userId: number;
  distributorId: number;
  name: string;
  quantity: number;
  time: string;
  enabled: boolean;
  days: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface DistributorData {
  id: number;
  userId: number;
  name: string;
  animalId: number;
  currentLevel: number;
  maxCapacity: number;
  autonomyDays: number;
  lastRefill: string;
  connected: boolean;
  firmwareVersion: string;
  location?: string;
}

export interface NextMealInfo {
  distributorId: number;
  distributorName: string;
  time: string;
  meal: string;
  amount: string;
  animal: string;
  mealId: number;
}
