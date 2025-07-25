/**
 * Test file to verify all imports are working
 * This will help identify if the error is real or false positive
 */

// Test all the imports we're using
import React from 'react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { 
  Play, 
  Pause, 
  TrendingUp, 
  DollarSign, 
  Activity, 
  Target,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Zap
} from 'lucide-react';

// If this file compiles without errors, then all our dependencies are working
console.log('All imports are working correctly!');

export const testImports = () => {
  return {
    React,
    hooks: { useState, useEffect },
    ui: { Card, Button, Input, Badge, Alert },
    icons: { Play, Pause, TrendingUp, DollarSign, Activity, Target, Plus, Trash2, CheckCircle, XCircle, Clock, Zap }
  };
};
