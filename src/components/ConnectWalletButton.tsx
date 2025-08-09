/**
 * ConnectWalletButton
 * Reusable MetaMask/EIP-1193 wallet connect button with loading and error states.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Wallet } from 'lucide-react';

/**
 * EthereumProvider
 * Minimal EIP-1193 provider interface used by this component.
 */
interface EthereumProvider {
  isMetaMask?: boolean;
  request: (args: { method: string; params?: any[] | object }) => Promise<any>;
  on?: (event: string, handler: (...args: any[]) => void) => void;
  removeListener?: (event: string, handler: (...args: any[]) => void) => void;
}

/**
 * ConnectWalletButtonProps
 * Props for configuring visual style and connection callbacks.
 */
export interface ConnectWalletButtonProps {
  /** Additional Tailwind classes */
  className?: string;
  /** Called when an address connects successfully */
  onConnected?: (address: string) => void;
  /** Called when the wallet disconnects or accounts become empty */
  onDisconnected?: () => void;
  /** If true, attempts to read existing connection via eth_accounts on mount */
  autoDetect?: boolean;
  /** Optional label override */
  label?: string;
}

/**
 * truncateAddress
 * Shortens an Ethereum address for UI display.
 */
function truncateAddress(addr: string, size = 4): string {
  if (!addr) return '';
  return `${addr.slice(0, 2 + size)}…${addr.slice(-size)}`;
}

/**
 * isMobile
 * Basic user-agent detection to decide whether to use MetaMask deeplink.
 */
function isMobile(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || navigator.vendor;
  return /android/i.test(ua) || /iPad|iPhone|iPod/.test(ua);
}

/**
 * getProvider
 * Safely access window.ethereum as an EIP-1193 provider.
 */
function getProvider(): EthereumProvider | null {
  if (typeof window === 'undefined') return null;
  return (window as any).ethereum ?? null;
}

/**
 * ConnectWalletButton
 * Handles EIP-1193 connection flow and renders a styled button with icon.
 */
export const ConnectWalletButton: React.FC<ConnectWalletButtonProps> = ({
  className,
  onConnected,
  onDisconnected,
  autoDetect = true,
  label,
}) => {
  const provider = useMemo(() => getProvider(), []);
  const [address, setAddress] = useState<string>('');
  const [connecting, setConnecting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  /**
   * handleAccountsChanged
   * Reacts to account changes from the wallet.
   */
  const handleAccountsChanged = useCallback(
    (accounts: string[]) => {
      if (Array.isArray(accounts) && accounts.length > 0) {
        const addr = accounts[0];
        setAddress(addr);
        onConnected?.(addr);
      } else {
        setAddress('');
        onDisconnected?.();
      }
    },
    [onConnected, onDisconnected]
  );

  /**
   * initExistingConnection
   * Reads existing accounts to pre-populate address if already connected.
   */
  const initExistingConnection = useCallback(async () => {
    if (!provider) return;
    try {
      const accounts: string[] = await provider.request({ method: 'eth_accounts' });
      handleAccountsChanged(accounts);
    } catch (e) {
      // Silently ignore at startup
    }
  }, [provider, handleAccountsChanged]);

  /**
   * useEffect: Auto-detect existing connection and subscribe to events.
   */
  useEffect(() => {
    if (!provider) return;
    if (autoDetect) {
      initExistingConnection();
    }

    const accountsListener = (accs: string[]) => handleAccountsChanged(accs);
    const chainChanged = () => {
      // Best practice: reload dapp state on chain changes if necessary.
      // You can also refetch balances here.
    };

    provider.on?.('accountsChanged', accountsListener);
    provider.on?.('chainChanged', chainChanged);

    return () => {
      provider.removeListener?.('accountsChanged', accountsListener);
      provider.removeListener?.('chainChanged', chainChanged);
    };
  }, [provider, autoDetect, initExistingConnection, handleAccountsChanged]);

  /**
   * connect
   * Requests account access or opens MetaMask install/deeplink.
   */
  const connect = useCallback(async () => {
    setError('');
    if (!provider) {
      // No provider: guide user to MetaMask
      if (isMobile()) {
        // Open MetaMask mobile deeplink to current dapp
        const href =
          typeof window !== 'undefined'
            ? `https://metamask.app.link/dapp/${window.location.hostname}${window.location.port ? `:${window.location.port}` : ''}${window.location.pathname}`
            : 'https://metamask.io/download/';
        window.open(href, '_blank', 'noopener,noreferrer');
      } else {
        window.open('https://metamask.io/download/', '_blank', 'noopener,noreferrer');
      }
      return;
    }

    try {
      setConnecting(true);
      const accounts: string[] = await provider.request({ method: 'eth_requestAccounts' });
      handleAccountsChanged(accounts);
    } catch (e: any) {
      // Common user rejection code in MetaMask: 4001
      if (e?.code === 4001) {
        setError('Connection request was rejected.');
      } else {
        setError(e?.message || 'Failed to connect wallet.');
      }
    } finally {
      setConnecting(false);
    }
  }, [provider, handleAccountsChanged]);

  const buttonText =
    label || (address ? `Connected: ${truncateAddress(address)}` : connecting ? 'Connecting…' : 'Connect Wallet');

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={connect}
        disabled={connecting}
        aria-busy={connecting}
        className={[
          // Default style closely matches your original classes.
          'inline-flex items-center justify-center gap-2',
          'font-medium py-2 px-4 rounded-md transition-colors',
          'bg-blue-600 hover:bg-blue-700 text-white',
          connecting ? 'opacity-80 cursor-not-allowed' : '',
          className || '',
        ].join(' ').trim()}
        style={{ pointerEvents: connecting ? 'none' : 'auto' }}
      >
        <Wallet size={18} />
        <span>{buttonText}</span>
      </button>

      {!provider && (
        <p className="text-xs text-amber-400">
          MetaMask not detected. Click the button to install/open MetaMask.
        </p>
      )}

      {!!error && (
        <p className="text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
};

export default ConnectWalletButton;