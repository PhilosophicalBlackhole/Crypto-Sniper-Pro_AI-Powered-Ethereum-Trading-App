/**
 * Multi-wallet connection hook supporting MetaMask, Coinbase Wallet, and other providers
 */

import { useState, useEffect, useCallback } from 'react';

export interface WalletProvider {
  id: string;
  name: string;
  icon: string;
  isInstalled: boolean;
  isConnected: boolean;
  provider?: any;
}

export interface MultiWalletState {
  connectedWallet: string | null;
  address: string | null;
  balance: string;
  chainId: number | null;
  isConnecting: boolean;
  error: string | null;
  availableWallets: WalletProvider[];
}

export function useMultiWallet() {
  const [walletState, setWalletState] = useState<MultiWalletState>({
    connectedWallet: null,
    address: null,
    balance: '0',
    chainId: null,
    isConnecting: false,
    error: null,
    availableWallets: [],
  });

  const [demoMode, setDemoMode] = useState(false);

  const detectWallets = useCallback((): WalletProvider[] => {
    const wallets: WalletProvider[] = [];

    // MetaMask
    if (window.ethereum && window.ethereum.isMetaMask) {
      wallets.push({
        id: 'metamask',
        name: 'MetaMask',
        icon: '🦊',
        isInstalled: true,
        isConnected: false,
        provider: window.ethereum,
      });
    }

    // Coinbase Wallet
    if (window.ethereum && window.ethereum.isCoinbaseWallet) {
      wallets.push({
        id: 'coinbase',
        name: 'Coinbase Wallet',
        icon: '🟦',
        isInstalled: true,
        isConnected: false,
        provider: window.ethereum,
      });
    }

    // WalletConnect (if available)
    if (window.ethereum && window.ethereum.isWalletConnect) {
      wallets.push({
        id: 'walletconnect',
        name: 'WalletConnect',
        icon: '🔗',
        isInstalled: true,
        isConnected: false,
        provider: window.ethereum,
      });
    }

    // Generic ethereum provider (fallback)
    if (window.ethereum && wallets.length === 0) {
      wallets.push({
        id: 'ethereum',
        name: 'Web3 Wallet',
        icon: '⚡',
        isInstalled: true,
        isConnected: false,
        provider: window.ethereum,
      });
    }

    // Demo wallet (always available)
    wallets.push({
      id: 'demo',
      name: 'Demo Mode',
      icon: '🎭',
      isInstalled: true,
      isConnected: false,
      provider: null,
    });

    return wallets;
  }, []);

  const updateBalance = useCallback(async (address: string, provider: any) => {
    try {
      if (provider) {
        const balance = await provider.request({
          method: 'eth_getBalance',
          params: [address, 'latest'],
        });
        const balanceInEth = (parseInt(balance, 16) / 1e18).toFixed(4);
        setWalletState(prev => ({ ...prev, balance: balanceInEth }));
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  }, []);

  const connectDemoWallet = useCallback(() => {
    setWalletState(prev => ({ ...prev, isConnecting: true, error: null }));
    
    setTimeout(() => {
      setWalletState(prev => ({
        ...prev,
        connectedWallet: 'demo',
        address: '0x742d35Cc6634C0532925a3b8D398aF7f',
        balance: '2.4567',
        chainId: 1,
        isConnecting: false,
        error: null,
        availableWallets: prev.availableWallets.map(w => 
          w.id === 'demo' ? { ...w, isConnected: true } : { ...w, isConnected: false }
        ),
      }));
      setDemoMode(true);
    }, 1000);
  }, []);

  const connectWallet = useCallback(async (walletId: string) => {
    const wallet = walletState.availableWallets.find(w => w.id === walletId);
    if (!wallet) return;

    if (walletId === 'demo') {
      connectDemoWallet();
      return;
    }

    if (!wallet.provider) {
      setWalletState(prev => ({
        ...prev,
        error: `${wallet.name} is not installed or available.`,
      }));
      return;
    }

    setWalletState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      // For multiple providers, we might need to select the specific one
      let provider = wallet.provider;
      
      // If there are multiple providers, try to select the right one
      if (window.ethereum && window.ethereum.providers) {
        const providers = window.ethereum.providers;
        if (walletId === 'metamask') {
          provider = providers.find((p: any) => p.isMetaMask) || provider;
        } else if (walletId === 'coinbase') {
          provider = providers.find((p: any) => p.isCoinbaseWallet) || provider;
        }
      }

      const accounts = await provider.request({
        method: 'eth_requestAccounts',
      });

      const chainId = await provider.request({
        method: 'eth_chainId',
      });

      if (accounts.length > 0) {
        const address = accounts[0];
        setWalletState(prev => ({
          ...prev,
          connectedWallet: walletId,
          address,
          chainId: parseInt(chainId, 16),
          isConnecting: false,
          availableWallets: prev.availableWallets.map(w => 
            w.id === walletId ? { ...w, isConnected: true } : { ...w, isConnected: false }
          ),
        }));
        await updateBalance(address, provider);
        setDemoMode(false);
      }
    } catch (error: any) {
      setWalletState(prev => ({
        ...prev,
        isConnecting: false,
        error: error.message || `Failed to connect ${wallet.name}`,
      }));
    }
  }, [walletState.availableWallets, updateBalance, connectDemoWallet]);

  const disconnectWallet = useCallback(() => {
    setWalletState(prev => ({
      ...prev,
      connectedWallet: null,
      address: null,
      balance: '0',
      chainId: null,
      isConnecting: false,
      error: null,
      availableWallets: prev.availableWallets.map(w => ({ ...w, isConnected: false })),
    }));
    setDemoMode(false);
  }, []);

  const switchWallet = useCallback(async (newWalletId: string) => {
    if (walletState.connectedWallet === newWalletId) return;
    
    // Disconnect current wallet first
    disconnectWallet();
    
    // Small delay to ensure clean disconnection
    setTimeout(() => {
      connectWallet(newWalletId);
    }, 500);
  }, [walletState.connectedWallet, disconnectWallet, connectWallet]);

  // Initialize available wallets on mount
  useEffect(() => {
    const wallets = detectWallets();
    setWalletState(prev => ({ ...prev, availableWallets: wallets }));
  }, [detectWallets]);

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum && walletState.connectedWallet && walletState.connectedWallet !== 'demo') {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setWalletState(prev => ({ ...prev, address: accounts[0] }));
          const wallet = walletState.availableWallets.find(w => w.id === walletState.connectedWallet);
          if (wallet?.provider) {
            updateBalance(accounts[0], wallet.provider);
          }
        }
      };

      const handleChainChanged = (chainId: string) => {
        setWalletState(prev => ({ 
          ...prev, 
          chainId: parseInt(chainId, 16) 
        }));
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [walletState.connectedWallet, walletState.availableWallets, disconnectWallet, updateBalance]);

  return {
    ...walletState,
    isConnected: !!walletState.connectedWallet,
    connectWallet,
    disconnectWallet,
    switchWallet,
    updateBalance: () => {
      if (walletState.address && walletState.connectedWallet !== 'demo') {
        const wallet = walletState.availableWallets.find(w => w.id === walletState.connectedWallet);
        if (wallet?.provider) {
          updateBalance(walletState.address, wallet.provider);
        }
      }
    },
    demoMode,
  };
}
