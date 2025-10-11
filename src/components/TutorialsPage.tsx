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
#import { VideoPlayer } from './media/VideoPlayer';

interface TutorialStep {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'video' | 'interactive' | 'quiz';
  media?: string;
  quiz?: { question: string; options: string[]; correct: number }[];
}

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

interface TutorialsPageProps {
  userId?: string;
}

function CryptoTermTooltip({ term, definition, children }: { term: string; definition: string; children: React.ReactNode; }) {
  const [showTooltip, setShowTooltip] = useState(false);
  return (
    <span className="relative inline-block" onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}>
      <span className="cursor-help underline decoration-dotted decoration-blue-400 text-blue-300 hover:text-blue-200 transition-colors">{children}</span>
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
          <div className="bg-slate-800 border border-blue-500/40 rounded-lg shadow-xl p-3 text-sm max-w-xs">
            <div className="font-semibold text-blue-400 mb-1">{term}</div>
            <div className="text-slate-300 text-xs leading-relaxed">{definition}</div>
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
  const [userProgress, setUserProgress] = useState<{ userId: string; completedTutorials: string[]; totalProgress: number }>({
    userId: userId || 'guest',
    completedTutorials: [],
    totalProgress: 0,
  });
  const [quizAnswers, setQuizAnswers] = useState<{ [key: string]: number }>({});

  const tutorials: Tutorial[] = [
    {
      id: 'crypto-sniping-101',
      title: 'What is Crypto Sniping?',
      description: 'Learn fundamentals of crypto sniping, market mechanics and key concepts.',
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
          id: 'quiz-basics',
          title: 'Test Your Knowledge',
          content: 'Answer these questions to test your understanding of crypto sniping basics.',
          type: 'quiz',
          quiz: [
            {
              question: 'What is the primary goal of crypto sniping?',
              options: ['To hold tokens long-term', 'To quickly buy tokens before price increases', 'To provide liquidity to pools', 'To mine cryptocurrency'],
              correct: 1
            },
            {
              question: 'What determines the initial price of a newly launched token?',
              options: ['The developer sets a fixed price', 'Market cap divided by supply', 'Ratio of tokens to ETH in liquidity pool', 'Previous day trading volume'],
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
• Step 1: Visit metamask.io and download the browser extension
• Step 2: Create a new wallet or import existing seed phrase
• Step 3: Secure your seed phrase (write it down offline!)
• Step 4: Add funds to your wallet

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
      description: 'Step-by-step guide to using CryptoSniper on Testnet and Mainnet — configure, simulate, and execute.',
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
          type: 'text'
        },
        {
          id: 'environment-setup',
          title: 'Environment Setup (App Basics)',
          content: "Familiarize yourself with the app’s key controls before connecting your wallet.",
          type: 'interactive'
        },
        {
          id: 'wallet-connect',
          title: 'Connect Your Wallet',
          content: 'Use the in-app wallet controls to connect MetaMask and verify account details.',
          type: 'interactive'
        },
        {
          id: 'select-network',
          title: 'Select Testnet or Mainnet',
          content: 'Use the Live/Test toggle and ensure your MetaMask is on the matching network.',
          type: 'interactive'
        },
        {
          id: 'configure-snipe',
          title: 'Configure Your Snipe',
          content: 'Fill in token address, amount, slippage, gas, and save your config.',
          type: 'interactive'
        },
        {
          id: 'configure-snipe-video',
          title: 'Watch: Configure Your Snipe (Demo)',
          content: 'Visual walkthrough of entering token address, amount, slippage, gas, and saving a preset.',
          type: 'video',
          media: 'mp4:https://samplelib.com/lib/preview/mp4/sample-960x540.mp4'
        },
        {
          id: 'dry-run',
          title: 'Dry-Run on Testnet',
          content: 'Simulate or practice on a Testnet to validate settings and flows.',
          type: 'interactive'
        },
        {
          id: 'execute-live',
          title: 'Execute on Mainnet (Live)',
          content: 'When confident, switch to Live and execute with real funds. Review MetaMask prompts carefully.',
          type: 'text'
        },
        {
          id: 'monitor',
          title: 'Monitor and Manage',
          content: 'Track the transaction, manage replacements, and watch execution status.',
          type: 'text'
        },
        {
          id: 'post-trade',
          title: 'Post-Trade Review',
          content: 'Analyze outcomes and refine your strategy for the next attempt.',
          type: 'text'
        }
      ]
    },
    // Additional categories can be added similarly...
  ];

  // Persist progress
  useEffect(() => {
    const savedProgress = localStorage.getItem(`tutorial-progress-${userId}`);
    if (savedProgress) {
      const loaded = JSON.parse(savedProgress);
      const actual = (loaded.completedTutorials.length / tutorials.length) * 100;
      setUserProgress({ ...loaded, totalProgress: Math.min(100, actual) });
    }
    // eslint-disable-next-line
  }, [userId]);

  useEffect(() => {
    localStorage.setItem(`tutorial-progress-${userId}`, JSON.stringify(userProgress));
  }, [userProgress, userId]);

  const getCategoryTutorials = (category: string) => tutorials.filter((t) => t.category === category);

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
    setUserProgress((prev) => {
      if (prev.completedTutorials.includes(tutorialId)) return prev;
      const next = [...prev.completedTutorials, tutorialId];
      const newTotal = (next.length / tutorials.length) * 100;
      return { ...prev, completedTutorials: next, totalProgress: Math.min(100, newTotal) };
    });
  };

  const startTutorial = (t: Tutorial) => {
    if (t.locked) return;
    setSelectedTutorial(t);
    setCurrentStep(0);
  };

  const nextStep = () => {
    if (!selectedTutorial) return;
    if (currentStep < selectedTutorial.steps.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      completeTutorial(selectedTutorial.id);
      setSelectedTutorial(null);
      setCurrentStep(0);
    }
  };

  const handleQuizAnswer = (qIndex: number, aIndex: number) => {
    if (!selectedTutorial) return;
    const key = `${selectedTutorial.id}-${currentStep}-${qIndex}`;
    setQuizAnswers((p) => ({ ...p, [key]: aIndex }));
  };

  const renderInteractiveStepContent = (stepId: string) => {
    switch (stepId) {
      case 'environment-setup':
        return (
          <div className="space-y-6 text-base leading-relaxed">
            <p className="text-slate-300">Get familiar with the essential controls in the app:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-slate-900/60 border-slate-700/50">
                <CardHeader><CardTitle className="text-white text-base flex items-center gap-2"><Wrench className="h-4 w-4" /> Core Panels</CardTitle></CardHeader>
                <CardContent className="text-slate-300 text-sm space-y-2">
                  <div className="flex items-start gap-2"><Activity className="h-4 w-4 mt-0.5 text-blue-400" /><span>Dashboard: Quick glance of markets and your active strategies.</span></div>
                  <div className="flex items-start gap-2"><History className="h-4 w-4 mt-0.5 text-blue-400" /><span>History: Review past transactions and outcomes.</span></div>
                </CardContent>
              </Card>
              <Card className="bg-slate-900/60 border-slate-700/50">
                <CardHeader><CardTitle className="text-white text-base flex items-center gap-2"><Network className="h-4 w-4" /> Status & Toggles</CardTitle></CardHeader>
                <CardContent className="text-slate-300 text-sm space-y-2">
                  <div className="flex items-start gap-2"><ArrowRightLeft className="h-4 w-4 mt-0.5 text-purple-400" /><span>Live/Test toggle (LiveModeToggle): switch between Mainnet and Testnet flows in-app.</span></div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      case 'wallet-connect':
        return (
          <div className="space-y-6 text-base leading-relaxed">
            <p className="text-slate-300">Connect your wallet and verify it’s ready:</p>
            <div className="p-4 rounded-lg bg-slate-800/40 border border-slate-700/50">
              <ul className="space-y-2 text-slate-300 text-sm">
                <li>• Click the wallet control to connect</li>
                <li>• Approve connection in MetaMask</li>
                <li>• Confirm address and ensure funds</li>
              </ul>
            </div>
          </div>
        );
      case 'select-network':
        return (
          <div className="space-y-6 text-base leading-relaxed">
            <p className="text-slate-300">Practice on a Testnet first, then go Live:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-slate-900/60 border-slate-700/50">
                <CardHeader><CardTitle className="text-white text-base flex items-center gap-2"><Lock className="h-4 w-4" /> Testnet Mode</CardTitle></CardHeader>
                <CardContent className="text-slate-300 text-sm space-y-2">
                  <div className="flex items-start gap-2"><HelpCircle className="h-4 w-4 mt-0.5 text-green-400" /><span>Toggle Live OFF (Test) with LiveModeToggle.</span></div>
                </CardContent>
              </Card>
              <Card className="bg-slate-900/60 border-slate-700/50">
                <CardHeader><CardTitle className="text-white text-base flex items-center gap-2"><Unlock className="h-4 w-4" /> Mainnet Mode</CardTitle></CardHeader>
                <CardContent className="text-slate-300 text-sm space-y-2">
                  <div className="flex items-start gap-2"><HelpCircle className="h-4 w-4 mt-0.5 text-red-400" /><span>Toggle Live ON and confirm you're on Ethereum Mainnet.</span></div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      case 'configure-snipe':
        return (
          <div className="space-y-6 text-base leading-relaxed">
            <p className="text-slate-300">Configure a snipe with realistic parameters:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-slate-900/60 border-slate-700/50">
                <CardHeader><CardTitle className="text-white text-base flex items-center gap-2"><Wrench className="h-4 w-4" /> Snipe Config</CardTitle></CardHeader>
                <CardContent className="text-slate-300 text-sm space-y-2">
                  <div className="flex items-start gap-2"><ListChecks className="h-4 w-4 mt-0.5 text-blue-400" /><span>Enter token address and symbol</span></div>
                </CardContent>
              </Card>
              <Card className="bg-slate-900/60 border-slate-700/50">
                <CardHeader><CardTitle className="text-white text-base flex items-center gap-2"><Star className="h-4 w-4" /> Save & Reuse</CardTitle></CardHeader>
                <CardContent className="text-slate-300 text-sm space-y-2">
                  <div className="flex items-start gap-2"><Save className="h-4 w-4 mt-0.5" /><span>Save presets for fast recall.</span></div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      case 'dry-run':
        return (
          <div className="space-y-6 text-base leading-relaxed">
            <p className="text-slate-300">Validate your flow on Testnet before using real funds:</p>
            <div className="p-4 rounded-lg bg-slate-800/40 border border-slate-700/50 space-y-2 text-sm text-slate-300">
              <div className="flex items-start gap-2"><Lock className="h-4 w-4 mt-0.5 text-green-400" /><span>Ensure LiveModeToggle is OFF (Test).</span></div>
            </div>
          </div>
        );
      default:
        return (
          <div className="text-slate-300">This step is interactive. Follow the on-screen instructions.</div>
        );
    }
  };

  const renderTutorialStep = () => {
    if (!selectedTutorial) return null;
    const step = selectedTutorial.steps[currentStep];
    if (!step) return null;

    const parseMedia = (spec?: string): { kind: 'embed' | 'mp4'; src: string } | null => {
      if (!spec) return null;
      if (spec.startsWith('mp4:')) return { kind: 'mp4', src: spec.slice(4) };
      if (spec.startsWith('embed:')) return { kind: 'embed', src: spec.slice(6) };
      return { kind: 'embed', src: spec };
    };

    const media = step.media ? parseMedia(step.media) : null;

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
              <div className="whitespace-pre-line text-base leading-relaxed">{step.content}</div>
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
                <VideoPlayer src={media.src} kind={media.kind} title={step.title} />
              </div>
            )}
            {step.type === 'quiz' && step.quiz && (
              <div className="space-y-6">
                <p className="text-slate-300 mb-6">{step.content}</p>
                {step.quiz.map((q, qi) => {
                  const key = `${selectedTutorial.id}-${currentStep}-${qi}`;
                  const isSelected = quizAnswers[key] != null;
                  return (
                    <div key={qi} className="space-y-3">
                      <h4 className="font-semibold text-white">{q.question}</h4>
                      <div className="space-y-2">
                        {q.options.map((opt, oi) => {
                          const isCorrect = oi === q.correct;
                          const chosen = quizAnswers[key] === oi;
                          const showResult = isSelected;
                          return (
                            <Button
                              key={oi}
                              variant={chosen ? 'default' : 'outline'}
                              className={`w-full justify-start text-left p-4 h-auto ${showResult ? (isCorrect ? 'bg-green-600/20 border-green-500 text-green-100' : (chosen ? 'bg-red-600/20 border-red-500 text-red-100' : 'opacity-50')) : 'hover:bg-slate-800'}`}
                              onClick={() => !showResult && handleQuizAnswer(qi, oi)}
                              disabled={showResult}
                            >
                              <span className="mr-3">{String.fromCharCode(65 + oi)}.</span>
                              {opt}
                              {showResult && isCorrect && <CheckCircle className="ml-auto h-5 w-5 text-green-400" />}
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
              <Button variant="outline" onClick={() => setSelectedTutorial(null)} className="border-slate-600 text-slate-300 hover:bg-slate-800">
                Back to Tutorials
              </Button>
              <Button onClick={nextStep} className="bg-blue-600 hover:bg-blue-700 text-white">
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
        <h1 className="text-4xl font-bold text-white mb-4">🎓 CryptoSniper Academy</h1>
        <p className="text-xl text-slate-300 mb-6 font-medium">Master the art of crypto sniping with our comprehensive tutorials</p>

        <Card className="max-w-md mx-auto bg-slate-900/60 backdrop-blur-md border-slate-700/40">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600 rounded-full"><User className="h-6 w-6 text-white" /></div>
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

      {/* Tutorial Categories and Grid */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-slate-900/60 backdrop-blur-md">
          <TabsTrigger value="basics" className="flex items-center gap-2"><BookOpen className="h-4 w-4" /><span className="hidden sm:inline">Basics</span></TabsTrigger>
          <TabsTrigger value="strategy" className="flex items-center gap-2"><TrendingUp className="h-4 w-4" /><span className="hidden sm:inline">Strategy</span></TabsTrigger>
          <TabsTrigger value="technical" className="flex items-center gap-2"><Settings className="h-4 w-4" /><span className="hidden sm:inline">Technical</span></TabsTrigger>
          <TabsTrigger value="safety" className="flex items-center gap-2"><Shield className="h-4 w-4" /><span className="hidden sm:inline">Safety</span></TabsTrigger>
        </TabsList>

        {(['basics', 'strategy', 'technical', 'safety'] as const).map((category) => (
          <TabsContent key={category} value={category} className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getCategoryTutorials(category).map((t) => (
                <Card key={t.id} className={`bg-slate-900/60 backdrop-blur-md border-slate-700/40 hover:border-slate-600/60 transition-all duration-300 ${t.locked ? 'opacity-60' : 'hover:shadow-xl cursor-pointer'}`} onClick={() => startTutorial(t)}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {t.icon}
                        <div>
                          <CardTitle className="text-white text-lg">{t.title}</CardTitle>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className={getLevelColor(t.level)}>{t.level}</Badge>
                            <span className="text-slate-400 text-sm flex items-center gap-1"><Clock className="h-3 w-3" />{t.duration}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {userProgress.completedTutorials.includes(t.id) && <CheckCircle className="h-5 w-5 text-green-400" />}
                        {t.locked ? <Lock className="h-5 w-5 text-slate-500" /> : <Unlock className="h-5 w-5 text-blue-400" />}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="text-slate-300">
                    <p className="text-sm mb-4">{t.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

export default TutorialsPage;