import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

interface ApiCallOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  endpoint: string;
  body?: any;
  headers?: Record<string, string>;
  requiresAuth?: boolean;
}

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

const apiCall = async <T = any>({
  method,
  endpoint,
  body,
  headers = {},
  requiresAuth = true,
}: ApiCallOptions): Promise<T> => {
  try {
    const url = `${BASE_URL}${endpoint}`;

    // Ajouter le token d'authentification si requis
    if (requiresAuth && !endpoint.startsWith('/auth/')) {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    // Configuration de la requête
    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    // Ajouter le body pour les requêtes non-GET
    if (body && method !== 'GET') {
      config.body = JSON.stringify(body);
    }

    // Effectuer la requête
    const response = await fetch(url, config);

    // Vérifier le statut de la réponse
    if (!response.ok) {
      let errorMessage = `Erreur ${response.status}`;

      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        // Si on ne peut pas parser la réponse en JSON, garder le message par défaut
      }

      throw new ApiError(errorMessage, response.status);
    }

    // Traiter la réponse
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }

    return response.text() as any;
  } catch (error) {
    // Re-lancer les ApiError
    if (error instanceof ApiError) {
      throw error;
    }

    // Gérer les erreurs réseau
    if (error instanceof TypeError && error.message.includes('Network request failed')) {
      throw new ApiError('Erreur de connexion. Vérifiez votre connexion internet.', 0);
    }

    // Autres erreurs
    throw new ApiError("Une erreur inattendue s'est produite", 500);
  }
};

// Fonctions utilitaires spécifiques
export const authApi = {
  login: (email: string, password: string) =>
    apiCall({
      method: 'POST',
      endpoint: '/auth/login',
      body: { email, password },
      requiresAuth: false,
    }),

  register: (name: string, email: string, password: string) =>
    apiCall({
      method: 'POST',
      endpoint: '/auth/register',
      body: { name, email, password },
      requiresAuth: false,
    }),

  forgotPassword: (email: string) =>
    apiCall({
      method: 'POST',
      endpoint: '/auth/forgot-password',
      body: { email },
      requiresAuth: false,
    }),
};

export const animalsApi = {
  getAll: () => apiCall({ method: 'GET', endpoint: '/animals' }),
  getByUser: (userId: number) => apiCall({ method: 'GET', endpoint: `/animals?userId=${userId}` }),
  create: (animal: any) => apiCall({ method: 'POST', endpoint: '/animals', body: animal }),
  update: (id: number, animal: any) =>
    apiCall({ method: 'PUT', endpoint: `/animals/${id}`, body: animal }),
  delete: (id: number) => apiCall({ method: 'DELETE', endpoint: `/animals/${id}` }),
};

export const animalTypesApi = {
  getAll: () => apiCall({ method: 'GET', endpoint: '/animalTypes' }),
  create: (type: any) => apiCall({ method: 'POST', endpoint: '/animalTypes', body: type }),
  update: (id: number, type: any) =>
    apiCall({ method: 'PUT', endpoint: `/animalTypes/${id}`, body: type }),
  delete: (id: number) => apiCall({ method: 'DELETE', endpoint: `/animalTypes/${id}` }),
};

export const animalBreedsApi = {
  getAll: () => apiCall({ method: 'GET', endpoint: '/animalBreeds' }),
  getByType: (type: string) =>
    apiCall({ method: 'GET', endpoint: `/animalBreeds?type=${encodeURIComponent(type)}` }),
  create: (breed: any) => apiCall({ method: 'POST', endpoint: '/animalBreeds', body: breed }),
  update: (id: number, breed: any) =>
    apiCall({ method: 'PUT', endpoint: `/animalBreeds/${id}`, body: breed }),
  delete: (id: number) => apiCall({ method: 'DELETE', endpoint: `/animalBreeds/${id}` }),
};

export const mealsApi = {
  getAll: () => apiCall({ method: 'GET', endpoint: '/meals' }),
  getByUser: (userId: number) => apiCall({ method: 'GET', endpoint: `/meals?userId=${userId}` }),
  getByDistributor: (distributorId: number) => apiCall({ method: 'GET', endpoint: `/meals?distributorId=${distributorId}` }),
  getByAnimal: (animalId: number) =>
    apiCall({ method: 'GET', endpoint: `/meals?animalId=${animalId}` }),
  create: (meal: any) => apiCall({ method: 'POST', endpoint: '/meals', body: meal }),
  update: (id: number, meal: any) =>
    apiCall({ method: 'PUT', endpoint: `/meals/${id}`, body: meal }),
  delete: (id: number) => apiCall({ method: 'DELETE', endpoint: `/meals/${id}` }),
  distributeNow: () => apiCall({ method: 'POST', endpoint: '/meals/distribute-now' }),
};

export const distributorApi = {
  getStatus: () => apiCall({ method: 'GET', endpoint: '/distributorStatus' }),
  getByUser: (userId: number) =>
    apiCall({ method: 'GET', endpoint: `/distributorStatus?userId=${userId}` }),
  getByAnimal: (animalId: number) =>
    apiCall({ method: 'GET', endpoint: `/distributorStatus?animalId=${animalId}` }),
  create: (distributor: any) =>
    apiCall({ method: 'POST', endpoint: '/distributorStatus', body: distributor }),
  update: (id: number, distributor: any) =>
    apiCall({ method: 'PUT', endpoint: `/distributorStatus/${id}`, body: distributor }),
  delete: (id: number) => apiCall({ method: 'DELETE', endpoint: `/distributorStatus/${id}` }),
  calibrate: () => apiCall({ method: 'POST', endpoint: '/distributor/calibrate' }),
  updateFirmware: () => apiCall({ method: 'POST', endpoint: '/firmware/update' }),
};

export const statisticsApi = {
  getAll: () => apiCall({ method: 'GET', endpoint: '/statistics' }),
  getByAnimal: (animalId: number) =>
    apiCall({ method: 'GET', endpoint: `/statistics?animalId=${animalId}` }),
  getByUser: (userId: number) =>
    apiCall({ method: 'GET', endpoint: `/statistics?userId=${userId}` }),
};

export const planningApi = {
  getAll: () => apiCall({ method: 'GET', endpoint: '/planning' }),
  update: (id: number, planning: any) =>
    apiCall({ method: 'PUT', endpoint: `/planning/${id}`, body: planning }),
};

export const notificationsApi = {
  getAll: () => apiCall({ method: 'GET', endpoint: '/notifications' }),
  getByUser: (userId: number) =>
    apiCall({ method: 'GET', endpoint: `/notifications?userId=${userId}` }),
  create: (notification: any) =>
    apiCall({ method: 'POST', endpoint: '/notifications', body: notification }),
  update: (id: string | number, notification: any) =>
    apiCall({ method: 'PUT', endpoint: `/notifications/${id}`, body: notification }),
  delete: (id: string | number) => apiCall({ method: 'DELETE', endpoint: `/notifications/${id}` }),
  markAsRead: (id: string | number) =>
    apiCall({ method: 'PATCH', endpoint: `/notifications/${id}`, body: { read: true } }),
};

export { ApiError };
export default apiCall;
