import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';
const STORED_CREDENTIALS_KEY = 'stored_credentials';

export class BiometricAuthService {
  /**
   * Check if device supports biometric authentication
   */
  static async isBiometricAvailable(): Promise<boolean> {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      return compatible && enrolled;
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      return false;
    }
  }

  /**
   * Get available biometric types
   */
  static async getAvailableBiometrics(): Promise<LocalAuthentication.AuthenticationType[]> {
    try {
      return await LocalAuthentication.supportedAuthenticationTypesAsync();
    } catch (error) {
      console.error('Error getting biometric types:', error);
      return [];
    }
  }

  /**
   * Enable biometric authentication
   */
  static async enableBiometric(email: string, password: string): Promise<boolean> {
    try {
      const available = await this.isBiometricAvailable();
      if (!available) {
        throw new Error('Biometric authentication not available');
      }

      // Store credentials securely
      await SecureStore.setItemAsync(STORED_CREDENTIALS_KEY, JSON.stringify({ email, password }));
      await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, 'true');

      return true;
    } catch (error) {
      console.error('Error enabling biometric:', error);
      return false;
    }
  }

  /**
   * Authenticate using biometric
   */
  static async authenticateWithBiometric(): Promise<{ email: string; password: string } | null> {
    try {
      const enabled = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
      if (enabled !== 'true') {
        return null;
      }

      const authenticated = await LocalAuthentication.authenticateAsync({
        disableDeviceFallback: false,
        reason: 'Authenticate to access your Azora account',
      });

      if (!authenticated.success) {
        return null;
      }

      const credentials = await SecureStore.getItemAsync(STORED_CREDENTIALS_KEY);
      if (!credentials) {
        return null;
      }

      return JSON.parse(credentials);
    } catch (error) {
      console.error('Error authenticating with biometric:', error);
      return null;
    }
  }

  /**
   * Disable biometric authentication
   */
  static async disableBiometric(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(STORED_CREDENTIALS_KEY);
      await AsyncStorage.removeItem(BIOMETRIC_ENABLED_KEY);
    } catch (error) {
      console.error('Error disabling biometric:', error);
    }
  }

  /**
   * Check if biometric is enabled
   */
  static async isBiometricEnabled(): Promise<boolean> {
    const enabled = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
    return enabled === 'true';
  }
}
