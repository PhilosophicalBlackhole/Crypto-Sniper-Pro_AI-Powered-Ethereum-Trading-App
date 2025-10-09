/**
 * Comprehensive tutorials page for crypto sniping education
 * - Now includes a multi-step, actionable walkthrough of Testnet and Mainnet usage.
 * - Preserves original categories while expanding "Your First Snipe Trade".
 * - Adds embedded video support for visual walkthroughs.
 */

import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  BookOpen,
  Play,
  CheckCircle,
  Clock,
  Star,
  Zap,
  Shield,
  TrendingUp,
  Target,
  Settings,
  AlertTriangle,
  DollarSign,
  BarChart3,
  Lock,
  Unlock,
  ChevronRight,
  PlayCircle,
  User,
  HelpCircle,
  Network,
  Wallet,
  Wrench,
  Activity,
  ListChecks,
  Eye,
  History,
  ArrowRightLeft,
  Save
} from 'lucide-react';
import { VideoPlayer } from './media/VideoPlayer';

/**
 * Tutorial data structures
 */
interface Tutorial {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: 'basics' | 'strategy' | 'technical' | 'safety';
  completed: boolean;
  locked: boolean;
  icon: React.ReactNode;
  steps: TutorialStep[];
}

interface TutorialStep {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'video' | 'interactive' | 'quiz';
  /**
   * Media string format:
   * - "embed:URL" for YouTube/Vimeo embeds (e.g., "embed:https://www.youtube.com/embed/VIDEO_ID")
   * - "mp4:URL" for direct mp4 (e.g., "mp4:https://.../video.mp4")
   * - (optional) You can also use raw embed URLs if needed.
   */
  media?: string;
  quiz?: QuizQuestion[];
}

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
}

interface UserProgress {
  userId: string;
  completedTutorials: string[];
  totalProgress: number;
}

interface TutorialsPageProps {
  userId?: string;
}

/**
 * Inline tooltip for crypto terms
 */
function CryptoTermTooltip({
  term,
  definition,
  children,
}: {
  term: string;
  definition: string;
  children: React.ReactNode;
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <span className="relative inline-block">
      <span
        className="cursor-help underline decoration-dotted decoration-blue-400 text-blue-300 hover:text-blue-200 transition-colors"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {children}
      </span>
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
          <div className="bg-slate-800 border border-blue-500/40 rounded-lg shadow-xl p-3 text-sm max-w-xs">
            <div className="font-semibold text-blue-400 mb-1">{term}</div>
            <div className="text-slate-300 text-xs leading-relaxed">
              {definition}
            </div>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
              <div className="w-3 h-3 bg-slate-800 border-r border-b border-blue-500/40 transform rotate-45"></div>
            </div>
          </div>
        </div>
      )}
    </span>
  );
}

/**
 * TutorialsPage
 * - Provides categories and interactive lessons.
 * - Expanded "Your First Snipe Trade" with detailed Testnet/Mainnet steps.
 * - Adds video step for snipe configuration demo.
 */
export function TutorialsPage({ userId }: TutorialsPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('basics');
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [userProgress, setUserProgress] = useState<UserProgress>({
    userId: userId || 'guest',
    completedTutorials: [],
    totalProgress: 0,
  });
  const [quizAnswers, setQuizAnswers] = useState<{ [key: string]: number }>({});

  /**
   * Tutorial content
   * - Basics includes an expanded multi-step "Your First Snipe Trade" walkthrough.
   * - Adds a video step to visually explain snipe configuration.
   */
  const tutorials: Tutorial[] = [
    {
      id: 'crypto-sniping-101',
      title: 'What is Crypto Sniping?',
      description:
        'Learn the fundamentals of crypto sniping, including market mechanics and key concepts.',
      duration: '8 minutes',
      level: 'beginner',
      category: 'basics',
      completed: false,
      locked: false,
      icon: <BookOpen className="h-5 w-5" />,
      steps: [
        {
          id: 'intro',
          title: 'Introduction to Crypto Sniping',
          content: `Crypto sniping is the practice of quickly purchasing newly launched tokens or catching favorable price movements before the broader market reacts. 

Key concepts:
• Speed: Being first to execute trades
• Research: Identifying promising opportunities  
• Risk Management: Protecting your capital
• Technology: Using bots and automation

Sniping requires preparation, quick decision-making, and the right tools to be successful.`,
          type: 'text',
        },
        {
          id: 'market-mechanics',
          title: 'How Token Launches Work',
          content: `Understanding token launches is crucial for successful sniping:

Liquidity Pool Creation: When a new token launches, developers create a liquidity pool on DEXs like Uniswap.

Price Discovery: Initial price is determined by the ratio of tokens to ETH in the pool.

MEV Bots: Automated bots compete to be first in line for profitable trades.

Gas Wars: High demand leads to gas price bidding wars.`,
          type: 'text',
        },
        {
          id: 'quiz-basics',
          title: 'Test Your Knowledge',
          content:
            'Answer these questions to test your understanding of crypto sniping basics.',
          type: 'quiz',
          quiz: [
            {
              question: 'What is the primary goal of crypto sniping?',
              options: [
                'To hold tokens long-term',
                'To quickly buy tokens before price increases',
                'To provide liquidity to pools',
                'To mine cryptocurrency',
              ],
              correct: 1,
            },
            {
              question:
                'What determines the initial price of a newly launched token?',
              options: [
                'The developer sets a fixed price',
                'Market cap divided by supply',
                'Ratio of tokens to ETH in liquidity pool',
                'Previous day trading volume',
              ],
              correct: 2,
            },
          ],
        },
      ],
    },
    {
      id: 'setup-metamask',
      title: 'Setting Up MetaMask for Sniping',
      description:
        'Configure your MetaMask wallet for optimal sniping performance.',
      duration: '12 minutes',
      level: 'beginner',
      category: 'basics',
      completed: false,
      locked: false,
      icon: <Settings className="h-5 w-5" />,
      steps: [
        {
          id: 'install-metamask',
          title: 'Installing MetaMask',
          content: `MetaMask is your gateway to DeFi and sniping. Here's how to set it up:

Step 1: Visit metamask.io and download the browser extension
Step 2: Create a new wallet or import existing seed phrase
Step 3: Secure your seed phrase (write it down offline!)
Step 4: Add funds to your wallet

⚠️ Security Tip: Never share your seed phrase with anyone!`,
          type: 'text',
        },
        {
          id: 'network-settings',
          title: 'Optimizing Network Settings',
          content: `Configure MetaMask for faster transaction processing:

Custom RPC Endpoints: Use faster RPC providers like Alchemy or Infura

Gas Settings: 
• Set default gas limit to 300,000
• Enable advanced gas controls
• Use "Fast" or "Fastest" gas prices for sniping

Nonce Management: Understand transaction ordering and replacement`,
          type: 'text',
        },
      ],
    },
    {
      id: 'first-snipe',
      title: 'Your First Snipe Trade',
      description:
        'Step-by-step guide to using CryptoSniper on Testnet and Mainnet — configure, simulate, and execute.',
      duration: '15 minutes',
      level: 'beginner',
      category: 'basics',
      completed: false,
      locked: false,
      icon: <Target className="h-5 w-5" />,
      steps: [
        {
          id: 'preparation',
          title: 'Pre-Trade Preparation',
          content: `Before attempting your first snipe:

Research: 
• Check the project's social media and website
• Verify contract isn't a honeypot
• Look for red flags (anonymous team, no roadmap)

Technical Setup:
• Ensure sufficient ETH for gas fees
• Set slippage tolerance (10–15% for new tokens)
• Have CryptoSniper Pro ready with target configured

Risk Management:
• Only risk what you can afford to lose
• Set stop-loss levels before trading
• Have an exit strategy planned`,
          type: 'text',
        },
        {
          id: 'environment-setup',
          title: 'Environment Setup (App Basics)',
          content:
            'Familiarize yourself with the app’s key controls before connecting your wallet.',
          type: 'interactive',
        },
        {
          id: 'wallet-connect',
          title: 'Connect Your Wallet',
          content:
            'Use the in-app wallet controls to connect MetaMask and verify account details.',
          type: 'interactive',
        },
        {
          id: 'select-network',
          title: 'Select Testnet or Mainnet',
          content:
            'Use the Live/Test toggle and ensure your MetaMask is on the matching network.',
          type: 'interactive',
        },
        {
          id: 'configure-snipe',
          title: 'Configure Your Snipe',
          content:
            'Fill in token address, amount, slippage, gas, and save your config.',
          type: 'interactive',
        },
        {
          id: 'configure-snipe-video',
          title: 'Watch: Configure Your Snipe (Demo)',
          content:
            'Visual walkthrough of entering token address, amount, slippage, gas, and saving a preset.',
          type: 'video',
          // Using a sample mp4 for demonstration. Replace with your own hosted MP4 or an embed URL when available.
          media: 'mp4:https://samplelib.com/lib/preview/mp4/sample-960x540.mp4',
        },
        {
          id: 'dry-run',
          title: 'Dry-Run on Testnet',
          content:
            'Simulate or practice on a Testnet to validate settings and flows.',
          type: 'interactive',
        },
        {
          id: 'execute-live',
          title: 'Execute on Mainnet (Live)',
          content:
            'When confident, switch to Live and execute with real funds. Review MetaMask prompts carefully.',
          type: 'text',
        },
        {
          id: 'monitor',
          title: 'Monitor and Manage',
          content:
            'Track the transaction, manage replacements, and watch execution status.',
          type: 'text',
        },
        {
          id: 'post-trade',
          title: 'Post-Trade Review',
          content:
            'Analyze outcomes and refine your strategy for the next attempt.',
          type: 'text',
        },
      ],
    },

    // STRATEGY CATEGORY
    {
      id: 'timing-strategies',
      title: 'Perfect Timing Strategies',
      description: 'Master the art of timing your snipes for maximum profit.',
      duration: '18 minutes',
      level: 'intermediate',
      category: 'strategy',
      completed: false,
      locked: true,
      icon: <Clock className="h-5 w-5" />,
      steps: [
        {
          id: 'launch-timing',
          title: 'Launch Window Analysis',
          content: `The first few minutes after a token launch are critical:

Block 0–10: Extreme volatility, highest risk/reward
Block 10–50: Price stabilization begins
Block 50+: More predictable price action

Timing Indicators:
• Social media announcements
• Liquidity pool creation transactions
• Team wallet movements
• Marketing campaign timing`,
          type: 'text',
        },
      ],
    },
    {
      id: 'risk-management',
      title: 'Advanced Risk Management',
      description:
        'Protect your capital with sophisticated risk management techniques.',
      duration: '22 minutes',
      level: 'intermediate',
      category: 'strategy',
      completed: false,
      locked: true,
      icon: <Shield className="h-5 w-5" />,
      steps: [],
    },
    {
      id: 'portfolio-strategy',
      title: 'Portfolio Allocation for Snipers',
      description:
        'Learn how to structure your portfolio for consistent sniping profits.',
      duration: '16 minutes',
      level: 'intermediate',
      category: 'strategy',
      completed: false,
      locked: true,
      icon: <BarChart3 className="h-5 w-5" />,
      steps: [],
    },

    // TECHNICAL CATEGORY
    {
      id: 'gas-optimization',
      title: 'Gas Optimization Techniques',
      description: 'Advanced strategies to minimize gas costs and maximize speed.',
      duration: '20 minutes',
      level: 'advanced',
      category: 'technical',
      completed: false,
      locked: true,
      icon: <Zap className="h-5 w-5" />,
      steps: [],
    },
    {
      id: 'mev-protection',
      title: 'MEV Protection Strategies',
      description: 'Protect yourself from front-running and sandwich attacks.',
      duration: '25 minutes',
      level: 'advanced',
      category: 'technical',
      completed: false,
      locked: true,
      icon: <Shield className="h-5 w-5" />,
      steps: [],
    },
    {
      id: 'smart-contracts',
      title: 'Reading Smart Contracts',
      description:
        'Learn to analyze token contracts for security and functionality.',
      duration: '30 minutes',
      level: 'advanced',
      category: 'technical',
      completed: false,
      locked: true,
      icon: <Settings className="h-5 w-5" />,
      steps: [],
    },

    // SAFETY CATEGORY
    {
      id: 'scam-detection',
      title: 'Identifying Scams and Honeypots',
      description: 'Protect yourself from malicious tokens and rug pulls.',
      duration: '14 minutes',
      level: 'beginner',
      category: 'safety',
      completed: false,
      locked: false,
      icon: <AlertTriangle className="h-5 w-5" />,
      steps: [],
    },
    {
      id: 'wallet-security',
      title: 'Wallet Security Best Practices',
      description: 'Keep your funds safe with proper wallet hygiene.',
      duration: '12 minutes',
      level: 'beginner',
      category: 'safety',
      completed: false,
      locked: false,
      icon: <Lock className="h-5 w-5" />,
      steps: [],
    },
  ];

  /**
   * Persist progress per user
   */
  useEffect(() => {
    const savedProgress = localStorage.getItem(`tutorial-progress-${userId}`);
    if (savedProgress) {
      const loadedProgress = JSON.parse(savedProgress);
      const actualProgress = (loadedProgress.completedTutorials.length / tutorials.length) * 100;
      setUserProgress({
        ...loadedProgress,
        totalProgress: Math.min(100, actualProgress),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    localStorage.setItem(`tutorial-progress-${userId}`, JSON.stringify(userProgress));
  }, [userProgress, userId]);

  /**
   * Helpers
   */
  const getCategoryTutorials = (category: string) => {
    return tutorials.filter((t) => t.category === category);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-600';
      case 'intermediate':
        return 'bg-yellow-600';
      case 'advanced':
        return 'bg-red-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'basics':
        return <BookOpen className="h-5 w-5" />;
      case 'strategy':
        return <TrendingUp className="h-5 w-5" />;
      case 'technical':
        return <Settings className="h-5 w-5" />;
      case 'safety':
        return <Shield className="h-5 w-5" />;
      default:
        return <BookOpen className="h-5 w-5" />;
    }
  };

  const completeTutorial = (tutorialId: string) => {
    setUserProgress((prev) => {
      if (prev.completedTutorials.includes(tutorialId)) {
        return prev;
      }
      const newCompletedTutorials = [...prev.completedTutorials, tutorialId];
      const newTotalProgress = (newCompletedTutorials.length / tutorials.length) * 100;
      return {
        ...prev,
        completedTutorials: newCompletedTutorials,
        totalProgress: Math.min(100, newTotalProgress),
      };
    });
  };

  const startTutorial = (tutorial: Tutorial) => {
    if (tutorial.locked) return;
    setSelectedTutorial(tutorial);
    setCurrentStep(0);
  };

  const nextStep = () => {
    if (!selectedTutorial) return;
    if (currentStep < selectedTutorial.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTutorial(selectedTutorial.id);
      setSelectedTutorial(null);
      setCurrentStep(0);
    }
  };

  const handleQuizAnswer = (questionIndex: number, answerIndex: number) => {
    setQuizAnswers((prev) => ({
      ...prev,
      [`${selectedTutorial?.id}-${currentStep}-${questionIndex}`]: answerIndex,
    }));
  };

  /**
   * Interactive step renderers for "Your First Snipe Trade"
   * - Renders step-specific guidance with actionable checklists.
   */
  const renderInteractiveStepContent = (stepId: string) => {
    switch (stepId) {
      case 'environment-setup':
        return (
          <div className="space-y-6 text-base leading-relaxed">
            <p className="text-slate-300">
              Get familiar with the essential controls in the app:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-slate-900/60 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white text-base flex items-center gap-2">
                    <Wrench className="h-4 w-4" />
                    Core Panels
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-slate-300 text-sm space-y-2">
                  <div className="flex items-start gap-2">
                    <Activity className="h-4 w-4 mt-0.5 text-blue-400" />
                    <span>Dashboard: Quick glance of markets and your active strategies.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <History className="h-4 w-4 mt-0.5 text-blue-400" />
                    <span>History: Review past transactions and outcomes.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Settings className="h-4 w-4 mt-0.5 text-blue-400" />
                    <span>Billing/Tutorials: Plan management and education hub.</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/60 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white text-base flex items-center gap-2">
                    <Network className="h-4 w-4" />
                    Status & Toggles
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-slate-300 text-sm space-y-2">
                  <div className="flex items-start gap-2">
                    <ArrowRightLeft className="h-4 w-4 mt-0.5 text-purple-400" />
                    <span>
                      Live/Test toggle (LiveModeToggle): switch between Mainnet and Testnet
                      flows in-app.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Shield className="h-4 w-4 mt-0.5 text-purple-400" />
                    <span>Network bar: confirms network name and chain status.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Zap className="h-4 w-4 mt-0.5 text-purple-400" />
                    <span>Gas status: keep an eye on fees during volatile periods.</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'wallet-connect':
        return (
          <div className="space-y-6 text-base leading-relaxed">
            <p className="text-slate-300">
              Connect your wallet and verify it’s ready:
            </p>
            <div className="p-4 rounded-lg bg-slate-800/40 border border-slate-700/50">
              <ul className="space-y-2 text-slate-300 text-sm">
                <li>• Click the wallet control (ConnectWalletButton or WalletConnection).</li>
                <li>• Approve connection in MetaMask (extension or mobile via WalletConnect).</li>
                <li>• Confirm the displayed address and ensure it has sufficient funds (ETH on Mainnet, test ETH on Testnet).</li>
                <li>• If needed, add networks in MetaMask and switch them from the extension UI.</li>
              </ul>
            </div>
          </div>
        );

      case 'select-network':
        return (
          <div className="space-y-6 text-base leading-relaxed">
            <p className="text-slate-300">
              Practice on a Testnet first, then go Live:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-slate-900/60 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white text-base flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Testnet Mode
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-slate-300 text-sm space-y-2">
                  <div className="flex items-start gap-2">
                    <HelpCircle className="h-4 w-4 mt-0.5 text-green-400" />
                    <span>Toggle Live OFF (Test) with LiveModeToggle.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Network className="h-4 w-4 mt-0.5 text-green-400" />
                    <span>Choose a Testnet (e.g., Sepolia/Holesky). Use TestnetPanel if available.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <DollarSign className="h-4 w-4 mt-0.5 text-green-400" />
                    <span>Get test ETH from a faucet if you need funds.</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/60 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white text-base flex items-center gap-2">
                    <Unlock className="h-4 w-4" />
                    Mainnet Mode
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-slate-300 text-sm space-y-2">
                  <div className="flex items-start gap-2">
                    <HelpCircle className="h-4 w-4 mt-0.5 text-red-400" />
                    <span>Toggle Live ON and confirm you're on Ethereum Mainnet.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Shield className="h-4 w-4 mt-0.5 text-red-400" />
                    <span>Double-check slippage, gas, and contract safety before executing.</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'configure-snipe':
        return (
          <div className="space-y-6 text-base leading-relaxed">
            <p className="text-slate-300">
              Configure a snipe with realistic parameters:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-slate-900/60 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white text-base flex items-center gap-2">
                    <Wrench className="h-4 w-4" />
                    Snipe Config (SnipeConfigCard)
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-slate-300 text-sm space-y-2">
                  <div className="flex items-start gap-2">
                    <ListChecks className="h-4 w-4 mt-0.5 text-blue-400" />
                    <span>Enter token address and symbol (verify contract). </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <ListChecks className="h-4 w-4 mt-0.5 text-blue-400" />
                    <span>Set amount (e.g., 0.05–0.2 ETH), slippage (10–15% for fresh launches).</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <ListChecks className="h-4 w-4 mt-0.5 text-blue-400" />
                    <span>Adjust gas strategy (priority fee when competition is high).</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/60 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white text-base flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Save & Reuse (SavedConfigsManager)
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-slate-300 text-sm space-y-2">
                  <div className="flex items-start gap-2">
                    <Save className="h-4 w-4 mt-0.5 text-yellow-400" />
                    <span>Save named presets for fast recall under pressure.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <History className="h-4 w-4 mt-0.5 text-yellow-400" />
                    <span>Load favorites quickly when markets move.</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'dry-run':
        return (
          <div className="space-y-6 text-base leading-relaxed">
            <p className="text-slate-300">
              Validate your flow on Testnet before using real funds:
            </p>
            <div className="p-4 rounded-lg bg-slate-800/40 border border-slate-700/50 space-y-2 text-sm text-slate-300">
              <div className="flex items-start gap-2">
                <Lock className="h-4 w-4 mt-0.5 text-green-400" />
                <span>Ensure LiveModeToggle is OFF (Test).</span>
              </div>
              <div className="flex items-start gap-2">
                <Network className="h-4 w-4 mt-0.5 text-green-400" />
                <span>Switch MetaMask to your chosen Testnet and confirm in the network bar.</span>
              </div>
              <div className="flex items-start gap-2">
                <Play className="h-4 w-4 mt-0.5 text-green-400" />
                <span>Run a simulated trade or test swap to confirm approvals and gas behavior.</span>
              </div>
              <div className="flex items-start gap-2">
                <Eye className="h-4 w-4 mt-0.5 text-green-400" />
                <span>Observe confirmations and timing in the status widgets.</span>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-slate-300">
            This step is interactive. Follow the on-screen instructions.
          </div>
        );
    }
  };

  /**
   * Render current step (selected tutorial)
   * - Adds rendering branch for 'video' steps using VideoPlayer.
   */
  const renderTutorialStep = () => {
    if (!selectedTutorial) return null;

    const step = selectedTutorial.steps[currentStep];
    if (!step) return null;

    // Parse media spec if present for video steps
    const parseMedia = (spec?: string): { kind: 'embed' | 'mp4'; src: string } | null => {
      if (!spec) return null;
      if (spec.startsWith('mp4:')) return { kind: 'mp4', src: spec.slice(4) };
      if (spec.startsWith('embed:')) return { kind: 'embed', src: spec.slice(6) };
      // Default: treat as embed when raw URL string without prefix
      return { kind: 'embed', src: spec };
    };

    const media = parseMedia(step.media);

    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Progress
            value={(currentStep / selectedTutorial.steps.length) * 100}
            className="mb-4"
          />
          <div className="flex justify-between text-sm text-slate-400">
            <span>
              Step {currentStep + 1} of {selectedTutorial.steps.length}
            </span>
            <span>{selectedTutorial.duration}</span>
          </div>
        </div>

        <Card className="bg-slate-900/60 backdrop-blur-md border-slate-700/40">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-3">
              {selectedTutorial.icon}
              {step.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-slate-300">
            {step.type === 'text' && (
              <div className="whitespace-pre-line text-base leading-relaxed">
                {step.content}
              </div>
            )}

            {step.type === 'interactive' && (
              <div className="text-base leading-relaxed space-y-4">
                <p className="text-slate-300">{step.content}</p>
                {renderInteractiveStepContent(step.id)}
              </div>
            )}

            {step.type === 'video' && media && (
              <div className="space-y-4">
                <p className="text-slate-300">{step.content}</p>
                <VideoPlayer
                  src={media.src}
                  kind={media.kind}
                  title={step.title}
                />
              </div>
            )}

            {step.type === 'quiz' && step.quiz && (
              <div className="space-y-6">
                <p className="text-slate-300 mb-6">{step.content}</p>
                {step.quiz.map((question, qIndex) => {
                  const answerKey = `${selectedTutorial.id}-${currentStep}-${qIndex}`;
                  return (
                    <div key={qIndex} className="space-y-3">
                      <h4 className="font-semibold text-white">
                        {question.question}
                      </h4>
                      <div className="space-y-2">
                        {question.options.map((option, oIndex) => {
                          const isSelected = quizAnswers[answerKey] === oIndex;
                          const isCorrect = oIndex === question.correct;
                          const showResult = answerKey in quizAnswers;

                          return (
                            <Button
                              key={oIndex}
                              variant={isSelected ? 'default' : 'outline'}
                              className={`w-full justify-start text-left p-4 h-auto ${
                                showResult
                                  ? isCorrect
                                    ? 'bg-green-600/20 border-green-500 text-green-100'
                                    : isSelected
                                    ? 'bg-red-600/20 border-red-500 text-red-100'
                                    : 'opacity-50'
                                  : 'hover:bg-slate-800'
                              }`}
                              onClick={() =>
                                !showResult &&
                                handleQuizAnswer(qIndex, oIndex)
                              }
                              disabled={showResult}
                            >
                              <span className="mr-3">
                                {String.fromCharCode(65 + oIndex)}.
                              </span>
                              {option}
                              {showResult && isCorrect && (
                                <CheckCircle className="ml-auto h-5 w-5 text-green-400" />
                              )}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={() => setSelectedTutorial(null)}
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                Back to Tutorials
              </Button>
              <Button
                onClick={nextStep}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {currentStep < selectedTutorial.steps.length - 1
                  ? 'Next Step'
                  : 'Complete Tutorial'}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (selectedTutorial) {
    return (
      <div className="container mx-auto px-4 py-8 bg-transparent">
        {renderTutorialStep()}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-transparent">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">
          🎓 CryptoSniper Academy
        </h1>
        <p className="text-xl text-slate-300 mb-6 font-medium">
          Master the art of crypto sniping with our comprehensive tutorials
        </p>

        {/* Progress Overview */}
        <Card className="max-w-md mx-auto bg-slate-900/60 backdrop-blur-md border-slate-700/40">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600 rounded-full">
                <User className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white font-semibold">Your Progress</span>
                  <span className="text-slate-300">
                    {userProgress.completedTutorials.length}/{tutorials.length}
                  </span>
                </div>
                <Progress value={userProgress.totalProgress} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tutorial Categories */}
      <Tabs
        value={selectedCategory}
        onValueChange={setSelectedCategory}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-4 bg-slate-900/60 backdrop-blur-md">
          <TabsTrigger value="basics" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Basics</span>
          </TabsTrigger>
          <TabsTrigger value="strategy" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Strategy</span>
          </TabsTrigger>
          <TabsTrigger value="technical" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Technical</span>
          </TabsTrigger>
          <TabsTrigger value="safety" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Safety</span>
          </TabsTrigger>
        </TabsList>

        {(['basics', 'strategy', 'technical', 'safety'] as const).map(
          (category) => (
            <TabsContent key={category} value={category} className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getCategoryTutorials(category).map((tutorial) => (
                  <Card
                    key={tutorial.id}
                    className={`bg-slate-900/60 backdrop-blur-md border-slate-700/40 hover:border-slate-600/60 transition-all duration-300 ${
                      tutorial.locked
                        ? 'opacity-60'
                        : 'hover:shadow-xl cursor-pointer'
                    }`}
                    onClick={() => startTutorial(tutorial)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {tutorial.icon}
                          <div>
                            <CardTitle className="text-white text-lg">
                              {tutorial.title}
                            </CardTitle>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge className={getLevelColor(tutorial.level)}>
                                {tutorial.level}
                              </Badge>
                              <span className="text-slate-400 text-sm flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {tutorial.duration}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {userProgress.completedTutorials.includes(
                            tutorial.id
                          ) && (
                            <CheckCircle className="h-5 w-5 text-green-400" />
                          )}
                          {tutorial.locked ? (
                            <Lock className="h-5 w-5 text-slate-500" />
                          ) : (
                            <Unlock className="h-5 w-5 text-blue-400" />
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-300 text-sm mb-4">
                        {tutorial.description}
                      </p>
                      <Button>
                        className={`w-full ${
                          tutorial.locked
		      </button>
 		</CardContent>
        </Card>
      </div>
    </div>
  );
}
