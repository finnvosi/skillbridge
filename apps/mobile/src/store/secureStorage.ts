// Secure session storage for auth material (blueprint §12: expo-secure-store
// for refresh tokens and sensitive session data).
//
// expo-secure-store is native-only (iOS Keychain / Android Keystore). On web it
// is unavailable, so we fall back to AsyncStorage there. Everything else uses
// the secure store; failures degrade to AsyncStorage rather than crashing.
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StateStorage } from 'zustand/middleware';

async function getItem(key: string): Promise<string | null> {
  if (Platform.OS !== 'web') {
    try {
      const value = await SecureStore.getItemAsync(key);
      if (value != null) return value;
    } catch {
      // fall through to AsyncStorage
    }
  }
  return AsyncStorage.getItem(key);
}

async function setItem(key: string, value: string): Promise<void> {
  if (Platform.OS !== 'web') {
    try {
      await SecureStore.setItemAsync(key, value);
      return;
    } catch {
      // fall through to AsyncStorage
    }
  }
  await AsyncStorage.setItem(key, value);
}

async function removeItem(key: string): Promise<void> {
  if (Platform.OS !== 'web') {
    try {
      await SecureStore.deleteItemAsync(key);
      return;
    } catch {
      // fall through to AsyncStorage
    }
  }
  await AsyncStorage.removeItem(key);
}

export const secureStorage: StateStorage = { getItem, setItem, removeItem };
