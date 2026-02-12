// ============================================
// User & Authentication Types
// ============================================

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

// ============================================
// Animal Types
// ============================================

export interface Animal {
  id: string | number;
  userId: string | number;
  name: string;
  type?: string;
  typeId?: string;
  breed?: string;
  breedId?: string;
  gender?: string;
  age?: number;
  ageUnit?: string;
  birthDate?: string;
  weight?: number;
  activityLevel?: number;
  photo?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AnimalType {
  id: string | number;
  name: string;
  description?: string;
  icon?: string;
}

export interface AnimalBreed {
  id: string | number;
  name: string;
  typeId: string | number;
  description?: string;
}

// ============================================
// Distributor Types
// ============================================

export interface Distributor {
  id: string | number;
  userId: string | number;
  name: string;
  animalId?: string | number;
  currentLevel: number;
  maxCapacity: number;
  autonomyDays: number;
  lastRefill: string;
  connected: boolean;
  firmwareVersion: string;
  location?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DistributorSettings {
  id: string | number;
  distributorId?: string | number;
  name: string;
  animalType?: string;
  autoCalibration: boolean;
  lowLevelAlert: number;
  maintenanceReminder: boolean;
  soundEnabled: boolean;
  ledEnabled: boolean;
}

// ============================================
// Meal Types
// ============================================

export interface Meal {
  id: string | number;
  userId: string | number;
  animalId: string | number;
  distributorId?: string | number;
  scheduledTime: string;
  quantity: number;
  status: 'pending' | 'completed' | 'missed' | 'cancelled';
  actualTime?: string;
  actualQuantity?: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================
// Statistics Types
// ============================================

export interface Statistic {
  id: string | number;
  animalId: string | number;
  userId: string | number;
  totalConsumed?: number;
  totalDistributed?: number;
  mealsCount?: number;
  averageConsumptionTime?: number;
  regularity?: number;
  date?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CurrentStats {
  meals: string;
  consumed: string;
  speed: string;
  goal: string;
  totalDistributed: number;
  averageTime: number;
  successRate: number;
}

// ============================================
// Notification Types
// ============================================

export interface Notification {
  id: string | number;
  userId?: string | number;
  type: 'meal' | 'lowFood' | 'connection' | 'reminder' | 'alert';
  title: string;
  message: string;
  timestamp: Date | string;
  read: boolean;
  icon?: string;
  color?: string;
  actionId?: string;
  createdAt?: string;
}

// ============================================
// Form & UI Types
// ============================================

export interface FormData {
  [key: string]: string | number | boolean | null | undefined;
}

export interface SelectOption {
  label: string;
  value: string | number;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
