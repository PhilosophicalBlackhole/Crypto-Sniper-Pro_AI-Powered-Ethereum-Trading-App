/**
 * Dynamic animated background component with live crypto imagery
 */

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';

interface DynamicBackgroundProps {
  className?: string;
}

export function DynamicBackground({ className = '' }: DynamicBackgroundProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const { resolvedTheme } = useTheme();

  // Crypto-themed background images including your custom CryptoSniperPRO image
  const backgroundImages = [
    'https://pub-cdn.sider.ai/u/U0KAHY9O4N/web-coder/686f3f80d84378322bc45f1f/resource/686f3f80d84378322bc45f1f.jpg', // Your CryptoSniperPRO image
    'https://pub-cdn.sider.ai/u/U0KAHY9O4N/web-coder/685fc6490385cdf9803e9fae/resource/033d5696-c24c-40be-9bf8-d2a2ff747b9b.jpg',
    'https://pub-cdn.sider.ai/u/U0KAHY9O4N/web-coder/685fc6490385cdf9803e9fae/resource/51d28c08-1988-497b-890a-97f3270db328.jpg',
    'https://pub-cdn.sider.ai/u/U0KAHY9O4N/web-coder/685fc6490385cdf9803e9fae/resource/98e4393b-8ee3-432c-82a3-d9e939d47c33.jpg',
    'https://pub-cdn.sider.ai/u/U0KAHY9O4N/web-coder/685fc6490385cdf9803e9fae/resource/ce2aa969-32a2-4459-94fe-21b1d1db588c.png',
    'https://pub-cdn.sider.ai/u/U0KAHY9O4N/web-coder/685fc6490385cdf9803e9fae/resource/ef464507-5375-4c59-af12-7f61b5211ec3.jpg',
    'https://pub-cdn.sider.ai/u/U0KAHY9O4N/web-coder/685fc6490385cdf9803e9fae/resource/12a0ec2a-fed0-4ae7-84c5-7ce04996fb75.jpg',
  ];

  // Rotate background images every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
        setIsVisible(true);
      }, 500);
    }, 10000);

    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  const isDark = resolvedTheme === 'dark';

  return (
    <div className={`fixed inset-0 overflow-hidden ${className}`} style={{ zIndex: -1 }}>
      {/* Dynamic Background Image */}
      <div 
        className={`absolute inset-0 transition-opacity duration-500 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          backgroundImage: `url(${backgroundImages[currentImageIndex]})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      
      {/* Theme-aware Gradient Overlay */}
      <div className={`absolute inset-0 transition-colors duration-500 ${
        isDark 
          ? 'bg-slate-900/60' 
          : 'bg-white/70'
      }`} />
      
      {/* Animated Particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-1 h-1 rounded-full animate-float ${
              isDark ? 'bg-blue-400/30' : 'bg-blue-600/50'
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${10 + Math.random() * 20}s`,
            }}
          />
        ))}
      </div>
      
      {/* Theme-aware Geometric Shapes */}
      <div className="absolute inset-0">
        <div className={`absolute top-20 left-20 w-32 h-32 border rounded-full animate-pulse ${
          isDark ? 'border-blue-500/20' : 'border-blue-600/40'
        }`} />
        <div className={`absolute bottom-20 right-20 w-48 h-48 border rounded-lg rotate-45 animate-spin-slow ${
          isDark ? 'border-green-500/20' : 'border-green-600/40'
        }`} />
      </div>
    </div>
  );
}
