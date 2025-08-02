/**
 * Reusable tooltip component for providing contextual help
 */

import React, { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';
import { Button } from './ui/button';

interface HelpTooltipProps {
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
}

export function HelpTooltip({ title, content, position = 'top', size = 'md' }: HelpTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
  };

  const sizeClasses = {
    sm: 'w-48',
    md: 'w-64',
    lg: 'w-80',
  };

  return (
    <div className="relative inline-block">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="h-5 w-5 p-0 text-slate-400 hover:text-blue-400 transition-colors"
      >
        <HelpCircle className="h-4 w-4" />
      </Button>
      
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Tooltip */}
          <div 
            className={`absolute z-50 ${positionClasses[position]} ${sizeClasses[size]}`}
          >
            <div className="bg-slate-800 border border-slate-600 rounded-lg shadow-xl p-4 text-sm">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-blue-400">{title}</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-4 w-4 p-0 text-slate-400 hover:text-white"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <div className="text-slate-300 leading-relaxed">
                {content}
              </div>
              
              {/* Arrow */}
              <div 
                className={`absolute w-3 h-3 bg-slate-800 border-slate-600 transform rotate-45 ${
                  position === 'top' ? 'top-full left-1/2 -translate-x-1/2 -mt-1.5 border-r border-b' :
                  position === 'bottom' ? 'bottom-full left-1/2 -translate-x-1/2 -mb-1.5 border-l border-t' :
                  position === 'left' ? 'left-full top-1/2 -translate-y-1/2 -ml-1.5 border-t border-r' :
                  'right-full top-1/2 -translate-y-1/2 -mr-1.5 border-b border-l'
                }`}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
