/**
 * Custom hook for wallet connection and management
 */

import { useState, useEffect, useCallback } from 'react';

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: string;
  chainId: number | null;
  isConnecting: boolean;
  error: string | null;
}

export function useWallet() {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    balance: '0',
    chainId: null,
    isConnecting: false,
    error: null,
  });

  const [demoMode, setDemoMode] = useState(false);

  const updateBalance = useCallback(async (address: string) => {
    try {
      if (window.ethereum) {
        const balance = await window.ethereum.request({
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
    
    // Simulate connection delay
    setTimeout(() => {
      setWalletState({
        isConnected: true,
        address: '0x742d35Cc6634C0532925a3b8D',
        balance: '2.4567',
        chainId: 1,
        isConnecting: false,
        error: null,
      });
      setDemoMode(true);
    }, 1500);
  }, []);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      // Instead of showing error, offer demo mode
      connectDemoWallet();
      return;
    }

    setWalletState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      const chainId = await window.ethereum.request({
        method: 'eth_chainId',
      });

      if (accounts.length > 0) {
        const address = accounts[0];
        setWalletState(prev => ({
          ...prev,
          isConnected: true,
          address,
          chainId: parseInt(chainId, 16),
          isConnecting: false,
        }));
        await updateBalance(address);
      }
    } catch (error: any) {
      setWalletState(prev => ({
        ...prev,
        isConnecting: false,
        error: error.message || 'Failed to connect wallet',
      }));
    }
  }, [updateBalance]);

  const disconnectWallet = useCallback(() => {
    setWalletState({
      isConnected: false,
      address: null,
      balance: '0',
      chainId: null,
      isConnecting: false,
      error: null,
    });
    setDemoMode(false);
  }, []);

  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setWalletState(prev => ({ ...prev, address: accounts[0] }));
          updateBalance(accounts[0]);
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
  }, [disconnectWallet, updateBalance]);

  return {
    ...walletState,
    connectWallet,
    disconnectWallet,
    updateBalance: () => walletState.address && updateBalance(walletState.address),
    demoMode,
  };
}
