/**
 * Mobile-friendly affiliate banner component
 */

import React, { useState } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';

export function MobileAffiliateBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const affiliateUrl = 'https://coins.game/c/2244403_ae585d8d';

  const handleClick = () => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'affiliate_click_mobile', {
        event_category: 'monetization',
        event_label: 'coins_game_mobile'
      });
    }
    window.open(affiliateUrl, '_blank', 'noopener,noreferrer');
  };

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('mobile_affiliate_banner_closed', 'true');
  };

  React.useEffect(() => {
    const wasClosed = localStorage.getItem('mobile_affiliate_banner_closed');
    if (wasClosed === 'true') {
      setIsVisible(false);
    }
  }, []);

  if (!isVisible) return null;

  return (
    <div className="lg:hidden fixed bottom-4 left-4 right-4 z-40">
      <div className="relative bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-600 rounded-lg shadow-2xl overflow-hidden">
        {/* Close Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClose}
          className="absolute top-2 right-2 z-10 h-6 w-6 p-0 text-slate-400 hover:text-white"
        >
          <X className="h-3 w-3" />
        </Button>

        {/* Banner Content */}
        <div 
          onClick={handleClick}
          className="cursor-pointer p-4 hover:bg-slate-700/30 transition-colors flex items-center gap-3"
        >
          {/* Logo Section */}
          <div className="flex-shrink-0">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold text-xs px-2 py-1 rounded-md">
              COINS GAME
            </div>
            <div className="flex gap-1 mt-1">
              <span className="bg-purple-600 text-white text-xs px-1 py-0.5 rounded">CASINO</span>
              <span className="bg-blue-600 text-white text-xs px-1 py-0.5 rounded">SPORT</span>
            </div>
          </div>

          {/* Text Content */}
          <div className="flex-1">
            <div className="text-white font-bold text-sm">
              THE BEST PLACE TO PLAY & EARN
            </div>
            <div className="text-slate-300 text-xs">
              18+ | Play Responsibly
            </div>
          </div>

          {/* CTA */}
          <div className="flex-shrink-0">
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white font-bold text-xs py-2 px-3 rounded-lg flex items-center gap-1">
              PLAY NOW
              <ExternalLink className="h-3 w-3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
