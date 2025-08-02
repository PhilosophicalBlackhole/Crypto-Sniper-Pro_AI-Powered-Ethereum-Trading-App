/**
 * Testnet functionality panel for practice trading
 */

import React, { useState } from 'react';
import { Settings, Network, ExternalLink, Zap, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useTestnet } from '../hooks/useTestnet';
import { useWallet } from '../hooks/useWallet';

export function TestnetPanel() {
  const { address } = useWallet();
  const {
    isTestnet,
    chainName,
    faucetUrl,
    practiceMode,
    testTransactions,
    switchToTestnet,
    exitTestnet,
    sendTestTransaction,
    availableTestnets,
  } = useTestnet();

  const [isExpanded, setIsExpanded] = useState(false);
  const [testAmount, setTestAmount] = useState('0.01');
  const [testAddress, setTestAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSwitchTestnet = async (chainId: number) => {
    setIsLoading(true);
    try {
      await switchToTestnet(chainId);
    } catch (error) {
      console.error('Failed to switch testnet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestTransaction = async () => {
    if (!testAddress || !testAmount) return;
    
    setIsLoading(true);
    try {
      await sendTestTransaction(testAddress, testAmount);
      setTestAddress('');
      setTestAmount('0.01');
    } catch (error) {
      console.error('Test transaction failed:', error);
      alert('Transaction failed: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isExpanded && !isTestnet) {
    return (
      <Card className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/20 backdrop-blur-sm">
        <CardContent className="p-4">
          <Button
            onClick={() => setIsExpanded(true)}
            variant="ghost"
            className="w-full justify-between text-purple-300 hover:text-white"
          >
            <div className="flex items-center gap-2">
              <Network className="h-4 w-4" />
              <span>Practice on Testnets</span>
            </div>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Testnet Practice
          </div>
          <div className="flex items-center gap-2">
            {isTestnet && (
              <Badge className="bg-purple-600">
                {chainName}
              </Badge>
            )}
            {!isTestnet && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!isTestnet ? (
          <div className="space-y-4">
            <div className="p-4 bg-purple-900/30 border border-purple-500/50 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-purple-400 mt-0.5" />
                <div>
                  <h4 className="text-purple-300 font-semibold mb-1">Safe Practice Environment</h4>
                  <p className="text-purple-200 text-sm">
                    Test your sniping strategies with real blockchain interactions using testnet tokens that have no real value.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-slate-300 mb-3 block">Choose a Testnet:</Label>
              <div className="space-y-2">
                {availableTestnets.map((testnet) => (
                  <Button
                    key={testnet.chainId}
                    onClick={() => handleSwitchTestnet(testnet.chainId)}
                    disabled={isLoading}
                    className="w-full justify-between bg-slate-800 hover:bg-slate-700 text-white"
                  >
                    <div className="flex items-center gap-2">
                      <Network className="h-4 w-4" />
                      <span>{testnet.name}</span>
                    </div>
                    <span className="text-slate-400 text-sm">{testnet.currency}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Testnet Status */}
            <div className="p-4 bg-purple-900/30 border border-purple-500/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-purple-300 font-semibold">Practice Mode Active</span>
                <Badge className="bg-green-600">Live Testnet</Badge>
              </div>
              <p className="text-purple-200 text-sm">
                Connected to {chainName}. All transactions use test tokens with no real value.
              </p>
            </div>

            {/* Faucet Link */}
            {faucetUrl && (
              <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                <div>
                  <div className="text-white font-semibold">Need Test ETH?</div>
                  <div className="text-slate-400 text-sm">Get free testnet tokens</div>
                </div>
                <Button
                  onClick={() => window.open(faucetUrl, '_blank')}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Faucet
                </Button>
              </div>
            )}

            {/* Test Transaction Form */}
            <div className="p-4 bg-slate-800 rounded-lg">
              <Label className="text-slate-300 mb-3 block">Send Test Transaction:</Label>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="testAddress" className="text-slate-400 text-sm">To Address</Label>
                  <Input
                    id="testAddress"
                    placeholder="0x..."
                    value={testAddress}
                    onChange={(e) => setTestAddress(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="testAmount" className="text-slate-400 text-sm">Amount (Test ETH)</Label>
                  <Input
                    id="testAmount"
                    type="number"
                    step="0.001"
                    value={testAmount}
                    onChange={(e) => setTestAmount(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <Button
                  onClick={handleTestTransaction}
                  disabled={!testAddress || !testAmount || isLoading}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Send Test Transaction
                </Button>
              </div>
            </div>

            {/* Test Transactions History */}
            {testTransactions.length > 0 && (
              <div>
                <Label className="text-slate-300 mb-3 block">Test Transactions:</Label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {testTransactions.map((tx) => (
                    <div
                      key={tx.hash}
                      className="flex items-center justify-between p-3 bg-slate-800 rounded-lg"
                    >
                      <div>
                        <div className="text-white font-mono text-sm">
                          {tx.hash.slice(0, 10)}...{tx.hash.slice(-8)}
                        </div>
                        <div className="text-slate-400 text-xs">
                          {tx.amount} ETH → {tx.to.slice(0, 6)}...
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          className={
                            tx.status === 'success' ? 'bg-green-600' :
                            tx.status === 'failed' ? 'bg-red-600' : 'bg-yellow-600'
                          }
                        >
                          {tx.status}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(tx.explorerUrl, '_blank')}
                          className="text-slate-400 hover:text-white"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Exit Button */}
            <Button
              onClick={exitTestnet}
              variant="outline"
              className="w-full border-slate-600 text-slate-300"
            >
              Exit Practice Mode
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
