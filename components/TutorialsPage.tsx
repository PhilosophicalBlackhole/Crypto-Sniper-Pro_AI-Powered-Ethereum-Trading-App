/**
 * Comprehensive tutorials page for crypto sniping education
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
  HelpCircle
} from 'lucide-react';

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
 * Inline tooltip component for crypto terms
 */
function CryptoTermTooltip({ term, definition, children }: { term: string; definition: string; children: React.ReactNode }) {
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
            <div className="text-slate-300 text-xs leading-relaxed">{definition}</div>
            {/* Arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
              <div className="w-3 h-3 bg-slate-800 border-r border-b border-blue-500/40 transform rotate-45"></div>
            </div>
          </div>
        </div>
      )}
    </span>
  );
}

export function TutorialsPage({ userId }: TutorialsPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('basics');
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [userProgress, setUserProgress] = useState<UserProgress>({
    userId: userId || 'guest',
    completedTutorials: [],
    totalProgress: 0
  });
  const [quizAnswers, setQuizAnswers] = useState<{ [key: string]: number }>({});

  // Tutorial data
  const tutorials: Tutorial[] = [
    // BASICS CATEGORY
    {
      id: 'crypto-sniping-101',
      title: 'What is Crypto Sniping?',
      description: 'Learn the fundamentals of crypto sniping, including market mechanics and key concepts.',
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
          type: 'text'
        },
        {
          id: 'market-mechanics',
          title: 'How Token Launches Work',
          content: `Understanding token launches is crucial for successful sniping:

Liquidity Pool Creation: When a new token launches, developers create a liquidity pool on DEXs like Uniswap.

Price Discovery: Initial price is determined by the ratio of tokens to ETH in the pool.

MEV Bots: Automated bots compete to be first in line for profitable trades.

Gas Wars: High demand leads to gas price bidding wars.`,
          type: 'text'
        },
        {
          id: 'quiz-basics',
          title: 'Test Your Knowledge',
          content: 'Answer these questions to test your understanding of crypto sniping basics.',
          type: 'quiz',
          quiz: [
            {
              question: 'What is the primary goal of crypto sniping?',
              options: [
                'To hold tokens long-term',
                'To quickly buy tokens before price increases',
                'To provide liquidity to pools',
                'To mine cryptocurrency'
              ],
              correct: 1
            },
            {
              question: 'What determines the initial price of a newly launched token?',
              options: [
                'The developer sets a fixed price',
                'Market cap divided by supply',
                'Ratio of tokens to ETH in liquidity pool',
                'Previous day trading volume'
              ],
              correct: 2
            }
          ]
        }
      ]
    },
    {
      id: 'setup-metamask',
      title: 'Setting Up MetaMask for Sniping',
      description: 'Configure your MetaMask wallet for optimal sniping performance.',
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
          type: 'text'
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
          type: 'text'
        }
      ]
    },
    {
      id: 'first-snipe',
      title: 'Your First Snipe Trade',
      description: 'Step-by-step guide to executing your first successful snipe.',
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
• Set slippage tolerance (10-15% for new tokens)
• Have CryptoSniper Pro ready with target configured

Risk Management:
• Only risk what you can afford to lose
• Set stop-loss levels before trading
• Have an exit strategy planned`,
          type: 'text'
        }
      ]
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

Block 0-10: Extreme volatility, highest risk/reward
Block 10-50: Price stabilization begins
Block 50+: More predictable price action

Timing Indicators:
• Social media announcements
• Liquidity pool creation transactions
• Team wallet movements
• Marketing campaign timing`,
          type: 'text'
        }
      ]
    },
    {
      id: 'risk-management',
      title: 'Advanced Risk Management',
      description: 'Protect your capital with sophisticated risk management techniques.',
      duration: '22 minutes',
      level: 'intermediate',
      category: 'strategy',
      completed: false,
      locked: true,
      icon: <Shield className="h-5 w-5" />,
      steps: []
    },
    {
      id: 'portfolio-strategy',
      title: 'Portfolio Allocation for Snipers',
      description: 'Learn how to structure your portfolio for consistent sniping profits.',
      duration: '16 minutes',
      level: 'intermediate',
      category: 'strategy',
      completed: false,
      locked: true,
      icon: <BarChart3 className="h-5 w-5" />,
      steps: []
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
      steps: []
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
      steps: []
    },
    {
      id: 'smart-contracts',
      title: 'Reading Smart Contracts',
      description: 'Learn to analyze token contracts for security and functionality.',
      duration: '30 minutes',
      level: 'advanced',
      category: 'technical',
      completed: false,
      locked: true,
      icon: <Settings className="h-5 w-5" />,
      steps: []
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
      steps: []
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
      steps: []
    }
  ];

  // Load user progress on mount
  useEffect(() => {
    const savedProgress = localStorage.getItem(`tutorial-progress-${userId}`);
    if (savedProgress) {
      const loadedProgress = JSON.parse(savedProgress);
      // Recalculate total progress based on actual completed count
      const actualProgress = (loadedProgress.completedTutorials.length / tutorials.length) * 100;
      setUserProgress({
        ...loadedProgress,
        totalProgress: Math.min(100, actualProgress)
      });
    }
  }, [userId]);

  // Save progress when it changes
  useEffect(() => {
    localStorage.setItem(`tutorial-progress-${userId}`, JSON.stringify(userProgress));
  }, [userProgress, userId]);

  const getCategoryTutorials = (category: string) => {
    return tutorials.filter(t => t.category === category);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-600';
      case 'intermediate': return 'bg-yellow-600';
      case 'advanced': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'basics': return <BookOpen className="h-5 w-5" />;
      case 'strategy': return <TrendingUp className="h-5 w-5" />;
      case 'technical': return <Settings className="h-5 w-5" />;
      case 'safety': return <Shield className="h-5 w-5" />;
      default: return <BookOpen className="h-5 w-5" />;
    }
  };

  const completeTutorial = (tutorialId: string) => {
    setUserProgress(prev => {
      // Don't add if already completed
      if (prev.completedTutorials.includes(tutorialId)) {
        return prev;
      }
      
      const newCompletedTutorials = [...prev.completedTutorials, tutorialId];
      const newTotalProgress = (newCompletedTutorials.length / tutorials.length) * 100;
      
      return {
        ...prev,
        completedTutorials: newCompletedTutorials,
        totalProgress: Math.min(100, newTotalProgress)
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
      // Tutorial completed
      completeTutorial(selectedTutorial.id);
      setSelectedTutorial(null);
      setCurrentStep(0);
    }
  };

  const handleQuizAnswer = (questionIndex: number, answerIndex: number) => {
    setQuizAnswers(prev => ({
      ...prev,
      [`${selectedTutorial?.id}-${currentStep}-${questionIndex}`]: answerIndex
    }));
  };

  const renderTutorialStep = () => {
    if (!selectedTutorial) return null;

    const step = selectedTutorial.steps[currentStep];
    if (!step) return null;

    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Progress value={(currentStep / selectedTutorial.steps.length) * 100} className="mb-4" />
          <div className="flex justify-between text-sm text-slate-400">
            <span>Step {currentStep + 1} of {selectedTutorial.steps.length}</span>
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

            {step.type === 'interactive' && step.id === 'market-mechanics' && (
              <div className="text-base leading-relaxed space-y-4">
                <p>Understanding token launches is crucial for successful sniping:</p>
                
                <div>
                  <span className="font-semibold text-blue-400">Liquidity Pool Creation:</span> When a new token launches, developers create a <CryptoTermTooltip term="Liquidity Pool" definition="A smart contract containing pairs of tokens (like ETH/NewToken) that enables trading. The ratio determines the price."><span>liquidity pool</span></CryptoTermTooltip> on <CryptoTermTooltip term="DEX (Decentralized Exchange)" definition="A peer-to-peer marketplace like Uniswap where users can trade tokens directly without a central authority."><span>DEXs</span></CryptoTermTooltip> like Uniswap.
                </div>
                
                <div>
                  <span className="font-semibold text-blue-400">Price Discovery:</span> Initial price is determined by the ratio of tokens to ETH in the pool.
                </div>
                
                <div>
                  <span className="font-semibold text-blue-400"><CryptoTermTooltip term="MEV Bots" definition="Maximal Extractable Value bots that scan the blockchain for profitable opportunities and compete to execute trades first."><span>MEV Bots</span></CryptoTermTooltip>:</span> Automated bots compete to be first in line for profitable trades.
                </div>
                
                <div>
                  <span className="font-semibold text-blue-400">Gas Wars:</span> High demand leads to <CryptoTermTooltip term="Gas Wars" definition="When many traders compete for the same opportunity by bidding higher gas prices, driving up transaction costs dramatically."><span>gas price bidding wars</span></CryptoTermTooltip>.
                </div>
              </div>
            )}

            {step.type === 'interactive' && step.id === 'preparation' && (
              <div className="text-base leading-relaxed space-y-6">
                <p>Before attempting your first snipe:</p>
                
                <div>
                  <h4 className="font-semibold text-white mb-3">Research:</h4>
                  <ul className="space-y-2 text-slate-300">
                    <li>• Check the project's social media and website</li>
                    <li>• Verify contract isn't a <CryptoTermTooltip term="Honeypot" definition="A malicious smart contract designed to let you buy tokens but prevent you from selling them, trapping your funds permanently."><span>honeypot</span></CryptoTermTooltip></li>
                    <li>• Look for red flags (anonymous team, no roadmap)</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-white mb-3">Technical Setup:</h4>
                  <ul className="space-y-2 text-slate-300">
                    <li>• Ensure sufficient ETH for <CryptoTermTooltip term="Gas Fees" definition="Transaction fees paid to Ethereum miners/validators to process your trade. Higher gas = faster execution but more expensive."><span>gas fees</span></CryptoTermTooltip></li>
                    <li>• Set <CryptoTermTooltip term="Slippage Tolerance" definition="The maximum price difference you'll accept between when you submit a trade and when it executes. Higher slippage = more likely to execute but worse price."><span>slippage tolerance</span></CryptoTermTooltip> (10-15% for new tokens)</li>
                    <li>• Have CryptoSniper Pro ready with target configured</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-white mb-3">Risk Management:</h4>
                  <ul className="space-y-2 text-slate-300">
                    <li>• Only risk what you can afford to lose</li>
                    <li>• Set <CryptoTermTooltip term="Stop-Loss" definition="An automatic sell order that triggers when the token price drops to a certain level, limiting your losses on a bad trade."><span>stop-loss</span></CryptoTermTooltip> levels before trading</li>
                    <li>• Have an exit strategy planned</li>
                  </ul>
                </div>
              </div>
            )}

            {step.type === 'quiz' && step.quiz && (
              <div className="space-y-6">
                <p className="text-slate-300 mb-6">{step.content}</p>
                {step.quiz.map((question, qIndex) => (
                  <div key={qIndex} className="space-y-3">
                    <h4 className="font-semibold text-white">{question.question}</h4>
                    <div className="space-y-2">
                      {question.options.map((option, oIndex) => {
                        const answerKey = `${selectedTutorial.id}-${currentStep}-${qIndex}`;
                        const isSelected = quizAnswers[answerKey] === oIndex;
                        const isCorrect = oIndex === question.correct;
                        const showResult = answerKey in quizAnswers;
                        
                        return (
                          <Button
                            key={oIndex}
                            variant={isSelected ? "default" : "outline"}
                            className={`w-full justify-start text-left p-4 h-auto ${
                              showResult 
                                ? isCorrect 
                                  ? 'bg-green-600/20 border-green-500 text-green-100' 
                                  : isSelected 
                                    ? 'bg-red-600/20 border-red-500 text-red-100'
                                    : 'opacity-50'
                                : 'hover:bg-slate-800'
                            }`}
                            onClick={() => !showResult && handleQuizAnswer(qIndex, oIndex)}
                            disabled={showResult}
                          >
                            <span className="mr-3">{String.fromCharCode(65 + oIndex)}.</span>
                            {option}
                            {showResult && isCorrect && <CheckCircle className="ml-auto h-5 w-5 text-green-400" />}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                ))}
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
                {currentStep < selectedTutorial.steps.length - 1 ? 'Next Step' : 'Complete Tutorial'}
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
                  <span className="text-slate-300">{userProgress.completedTutorials.length}/{tutorials.length}</span>
                </div>
                <Progress value={userProgress.totalProgress} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tutorial Categories */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
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

        {(['basics', 'strategy', 'technical', 'safety'] as const).map(category => (
          <TabsContent key={category} value={category} className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getCategoryTutorials(category).map((tutorial) => (
                <Card 
                  key={tutorial.id} 
                  className={`bg-slate-900/60 backdrop-blur-md border-slate-700/40 hover:border-slate-600/60 transition-all duration-300 ${
                    tutorial.locked ? 'opacity-60' : 'hover:shadow-xl cursor-pointer'
                  }`}
                  onClick={() => startTutorial(tutorial)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {tutorial.icon}
                        <div>
                          <CardTitle className="text-white text-lg">{tutorial.title}</CardTitle>
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
                        {userProgress.completedTutorials.includes(tutorial.id) && (
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
                    <p className="text-slate-300 text-sm mb-4">{tutorial.description}</p>
                    <Button 
                      className={`w-full ${
                        tutorial.locked 
                          ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                          : userProgress.completedTutorials.includes(tutorial.id)
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                      disabled={tutorial.locked}
                    >
                      {tutorial.locked ? (
                        <>
                          <Lock className="mr-2 h-4 w-4" />
                          Locked
                        </>
                      ) : userProgress.completedTutorials.includes(tutorial.id) ? (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Completed
                        </>
                      ) : (
                        <>
                          <PlayCircle className="mr-2 h-4 w-4" />
                          Start Tutorial
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Learning Path Recommendations */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          🎯 Recommended Learning Path
        </h2>
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-r from-blue-900/60 to-purple-900/60 backdrop-blur-md border-blue-500/40">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="p-4 bg-green-600/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl">1️⃣</span>
                  </div>
                  <h3 className="text-white font-semibold mb-2">Start with Basics</h3>
                  <p className="text-slate-300 text-sm">Learn fundamentals and setup</p>
                </div>
                <div className="text-center">
                  <div className="p-4 bg-yellow-600/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl">2️⃣</span>
                  </div>
                  <h3 className="text-white font-semibold mb-2">Safety First</h3>
                  <p className="text-slate-300 text-sm">Protect yourself from scams</p>
                </div>
                <div className="text-center">
                  <div className="p-4 bg-blue-600/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl">3️⃣</span>
                  </div>
                  <h3 className="text-white font-semibold mb-2">Develop Strategy</h3>
                  <p className="text-slate-300 text-sm">Master timing and risk management</p>
                </div>
                <div className="text-center">
                  <div className="p-4 bg-purple-600/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl">4️⃣</span>
                  </div>
                  <h3 className="text-white font-semibold mb-2">Advanced Techniques</h3>
                  <p className="text-slate-300 text-sm">Optimize gas and MEV protection</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
