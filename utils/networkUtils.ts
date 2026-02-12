import { API_CONFIG } from '@/config/api.config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class NetworkError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
  ) {
    super(message);
    this.name = 'NetworkError';
  }
}

/**
 * Effectue une requête HTTP avec logique de retry
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxAttempts = API_CONFIG.RETRY.MAX_ATTEMPTS,
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.REQUEST_TIMEOUT);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Ne pas retry sur les erreurs 4xx (sauf 408, 429)
      if (error instanceof Response) {
        const status = error.status;
        if (status >= 400 && status < 500 && status !== 408 && status !== 429) {
          throw error;
        }
      }

      // Attendre avant de retry
      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, API_CONFIG.RETRY.DELAY * attempt));
      }
    }
  }

  throw lastError || new NetworkError('Erreur réseau lors de la requête');
}

/**
 * Récupère le token d'authentification
 */
export async function getAuthToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem('userToken');
  } catch (error) {
    console.error('Erreur lors de la récupération du token:', error);
    return null;
  }
}

/**
 * Formate les headers avec authentification
 */
export async function getHeaders(requiresAuth = true): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (requiresAuth) {
    const token = await getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
}

/**
 * Vérifie si nous sommes en ligne
 */
export async function isOnline(): Promise<boolean> {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/health`, {
      method: 'HEAD',
    });
    return response.ok;
  } catch {
    return false;
  }
}
