/**
 * Guided tour component for new users
 */

import React, { useState, useEffect } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { Button } from './ui/button';
import { HelpCircle, Play } from 'lucide-react';

const tourSteps: Step[] = [
  {
    target: '.wallet-connection',
    content: (
      <div>
        <h3 className="font-bold mb-2">Welcome to CryptoSniper Pro!</h3>
        <p>First, connect your MetaMask wallet or try demo mode to get started.</p>
      </div>
    ),
    placement: 'bottom',
  },
  {
    target: '.testnet-panel',
    content: (
      <div>
        <h3 className="font-bold mb-2">Practice Safely</h3>
        <p>Use testnets to practice sniping without risking real money. Perfect for learning!</p>
      </div>
    ),
    placement: 'right',
  },
  {
    target: '.add-snipe-form',
    content: (
      <div>
        <h3 className="font-bold mb-2">Configure Your Snipes</h3>
        <p>Add token addresses and set your target prices, slippage, and gas settings here.</p>
      </div>
    ),
    placement: 'left',
  },
  {
    target: '.bot-status',
    content: (
      <div>
        <h3 className="font-bold mb-2">Control Your Bot</h3>
        <p>Start/stop the bot and monitor your trading performance and success rate.</p>
      </div>
    ),
    placement: 'right',
  },
  {
    target: '.market-data',
    content: (
      <div>
        <h3 className="font-bold mb-2">Live Market Data</h3>
        <p>Monitor real-time prices and charts to make informed sniping decisions.</p>
      </div>
    ),
    placement: 'left',
  },
];

export function GuidedTour() {
  const [runTour, setRunTour] = useState(false);
  const [showTourButton, setShowTourButton] = useState(true);

  useEffect(() => {
    // Check if user has seen the tour before
    const hasSeenTour = localStorage.getItem('cryptosniper-tour-seen');
    if (!hasSeenTour) {
      setTimeout(() => setRunTour(true), 1000);
    }
  }, []);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRunTour(false);
      localStorage.setItem('cryptosniper-tour-seen', 'true');
    }
  };

  const startTour = () => {
    setRunTour(true);
    setShowTourButton(false);
  };

  if (!showTourButton && !runTour) return null;

  return (
    <>
      {showTourButton && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={startTour}
            className="bg-blue-600 hover:bg-blue-700 shadow-lg"
            size="lg"
          >
            <Play className="h-4 w-4 mr-2" />
            Take Tour
          </Button>
        </div>
      )}
      
      <Joyride
        steps={tourSteps}
        run={runTour}
        continuous
        showProgress
        showSkipButton
        callback={handleJoyrideCallback}
        styles={{
          options: {
            primaryColor: '#2563eb',
            backgroundColor: '#1e293b',
            textColor: '#f1f5f9',
            arrowColor: '#1e293b',
          },
          tooltip: {
            backgroundColor: '#1e293b',
            color: '#f1f5f9',
          },
          tooltipContent: {
            padding: '16px',
          },
          buttonNext: {
            backgroundColor: '#2563eb',
            color: '#ffffff',
          },
          buttonBack: {
            color: '#94a3b8',
            marginRight: '10px',
          },
        }}
      />
    </>
  );
}
