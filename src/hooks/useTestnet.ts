/**
 * Custom hook for testnet functionality and practice trading
 */

import { useState, useCallback, useEffect } from 'react';
import { Web3Service, TESTNETS } from '../services/web3';

export interface TestnetState {
  isTestnet: boolean;
  chainId: number | null;
  chainName: string;
  explorerUrl: string;
  faucetUrl: string;
  web3Service: Web3Service | null;
}

export function useTestnet() {
  const [testnetState, setTestnetState] = useState<TestnetState>({
    isTestnet: false,
    chainId: null,
    chainName: '',
    explorerUrl: '',
    faucetUrl: '',
    web3Service: null,
  });

  const [practiceMode, setPracticeMode] = useState(false);
  const [testTransactions, setTestTransactions] = useState<any[]>([]);

  const getFaucetUrl = (chainId: number): string => {
    switch (chainId) {
      case 5: // Goerli
        return 'https://goerlifaucet.com/';
      case 11155111: // Sepolia
        return 'https://sepoliafaucet.com/';
      default:
        return '';
    }
  };

  const switchToTestnet = useCallback(async (chainId: number) => {
    try {
      const web3Service = new Web3Service(chainId);
      const connected = await web3Service.connectProvider();
      
      if (!connected) {
        throw new Error('No wallet provider found');
      }

      const switched = await web3Service.switchToTestnet(chainId);
      
      if (switched) {
        const config = web3Service.getChainConfig();
        setTestnetState({
          isTestnet: true,
          chainId: chainId,
          chainName: config.name,
          explorerUrl: config.explorerUrl,
          faucetUrl: getFaucetUrl(chainId),
          web3Service: web3Service,
        });
        setPracticeMode(true);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to switch to testnet:', error);
      return false;
    }
  }, []);

  const exitTestnet = useCallback(() => {
    setTestnetState({
      isTestnet: false,
      chainId: null,
      chainName: '',
      explorerUrl: '',
      faucetUrl: '',
      web3Service: null,
    });
    setPracticeMode(false);
    setTestTransactions([]);
  }, []);

  const sendTestTransaction = useCallback(async (to: string, amount: string) => {
    if (!testnetState.web3Service) {
      throw new Error('No testnet connection');
    }

    try {
      const txHash = await testnetState.web3Service.sendTestTransaction(to, amount);
      
      // Add to test transactions
      const newTx = {
        hash: txHash,
        to: to,
        amount: amount,
        timestamp: Date.now(),
        status: 'pending',
        explorerUrl: testnetState.web3Service.getExplorerUrl(txHash),
      };
      
      setTestTransactions(prev => [newTx, ...prev]);
      
      // Monitor transaction status
      setTimeout(async () => {
        const receipt = await testnetState.web3Service!.getTransactionReceipt(txHash);
        if (receipt) {
          setTestTransactions(prev => 
            prev.map(tx => 
              tx.hash === txHash 
                ? { ...tx, status: receipt.status === '0x1' ? 'success' : 'failed' }
                : tx
            )
          );
        }
      }, 5000);
      
      return txHash;
    } catch (error) {
      console.error('Test transaction failed:', error);
      throw error;
    }
  }, [testnetState.web3Service]);

  const getTestBalance = useCallback(async (address: string) => {
    if (!testnetState.web3Service) return '0';
    
    return await testnetState.web3Service.getBalance(address);
  }, [testnetState.web3Service]);

  // Check if currently on a testnet
  useEffect(() => {
    const checkNetwork = async () => {
      if (window.ethereum) {
        try {
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          const numChainId = parseInt(chainId, 16);
          
          const isTestnetChain = Object.values(TESTNETS).some(config => config.chainId === numChainId);
          
          if (isTestnetChain && !testnetState.isTestnet) {
            // User is already on testnet
            const web3Service = new Web3Service(numChainId);
            const config = web3Service.getChainConfig();
            
            setTestnetState({
              isTestnet: true,
              chainId: numChainId,
              chainName: config.name,
              explorerUrl: config.explorerUrl,
              faucetUrl: getFaucetUrl(numChainId),
              web3Service: web3Service,
            });
          }
        } catch (error) {
          console.error('Error checking network:', error);
        }
      }
    };

    checkNetwork();
  }, [testnetState.isTestnet]);

  return {
    ...testnetState,
    practiceMode,
    testTransactions,
    switchToTestnet,
    exitTestnet,
    sendTestTransaction,
    getTestBalance,
    availableTestnets: Object.values(TESTNETS),
  };
}
