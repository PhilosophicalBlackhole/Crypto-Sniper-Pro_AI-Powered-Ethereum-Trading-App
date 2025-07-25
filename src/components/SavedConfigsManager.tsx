/**
 * Component for managing saved snipe configurations
 */

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { 
  Save, 
  Folder, 
  Star, 
  StarOff, 
  Trash2, 
  Download, 
  Calendar,
  Settings
} from 'lucide-react';
import { SnipeConfig } from '../types/trading';
import { useSnipeConfigStorage } from '../hooks/useSnipeConfigStorage';

interface SavedConfigsManagerProps {
  currentConfig?: SnipeConfig;
  onLoadConfig: (config: SnipeConfig) => void;
}

export function SavedConfigsManager({ currentConfig, onLoadConfig }: SavedConfigsManagerProps) {
  const { savedConfigs, saveConfig, loadConfig, deleteConfig, favoriteConfig, isLoading, error } = useSnipeConfigStorage();
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveDescription, setSaveDescription] = useState('');

  /**
   * Handle saving current configuration
   */
  const handleSaveConfig = async () => {
    if (!currentConfig || !saveName.trim()) return;

    try {
      await saveConfig(currentConfig, saveName.trim(), saveDescription.trim());
      setShowSaveDialog(false);
      setSaveName('');
      setSaveDescription('');
    } catch (error) {
      console.error('Failed to save config:', error);
    }
  };

  /**
   * Handle loading a saved configuration
   */
  const handleLoadConfig = (configId: string) => {
    const config = loadConfig(configId);
    if (config) {
      onLoadConfig(config);
      setShowLoadDialog(false);
    }
  };

  /**
   * Handle deleting a configuration
   */
  const handleDeleteConfig = async (configId: string) => {
    if (confirm('Are you sure you want to delete this configuration?')) {
      try {
        await deleteConfig(configId);
      } catch (error) {
        console.error('Failed to delete config:', error);
      }
    }
  };

  /**
   * Handle toggling favorite status
   */
  const handleToggleFavorite = async (configId: string, currentFavorite: boolean) => {
    try {
      await favoriteConfig(configId, !currentFavorite);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  /**
   * Format date for display
   */
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Sort configs: favorites first, then by last used
  const sortedConfigs = [...savedConfigs].sort((a, b) => {
    if (a.favorite && !b.favorite) return -1;
    if (!a.favorite && b.favorite) return 1;
    return b.lastUsed - a.lastUsed;
  });

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex gap-2">
        <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              disabled={!currentConfig}
              className="bg-transparent border-blue-500 text-blue-400 hover:bg-blue-500/10"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Current Settings
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">Save Configuration</DialogTitle>
              <DialogDescription className="text-slate-400">
                Save your current snipe settings to use later
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="configName" className="text-slate-300">Configuration Name *</Label>
                <Input
                  id="configName"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder="e.g., Conservative MEME Strategy"
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="configDescription" className="text-slate-300">Description (Optional)</Label>
                <Textarea
                  id="configDescription"
                  value={saveDescription}
                  onChange={(e) => setSaveDescription(e.target.value)}
                  placeholder="Describe your strategy and settings..."
                  className="bg-slate-800 border-slate-600 text-white"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={() => setShowSaveDialog(false)}
                variant="outline"
                className="bg-transparent"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveConfig}
                disabled={!saveName.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Save Configuration
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showLoadDialog} onOpenChange={setShowLoadDialog}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              disabled={savedConfigs.length === 0}
              className="bg-transparent border-green-500 text-green-400 hover:bg-green-500/10"
            >
              <Folder className="h-4 w-4 mr-2" />
              Load Settings ({savedConfigs.length})
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-700 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">Load Configuration</DialogTitle>
              <DialogDescription className="text-slate-400">
                Choose a saved configuration to load
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-96 overflow-y-auto space-y-3">
              {isLoading ? (
                <div className="text-center py-8 text-slate-400">Loading configurations...</div>
              ) : sortedConfigs.length === 0 ? (
                <div className="text-center py-8 text-slate-400">No saved configurations yet</div>
              ) : (
                sortedConfigs.map((config) => (
                  <Card key={config.id} className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-white">{config.name}</h4>
                          {config.favorite && (
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleFavorite(config.id, config.favorite)}
                            className="p-1 h-6 w-6"
                          >
                            {config.favorite ? (
                              <Star className="h-3 w-3 text-yellow-400 fill-current" />
                            ) : (
                              <StarOff className="h-3 w-3 text-slate-400" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteConfig(config.id)}
                            className="p-1 h-6 w-6 text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      {config.description && (
                        <p className="text-slate-400 text-sm mb-3">{config.description}</p>
                      )}
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 text-xs">
                        <div>
                          <span className="text-slate-500">Target Price:</span>
                          <div className="text-white font-semibold">${config.targetPrice.toFixed(6)}</div>
                        </div>
                        <div>
                          <span className="text-slate-500">Amount:</span>
                          <div className="text-white font-semibold">{config.amount} ETH</div>
                        </div>
                        <div>
                          <span className="text-slate-500">Slippage:</span>
                          <div className="text-white font-semibold">{config.slippage}%</div>
                        </div>
                        <div>
                          <span className="text-slate-500">Gas:</span>
                          <div className="text-white font-semibold">{config.gasPrice} GWEI</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Calendar className="h-3 w-3" />
                          {formatDate(config.lastUsed)}
                        </div>
                        <Button
                          onClick={() => handleLoadConfig(config.id)}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Load
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
            {error && (
              <div className="text-red-400 text-sm">{error}</div>
            )}
            <DialogFooter>
              <Button
                onClick={() => setShowLoadDialog(false)}
                variant="outline"
                className="bg-transparent"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Stats */}
      {savedConfigs.length > 0 && (
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-slate-400" />
                <span className="text-slate-400">{savedConfigs.length} Saved</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-400" />
                <span className="text-slate-400">{savedConfigs.filter(c => c.favorite).length} Favorites</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
