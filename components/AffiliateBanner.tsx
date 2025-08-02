/**
 * Interactive affiliate banner component for passive revenue
 */

import React, { useState } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';

interface AffiliateBannerProps {
  className?: string;
}

export function AffiliateBanner({ className = '' }: AffiliateBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  // Affiliate link
  const affiliateUrl = 'https://coins.game/c/2244403_ae585d8d';

  /**
   * Handle banner click with analytics tracking
   */
  const handleClick = () => {
    // Track click for analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'affiliate_click', {
        event_category: 'monetization',
        event_label: 'coins_game_banner'
      });
    }

    // Open in new tab
    window.open(affiliateUrl, '_blank', 'noopener,noreferrer');
  };

  /**
   * Handle banner close
   */
  const handleClose = () => {
    setIsVisible(false);
    // Remember user preference
    localStorage.setItem('affiliate_banner_closed', 'true');
  };

  /**
   * Check if user previously closed banner
   */
  React.useEffect(() => {
    const wasClosed = localStorage.getItem('affiliate_banner_closed');
    if (wasClosed === 'true') {
      setIsVisible(false);
    }
  }, []);

  if (!isVisible) return null;

  return (
    <div className={`${className}`}>
      <div className="relative">
        {/* Banner Container - Always visible */}
        <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-600 rounded-lg shadow-2xl w-full">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="absolute top-2 right-2 z-10 h-5 w-5 p-0 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-full"
          >
            <X className="h-3 w-3" />
          </Button>

          {/* Banner Content */}
          <div 
            onClick={handleClick}
            className="cursor-pointer p-4 pb-5 hover:bg-slate-700/30 transition-colors rounded-lg group"
          >
            {/* Coins Game Logo */}
            <div className="text-center mb-2">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold text-xs px-2 py-1 rounded-md inline-block">
                COINS
              </div>
              <div className="text-white font-semibold text-xs mt-1">GAME</div>
            </div>

            {/* Category Pills */}
            <div className="flex gap-1 mb-4">
              <div className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full flex-1 text-center font-semibold">
                CASINO
              </div>
              <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full flex-1 text-center font-semibold">
                SPORT
              </div>
            </div>

            {/* Character Illustrations */}
            <div className="relative h-24 mb-3 overflow-hidden rounded-lg bg-gradient-to-b from-purple-900/50 to-blue-900/50">
              {/* Mock character representations */}
              <div className="absolute left-2 bottom-0 w-7 h-14 bg-gradient-to-t from-purple-500 to-purple-300 rounded-t-full opacity-80"></div>
              <div className="absolute right-2 bottom-0 w-7 h-14 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-full opacity-80"></div>
              
              {/* Floating coins animation */}
              <div className="absolute top-3 left-1/2 w-2.5 h-2.5 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="absolute top-2 right-5 w-2 h-2 bg-yellow-300 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
              <div className="absolute top-4 left-6 w-1.5 h-1.5 bg-yellow-200 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
            </div>

            {/* Main Text */}
            <div className="text-center mb-3">
              <div className="text-white font-bold text-xs leading-tight mb-1">
                THE BEST PLACE
              </div>
              <div className="text-white font-bold text-xs leading-tight mb-1">
                TO PLAY
              </div>
              <div className="text-yellow-400 font-bold text-xs leading-tight">
                AND EARN FAST
              </div>
            </div>

            {/* CTA Button */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold text-xs py-2 px-3 rounded-lg text-center transition-all duration-200 transform group-hover:scale-105 shadow-lg">
              PLAY NOW
              <ExternalLink className="inline h-2.5 w-2.5 ml-1" />
            </div>
          </div>

          {/* Disclaimer */}
          <div className="px-3 pb-3">
            <div className="text-xs text-slate-500 text-center leading-tight">
              18+ | Play Responsibly
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
