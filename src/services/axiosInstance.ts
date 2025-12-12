import axios from 'axios';
import { Alert } from 'react-native';
import AuthService from './authService';

const axiosInstance = axios.create({
  baseURL: AuthService.BASE_URL,
});

export const setupAxiosInterceptors = (logOut: () => void) => {
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 403 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          Alert.alert('Session Expired', 'You have been logged out due to an expired session.', [
            { text: 'OK', onPress: () => logOut() },
          ]);
        } catch (error) {
          throw new Error('Logout failed');
        }
      }

      return Promise.reject(error);
    },
  );
};

export default axiosInstance;
