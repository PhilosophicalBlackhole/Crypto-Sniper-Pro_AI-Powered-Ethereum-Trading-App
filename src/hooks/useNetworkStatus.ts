/**
 * useNetworkStatus - simple hook to detect current EVM network and switch to Mainnet
 */

import { useCallback, useEffect, useState } from 'react';

interface NetworkStatus {
  chainId: number | null;
  isMainnet: boolean;
  networkName: string;
  isDetecting: boolean;
  switchToMainnet: () => Promise<boolean>;
}

/**
 * Translate chainId to a friendly name
 */
function getNetworkNameFromId(id: number | null): string {
  if (id == null) return 'Not connected';
  switch (id) {
    case 1:
      return 'Ethereum Mainnet';
    case 5:
      return 'Goerli Testnet';
    case 11155111:
      return 'Sepolia Testnet';
    case 137:
      return 'Polygon';
    case 56:
      return 'BSC';
    default:
      return `Chain ${id}`;
  }
}

/**
 * useNetworkStatus
 * Detects network via window.ethereum and exposes a method to switch to mainnet.
 */
export function useNetworkStatus(): NetworkStatus {
  const [chainId, setChainId] = useState<number | null>(null);
  const [isDetecting, setIsDetecting] = useState<boolean>(true);

  const detectChain = useCallback(async () => {
    try {
      if (!window.ethereum) {
        setChainId(null);
        return;
      }
      const chainHex = await window.ethereum.request({ method: 'eth_chainId' });
      const id = parseInt(chainHex, 16);
      setChainId(Number.isFinite(id) ? id : null);
    } catch (err) {
      setChainId(null);
      console.warn('Failed to detect chain:', err);
    } finally {
      setIsDetecting(false);
    }
  }, []);

  const handleChainChanged = useCallback((hexId: string) => {
    const id = parseInt(hexId, 16);
    setChainId(Number.isFinite(id) ? id : null);
  }, []);

  useEffect(() => {
    detectChain();

    if (window.ethereum && window.ethereum.on) {
      window.ethereum.on('chainChanged', handleChainChanged);
      return () => {
        try {
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        } catch {
          // no-op
        }
      };
    }
  }, [detectChain, handleChainChanged]);

  const switchToMainnet = useCallback(async () => {
    try {
      if (!window.ethereum) return false;
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x1' }],
      });
      // allow wallet UI to settle
      await new Promise((r) => setTimeout(r, 800));
      await detectChain();
      return true;
    } catch (err) {
      console.error('Failed to switch to mainnet:', err);
      return false;
    }
  }, [detectChain]);

  const isMainnet = chainId === 1;
  const networkName = getNetworkNameFromId(chainId);

  return { chainId, isMainnet, networkName, isDetecting, switchToMainnet };
}

// Window typing
declare global {
  interface Window {
    ethereum: any;
  }
}
