/**
 * Live visual effects that respond to market data
 */

import React, { useState, useEffect } from 'react';

interface LiveVisualEffectsProps {
  marketTrend?: 'up' | 'down' | 'neutral';
  intensity?: number;
}

export function LiveVisualEffects({ marketTrend = 'neutral', intensity = 0.5 }: LiveVisualEffectsProps) {
  const [pulseColor, setPulseColor] = useState('blue');
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; vx: number; vy: number }>>([]);

  useEffect(() => {
    // Change color based on market trend
    switch (marketTrend) {
      case 'up':
        setPulseColor('green');
        break;
      case 'down':
        setPulseColor('red');
        break;
      default:
        setPulseColor('blue');
    }
  }, [marketTrend]);

  useEffect(() => {
    // Create animated particles
    const newParticles = [...Array(Math.floor(20 * intensity))].map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      vx: (Math.random() - 0.5) * 0.1,
      vy: (Math.random() - 0.5) * 0.1,
    }));
    setParticles(newParticles);

    // Animate particles
    const interval = setInterval(() => {
      setParticles(prevParticles => 
        prevParticles.map(particle => ({
          ...particle,
          x: (particle.x + particle.vx + 100) % 100,
          y: (particle.y + particle.vy + 100) % 100,
        }))
      );
    }, 100);

    return () => clearInterval(interval);
  }, [intensity]);

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      {/* Market Trend Glow */}
      <div 
        className={`absolute inset-0 transition-all duration-1000 ${
          marketTrend === 'up' ? 'bg-green-500/5' :
          marketTrend === 'down' ? 'bg-red-500/5' :
          'bg-blue-500/5'
        }`}
      />
      
      {/* Animated Particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={`absolute w-1 h-1 rounded-full transition-colors duration-500 ${
            pulseColor === 'green' ? 'bg-green-400/30' :
            pulseColor === 'red' ? 'bg-red-400/30' :
            'bg-blue-400/30'
          }`}
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            boxShadow: `0 0 10px ${
              pulseColor === 'green' ? 'rgba(34, 197, 94, 0.3)' :
              pulseColor === 'red' ? 'rgba(239, 68, 68, 0.3)' :
              'rgba(59, 130, 246, 0.3)'
            }`,
          }}
        />
      ))}
      
      {/* Subtle Glow Effect - No Ripples */}
      <div className="absolute inset-0">
        <div 
          className={`absolute top-1/2 left-1/2 w-32 h-32 -translate-x-1/2 -translate-y-1/2 rounded-full transition-colors duration-500 ${
            pulseColor === 'green' ? 'bg-green-400/5' :
            pulseColor === 'red' ? 'bg-red-400/5' :
            'bg-blue-400/5'
          }`}
          style={{
            filter: 'blur(40px)',
            animation: 'gentle-pulse 4s ease-in-out infinite'
          }}
        />
      </div>
      
      {/* Data Stream Lines */}
      <div className="absolute inset-0">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`absolute h-px transition-colors duration-500 ${
              pulseColor === 'green' ? 'bg-gradient-to-r from-transparent via-green-400/40 to-transparent' :
              pulseColor === 'red' ? 'bg-gradient-to-r from-transparent via-red-400/40 to-transparent' :
              'bg-gradient-to-r from-transparent via-blue-400/40 to-transparent'
            }`}
            style={{
              top: `${20 + i * 10}%`,
              left: '-100%',
              right: '-100%',
              animation: `streamLine ${3 + i * 0.5}s linear infinite`,
              animationDelay: `${i * 0.8}s`,
            }}
          />
        ))}
      </div>
      
      <style jsx>{`
        @keyframes streamLine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes gentle-pulse {
          0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.6; transform: translate(-50%, -50%) scale(1.1); }
        }
      `}</style>
    </div>
  );
}
