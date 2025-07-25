/**
 * Hook for managing snipe configuration storage and retrieval
 */

import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { SnipeConfig } from '../types/trading';
import WixIntegration from '../utils/wixIntegration';

interface SavedSnipeConfig extends SnipeConfig {
  name: string;
  description?: string;
  lastUsed: number;
  favorite: boolean;
}

interface UseSnipeConfigStorageReturn {
  savedConfigs: SavedSnipeConfig[];
  saveConfig: (config: SnipeConfig, name: string, description?: string) => Promise<void>;
  loadConfig: (configId: string) => SavedSnipeConfig | null;
  deleteConfig: (configId: string) => Promise<void>;
  favoriteConfig: (configId: string, favorite: boolean) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function useSnipeConfigStorage(): UseSnipeConfigStorageReturn {
  const [savedConfigs, setSavedConfigs] = useState<SavedSnipeConfig[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wixIntegration = WixIntegration.getInstance();

  /**
   * Load saved configurations on mount
   */
  useEffect(() => {
    loadSavedConfigs();
  }, []);

  /**
   * Load all saved configurations from storage
   */
  const loadSavedConfigs = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (wixIntegration.isWix()) {
        // Load from Wix database
        const configs = await wixIntegration.getSnipeConfigs();
        setSavedConfigs(configs);
      } else {
        // Load from localStorage
        const saved = localStorage.getItem('cryptosniper_saved_configs');
        if (saved) {
          const configs = JSON.parse(saved);
          setSavedConfigs(configs);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load saved configurations');
      console.error('Error loading saved configs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Save a snipe configuration
   */
  const saveConfig = async (config: SnipeConfig, name: string, description?: string) => {
    setError(null);

    try {
      const savedConfig: SavedSnipeConfig = {
        ...config,
        id: uuidv4(),
        name,
        description,
        lastUsed: Date.now(),
        favorite: false,
      };

      if (wixIntegration.isWix()) {
        // Save to Wix database
        await wixIntegration.saveSnipeConfig(savedConfig);
        await loadSavedConfigs(); // Refresh list
      } else {
        // Save to localStorage
        const updatedConfigs = [...savedConfigs, savedConfig];
        setSavedConfigs(updatedConfigs);
        localStorage.setItem('cryptosniper_saved_configs', JSON.stringify(updatedConfigs));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save configuration');
      console.error('Error saving config:', err);
      throw err;
    }
  };

  /**
   * Load a specific configuration
   */
  const loadConfig = (configId: string): SavedSnipeConfig | null => {
    const config = savedConfigs.find(c => c.id === configId);
    if (config) {
      // Update last used timestamp
      updateLastUsed(configId);
      return config;
    }
    return null;
  };

  /**
   * Delete a saved configuration
   */
  const deleteConfig = async (configId: string) => {
    setError(null);

    try {
      if (wixIntegration.isWix()) {
        // Delete from Wix database
        await fetch('/_functions/deleteSnipeConfig', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ configId })
        });
        await loadSavedConfigs(); // Refresh list
      } else {
        // Delete from localStorage
        const updatedConfigs = savedConfigs.filter(c => c.id !== configId);
        setSavedConfigs(updatedConfigs);
        localStorage.setItem('cryptosniper_saved_configs', JSON.stringify(updatedConfigs));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete configuration');
      console.error('Error deleting config:', err);
      throw err;
    }
  };

  /**
   * Toggle favorite status of a configuration
   */
  const favoriteConfig = async (configId: string, favorite: boolean) => {
    setError(null);

    try {
      if (wixIntegration.isWix()) {
        // Update in Wix database
        await fetch('/_functions/updateSnipeConfig', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ configId, updates: { favorite } })
        });
        await loadSavedConfigs(); // Refresh list
      } else {
        // Update in localStorage
        const updatedConfigs = savedConfigs.map(config =>
          config.id === configId ? { ...config, favorite } : config
        );
        setSavedConfigs(updatedConfigs);
        localStorage.setItem('cryptosniper_saved_configs', JSON.stringify(updatedConfigs));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update configuration');
      console.error('Error updating config favorite:', err);
      throw err;
    }
  };

  /**
   * Update last used timestamp
   */
  const updateLastUsed = async (configId: string) => {
    try {
      if (wixIntegration.isWix()) {
        // Update in Wix database
        await fetch('/_functions/updateSnipeConfig', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ configId, updates: { lastUsed: Date.now() } })
        });
      } else {
        // Update in localStorage
        const updatedConfigs = savedConfigs.map(config =>
          config.id === configId ? { ...config, lastUsed: Date.now() } : config
        );
        setSavedConfigs(updatedConfigs);
        localStorage.setItem('cryptosniper_saved_configs', JSON.stringify(updatedConfigs));
      }
    } catch (err: any) {
      console.error('Error updating last used:', err);
    }
  };

  return {
    savedConfigs,
    saveConfig,
    loadConfig,
    deleteConfig,
    favoriteConfig,
    isLoading,
    error,
  };
}
