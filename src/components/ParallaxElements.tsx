/**
 * Parallax elements for enhanced dynamic background effects
 */

import React, { useEffect, useState } from 'react';
import { TrendingUp, Zap, Shield, BarChart3, Target, Activity } from 'lucide-react';

export function ParallaxElements() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const cryptoIcons = [
    { Icon: TrendingUp, color: 'text-green-400' },
    { Icon: Zap, color: 'text-blue-400' },
    { Icon: Shield, color: 'text-purple-400' },
    { Icon: BarChart3, color: 'text-yellow-400' },
    { Icon: Target, color: 'text-red-400' },
    { Icon: Activity, color: 'text-pink-400' },
  ];

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Floating Icons */}
      {cryptoIcons.map((item, index) => (
        <div
          key={index}
          className={`absolute ${item.color} opacity-10`}
          style={{
            left: `${10 + (index * 15)}%`,
            top: `${20 + (index * 10)}%`,
            transform: `translateY(${scrollY * (0.1 + index * 0.05)}px) rotate(${scrollY * 0.1}deg)`,
            animationDelay: `${index * 0.5}s`,
          }}
        >
          <item.Icon className="w-16 h-16 animate-pulse" />
        </div>
      ))}
      
      {/* Floating Price Indicators */}
      <div className="absolute inset-0">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute text-slate-400/20 font-mono text-sm animate-float"
            style={{
              left: `${Math.random() * 80 + 10}%`,
              top: `${Math.random() * 80 + 10}%`,
              transform: `translateY(${scrollY * (0.05 + i * 0.02)}px)`,
              animationDelay: `${i * 1.5}s`,
              animationDuration: `${8 + Math.random() * 4}s`,
            }}
          >
            ${(Math.random() * 100).toFixed(2)}
          </div>
        ))}
      </div>
      
      {/* Connecting Lines */}
      <svg className="absolute inset-0 w-full h-full opacity-5">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        {[...Array(5)].map((_, i) => (
          <line
            key={i}
            x1={`${i * 20}%`}
            y1="0%"
            x2={`${100 - i * 15}%`}
            y2="100%"
            stroke="url(#lineGradient)"
            strokeWidth="1"
            className="animate-pulse"
            style={{
              animationDelay: `${i * 0.8}s`,
              animationDuration: `${4 + i}s`,
            }}
          />
        ))}
      </svg>
    </div>
  );
}
