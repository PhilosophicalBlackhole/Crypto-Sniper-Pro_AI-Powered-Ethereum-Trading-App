/**
 * useMetaMask - robust MetaMask EIP-1193 connector with error handling and fallbacks.
 * - Detects MetaMask provider (including multi-provider scenarios).
 * - Connects via eth_requestAccounts with clear errors and guidance.
 * - Exposes chain/account reactive state and helpers (switchToMainnet, disconnect).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface EIP1193Provider {
  isMetaMask?: boolean;
  providers?: any[];
  request: (args: { method: string; params?: any[] | object }) => Promise<any>;
  on?: (event: string, handler: (...args: any[]) => void) => void;
  removeListener?: (event: string, handler: (...args: any[]) => void) => void;
}

interface UseMetaMaskState {
  provider: EIP1193Provider | null;
  account: string | null;
  chainId: number | null;
  connecting: boolean;
  error: string | null;
}

interface UseMetaMaskReturn extends UseMetaMaskState {
  connect: () => Promise<boolean>;
  disconnect: () => void;
  switchToMainnet: () => Promise<boolean>;
  hasProvider: boolean;
  isMainnet: boolean;
  shortAccount: string;
  openInstallPage: () => void;
  openMobileDeepLink: () => void;
}

/**
 * Pick MetaMask provider if multiple providers are injected.
 */
function pickMetaMaskProvider(win: any): EIP1193Provider | null {
  const eth = (win as any)?.ethereum as EIP1193Provider | undefined;
  if (!eth) return null;
  if (Array.isArray(eth.providers) && eth.providers.length) {
    const mm = eth.providers.find((p: any) => p && p.isMetaMask);
    return mm ?? null;
  }
  if (eth.isMetaMask) return eth;
  return null;
}

/**
 * Parse hex chainId like '0x1' into number 1.
 */
function parseChainId(hexOrNum: string | number): number | null {
  if (typeof hexOrNum === 'number') return Number.isFinite(hexOrNum) ? hexOrNum : null;
  if (typeof hexOrNum === 'string') {
    try {
      return parseInt(hexOrNum, 16);
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Map common MetaMask errors to friendly messages.
 */
function mapConnectError(err: unknown): string {
  const e = err as any;
  const code = e?.code;
  const msg = (e?.message as string) || 'Unknown error';
  // EIP-1193 / MetaMask codes
  if (code === 4001) return 'Connection request was rejected in MetaMask.';
  if (code === -32002) return 'A request is already pending in MetaMask. Open the extension and confirm.';
  // Permission errors
  if (msg?.toLowerCase().includes('already processing')) {
    return 'MetaMask is already processing a request. Open it and complete the action.';
  }
  return `Failed to connect: ${msg}`;
}

/**
 * useMetaMask hook
 */
export function useMetaMask(): UseMetaMaskReturn {
  const [state, setState] = useState<UseMetaMaskState>({
    provider: null,
    account: null,
    chainId: null,
    connecting: false,
    error: null,
  });

  const listenersAttached = useRef(false);

  // Detect provider on mount
  useEffect(() => {
    const prov = pickMetaMaskProvider(window);
    setState((s) => ({ ...s, provider: prov }));
  }, []);

  // Attach listeners when provider becomes available
  useEffect(() => {
    const prov = state.provider;
    if (!prov || listenersAttached.current) return;

    const onAccountsChanged = (accounts: string[]) => {
      const acc = Array.isArray(accounts) && accounts.length > 0 ? accounts[0] : null;
      setState((s) => ({ ...s, account: acc }));
    };

    const onChainChanged = (hexId: string) => {
      const id = parseChainId(hexId);
      setState((s) => ({ ...s, chainId: id }));
    };

    try {
      prov.on?.('accountsChanged', onAccountsChanged);
      prov.on?.('chainChanged', onChainChanged);
      listenersAttached.current = true;
    } catch {
      // Safe to ignore
    }

    return () => {
      try {
        prov.removeListener?.('accountsChanged', onAccountsChanged);
        prov.removeListener?.('chainChanged', onChainChanged);
      } catch {
        // ignore
      }
      listenersAttached.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.provider]);

  /**
   * Connect to MetaMask via eth_requestAccounts.
   */
  const connect = useCallback(async () => {
    const prov = pickMetaMaskProvider(window);
    if (!prov) {
      setState((s) => ({ ...s, error: 'MetaMask not found. Install the extension or open the MetaMask app.' }));
      return false;
    }
    setState((s) => ({ ...s, provider: prov, connecting: true, error: null }));
    try {
      const accounts: string[] = await prov.request({ method: 'eth_requestAccounts' });
      const chainHex: string = await prov.request({ method: 'eth_chainId' });
      const acc = Array.isArray(accounts) && accounts.length > 0 ? accounts[0] : null;
      const id = parseChainId(chainHex);
      setState((s) => ({ ...s, account: acc, chainId: id, connecting: false, error: null }));
      return !!acc;
    } catch (err) {
      const friendly = mapConnectError(err);
      setState((s) => ({ ...s, connecting: false, error: friendly }));
      return false;
    }
  }, []);

  /**
   * "Disconnect" for injected providers = clear local state.
   * There is no standard EIP-1193 disconnect for MetaMask injection.
   */
  const disconnect = useCallback(() => {
    setState((s) => ({ ...s, account: null, error: null }));
  }, []);

  /**
   * Switch to Ethereum Mainnet (0x1).
   */
  const switchToMainnet = useCallback(async () => {
    if (!state.provider) return false;
    try {
      await state.provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x1' }],
      });
      // Re-read chain
      const chainHex: string = await state.provider.request({ method: 'eth_chainId' });
      setState((s) => ({ ...s, chainId: parseChainId(chainHex) }));
      return true;
    } catch (err) {
      setState((s) => ({ ...s, error: (err as any)?.message || 'Failed to switch network' }));
      return false;
    }
  }, [state.provider]);

  const hasProvider = !!state.provider;
  const isMainnet = state.chainId === 1;
  const shortAccount = useMemo(() => {
    if (!state.account) return '';
    return `${state.account.slice(0, 6)}…${state.account.slice(-4)}`;
  }, [state.account]);

  const openInstallPage = useCallback(() => {
    window.open('https://metamask.io/download/', '_blank', 'noopener,noreferrer');
  }, []);

  const openMobileDeepLink = useCallback(() => {
    const host = window.location.host;
    // Deep link to open our current host inside MetaMask mobile browser
    window.location.href = `https://metamask.app.link/dapp/${host}`;
  }, []);

  return {
    ...state,
    connect,
    disconnect,
    switchToMainnet,
    hasProvider,
    isMainnet,
    shortAccount,
    openInstallPage,
    openMobileDeepLink,
  };
}
