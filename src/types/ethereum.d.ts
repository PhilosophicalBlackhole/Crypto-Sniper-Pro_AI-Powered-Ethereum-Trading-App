/**
 * TypeScript declarations for MetaMask and Ethereum providers
 */

interface EthereumProvider {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on: (event: string, handler: (...args: any[]) => void) => void;
  removeListener: (event: string, handler: (...args: any[]) => void) => void;
  isMetaMask?: boolean;
  isCoinbaseWallet?: boolean;
  isWalletConnect?: boolean;
  providers?: EthereumProvider[];
}

declare global {
  interface Window {
    ethereum: EthereumProvider;
    Stripe: any;
    __ENV__?: Record<string, string>;
  }
}

export {};
