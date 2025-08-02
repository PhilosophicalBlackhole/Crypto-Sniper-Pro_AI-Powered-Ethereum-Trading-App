/**
 * Real MetaMask wallet integration hook
 * Simplified version without ethers dependency
 */

import { useState, useEffect, useCallback } from 'react';

interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: string;
  chainId: number | null;
  provider: any;
}

interface UseRealMetaMaskReturn extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: (chainId: number) => Promise<void>;
  error: string | null;
  isLoading: boolean;
}

/**
 * Hook for real MetaMask wallet integration
 * Handles wallet connection, balance reading, and network switching
 */
export function useRealMetaMask(): UseRealMetaMaskReturn {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    balance: '0',
    chainId: null,
    provider: null,
  });

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Check if MetaMask is installed
   */
  const isMetaMaskInstalled = useCallback(() => {
    if (typeof window === 'undefined') return false;
    
    return !!(
      window.ethereum && 
      window.ethereum.isMetaMask
    );
  }, []);

  /**
   * Convert hex to decimal
   */
  const hexToDecimal = (hex: string): number => {
    return parseInt(hex, 16);
  };

  /**
   * Convert Wei to Eth (simplified)
   */
  const weiToEth = (wei: string): string => {
    try {
      const weiValue = BigInt(wei);
      const ethValue = Number(weiValue) / 1e18;
      return ethValue.toFixed(4);
    } catch (error) {
      console.error('Error converting wei to eth:', error);
      return '0.0000';
    }
  };

  /**
   * Connect to MetaMask wallet
   */
  const connect = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if MetaMask is installed
      if (!isMetaMaskInstalled()) {
        throw new Error('MetaMask is not installed. Please install MetaMask extension to continue.');
      }

      // Check if ethereum object exists
      if (!window.ethereum) {
        throw new Error('Ethereum provider not found. Please make sure MetaMask is properly installed.');
      }

      console.log('🔄 Attempting to connect to MetaMask...');

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please make sure you have accounts in MetaMask and try again.');
      }

      const address = accounts[0];
      console.log('📱 Account found:', address);

      // Get balance
      let balance = '0';
      try {
        const balanceHex = await window.ethereum.request({
          method: 'eth_getBalance',
          params: [address, 'latest'],
        });
        balance = weiToEth(balanceHex);
        console.log('💰 Balance retrieved:', balance, 'ETH');
      } catch (balanceError) {
        console.warn('⚠️ Could not retrieve balance:', balanceError);
        balance = '0.0000';
      }

      // Get chain ID
      let chainId = null;
      try {
        const chainIdHex = await window.ethereum.request({
          method: 'eth_chainId',
        });
        chainId = hexToDecimal(chainIdHex);
        console.log('🌐 Network detected:', chainId);
      } catch (chainError) {
        console.warn('⚠️ Could not retrieve chain ID:', chainError);
        chainId = 1; // Default to mainnet
      }

      setWalletState({
        isConnected: true,
        address,
        balance,
        chainId,
        provider: window.ethereum,
      });

      console.log('✅ MetaMask connected successfully!');
    } catch (err: any) {
      console.error('❌ MetaMask connection failed:', err);
      
      let errorMessage = 'Failed to connect to MetaMask';
      
      if (err.code === 4001) {
        errorMessage = 'Connection rejected by user. Please approve the connection request.';
      } else if (err.code === -32002) {
        errorMessage = 'MetaMask is already processing a request. Please check MetaMask extension.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isMetaMaskInstalled]);

  /**
   * Disconnect wallet
   */
  const disconnect = useCallback(() => {
    setWalletState({
      isConnected: false,
      address: null,
      balance: '0',
      chainId: null,
      provider: null,
    });
    setError(null);
    console.log('🔌 Wallet disconnected');
  }, []);

  /**
   * Switch network
   */
  const switchNetwork = useCallback(async (chainId: number) => {
    if (!walletState.provider) {
      setError('Wallet not connected');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
      
      console.log(`✅ Switched to network ${chainId}`);
      
      // Update chain ID in state
      setWalletState(prev => ({
        ...prev,
        chainId,
      }));
    } catch (err: any) {
      console.error('❌ Network switch failed:', err);
      
      // If network doesn't exist, try to add it (for mainnet)
      if (err.code === 4902 && chainId === 1) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x1',
              chainName: 'Ethereum Mainnet',
              nativeCurrency: {
                name: 'Ethereum',
                symbol: 'ETH',
                decimals: 18,
              },
              rpcUrls: ['https://mainnet.infura.io/v3/'],
              blockExplorerUrls: ['https://etherscan.io/'],
            }],
          });
        } catch (addError) {
          setError('Failed to add Ethereum network');
          console.error('❌ Add network error:', addError);
        }
      } else {
        setError('Failed to switch network');
      }
    } finally {
      setIsLoading(false);
    }
  }, [walletState.provider]);

  /**
   * Listen for account changes
   */
  useEffect(() => {
    if (!isMetaMaskInstalled() || !window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      console.log('🔄 Accounts changed:', accounts);
      
      if (accounts.length === 0) {
        disconnect();
      } else if (accounts[0] !== walletState.address) {
        // Auto-reconnect with new account
        connect();
      }
    };

    const handleChainChanged = (chainId: string) => {
      console.log('🌐 Chain changed:', chainId);
      
      setWalletState(prev => ({
        ...prev,
        chainId: hexToDecimal(chainId),
      }));
    };

    const handleConnect = (connectInfo: any) => {
      console.log('🔗 MetaMask connected:', connectInfo);
    };

    const handleDisconnect = (error: any) => {
      console.log('🔌 MetaMask disconnected:', error);
      disconnect();
    };

    // Add event listeners
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    window.ethereum.on('connect', handleConnect);
    window.ethereum.on('disconnect', handleDisconnect);

    return () => {
      // Remove event listeners
      if (window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('connect', handleConnect);
        window.ethereum.removeListener('disconnect', handleDisconnect);
      }
    };
  }, [isMetaMaskInstalled, walletState.address, connect, disconnect]);

  /**
   * Check for existing connection on mount
   */
  useEffect(() => {
    if (!isMetaMaskInstalled()) return;

    const checkConnection = async () => {
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_accounts',
        });

        if (accounts && accounts.length > 0) {
          console.log('🔄 Found existing connection, auto-connecting...');
          // Auto-connect if already authorized
          connect();
        }
      } catch (err) {
        console.error('❌ Failed to check existing connection:', err);
      }
    };

    checkConnection();
  }, [isMetaMaskInstalled, connect]);

  return {
    ...walletState,
    connect,
    disconnect,
    switchNetwork,
    error,
    isLoading,
  };
}

/**
 * TypeScript declarations for ethereum object
 */
declare global {
  interface Window {
    ethereum: any;
  }
}
