/**
 * Web3 service for blockchain interactions on testnets
 */

// Basic Web3 functionality without external dependencies
export interface Web3Config {
  chainId: number;
  rpcUrl: string;
  explorerUrl: string;
  name: string;
  currency: string;
}

export const TESTNETS: Record<string, Web3Config> = {
  goerli: {
    chainId: 5,
    rpcUrl: 'https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
    explorerUrl: 'https://goerli.etherscan.io',
    name: 'Goerli Testnet',
    currency: 'GoerliETH',
  },
  sepolia: {
    chainId: 11155111,
    rpcUrl: 'https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
    explorerUrl: 'https://sepolia.etherscan.io',
    name: 'Sepolia Testnet',
    currency: 'SepoliaETH',
  },
};

export class Web3Service {
  private provider: any;
  private chainConfig: Web3Config;

  constructor(chainId: number) {
    this.chainConfig = Object.values(TESTNETS).find(config => config.chainId === chainId) || TESTNETS.sepolia;
  }

  async connectProvider() {
    if (window.ethereum) {
      this.provider = window.ethereum;
      return true;
    }
    return false;
  }

  async switchToTestnet(chainId: number): Promise<boolean> {
    try {
      if (!window.ethereum) return false;

      const chainHex = `0x${chainId.toString(16)}`;
      
      // Try to switch to the network
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: chainHex }],
        });
        return true;
      } catch (switchError: any) {
        // Network not added, try to add it
        if (switchError.code === 4902) {
          const config = Object.values(TESTNETS).find(c => c.chainId === chainId);
          if (!config) return false;

          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: chainHex,
                chainName: config.name,
                rpcUrls: [config.rpcUrl],
                blockExplorerUrls: [config.explorerUrl],
                nativeCurrency: {
                  name: config.currency,
                  symbol: config.currency.replace('ETH', 'ETH'),
                  decimals: 18,
                },
              },
            ],
          });
          return true;
        }
        throw switchError;
      }
    } catch (error) {
      console.error('Failed to switch network:', error);
      return false;
    }
  }

  async getBalance(address: string): Promise<string> {
    try {
      if (!window.ethereum) return '0';
      
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest'],
      });
      
      // Convert from Wei to ETH
      const balanceInEth = parseInt(balance, 16) / 1e18;
      return balanceInEth.toFixed(6);
    } catch (error) {
      console.error('Error fetching balance:', error);
      return '0';
    }
  }

  async getTokenBalance(tokenAddress: string, walletAddress: string): Promise<string> {
    try {
      if (!window.ethereum) return '0';

      // ERC-20 balanceOf function signature
      const data = `0x70a08231000000000000000000000000${walletAddress.slice(2)}`;
      
      const result = await window.ethereum.request({
        method: 'eth_call',
        params: [
          {
            to: tokenAddress,
            data: data,
          },
          'latest',
        ],
      });

      const balance = parseInt(result, 16);
      return (balance / 1e18).toFixed(6);
    } catch (error) {
      console.error('Error fetching token balance:', error);
      return '0';
    }
  }

  async sendTestTransaction(to: string, amount: string): Promise<string> {
    try {
      if (!window.ethereum) throw new Error('No wallet connected');

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: accounts[0],
            to: to,
            value: `0x${(parseFloat(amount) * 1e18).toString(16)}`,
            gas: '0x5208', // 21000
          },
        ],
      });

      return txHash;
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    }
  }

  async getTransactionReceipt(txHash: string) {
    try {
      if (!window.ethereum) return null;

      return await window.ethereum.request({
        method: 'eth_getTransactionReceipt',
        params: [txHash],
      });
    } catch (error) {
      console.error('Error fetching transaction receipt:', error);
      return null;
    }
  }

  getExplorerUrl(txHash: string): string {
    return `${this.chainConfig.explorerUrl}/tx/${txHash}`;
  }

  getAddressUrl(address: string): string {
    return `${this.chainConfig.explorerUrl}/address/${address}`;
  }

  getChainConfig(): Web3Config {
    return this.chainConfig;
  }
}
