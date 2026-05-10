import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Button, Card, ErrorBoundary } from './components/UI';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, BookOpen, MessageSquare, User, Trophy, BarChart2, History, LogOut, ChevronRight, ChevronLeft, Play, CheckCircle2, Wallet, Sparkles, BrainCircuit, Bot, Lock, CheckCircle, Check, HelpCircle, Zap, X, GraduationCap, Youtube, FileText, XCircle, AlertCircle, ArrowRight, Activity, PieChart as PieChartIcon, Building, Coins, Apple, Info, ArrowUp, ArrowDown } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line } from 'recharts';
import { auth, googleProvider, signInWithPopup, signOut, db, collection, addDoc, serverTimestamp, query, where, onSnapshot, updateDoc, doc, getDoc, setDoc, orderBy, handleFirestoreError, OperationType, deleteDoc, getDocs, increment } from './firebase';
import { useAuth } from './hooks/useAuth';
import { LESSONS, INITIAL_BALANCE, GAME_SCENARIOS, MOCK_PRICES } from './constants';
import { UserProfile, Trade, Lesson } from './types';
import { getTutorResponse, analyzeChart, getQuizExplanation } from './services/geminiService';
import Markdown from 'react-markdown';
import { cn } from './lib/utils';

// --- Views ---

const LandingView = ({ onDemo }: { onDemo: () => void }) => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);

    const handleLogin = async () => {
    if (isLoggingIn) return;

    setIsLoggingIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error('Login failed detail:', error);
      // Ignore common 'cancelled' or 'popup closed' errors
      if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
        if (error.message?.includes('api-key-not-valid')) {
           alert("The Firebase API key is missing or invalid. Please check your Firebase setup in the 'Settings' menu.");
        } else if (error.code === 'auth/unauthorized-domain') {
           alert("Unauthorized Domain: Please add this URL to your Firebase Authorized Domains in the console.");
        } else {
           alert(`Login failed: ${error.message}. If this is a domain error, add ${window.location.hostname} to authorized domains in Firebase Console.`);
        }
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center overflow-hidden relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 w-full max-w-md"
      >
        <div className="relative flex items-center justify-center mb-8">
          <motion.div
            animate={{ x: [-20, -10, -20], y: [0, -5, 0], rotate: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="text-8xl absolute -left-16 bottom-0 z-20 hidden md:block"
          >
            🐂
          </motion.div>
          <h1 className="text-8xl font-black tracking-tighter text-white italic relative z-10 bg-slate-950 px-4">INVESTO</h1>
          <motion.div
            animate={{ x: [20, 10, 20], y: [0, 5, 0], rotate: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 0.5 }}
            className="text-8xl absolute -right-16 bottom-0 z-20 hidden md:block"
          >
            🐻
          </motion.div>
        </div>
        
        <p className="text-slate-400 text-xl max-w-md mx-auto mb-12">
          Master the markets with gamified lessons and risk-free paper trading.
        </p>

        <AnimatePresence mode="wait">
          <motion.div
            key="login-buttons"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-4"
          >
            <Button onClick={handleLogin} className="w-full py-4 text-lg" disabled={isLoggingIn}>
              {isLoggingIn ? 'Connecting...' : 'Sign in with Google'}
            </Button>
            <Button onClick={onDemo} variant="secondary" className="w-full py-4 text-lg">
              Try Trading Arena
            </Button>
          </motion.div>
        </AnimatePresence>
        
        <p className="mt-8 text-slate-500 text-sm">
          Don't have an account? <span onClick={handleLogin} className="text-indigo-400 cursor-pointer hover:underline">Create one</span>
        </p>
      </motion.div>
    </div>
  );
};

const DashboardView = ({ user, onUpdateUser, onNavigate }: { user: UserProfile, onUpdateUser: (data: Partial<UserProfile>) => void, onNavigate: (tab: any) => void }) => {
  const [showReward, setShowReward] = useState(false);
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    if (user.uid === 'guest') {
      const localTrades = JSON.parse(localStorage.getItem('investo_guest_trades') || '[]');
      setRecentTrades(localTrades.slice(0, 3));
      return;
    }
    const q = query(collection(db, 'users', user.uid, 'trades'), where('uid', '==', user.uid), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      const allTrades = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Trade));
      setRecentTrades(allTrades.slice(0, 3));
    }, (e) => {
      handleFirestoreError(e, OperationType.GET, `users/${user.uid}/trades`);
    });
    return () => unsubscribe();
  }, [user.uid]);

  useEffect(() => {
    if (!user?.uid) return;
    
    const checkReward = () => {
      const lastClaimed = user.lastRewardClaimedAt ? new Date(user.lastRewardClaimedAt) : null;
      const now = new Date();
      
      const isNewDay = !lastClaimed || 
        lastClaimed.getDate() !== now.getDate() || 
        lastClaimed.getMonth() !== now.getMonth() || 
        lastClaimed.getFullYear() !== now.getFullYear();

      if (isNewDay) {
        setShowReward(true);
      }
    };
    checkReward();
  }, [user?.uid, user?.lastRewardClaimedAt]); 

  const claimReward = async () => {
    if (!user?.uid) return;
    try {
      const newXp = (user.xp || 0) + 50;
      const newStreak = (user.streak || 0) + 1;
      
      setShowReward(false);
      onUpdateUser({
        xp: newXp,
        lastRewardClaimedAt: new Date().toISOString(),
        streak: newStreak
      });
      
      setNotification("Claimed 50 XP Daily Reward!");
    } catch (e) {
      console.error("Failed to claim reward:", e);
      setNotification("Error claiming reward.");
      setShowReward(true);
    }
  };

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {showReward && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-6">
            <Card className="max-w-sm w-full text-center space-y-6 border-indigo-500 shadow-2xl shadow-indigo-500/20">
              <div className="text-6xl">🎁</div>
              <h3 className="text-2xl font-black text-white">Daily Reward!</h3>
              <p className="text-slate-400">You received 50 XP for signing in today.</p>
              <Button onClick={claimReward} className="w-full py-4">Claim Reward</Button>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {notification && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[150]">
            <div className="bg-indigo-600 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3">
              <CheckCircle2 size={20} />
              <span className="font-bold">{notification}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Welcome back, {user.displayName || 'Investor'}!</h2>
        </div>
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-4 py-2 rounded-2xl">
          <span className="text-orange-500 font-bold">🔥 {user.streak || 0}</span>
          <div className="w-px h-4 bg-slate-800" />
          <span className="text-indigo-400 font-bold">✨ {user.xp || 0} XP</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="flex flex-col justify-between">
          <div>
            <p className="text-slate-500 text-sm uppercase tracking-wider font-bold mb-1">Portfolio Balance</p>
            <h3 className="text-4xl font-black text-white">${user.balance.toLocaleString()}</h3>
          </div>
          <div className="mt-6 flex items-center gap-2 text-emerald-400">
            <TrendingUp size={20} />
            <span className="font-bold">+2.4% today</span>
          </div>
        </Card>

        <Card className="bg-indigo-600/10 border-indigo-500/30">
          <div className="flex items-start gap-4">
            <div className="text-4xl">{user.botType === 'bull' ? '🐂' : '🐻'}</div>
            <div>
              <h4 className="text-white font-bold mb-1">Investo Tutor</h4>
              <p className="text-indigo-200/70 text-sm italic mb-3">
                "The best time to plant a tree was 20 years ago. Ready for your next lesson?"
              </p>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="bg-indigo-600/20 text-indigo-300 border-indigo-500/30 hover:bg-indigo-600/40"
                  onClick={() => onNavigate('lessons')}
                >
                  Learn Fundamentals <ArrowRight size={14} className="ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-emerald-600/10 border-emerald-500/30 md:col-span-2">
          <div className="flex items-start gap-4">
            <div className="text-4xl">⚔️</div>
            <div>
              <h4 className="text-white font-bold mb-1">Practical Mastery Lab</h4>
              <p className="text-emerald-200/70 text-sm italic mb-3">
                "Applied knowledge is power. Test your mettle and master the charts."
              </p>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="bg-emerald-600/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-600/40"
                  onClick={() => onNavigate('simulator')}
                >
                  Practice Strategies <ArrowRight size={14} className="ml-2" />
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="bg-purple-600/20 text-purple-300 border-purple-500/30 hover:bg-purple-600/40"
                  onClick={() => onNavigate('arcade')}
                >
                  Trading Arcade <ArrowRight size={14} className="ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <History size={20} className="text-indigo-400" />
          Recent Activity
        </h3>
        <Card className="p-0 overflow-hidden">
          {recentTrades.length === 0 ? (
            <div className="p-4 text-center text-slate-500">
              No recent trades. Start your first trade in the simulator!
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {recentTrades.map(t => (
                <div key={t.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white">{t.symbol}</p>
                    <p className="text-xs text-slate-500 uppercase">{t.type} • {t.amount} units</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-white">${t.entryPrice}</p>
                    <p className="text-xs text-emerald-400">Active</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

const LessonsView = ({ user, onUpdateUser }: { user: UserProfile, onUpdateUser: (data: Partial<UserProfile>) => void }) => {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [shuffledQuiz, setShuffledQuiz] = useState<any[]>([]);
  const [currentSubTopicIndex, setCurrentSubTopicIndex] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const currentQuestion = shuffledQuiz?.[quizScore];
  const [showTutor, setShowTutor] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isWrong, setIsWrong] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<any | null>(null); // index, text, or array
  const [matchingPairs, setMatchingPairs] = useState<{left: string, right: string | null}[]>([]);
  const [availableMatches, setAvailableMatches] = useState<string[]>([]);
  const [activeVisualItem, setActiveVisualItem] = useState<number | null>(null);
  const [simStockPrice, setSimStockPrice] = useState(100);
  const [stockYears, setStockYears] = useState(10);
  const [bondYield, setBondYield] = useState(5);
  const [altVolatility, setAltVolatility] = useState(0);
  const [bidPrice, setBidPrice] = useState(100.00);
  const [askPrice, setAskPrice] = useState(100.05);
  const [longShortPos, setLongShortPos] = useState<'long' | 'short'>('long');
  const [marketSentiment, setMarketSentiment] = useState<'bull' | 'bear'>('bull');
  const [portfolioAssets, setPortfolioAssets] = useState<{name: string, value: number, color: string}[]>([
    { name: 'Stocks', value: 40, color: '#6366f1' },
    { name: 'Bonds', value: 30, color: '#10b981' },
    { name: 'Crypto', value: 10, color: '#f59e0b' },
    { name: 'Cash', value: 20, color: '#94a3b8' }
  ]);

  useEffect(() => {
    setActiveVisualItem(null);
  }, [currentSubTopicIndex, selectedLesson]);

  useEffect(() => {
    if (currentQuestion?.type === 'MQ' && matchingPairs.length === 0) {
      const initialPairs = currentQuestion.pairs.map((p: any) => ({ left: p.left, right: null }));
      const rights = currentQuestion.pairs.map((p: any) => p.right);
      // Shuffle rights
      for (let i = rights.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [rights[i], rights[j]] = [rights[j], rights[i]];
      }
      setMatchingPairs(initialPairs);
      setAvailableMatches(rights);
    }
  }, [currentQuestion, matchingPairs.length]);

  useEffect(() => {
    if (selectedLesson?.quiz) {
      let shuffled = selectedLesson.quiz.map(q => {
        if (q.type === 'MCQ' || q.type === 'TQ') {
          const optionsWithInitIdx = (q.options || []).map((opt, i) => ({ opt, originalIdx: i }));
          for (let i = optionsWithInitIdx.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [optionsWithInitIdx[i], optionsWithInitIdx[j]] = [optionsWithInitIdx[j], optionsWithInitIdx[i]];
          }
          
          let newCorrect: any;
          if (q.type === 'MCQ') {
            newCorrect = optionsWithInitIdx.findIndex(o => o.originalIdx === q.correctAnswer);
          } else {
            const correctIndices = q.correctAnswer as number[];
            newCorrect = optionsWithInitIdx
              .map((o, idx) => correctIndices.includes(o.originalIdx) ? idx : -1)
              .filter(idx => idx !== -1);
          }

          return {
            ...q,
            options: optionsWithInitIdx.map(o => o.opt),
            correctAnswer: newCorrect
          };
        }
        return q;
      });

      // Shuffle the questions themselves
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      setShuffledQuiz(shuffled);
    } else {
      setShuffledQuiz([]);
    }
  }, [selectedLesson]);

  const handleComplete = async (lesson: Lesson) => {
    if (user.completedLessons.includes(lesson.id)) {
      setSelectedLesson(null);
      return;
    }

    const newCompleted = [...user.completedLessons, lesson.id];
    try {
      if (user.uid === 'guest') {
        onUpdateUser({
          completedLessons: newCompleted,
          xp: user.xp + lesson.xpReward
        });
      } else {
        await updateDoc(doc(db, 'users', user.uid), {
          completedLessons: newCompleted,
          xp: user.xp + lesson.xpReward
        });
      }
      setSelectedLesson(null);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const handleQuizAnswer = async (answer: any) => {
    const currentQ = (shuffledQuiz && shuffledQuiz[quizScore]) || (selectedLesson?.quiz && selectedLesson.quiz[quizScore]);
    if (!currentQ || explanation) return;
    
    // Prevent multiple submissions for non-TQ types once an answer is chosen
    if (currentQ.type !== 'TQ' && selectedAnswer !== null) return;
    
    let reflectsCorrect = false;

    if (currentQ.type === 'MCQ') {
      reflectsCorrect = answer === currentQ.correctAnswer;
    } else if (currentQ.type === 'WQ') {
      const normalizedInput = answer.toLowerCase().trim();
      const normalizedCorrect = String(currentQ.correctAnswer).toLowerCase().split(',').map(s => s.trim());
      
      // Extract number from question like "Name 3 examples" or "What are the four types"
      const numberWords: Record<string, number> = {
        'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
        'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10
      };
      
      // Look for numbers followed by key terms (e.g., "3 types", "four indicators") 
      // or preceded by directives (e.g., "Name 3", "Give four")
      const patterns = [
        /(?:name|list|what are|give|state|identify|select|how many)\s+(?:at least\s+)?(\d+|one|two|three|four|five|six|seven|eight|nine|ten)/i,
        /(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s+(?:types|examples|items|classes|categories|indicators|pillars|factors|players|reasons)/i
      ];

      let requiredCount = 1;
      for (const pattern of patterns) {
        const match = currentQ.question.match(pattern);
        if (match) {
          const val = match[1].toLowerCase();
          const count = numberWords[val] || parseInt(val);
          if (count > requiredCount) requiredCount = count;
        }
      }

      // If a specific number was requested, we must find at least that many correct items in the input
      if (requiredCount > 1) {
        const foundCount = normalizedCorrect.filter(c => normalizedInput.includes(c)).length;
        reflectsCorrect = foundCount >= requiredCount;
      } else {
        reflectsCorrect = normalizedCorrect.some(c => normalizedInput.includes(c));
      }
    } else if (currentQ.type === 'TQ') {
      const sortedInput = [...answer].sort();
      const sortedCorrect = [...currentQ.correctAnswer].sort();
      reflectsCorrect = JSON.stringify(sortedInput) === JSON.stringify(sortedCorrect);
    } else if (currentQ.type === 'MQ') {
      reflectsCorrect = answer === true; // Handle match validation internally
    }

    setSelectedAnswer(answer);
    setIsWrong(!reflectsCorrect);

    // Get AI explanation
    let correctText = '';
    if (currentQ.type === 'MCQ') {
      correctText = currentQ.options[currentQ.correctAnswer];
    } else if (currentQ.type === 'WQ' || currentQ.type === 'TQ') {
      correctText = String(currentQ.correctAnswer);
    }
    
    const explain = await getQuizExplanation(
      currentQ.question, 
      String(answer), 
      reflectsCorrect, 
      correctText, 
      currentQ.explanation
    );
    setExplanation(explain);
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setExplanation(null);
    setIsWrong(false);
    if (quizScore < shuffledQuiz.length - 1) {
      setQuizScore(prev => prev + 1);
    } else {
      setQuizFinished(true);
    }
  };

  const sections = ['Assets', 'Terminology', 'Analysis'];

  return (
    <div className="space-y-12 relative pb-20">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black text-white italic">LEARNING PATH</h2>
        <div className="flex gap-2">
           <div className="px-3 py-1 bg-slate-800 rounded-full text-xs font-bold text-slate-400 border border-slate-700">
             {user.completedLessons.length} / {LESSONS.length} LESSONS
           </div>
        </div>
      </div>
      
      <div className="space-y-12">
        {sections.map(sectionName => {
          const sectionLessons = LESSONS.filter(l => l.section === sectionName);
          return (
            <div key={sectionName} className="space-y-4">
              <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-4">
                <span className="shrink-0">{sectionName}</span>
                <div className="h-px w-full bg-slate-800" />
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sectionLessons.map((lesson, index) => {
                  const globalIndex = LESSONS.findIndex(l => l.id === lesson.id);
                  const isCompleted = user.completedLessons.includes(lesson.id);
                  const isLocked = globalIndex > 0 && !user.completedLessons.includes(LESSONS[globalIndex - 1].id);

                  return (
                    <motion.div
                      key={lesson.id}
                      whileHover={!isLocked ? { y: -4, scale: 1.01 } : {}}
                      className={cn(
                        "relative group p-6 rounded-3xl border-2 transition-all cursor-pointer overflow-hidden",
                        isCompleted ? "bg-emerald-500/5 border-emerald-500/20" : 
                        !isLocked ? "bg-slate-900 border-slate-800 hover:border-indigo-500/50" : 
                        "bg-slate-950 border-slate-900 opacity-60 grayscale"
                      )}
                      onClick={() => !isLocked && setSelectedLesson(lesson)}
                    >
                      {isCompleted && (
                        <div className="absolute -top-6 -right-6 w-16 h-16 bg-emerald-500 rotate-45 flex items-end justify-center pb-1">
                          <Check size={16} className="text-white -rotate-45" />
                        </div>
                      )}
                      
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border shadow-lg",
                          isCompleted ? "bg-emerald-600 border-emerald-400" :
                          !isLocked ? "bg-indigo-600 border-indigo-400" : "bg-slate-800 border-slate-700"
                        )}>
                          {isCompleted ? <CheckCircle2 size={24} /> : !isLocked ? <Play fill="currentColor" size={20} /> : <Lock size={20} />}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                             <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{lesson.category}</span>
                             <span className="text-[10px] text-slate-500 font-bold">+{lesson.xpReward} XP</span>
                          </div>
                          <h4 className="text-lg font-bold text-white mb-1 group-hover:text-indigo-300 transition-colors">{lesson.title}</h4>
                          <p className="text-slate-400 text-sm line-clamp-2 leading-relaxed">{lesson.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedLesson && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4">
            <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto overflow-x-hidden relative p-0 border-0 bg-slate-900 shadow-2xl custom-scrollbar">
              {/* Header */}
              <div className="sticky top-0 z-20 bg-slate-900/80 backdrop-blur-md p-6 border-b border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                     <GraduationCap size={20} />
                   </div>
                   <div>
                     <h3 className="font-black text-white italic tracking-tight">{selectedLesson.title}</h3>
                     <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{selectedLesson.section} • {selectedLesson.category}</p>
                   </div>
                </div>
                <button 
                  onClick={() => {
                    setSelectedLesson(null);
                    setCurrentSubTopicIndex(0);
                    setShowQuiz(false);
                    setQuizScore(0);
                    setQuizFinished(false);
                    setSelectedAnswer(null);
                    setExplanation(null);
                    setIsWrong(false);
                    setMatchingPairs([]);
                  }} 
                  className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-8">
                {!showQuiz ? (
                  <div className="space-y-12">
                    {/* Visual Progress Ribbon */}
                    <div className="flex gap-2">
                       {selectedLesson.subTopics.map((_, i) => (
                         <div key={i} className={cn("h-1.5 flex-1 rounded-full transition-all duration-500", i <= currentSubTopicIndex ? "bg-indigo-500" : "bg-slate-800")} />
                       ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
                      <div className="space-y-8">
                         <AnimatePresence mode="wait">
                           <motion.div
                             key={currentSubTopicIndex}
                             initial={{ opacity: 0, x: 20 }}
                             animate={{ opacity: 1, x: 0 }}
                             exit={{ opacity: 0, x: -20 }}
                             className="space-y-6"
                           >
                             <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 rounded-full border border-indigo-500/20">
                               <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">STEP {currentSubTopicIndex + 1}</span>
                             </div>
                             <h4 className="text-3xl font-black text-white italic leading-tight">{selectedLesson.subTopics[currentSubTopicIndex].title}</h4>
                             
                             <div className="markdown-body prose prose-invert max-w-none text-slate-300 leading-relaxed text-lg">
                               <Markdown>{selectedLesson.subTopics[currentSubTopicIndex].content}</Markdown>
                             </div>

                             {/* Visual Representation */}
                             {selectedLesson.subTopics[currentSubTopicIndex].visualData && (
                               <div className="p-10 rounded-[40px] bg-slate-800/30 border border-slate-700/50 flex items-center justify-center min-h-[350px] relative overflow-hidden group">
                                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />
                                  
                                  {selectedLesson.subTopics[currentSubTopicIndex].visualData.type === 'icon-group' && (
                                    <div className="flex flex-col items-center gap-10 relative z-10 w-full">
                                       <div className="flex flex-wrap justify-center gap-8 md:gap-12">
                                          {selectedLesson.subTopics[currentSubTopicIndex].visualData.items.map((item: any, i: number) => {
                                            const IconComponent = {
                                              'Building': Building,
                                              'Wallet': Wallet,
                                              'Coins': Coins,
                                              'Apple': Apple,
                                              'TrendingUp': TrendingUp,
                                              'ShieldCheck': CheckCircle2,
                                              'Lock': Lock,
                                              'Zap': Zap
                                            }[item.icon] || Activity;

                                            return (
                                              <motion.div 
                                                key={i}
                                                initial={{ scale: 0, y: 20 }}
                                                animate={{ scale: 1, y: 0 }}
                                                transition={{ delay: i * 0.15, type: 'spring', damping: 12 }}
                                                className="flex flex-col items-center gap-4"
                                              >
                                                <button 
                                                  onClick={() => setActiveVisualItem(activeVisualItem === i ? null : i)}
                                                  className={cn(
                                                    "w-28 h-28 md:w-32 md:h-32 rounded-[32px] border-2 flex items-center justify-center transition-all shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative group/icon",
                                                    activeVisualItem === i ? "bg-indigo-600 border-indigo-400 scale-110" : "bg-slate-900 border-slate-700/50 hover:border-indigo-500/50"
                                                  )}
                                                >
                                                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover/icon:opacity-100 transition-opacity rounded-[32px]" />
                                                  <IconComponent size={40} className={cn("transition-transform", activeVisualItem === i ? "text-white" : "text-indigo-400 group-hover/icon:scale-110")} />
                                                  
                                                  <div className={cn(
                                                    "absolute -bottom-3 -right-3 w-10 h-10 rounded-2xl flex items-center justify-center shadow-xl transition-all",
                                                    activeVisualItem === i ? "bg-white text-indigo-600 rotate-0 scale-110" : "bg-indigo-600 text-white rotate-12"
                                                  )}>
                                                    {activeVisualItem === i ? <Check size={18} /> : <Sparkles size={18} />}
                                                  </div>
                                                </button>
                                                <span className={cn("text-[10px] font-black uppercase tracking-[0.2em] transition-colors", activeVisualItem === i ? "text-indigo-400" : "text-slate-500")}>
                                                  {item.label}
                                                </span>
                                              </motion.div>
                                            );
                                          })}
                                       </div>

                                       <AnimatePresence>
                                         {activeVisualItem !== null && (
                                           <motion.div
                                             initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                             animate={{ opacity: 1, y: 0, scale: 1 }}
                                             exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                             className="w-full max-w-lg p-6 rounded-3xl bg-indigo-600 shadow-2xl shadow-indigo-600/20 border border-indigo-400/50 relative overflow-hidden"
                                           >
                                              <div className="absolute -top-10 -right-10 opacity-20 rotate-12">
                                                <Bot size={120} />
                                              </div>
                                              <div className="relative z-10">
                                                <h5 className="text-xl font-black text-white italic mb-2 flex items-center gap-2">
                                                  <Info size={20} />
                                                  {selectedLesson.subTopics[currentSubTopicIndex].visualData.items[activeVisualItem].label}
                                                </h5>
                                                <p className="text-indigo-100 font-medium leading-relaxed">
                                                  {selectedLesson.subTopics[currentSubTopicIndex].visualData.items[activeVisualItem].info}
                                                </p>
                                              </div>
                                           </motion.div>
                                         )}
                                       </AnimatePresence>
                                    </div>
                                  )}
                                  
                                  {selectedLesson.subTopics[currentSubTopicIndex].visualData.type === 'pie-chart' && (
                                    <div className="w-full h-[250px] flex flex-col items-center">
                                      <ResponsiveContainer width={200} height={200}>
                                        <PieChart>
                                          <Pie
                                            data={selectedLesson.subTopics[currentSubTopicIndex].visualData.data}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                          >
                                            {selectedLesson.subTopics[currentSubTopicIndex].visualData.data.map((_: any, index: number) => (
                                              <Cell key={`cell-${index}`} fill={index === 0 ? '#6366f1' : '#1e293b'} />
                                            ))}
                                          </Pie>
                                        </PieChart>
                                      </ResponsiveContainer>
                                      <div className="flex gap-4 mt-4">
                                         {selectedLesson.subTopics[currentSubTopicIndex].visualData.data.map((d: any, i: number) => (
                                           <div key={i} className="flex items-center gap-2">
                                             <div className="w-3 h-3 rounded-full" style={{ backgroundColor: i === 0 ? '#6366f1' : '#1e293b' }} />
                                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{d.name} ({d.value}%)</span>
                                           </div>
                                         ))}
                                      </div>
                                    </div>
                                  )}

                                  {selectedLesson.subTopics[currentSubTopicIndex].visualData.type === 'bar-chart' && (
                                    <div className="w-full space-y-4">
                                      {selectedLesson.subTopics[currentSubTopicIndex].visualData.label && (
                                        <p className="text-[10px] text-center text-slate-500 font-black uppercase tracking-[0.2em]">
                                          {selectedLesson.subTopics[currentSubTopicIndex].visualData.label}
                                        </p>
                                      )}
                                      <div className="h-[220px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                          <BarChart data={selectedLesson.subTopics[currentSubTopicIndex].visualData.data}>
                                            <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                                            <Tooltip 
                                              contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px' }}
                                              itemStyle={{ color: '#fff', fontSize: '12px' }}
                                            />
                                            <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} />
                                          </BarChart>
                                        </ResponsiveContainer>
                                      </div>
                                    </div>
                                  )}

                                  {selectedLesson.subTopics[currentSubTopicIndex].visualData.type === 'chart-line' && (
                                    <div className="w-full h-[250px]">
                                      <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={[
                                          { p: 125 }, { p: 110 }, { p: 102 }, { p: 115 }, { p: 130 }, { p: 145 }, 
                                          { p: 148 }, { p: 135 }, { p: 142 }, { p: 149 }, { p: 130 }, { p: 110 },
                                          { p: 103 }, { p: 115 }, { p: 125 }
                                        ]}>
                                          <Line type="monotone" dataKey="p" stroke="#6366f1" strokeWidth={4} dot={false} />
                                          {/* Resistance Line (150) */}
                                          <Line type="monotone" dataKey={() => 150} stroke="#ef4444" strokeDasharray="5 5" dot={false} strokeOpacity={0.8} />
                                          {/* Support Line (100) */}
                                          <Line type="monotone" dataKey={() => 100} stroke="#10b981" strokeDasharray="5 5" dot={false} strokeOpacity={0.8} />
                                        </LineChart>
                                      </ResponsiveContainer>
                                      <div className="flex justify-between px-2 mt-2">
                                        <div className="flex items-center gap-1.5">
                                          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                          <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Support (Floor)</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                          <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">Resistance (Ceiling)</span>
                                          <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                                        </div>
                                      </div>
                                      <div className="text-center text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">ILLUSTRATIVE CHART ACTION</div>
                                    </div>
                                  )}

                                  {selectedLesson.subTopics[currentSubTopicIndex].visualData.type === 'crossover' && (
                                    <div className="w-full space-y-6">
                                      <div className="flex justify-center gap-2">
                                        <button 
                                          onClick={() => setMarketSentiment('bull')}
                                          className={cn(
                                            "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                            marketSentiment === 'bull' ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" : "bg-slate-900 text-slate-500 hover:bg-slate-800"
                                          )}
                                        >
                                          Golden Cross
                                        </button>
                                        <button 
                                          onClick={() => setMarketSentiment('bear')}
                                          className={cn(
                                            "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                            marketSentiment === 'bear' ? "bg-rose-600 text-white shadow-lg shadow-rose-600/20" : "bg-slate-900 text-slate-500 hover:bg-slate-800"
                                          )}
                                        >
                                          Death Cross
                                        </button>
                                      </div>

                                      <div className="h-[220px] bg-slate-950/50 rounded-3xl p-4 border border-slate-800 relative group overflow-hidden">
                                        <ResponsiveContainer width="100%" height="100%">
                                          <LineChart data={marketSentiment === 'bull' ? [
                                            { name: '1', fast: 100, slow: 140 },
                                            { name: '2', fast: 110, slow: 135 },
                                            { name: '3', fast: 130, slow: 130 },
                                            { name: '4', fast: 160, slow: 125 },
                                            { name: '5', fast: 180, slow: 120 }
                                          ] : [
                                            { name: '1', fast: 180, slow: 130 },
                                            { name: '2', fast: 160, slow: 135 },
                                            { name: '3', fast: 130, slow: 140 },
                                            { name: '4', fast: 100, slow: 145 },
                                            { name: '5', fast: 80, slow: 150 }
                                          ]}>
                                            <Line 
                                              type="monotone" 
                                              dataKey="fast" 
                                              stroke={marketSentiment === 'bull' ? "#10b981" : "#ef4444"} 
                                              strokeWidth={4} 
                                              dot={false} 
                                              animationDuration={1000}
                                            />
                                            <Line 
                                              type="monotone" 
                                              dataKey="slow" 
                                              stroke="#6366f1" 
                                              strokeWidth={4} 
                                              dot={false} 
                                              strokeOpacity={0.4}
                                            />
                                          </LineChart>
                                        </ResponsiveContainer>
                                        
                                        <div className="absolute top-6 left-6 flex flex-col gap-1">
                                          <div className="flex items-center gap-2">
                                            <div className="w-3 h-1 rounded-full bg-indigo-500/40" />
                                            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">200-Day (Slow)</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <div className={cn("w-3 h-1 rounded-full", marketSentiment === 'bull' ? "bg-emerald-500" : "bg-rose-500")} />
                                            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">50-Day (Fast)</span>
                                          </div>
                                        </div>

                                        <motion.div 
                                          key={marketSentiment}
                                          initial={{ opacity: 0, scale: 0.8 }}
                                          animate={{ opacity: 1, scale: 1 }}
                                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                                        >
                                          <div className={cn(
                                            "px-4 py-2 rounded-2xl border backdrop-blur-md shadow-2xl flex items-center gap-2",
                                            marketSentiment === 'bull' ? "bg-emerald-500/10 border-emerald-500/20" : "bg-rose-500/10 border-rose-500/20"
                                          )}>
                                            <div className={cn("w-2 h-2 rounded-full animate-pulse", marketSentiment === 'bull' ? "bg-emerald-500" : "bg-rose-500")} />
                                            <span className={cn("text-[10px] font-black uppercase tracking-widest", marketSentiment === 'bull' ? "text-emerald-400" : "text-rose-400")}>
                                              {marketSentiment === 'bull' ? 'Golden Cross!' : 'Death Cross!'}
                                            </span>
                                          </div>
                                        </motion.div>
                                      </div>
                                      
                                      <p className="text-[9px] text-center text-slate-500 font-bold uppercase tracking-[0.2em]">
                                        {marketSentiment === 'bull' ? 'Signals an UPWARD trend reversal' : 'Signals a DOWNWARD trend reversal'}
                                      </p>
                                    </div>
                                  )}

                                  {selectedLesson.subTopics[currentSubTopicIndex].visualData.type === 'derivative-sim' && (
                                    <div className="w-full space-y-6 relative z-10">
                                      <div className="flex flex-col items-center gap-2">
                                        <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Interactive Call Option Simulator</div>
                                        <div className="flex items-center gap-4">
                                          <div className="text-center">
                                            <p className="text-xs text-slate-500 uppercase font-bold">Strike Price</p>
                                            <p className="text-lg font-black text-white">$100</p>
                                          </div>
                                          <div className="w-px h-8 bg-slate-800" />
                                          <div className="text-center">
                                            <p className="text-xs text-slate-500 uppercase font-bold">Current Stock Price</p>
                                            <p className="text-xl font-black text-indigo-400">${simStockPrice}</p>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="relative h-32 w-full flex items-end gap-2 bg-slate-950/50 rounded-2xl p-4 border border-slate-800/50">
                                        {Array.from({ length: 21 }).map((_, i) => {
                                          const price = 80 + i * 2;
                                          const strike = 100;
                                          const profit = Math.max(0, price - strike);
                                          const height = (profit / 40) * 100;
                                          const isCurrent = Math.abs(simStockPrice - price) < 1;

                                          return (
                                            <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1 h-full">
                                              <motion.div 
                                                animate={{ height: `${height}%`, opacity: isCurrent ? 1 : 0.4 }}
                                                className={cn(
                                                  "w-full rounded-t-sm transition-colors",
                                                  profit > 0 ? "bg-emerald-500" : "bg-slate-800",
                                                  isCurrent && "bg-indigo-500 ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-900 shadow-[0_0_20px_rgba(99,102,241,0.5)]"
                                                )}
                                              />
                                            </div>
                                          );
                                        })}
                                        <div className="absolute left-1/2 bottom-0 w-px h-full bg-slate-700/50 border-dashed border-l" />
                                      </div>

                                      <div className="space-y-4">
                                        <input 
                                          type="range" 
                                          min="80" 
                                          max="120" 
                                          value={simStockPrice}
                                          onChange={(e) => setSimStockPrice(parseInt(e.target.value))}
                                          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                        />
                                        <div className="flex justify-between text-[10px] font-bold text-slate-500">
                                          <span>STOCK PRICE DROPS</span>
                                          <span>STOCK PRICE RISES</span>
                                        </div>
                                      </div>

                                      <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-center text-balance">
                                        <p className="text-xs text-indigo-200">
                                          {simStockPrice <= 100 
                                            ? "The option is 'Out of the Money'. It currently has no intrinsic value." 
                                            : `The option is 'In the Money'! You can buy at $100 and value it at $${simStockPrice}.`}
                                        </p>
                                      </div>
                                    </div>
                                  )}

                                  {selectedLesson.subTopics[currentSubTopicIndex].visualData.type === 'stock-sim' && (
                                    <div className="w-full space-y-6 relative z-10">
                                      <div className="text-center">
                                        <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Compound Growth Simulator</div>
                                        <p className="text-2xl font-black text-white">$10,000 Investment</p>
                                      </div>

                                      <div className="flex gap-2 h-40 items-end">
                                        {Array.from({ length: 21 }).map((_, i) => {
                                          const year = i;
                                          const value = 10000 * Math.pow(1.08, year);
                                          const height = (value / 50000) * 100;
                                          const isTarget = year === stockYears;

                                          return (
                                            <div key={i} className="flex-1 flex flex-col items-center justify-end h-full gap-1">
                                              <motion.div 
                                                animate={{ height: `${height}%`, opacity: isTarget ? 1 : 0.3 }}
                                                className={cn(
                                                  "w-full bg-indigo-500 rounded-t-sm transition-all",
                                                  isTarget && "bg-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.4)]"
                                                )}
                                              />
                                            </div>
                                          );
                                        })}
                                      </div>

                                      <div className="space-y-4">
                                        <input 
                                          type="range" 
                                          min="0" 
                                          max="20" 
                                          value={stockYears}
                                          onChange={(e) => setStockYears(parseInt(e.target.value))}
                                          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                        />
                                        <div className="flex justify-between text-[11px] font-black text-slate-500 uppercase tracking-tighter">
                                          <span>Start (Year 0)</span>
                                          <span>Year {stockYears}</span>
                                          <span>20 Years</span>
                                        </div>
                                      </div>

                                      <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-center">
                                        <p className="text-sm font-bold text-white mb-1">Estimated Value: ${(10000 * Math.pow(1.08, stockYears)).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                                        <p className="text-[10px] text-indigo-300/60 font-medium italic">Assuming 8% annual growth compounded yearly.</p>
                                      </div>
                                    </div>
                                  )}

                                  {selectedLesson.subTopics[currentSubTopicIndex].visualData.type === 'bond-sim' && (
                                    <div className="w-full space-y-6 relative z-10">
                                      <div className="text-center">
                                        <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Bond Value vs. Market Yield</div>
                                        <p className="text-xs text-slate-400 font-bold uppercase">Relationship: Inverse</p>
                                      </div>

                                      <div className="flex items-center justify-center gap-12 h-32">
                                        <div className="flex flex-col items-center gap-2">
                                          <div className="text-[10px] text-slate-500 font-black uppercase">Market Yield</div>
                                          <motion.div 
                                            animate={{ y: bondYield > 5 ? -10 : (bondYield < 5 ? 10 : 0) }}
                                            className="text-4xl font-black text-indigo-400"
                                          >
                                            {bondYield}%
                                          </motion.div>
                                          {bondYield > 5 ? <ArrowUp className="text-indigo-400" size={16} /> : (bondYield < 5 ? <ArrowDown className="text-indigo-400" size={16} /> : null)}
                                        </div>

                                        <div className="w-px h-16 bg-slate-800" />

                                        <div className="flex flex-col items-center gap-2">
                                          <div className="text-[10px] text-slate-500 font-black uppercase">Bond Price</div>
                                          <motion.div 
                                            animate={{ 
                                              y: bondYield > 5 ? 10 : (bondYield < 5 ? -10 : 0),
                                              color: bondYield > 5 ? "#ef4444" : (bondYield < 5 ? "#10b981" : "#ffffff")
                                            }}
                                            className="text-4xl font-black text-white"
                                          >
                                            ${(100 * (1 / (1 + (bondYield - 5)/100))).toFixed(1)}
                                          </motion.div>
                                          {bondYield > 5 ? <ArrowDown className="text-rose-500" size={16} /> : (bondYield < 5 ? <ArrowUp className="text-emerald-500" size={16} /> : null)}
                                        </div>
                                      </div>

                                      <div className="space-y-4">
                                        <input 
                                          type="range" 
                                          min="1" 
                                          max="10" 
                                          step="0.1"
                                          value={bondYield}
                                          onChange={(e) => setBondYield(parseFloat(e.target.value))}
                                          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                        />
                                        <div className="flex justify-between text-[11px] font-black text-slate-500 uppercase tracking-tighter">
                                          <span>Rates Falling</span>
                                          <span>Current: {bondYield}%</span>
                                          <span>Rates Rising</span>
                                        </div>
                                      </div>

                                      <div className="p-4 rounded-2xl bg-indigo-500/5 border border-slate-800 text-center">
                                        <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                                          When market interest rates (yields) rise, new bonds pay more, so older bonds with lower rates become less valuable. This is the **Inverse Relationship**.
                                        </p>
                                      </div>
                                    </div>
                                  )}

                                  {selectedLesson.subTopics[currentSubTopicIndex].visualData.type === 'alt-sim' && (
                                    <div className="w-full space-y-6 relative z-10">
                                      <div className="text-center">
                                        <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Alternative Asset Volatility</div>
                                        <p className="text-2xl font-black text-white">Bitcoin Volatility Sim</p>
                                      </div>

                                      <div className="h-40 bg-slate-950 rounded-2xl border border-slate-800 p-4 relative overflow-hidden">
                                        <ResponsiveContainer width="100%" height="100%">
                                          <LineChart data={Array.from({ length: 30 }).map((_, i) => ({ 
                                            time: i, 
                                            price: 10 * Math.sin(i * 0.5 + altVolatility) + (Math.random() * 5 * altVolatility) 
                                          }))}>
                                            <Line 
                                              type="monotone" 
                                              dataKey="price" 
                                              stroke="#6366f1" 
                                              strokeWidth={3} 
                                              dot={false} 
                                              isAnimationActive={false}
                                            />
                                          </LineChart>
                                        </ResponsiveContainer>
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent pointer-events-none" />
                                      </div>

                                      <div className="space-y-4">
                                        <Button 
                                          onClick={() => setAltVolatility(prev => prev + 1)}
                                          className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-600/20"
                                        >
                                          Simulate Volatility
                                        </Button>
                                        <p className="text-[10px] text-slate-500 text-center font-bold uppercase tracking-widest">
                                          Alternatives like Crypto are known for extreme price swings.
                                        </p>
                                      </div>
                                    </div>
                                  )}

                                  {selectedLesson.subTopics[currentSubTopicIndex].visualData.type === 'bid-ask-sim' && (
                                    <div className="w-full space-y-8 relative z-10">
                                      <div className="text-center">
                                        <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Bid-Ask Order Book Sim</div>
                                        <div className="flex items-center justify-center gap-4">
                                          <div className="px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
                                            <p className="text-[10px] text-rose-500 font-bold uppercase">Best Bid</p>
                                            <p className="text-2xl font-black text-white">${bidPrice.toFixed(2)}</p>
                                          </div>
                                          <div className="flex flex-col items-center">
                                            <div className="text-[10px] text-slate-500 font-black uppercase mb-1">Spread</div>
                                            <div className="px-3 py-1 bg-slate-800 rounded-full text-xs font-black text-indigo-400">
                                              ${(askPrice - bidPrice).toFixed(2)}
                                            </div>
                                          </div>
                                          <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                                            <p className="text-[10px] text-emerald-500 font-bold uppercase">Best Ask</p>
                                            <p className="text-2xl font-black text-white">${askPrice.toFixed(2)}</p>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="relative h-48 w-full bg-slate-950 rounded-3xl p-6 border border-slate-800 overflow-hidden">
                                        {/* Visualizing the "Gap" */}
                                        <div className="absolute inset-0 flex">
                                          {/* Bid Side */}
                                          <div className="h-full flex-1 bg-rose-500/5 flex flex-col items-end justify-center pr-4 gap-2 border-r border-slate-800/50">
                                            {[...Array(5)].map((_, i) => (
                                              <motion.div 
                                                key={`bid-${i}`}
                                                initial={{ x: -20, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 - i * 0.15 }}
                                                className="h-4 bg-rose-500/20 rounded-l-full"
                                                style={{ width: `${80 - i * 15}%` }}
                                              />
                                            ))}
                                            <div className="text-[10px] font-black text-rose-500/50 uppercase">Buy Orders (Bid)</div>
                                          </div>
                                          
                                          {/* Ask Side */}
                                          <div className="h-full flex-1 bg-emerald-500/5 flex flex-col items-start justify-center pl-4 gap-2">
                                            {[...Array(5)].map((_, i) => (
                                              <motion.div 
                                                key={`ask-${i}`}
                                                initial={{ x: 20, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 - i * 0.15 }}
                                                className="h-4 bg-emerald-500/20 rounded-r-full"
                                                style={{ width: `${80 - i * 15}%` }}
                                              />
                                            ))}
                                            <div className="text-[10px] font-black text-emerald-500/50 uppercase">Sell Orders (Ask)</div>
                                          </div>
                                        </div>
                                        
                                        {/* The "Price" labels floating on top */}
                                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center pointer-events-none">
                                          <motion.div 
                                            animate={{ scale: [1, 1.05, 1] }}
                                            transition={{ repeat: Infinity, duration: 2 }}
                                            className="h-24 w-1 bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,1)] rounded-full relative"
                                          >
                                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-black text-indigo-400 whitespace-nowrap bg-slate-900 px-2 py-0.5 rounded border border-indigo-500/30">MARKET PRICE</div>
                                          </motion.div>
                                        </div>
                                      </div>

                                      <div className="space-y-6">
                                        <div className="space-y-2">
                                          <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase">
                                            <span>Adjust Spread</span>
                                            <span className="text-indigo-400">${(askPrice - bidPrice).toFixed(2)} Spread</span>
                                          </div>
                                          <input 
                                            type="range" 
                                            min="100.01" 
                                            max="102.00" 
                                            step="0.01"
                                            value={askPrice}
                                            onChange={(e) => setAskPrice(parseFloat(e.target.value))}
                                            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                          />
                                        </div>
                                        
                                        <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                                          <p className="text-xs text-indigo-200 text-center leading-relaxed font-medium">
                                            A **narrower spread** means higher liquidity (easier to trade). A **wider spread** means lower liquidity and higher transaction costs for traders.
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {selectedLesson.subTopics[currentSubTopicIndex].visualData.type === 'long-short-sim' && (
                                    <div className="w-full space-y-8 relative z-10">
                                      <div className="text-center">
                                        <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Position Direction Simulator</div>
                                        <div className="flex bg-slate-900 rounded-2xl p-1 gap-1 border border-slate-800">
                                          <button 
                                            onClick={() => setLongShortPos('long')}
                                            className={cn("flex-1 py-3 px-6 rounded-xl text-xs font-black uppercase tracking-widest transition-all", longShortPos === 'long' ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "text-slate-500 hover:text-slate-300")}
                                          >
                                            Go Long
                                          </button>
                                          <button 
                                            onClick={() => setLongShortPos('short')}
                                            className={cn("flex-1 py-3 px-6 rounded-xl text-xs font-black uppercase tracking-widest transition-all", longShortPos === 'short' ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" : "text-slate-500 hover:text-slate-300")}
                                          >
                                            Go Short
                                          </button>
                                        </div>
                                      </div>

                                      <div className="h-48 relative flex items-center justify-center">
                                        <div className="absolute w-full h-px bg-slate-800 top-1/2 -translate-y-1/2" />
                                        <AnimatePresence mode="wait">
                                          {longShortPos === 'long' ? (
                                            <motion.div 
                                              key="long"
                                              initial={{ y: 20, opacity: 0 }}
                                              animate={{ y: -40, opacity: 1 }}
                                              exit={{ y: -60, opacity: 0 }}
                                              className="flex flex-col items-center gap-4 text-emerald-400"
                                            >
                                              <ArrowUp size={48} className="drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                                              <div className="text-center">
                                                <p className="text-lg font-black uppercase">Profit if UP</p>
                                                <p className="text-[10px] font-bold text-slate-400">Loss if DOWN</p>
                                              </div>
                                            </motion.div>
                                          ) : (
                                            <motion.div 
                                              key="short"
                                              initial={{ y: -20, opacity: 0 }}
                                              animate={{ y: 40, opacity: 1 }}
                                              exit={{ y: 60, opacity: 0 }}
                                              className="flex flex-col items-center gap-4 text-rose-400"
                                            >
                                              <ArrowDown size={48} className="drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
                                              <div className="text-center">
                                                <p className="text-lg font-black uppercase">Profit if DOWN</p>
                                                <p className="text-[10px] font-bold text-slate-400">Loss if UP</p>
                                              </div>
                                            </motion.div>
                                          )}
                                        </AnimatePresence>
                                      </div>

                                      <div className="p-4 rounded-2xl bg-indigo-500/5 border border-slate-800 text-center">
                                        <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                                          {longShortPos === 'long' 
                                            ? "Buying low and selling high. You want the price to go to the moon!" 
                                            : "Borrowing an asset to sell it now, hoping to buy it back cheaper later. You profit from fear."}
                                        </p>
                                      </div>
                                    </div>
                                  )}

                                  {selectedLesson.subTopics[currentSubTopicIndex].visualData.type === 'retail-inst-sim' && (
                                    <div className="w-full space-y-8">
                                      <div className="text-center">
                                        <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Scale of Participation</div>
                                        <p className="text-xs text-slate-400 font-bold uppercase">Retail vs Institutional</p>
                                      </div>

                                      <div className="flex h-56 gap-8">
                                        <div className="flex-1 flex flex-col items-center justify-end gap-4 p-6 bg-slate-900/50 rounded-3xl border border-slate-800/50 relative overflow-hidden group">
                                          <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500/20" />
                                          <motion.div 
                                            animate={{ scale: [1, 1.1, 1] }}
                                            transition={{ repeat: Infinity, duration: 3 }}
                                            className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/20"
                                          >
                                            <User size={24} />
                                          </motion.div>
                                          <div className="text-center">
                                            <p className="text-sm font-black text-white uppercase mb-1">Retail</p>
                                            <div className="w-16 h-1 bg-slate-800 rounded-full mx-auto overflow-hidden">
                                              <div className="w-1/4 h-full bg-indigo-500" />
                                            </div>
                                            <p className="text-[8px] mt-2 font-bold text-slate-500">INDIVIDUAL APPS</p>
                                          </div>
                                        </div>

                                        <div className="flex-1 flex flex-col items-center justify-end gap-4 p-6 bg-indigo-500/5 rounded-3xl border border-indigo-500/20 relative overflow-hidden group">
                                          <div className="absolute top-0 left-0 w-full h-1 bg-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                                          <div className="flex flex-wrap gap-1 justify-center max-w-[100px]">
                                            {[...Array(9)].map((_, i) => (
                                              <motion.div 
                                                key={i}
                                                animate={{ opacity: [0.3, 1, 0.3], scale: [0.9, 1, 0.9] }}
                                                transition={{ repeat: Infinity, duration: 2, delay: i * 0.1 }}
                                                className="w-5 h-5 bg-indigo-500/30 rounded-md border border-indigo-400/30"
                                              />
                                            ))}
                                          </div>
                                          <div className="text-center">
                                            <p className="text-sm font-black text-indigo-400 uppercase mb-1">Institutions</p>
                                            <div className="w-16 h-1 bg-slate-800 rounded-full mx-auto overflow-hidden">
                                              <div className="w-full h-full bg-indigo-400" />
                                            </div>
                                            <p className="text-[8px] mt-2 font-bold text-indigo-400">BANKS & HEDGE FUNDS</p>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-center">
                                        <p className="text-[10px] text-indigo-200 leading-relaxed font-medium">
                                          Institutions use high-frequency algorithms and manage billions, while retail investors trade for personal wealth using standard brokerage apps.
                                        </p>
                                      </div>
                                    </div>
                                  )}

                                  {selectedLesson.subTopics[currentSubTopicIndex].visualData.type === 'sentiment-sim' && (
                                    <div className="w-full space-y-8">
                                      <div className="text-center">
                                        <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">
                                          {selectedLesson.subTopics[currentSubTopicIndex].visualData.label || 'Market Sentiment Simulator'}
                                        </div>
                                        <div className="flex bg-slate-900 rounded-full p-1 gap-1 border border-slate-800 max-w-[200px] mx-auto">
                                          <button 
                                            onClick={() => setMarketSentiment('bull')}
                                            className={cn("flex-1 py-2 px-4 rounded-full text-[10px] font-black uppercase transition-all", marketSentiment === 'bull' ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "text-slate-500 hover:text-slate-300")}
                                          >
                                            {selectedLesson.subTopics[currentSubTopicIndex].visualData.labels?.[0] || 'Bullish'}
                                          </button>
                                          <button 
                                            onClick={() => setMarketSentiment('bear')}
                                            className={cn("flex-1 py-2 px-4 rounded-full text-[10px] font-black uppercase transition-all", marketSentiment === 'bear' ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20" : "text-slate-500 hover:text-slate-300")}
                                          >
                                            {selectedLesson.subTopics[currentSubTopicIndex].visualData.labels?.[1] || 'Bearish'}
                                          </button>
                                        </div>
                                      </div>

                                      <div className="h-48 relative flex items-center justify-center overflow-hidden rounded-[32px] bg-slate-950 border border-slate-800">
                                         <AnimatePresence mode="wait">
                                           {marketSentiment === 'bull' ? (
                                             <motion.div 
                                               key="bull"
                                               initial={{ scale: 0.8, opacity: 0 }}
                                               animate={{ scale: 1, opacity: 1 }}
                                               exit={{ scale: 1.2, opacity: 0 }}
                                               className="flex flex-col items-center gap-4"
                                             >
                                                <div className="relative">
                                                  <TrendingUp size={64} className="text-emerald-400 relative z-10" />
                                                  <motion.div 
                                                    animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.5, 0.2] }}
                                                    transition={{ repeat: Infinity, duration: 2 }}
                                                    className="absolute inset-0 bg-emerald-500 rounded-full blur-3xl -z-10"
                                                  />
                                                </div>
                                                <p className="text-xl font-black text-emerald-400 tracking-tighter uppercase italic">
                                                  {selectedLesson.subTopics[currentSubTopicIndex].visualData.statuses?.[0] || 'Charging UP'}
                                                </p>
                                             </motion.div>
                                           ) : (
                                             <motion.div 
                                               key="bear"
                                               initial={{ scale: 1.2, opacity: 0 }}
                                               animate={{ scale: 1, opacity: 1 }}
                                               exit={{ scale: 0.8, opacity: 0 }}
                                               className="flex flex-col items-center gap-4"
                                             >
                                                <div className="relative">
                                                  <TrendingDown size={64} className="text-rose-400 relative z-10" />
                                                  <motion.div 
                                                    animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.5, 0.2] }}
                                                    transition={{ repeat: Infinity, duration: 2 }}
                                                    className="absolute inset-0 bg-rose-500 rounded-full blur-3xl -z-10"
                                                  />
                                                </div>
                                                <p className="text-xl font-black text-rose-400 tracking-tighter uppercase italic">
                                                  {selectedLesson.subTopics[currentSubTopicIndex].visualData.statuses?.[1] || 'Hibernating DOWN'}
                                                </p>
                                             </motion.div>
                                           )}
                                         </AnimatePresence>
                                         
                                         {/* Background particle effect */}
                                         <div className="absolute inset-0 flex justify-between px-10 pointer-events-none opacity-20">
                                            {[...Array(5)].map((_, i) => (
                                              <motion.div 
                                                key={i}
                                                animate={{ 
                                                  y: marketSentiment === 'bull' ? [-20, 20] : [20, -20],
                                                  opacity: [0, 1, 0]
                                                }}
                                                transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.3 }}
                                                className={cn("w-px h-10", marketSentiment === 'bull' ? "bg-emerald-400" : "bg-rose-400")}
                                              />
                                            ))}
                                         </div>
                                      </div>

                                      <div className="p-4 rounded-2xl bg-indigo-500/5 border border-slate-800 text-center">
                                        <p className="text-[10px] text-slate-400 leading-relaxed font-medium uppercase tracking-widest font-black">
                                          {marketSentiment === 'bull' ? "Positive Sentiment • Buying Power • Optimism" : "Negative Sentiment • Selling Pressure • Fear"}
                                        </p>
                                      </div>
                                    </div>
                                  )}

                                  {selectedLesson.subTopics[currentSubTopicIndex].visualData.type === 'portfolio-sim' && (
                                    <div className="w-full space-y-8 relative z-20">
                                      <div className="text-center">
                                        <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Diversification Tool</div>
                                        <p className="text-xs text-slate-400 font-bold uppercase">Balance your assets</p>
                                      </div>

                                      <div className="flex flex-col md:flex-row gap-8 items-center bg-slate-950/50 p-6 rounded-[32px] border border-slate-800">
                                        <div className="w-32 h-32 md:w-40 md:h-40 pointer-events-none">
                                          <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                              <Pie
                                                data={portfolioAssets}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={45}
                                                outerRadius={65}
                                                paddingAngle={5}
                                                dataKey="value"
                                                isAnimationActive={false}
                                              >
                                                {portfolioAssets.map((entry, index) => (
                                                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                                ))}
                                              </Pie>
                                            </PieChart>
                                          </ResponsiveContainer>
                                        </div>

                                        <div className="flex-1 w-full space-y-4">
                                          {portfolioAssets.map((asset, idx) => (
                                            <div key={asset.name} className="space-y-1">
                                              <div className="flex justify-between text-[10px] font-bold text-slate-400">
                                                <span className="flex items-center gap-1.5">
                                                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: asset.color }} />
                                                  {asset.name}
                                                </span>
                                                <span className="text-white font-black">{Math.round(asset.value)}%</span>
                                              </div>
                                              <input 
                                                type="range"
                                                min="0"
                                                max="100"
                                                step="0.1"
                                                value={asset.value}
                                                onChange={(e) => {
                                                  const newVal = parseFloat(e.target.value);
                                                  const oldVal = portfolioAssets[idx].value;
                                                  const delta = newVal - oldVal;
                                                  
                                                  if (Math.abs(delta) < 0.01) return;

                                                  // Deep copy assets to avoid mutating state directly
                                                  const newAssets = portfolioAssets.map(asset => ({ ...asset }));
                                                  newAssets[idx].value = newVal;

                                                  const otherIndices = portfolioAssets.map((_, i) => i).filter(i => i !== idx);
                                                  const totalOthers = otherIndices.reduce((acc, i) => acc + portfolioAssets[i].value, 0);

                                                  if (totalOthers > 0) {
                                                    otherIndices.forEach(i => {
                                                      const share = portfolioAssets[i].value / totalOthers;
                                                      newAssets[i].value = Math.max(0, portfolioAssets[i].value - (delta * share));
                                                    });
                                                  } else if (otherIndices.length > 0) {
                                                    const firstOther = otherIndices[0];
                                                    newAssets[firstOther].value = Math.max(0, 100 - newVal);
                                                  }

                                                  setPortfolioAssets(newAssets);
                                                }}
                                                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all"
                                              />
                                            </div>
                                          ))}
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-4 bg-indigo-500/10 p-4 rounded-2xl border border-indigo-500/20">
                                        <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-400">
                                          <Sparkles size={20} />
                                        </div>
                                        <div className="flex-1">
                                          <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mb-0.5">Stability Score</p>
                                          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                            {/* Logic: More distributed = more stable. One heavy asset = less stable */}
                                            <motion.div 
                                              initial={{ width: 0 }}
                                              animate={{ 
                                                width: `${Math.min(100, Math.max(0, 100 - (Math.max(...portfolioAssets.map(a => a.value)) - 25) * 2))}%` 
                                              }}
                                              className="h-full bg-indigo-500"
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                               </div>
                             )}

                             {/* Fun Fact / Interactive Element */}
                             {selectedLesson.subTopics[currentSubTopicIndex].funFact && (
                               <motion.div 
                                 initial={{ opacity: 0, y: 10 }}
                                 animate={{ opacity: 1, y: 0 }}
                                 className="p-6 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex gap-4 items-start shadow-[0_0_50px_-12px_rgba(245,158,11,0.2)]"
                               >
                                 <div className="p-2 rounded-xl bg-amber-500/20 text-amber-500 mt-1">
                                   <Zap size={20} fill="currentColor" />
                                 </div>
                                 <div className="flex-1">
                                   <div className="flex justify-between items-center mb-1">
                                     <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">FUN FACT</span>
                                     <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center">
                                       <Activity size={14} className="text-amber-500 animate-pulse" />
                                     </div>
                                   </div>
                                   <p className="text-sm text-amber-200/80 font-medium italic">{selectedLesson.subTopics[currentSubTopicIndex].funFact}</p>
                                 </div>
                               </motion.div>
                             )}
                           </motion.div>
                         </AnimatePresence>

                         <div className="flex gap-4 pt-8">
                           {currentSubTopicIndex > 0 && (
                             <Button variant="secondary" onClick={() => setCurrentSubTopicIndex(i => i - 1)} className="flex-1 py-6 rounded-2xl">
                               Previous
                             </Button>
                           )}
                           <Button 
                             onClick={() => {
                               if (currentSubTopicIndex < selectedLesson.subTopics.length - 1) {
                                 setCurrentSubTopicIndex(i => i + 1);
                               } else {
                                 setShowQuiz(true);
                               }
                             }} 
                             className={cn(
                               "flex-[2] py-6 rounded-2xl shadow-xl transition-all",
                               currentSubTopicIndex < selectedLesson.subTopics.length - 1 
                                ? "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20" 
                                : "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20"
                             )}
                           >
                             {currentSubTopicIndex < selectedLesson.subTopics.length - 1 
                                ? 'Next Step' 
                                : (quizScore > 0 ? 'Continue Quiz' : 'Take Final Quiz')}
                             <ChevronRight className="ml-2" />
                           </Button>
                         </div>
                      </div>

                      <div className="space-y-6">
                        <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
                           <h5 className="text-xs font-black text-slate-500 uppercase tracking-widest">Resources</h5>
                           {selectedLesson.videoUrl && (
                             <a href={selectedLesson.videoUrl} target="_blank" rel="noopener" className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-900 transition-colors group">
                               <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-white transition-all">
                                 <Youtube size={16} />
                               </div>
                               <span className="text-xs font-bold text-slate-300">Watch Lesson Video</span>
                             </a>
                           )}
                           {selectedLesson.articleUrl && (
                             <a href={selectedLesson.articleUrl} target="_blank" rel="noopener" className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-900 transition-colors group">
                               <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
                                 <FileText size={16} />
                               </div>
                               <span className="text-xs font-bold text-slate-300">Read Deep Dive</span>
                             </a>
                           )}
                        </div>

                        {/* AI Tutor Card */}
                        <Card className="p-6 bg-gradient-to-br from-indigo-900/40 to-slate-900 border-indigo-500/30 overflow-hidden relative group">
                           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                             <Bot size={80} />
                           </div>
                           <div className="flex items-center gap-3 mb-4 relative z-10">
                             <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white ring-4 ring-indigo-500/20 shadow-lg">
                               <Bot size={20} />
                             </div>
                             <div>
                               <h6 className="text-sm font-black text-white italic tracking-tight">AI Coach</h6>
                               <div className="flex items-center gap-1.5">
                                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                 <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest\">Coach is available</span>
                               </div>
                             </div>
                           </div>
                           <p className="text-xs text-indigo-200/80 leading-relaxed italic mb-6 relative z-10">
                             "Stuck on a concept? I can break it down using real-world analogies or even check your strategy!"
                           </p>
                           <Button 
                             onClick={() => setShowTutor(true)} 
                             variant="secondary" 
                             className="w-full text-xs py-3 bg-indigo-500/10 hover:bg-indigo-500/30 border-indigo-500/30 text-indigo-300 relative z-10 font-black tracking-widest uppercase"
                           >
                             Open AI Coach
                           </Button>
                        </Card>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="max-w-2xl mx-auto space-y-8 py-8">
                    {!quizFinished ? (
                      <>
                        <div className="flex justify-between items-center mb-4">
                           <div className="flex gap-2 items-center">
                             <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-500">
                               <HelpCircle size={18} />
                             </div>
                             <span className="text-xs font-black text-white italic uppercase tracking-widest">Knowledge Check</span>
                           </div>
                           <span className="text-xs font-bold text-slate-500 tracking-widest">{quizScore + 1} / {shuffledQuiz.length}</span>
                        </div>

                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-12 shadow-inner">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${((quizScore) / shuffledQuiz.length) * 100}%` }}
                            className="h-full bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                          />
                        </div>

                        <div className="space-y-8">
                           <h3 className="text-3xl font-black text-white italic text-center leading-tight">
                             {currentQuestion.question}
                           </h3>

                           {/* Answer Types */}
                           {currentQuestion.type === 'MCQ' && (
                             <div className="grid gap-4">
                               {currentQuestion.options.map((option: string, idx: number) => {
                                 const q = currentQuestion as any;
                                 const originalIdx = q.optionsWithInitIdx ? q.optionsWithInitIdx[idx].originalIdx : idx;
                                 const isCorrect = originalIdx === q.correctAnswer;
                                 const isSelected = selectedAnswer === idx;

                                 let variant: 'primary' | 'danger' | 'secondary' = 'secondary';
                                 let customStyles = "";
                                 
                                 if (explanation) {
                                   if (isCorrect) {
                                     variant = 'primary';
                                     customStyles = "bg-emerald-600 border-emerald-400 text-white";
                                   } else if (isSelected && !isCorrect) {
                                     variant = 'danger';
                                     customStyles = "bg-rose-600 border-rose-400 text-white";
                                   } else {
                                     customStyles = "opacity-40 grayscale-[0.5]";
                                   }
                                 } else if (isSelected) {
                                   variant = 'primary';
                                 }

                                 return (
                                   <Button 
                                     key={idx} 
                                     variant={variant}
                                     onClick={() => handleQuizAnswer(idx)}
                                     className={cn(
                                       "py-6 text-lg rounded-2xl justify-start px-8 transition-all hover:scale-[1.01] active:scale-95",
                                       customStyles
                                     )}
                                     disabled={explanation !== null}
                                   >
                                     <div className="flex items-center gap-4 w-full">
                                        <div className={cn(
                                          "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black border",
                                          (isSelected || (explanation && isCorrect)) ? "bg-white/20 border-white/40 text-white" : "bg-slate-800 border-slate-700 text-slate-500"
                                        )}>
                                          {String.fromCharCode(65 + idx)}
                                        </div>
                                        <span className="font-bold">{option}</span>
                                        {explanation && (
                                          <div className="ml-auto">
                                            {isCorrect ? <CheckCircle size={24} /> : (isSelected && <XCircle size={24} />)}
                                          </div>
                                        )}
                                     </div>
                                   </Button>
                                 );
                               })}
                             </div>
                           )}

                           {currentQuestion.type === 'WQ' && (
                             <div className="space-y-4">
                               <input 
                                 type="text"
                                 placeholder="Type your answer here..."
                                 className="w-full bg-slate-950 border-2 border-slate-800 rounded-3xl p-6 text-white text-xl focus:border-indigo-500 outline-none transition-all placeholder:text-slate-700"
                                 onKeyDown={(e) => {
                                   if (e.key === 'Enter' && e.currentTarget.value) {
                                     handleQuizAnswer(e.currentTarget.value);
                                   }
                                 }}
                                 disabled={selectedAnswer !== null}
                               />
                               <p className="text-center text-xs text-slate-500">Press Enter to submit</p>
                             </div>
                           )}

                           {currentQuestion.type === 'TQ' && (
                              <div className="space-y-6">
                                <div className="grid gap-3">
                                  {currentQuestion.options.map((option: string, idx: number) => {
                                    const isSelected = Array.isArray(selectedAnswer) && selectedAnswer.includes(idx);
                                    const q = currentQuestion as any;
                                    const originalIdx = q.optionsWithInitIdx ? q.optionsWithInitIdx[idx].originalIdx : idx;
                                    const isCorrect = q.correctAnswer.includes(originalIdx);
                                    
                                    let statusColor = isSelected ? "bg-indigo-600/20 border-indigo-500" : "bg-slate-950 border-slate-800 hover:border-slate-700";
                                    let iconColor = isSelected ? "bg-indigo-500 border-indigo-300" : "border-slate-700 group-hover:border-slate-500";
                                    let textColor = isSelected ? "text-white" : "text-slate-400 group-hover:text-slate-300";

                                    if (explanation) {
                                      if (isCorrect) {
                                        statusColor = "bg-green-600/20 border-green-500";
                                        iconColor = "bg-green-500 border-green-300";
                                        textColor = "text-green-400";
                                      } else if (isSelected && !isCorrect) {
                                        statusColor = "bg-red-600/20 border-red-500";
                                        iconColor = "bg-red-500 border-red-300";
                                        textColor = "text-red-400";
                                      } else {
                                        statusColor = "bg-slate-950/50 border-slate-900 opacity-50";
                                        textColor = "text-slate-600";
                                      }
                                    }

                                    return (
                                      <button
                                        key={idx}
                                        onClick={() => {
                                          if (explanation) return;
                                          const current = Array.isArray(selectedAnswer) ? selectedAnswer : [];
                                          if (current.includes(idx)) {
                                            setSelectedAnswer(current.filter(v => v !== idx));
                                          } else {
                                            setSelectedAnswer([...current, idx]);
                                          }
                                        }}
                                        className={cn(
                                          "p-5 rounded-2xl border-2 text-left flex items-center gap-4 transition-all group",
                                          statusColor
                                        )}
                                      >
                                        <div className={cn(
                                          "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors", 
                                          iconColor
                                        )}>
                                          {explanation ? (
                                            isCorrect ? <Check size={14} className="text-white" /> : (isSelected ? <X size={14} className="text-white" /> : null)
                                          ) : (
                                            isSelected && <Check size={14} className="text-white" />
                                          )}
                                        </div>
                                        <span className={cn("font-bold text-lg", textColor)}>{option}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                                {!explanation && (
                                  <Button 
                                    onClick={() => handleQuizAnswer(selectedAnswer || [])} 
                                    disabled={!Array.isArray(selectedAnswer) || selectedAnswer.length === 0}
                                    className="w-full py-5 text-base font-black uppercase tracking-widest bg-indigo-600 hover:bg-indigo-500 rounded-3xl shadow-xl shadow-indigo-600/20"
                                  >
                                    Check Answer
                                  </Button>
                                )}
                              </div>
                            )}

                           {currentQuestion.type === 'MQ' && (
                              <div className="space-y-12">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                                  {/* Left Side: Static Terms */}
                                  <div className="space-y-4">
                                    <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 text-center">Terms</h5>
                                    {matchingPairs.map((pair, i) => (
                                      <div key={i} className="flex gap-4 items-center">
                                        <div className="flex-1 p-6 rounded-3xl bg-slate-950 border border-slate-800 text-white font-bold text-lg shadow-xl shrink-0 min-w-[140px] text-center">
                                          {pair.left}
                                        </div>
                                        <div className="w-4 h-px bg-slate-800 shrink-0" />
                                        <div className={cn(
                                          "flex-1 min-h-[76px] p-2 rounded-3xl border-2 border-dashed flex items-center justify-center transition-all",
                                          pair.right ? "bg-indigo-600/10 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.1)]" : "bg-slate-900/50 border-slate-800"
                                        )}>
                                          {pair.right ? (
                                            <motion.div 
                                              layoutId={`match-${pair.right}`}
                                              className="w-full h-full p-4 rounded-2xl bg-indigo-600 text-white font-bold text-center shadow-lg cursor-pointer hover:bg-indigo-500 active:scale-95 transition-colors"
                                              onClick={() => {
                                                if (explanation) return;
                                                const newPairs = [...matchingPairs];
                                                const removed = newPairs[i].right;
                                                newPairs[i].right = null;
                                                setMatchingPairs(newPairs);
                                                if (removed) setAvailableMatches(prev => [...prev, removed]);
                                              }}
                                            >
                                              {pair.right}
                                            </motion.div>
                                          ) : (
                                            <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest\">Drop Here</span>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>

                                  {/* Right Side: Options */}
                                  <div className="space-y-4">
                                    <div className="flex justify-between items-center mb-4">
                                      <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Meanings</h5>
                                      <Button 
                                        variant="secondary" 
                                        onClick={() => {
                                          if (explanation) return;
                                          const initialPairs = currentQuestion.pairs.map((p: any) => ({ left: p.left, right: null }));
                                          const rights = currentQuestion.pairs.map((p: any) => p.right);
                                          setMatchingPairs(initialPairs);
                                          setAvailableMatches(rights);
                                        }}
                                        className="h-8 px-3 text-[10px] font-black uppercase tracking-widest rounded-xl bg-slate-950/50 hover:bg-slate-950 transition-colors"
                                      >
                                        Reset
                                      </Button>
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                      <AnimatePresence>
                                        {availableMatches.map((opt) => (
                                          <motion.div
                                            key={opt}
                                            layoutId={`match-${opt}`}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="px-6 py-4 rounded-2xl bg-slate-800 border border-slate-700 text-slate-200 font-bold shadow-lg cursor-pointer hover:bg-slate-700 hover:border-indigo-500/50 transition-all font-sans"
                                            onClick={() => {
                                              if (explanation) return;
                                              const emptyIdx = matchingPairs.findIndex(p => p.right === null);
                                              if (emptyIdx !== -1) {
                                                const newPairs = [...matchingPairs];
                                                newPairs[emptyIdx].right = opt;
                                                setMatchingPairs(newPairs);
                                                setAvailableMatches(prev => prev.filter(a => a !== opt));
                                              }
                                            }}
                                          >
                                            {opt}
                                          </motion.div>
                                        ))}
                                      </AnimatePresence>
                                    </div>
                                    {availableMatches.length === 0 && !explanation && (
                                      <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/20 text-center"
                                      >
                                        <div className="flex flex-col items-center gap-2">
                                           <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                              <Sparkles size={16} />
                                           </div>
                                           <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest\">All matched! Confirm to check.</p>
                                        </div>
                                      </motion.div>
                                    )}
                                  </div>
                                </div>

                                <Button 
                                  onClick={() => {
                                    const reflectsCorrect = matchingPairs.every(p => {
                                      const correctPair = currentQuestion.pairs.find((cp: any) => cp.left === p.left);
                                      return correctPair && correctPair.right === p.right;
                                    });
                                    handleQuizAnswer(reflectsCorrect);
                                  }} 
                                  disabled={availableMatches.length > 0 || explanation !== null}
                                  className={cn(
                                    "w-full py-6 text-base font-black uppercase tracking-widest rounded-3xl shadow-xl transition-all font-sans",
                                    availableMatches.length === 0 ? "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20 text-white" : "bg-slate-800 text-slate-600 cursor-not-allowed"
                                  )}
                                >
                                  {explanation ? "Answer Checked" : "Confirm Matches"}
                                </Button>
                              </div>
                            )}

                           <AnimatePresence>
                             {explanation && (
                               <motion.div 
                                 initial={{ opacity: 0, scale: 0.95 }}
                                 animate={{ opacity: 1, scale: 1 }}
                                 className={cn(
                                   "p-8 rounded-[40px] border-4",
                                   isWrong ? "bg-rose-950/20 border-rose-500/30 text-rose-200" : "bg-emerald-950/20 border-emerald-500/30 text-emerald-200"
                                 )}
                               >
                                 <div className="flex gap-6">
                                    <div className={cn(
                                      "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                                      isWrong ? "bg-rose-600 text-white" : "bg-emerald-600 text-white"
                                    )}>
                                      {isWrong ? <AlertCircle size={24} /> : <Sparkles size={24} />}
                                    </div>
                                    <div className="space-y-4">
                                      <h5 className="text-xl font-black italic uppercase tracking-wider">
                                        {isWrong ? "Wait! Let's review." : "Incredible Work!"}
                                      </h5>
                                      <div className="markdown-body text-current leading-relaxed opacity-90">
                                        <Markdown>{explanation}</Markdown>
                                      </div>
                                      
                                      {isWrong ? (
                                        <div className="flex gap-4 pt-4">
                                           <Button onClick={() => {
                                             setShowQuiz(false);
                                             setExplanation(null);
                                             setSelectedAnswer(null);
                                             setIsWrong(false);
                                           }} variant="secondary" className="rounded-2xl px-6 bg-slate-950/50">
                                              Refer Back to Lesson
                                           </Button>
                                           <Button onClick={() => {
                                             setSelectedAnswer(null);
                                             setExplanation(null);
                                             setIsWrong(false);
                                           }} className="rounded-2xl px-8 bg-rose-600 hover:bg-rose-500">
                                              Try Again
                                           </Button>
                                        </div>
                                      ) : (
                                        <div className="pt-4">
                                           <Button 
                                             onClick={handleNextQuestion} 
                                             className="rounded-2xl px-10 py-4 bg-emerald-600 hover:bg-emerald-500 shadow-xl shadow-emerald-600/20 group"
                                           >
                                              {quizScore < shuffledQuiz.length - 1 ? 'Next Question' : 'Finish Quiz'}
                                              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                                           </Button>
                                        </div>
                                      )}
                                    </div>
                                 </div>
                               </motion.div>
                             )}
                           </AnimatePresence>
                        </div>
                      </>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center space-y-12"
                      >
                         <div className="relative inline-block">
                           <div className="text-[120px] filter drop-shadow-[0_0_30px_rgba(245,158,11,0.5)]">🏆</div>
                           <motion.div 
                             animate={{ rotate: 360 }}
                             transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                             className="absolute inset-0 border-4 border-dashed border-amber-500/30 rounded-full scale-125"
                           />
                         </div>
                         <div className="space-y-4">
                           <h3 className="text-4xl font-black text-white italic tracking-tight uppercase">Mission Accomplished!</h3>
                           <p className="text-slate-400 text-lg max-w-sm mx-auto">
                             You've successfully mastered {selectedLesson.title} and earned {selectedLesson.xpReward} XP for your efforts.
                           </p>
                         </div>
                         <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 flex justify-between items-center max-w-sm mx-auto">
                            <div className="text-left">
                               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">XP REWARD</span>
                               <span className="text-2xl font-black text-amber-500">+{selectedLesson.xpReward} XP</span>
                            </div>
                            <div className="text-right">
                               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">CHALLENGES</span>
                               <span className="text-2xl font-black text-white italic">PASSED</span>
                            </div>
                         </div>
                         <Button onClick={() => handleComplete(selectedLesson)} className="w-full py-6 text-xl rounded-[30px] bg-emerald-600 hover:bg-emerald-500 shadow-[0_10px_40px_rgba(16,185,129,0.3)] group">
                           Continue Journey
                           <ArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" />
                         </Button>
                      </motion.div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating AI Tutor - Persists for help */}
      <div className="fixed bottom-24 right-6 z-[300]">
        <AnimatePresence>
          {showTutor && (
            <motion.div 
              initial={{ opacity: 0, x: 20, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, x: 0, scale: 1, y: 0 }}
              exit={{ opacity: 0, x: 20, scale: 0.9, y: 20 }}
              className="absolute bottom-20 right-0 w-[calc(100vw-48px)] md:w-[450px] h-[600px] max-h-[70vh] bg-slate-900 border-2 border-slate-700/50 rounded-[32px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col ring-1 ring-white/10 backdrop-blur-xl"
            >
              <div className="p-5 border-b border-slate-800 bg-indigo-600 flex justify-between items-center shadow-lg">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white shadow-inner">
                     <Bot size={22} />
                   </div>
                   <div>
                     <span className="font-black text-white italic block tracking-tight leading-tight">INVESTO COACH</span>
                     <div className="flex items-center gap-1.5">
                       <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                       <span className="text-[9px] text-indigo-100 font-bold uppercase tracking-widest\">Powered by Gemini</span>
                     </div>
                   </div>
                </div>
                <button 
                  onClick={() => setShowTutor(false)} 
                  className="group flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/20 hover:bg-black/30 text-white transition-all border border-white/10"
                >
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Close</span>
                  <X size={18} />
                </button>
              </div>
              <div className="flex-1 overflow-hidden bg-slate-900/50">
                <ChatView user={user} isFloating />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.button 
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowTutor(!showTutor)}
          className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-[0_15px_30px_-5px_rgba(0,0,0,0.4)] transition-all relative overflow-hidden group border-2",
            showTutor 
              ? "bg-rose-600 border-rose-400 shadow-rose-900/40" 
              : "bg-indigo-600 border-indigo-400 shadow-indigo-900/40"
          )}
        >
          {showTutor ? <X size={28} /> : (
            <div className="flex flex-col items-center">
              <Bot size={28} />
              <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-indigo-600" />
            </div>
          )}
          <motion.div 
            animate={{ scale: [1, 1.2, 1] }} 
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-20"
          />
        </motion.button>
      </div>
    </div>
  );
};

const QuizView = ({ onComplete }: { onComplete: (level: string, tab: 'lessons' | 'simulator' | 'arcade') => void }) => {
  const [step, setStep] = useState(0);
  const [firstChoice, setFirstChoice] = useState('');
  const questions = [
    { q: "How much do you know about trading?", options: ["Nothing, I'm a beginner", "I know some basics", "I'm an expert"] },
    { q: "What's your goal?", options: ["Learn fundamentals", "Practice strategies", "Trading Arcade"] }
  ];

  const handleSelect = (option: string) => {
    if (step === 0) {
      setFirstChoice(option);
      setStep(1);
    } else {
      let level = 'beginner';
      const levelOpt = firstChoice.toLowerCase();
      if (levelOpt.includes("expert")) level = "expert";
      else if (levelOpt.includes("basics")) level = "proficient";

      let tab: 'lessons' | 'simulator' | 'arcade' = 'lessons';
      const goalOpt = option.toLowerCase();
      if (goalOpt.includes("practice")) tab = 'simulator';
      else if (goalOpt.includes("arcade") || goalOpt.includes("trading")) tab = 'arcade';

      onComplete(level, tab);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex items-center justify-center p-6">
      <Card className="max-w-md w-full text-center space-y-8">
        <div className="text-4xl">🐂🐻</div>
        <h3 className="text-2xl font-black text-white">{questions[step].q}</h3>
        <div className="space-y-3">
          {questions[step].options.map(opt => (
            <Button key={opt} onClick={() => handleSelect(opt)} variant="secondary" className="w-full py-4">
              {opt}
            </Button>
          ))}
        </div>
      </Card>
    </div>
  );
};

const SimulatorView = ({ user, onUpdateUser }: { user: UserProfile, onUpdateUser: (data: Partial<UserProfile>) => void }) => {
  const [symbol, setSymbol] = useState('BTCUSD');
  const [amount, setAmount] = useState(1);
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [tp, setTp] = useState<number | ''>('');
  const [sl, setSl] = useState<number | ''>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [interval, setIntervalState] = useState('D');
  const [range, setRange] = useState('1M');
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [currentPrice, setCurrentPrice] = useState(MOCK_PRICES[symbol] || 65000);
  const [openTrades, setOpenTrades] = useState<Trade[]>([]);
  const [showTutor, setShowTutor] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [isAdjusting, setIsAdjusting] = useState<{ id: string, type: 'tp' | 'sl', value: number } | null>(null);
  const [priceHistory, setPriceHistory] = useState<number[]>([]);

  useEffect(() => {
    // Reset price when symbol changes
    setCurrentPrice(MOCK_PRICES[symbol] || 65000);
  }, [symbol]);

  const STOCKS = Object.keys(MOCK_PRICES);
  const INTERVALS = [
    { label: '1m', value: '1' }, { label: '5m', value: '5' }, { label: '15m', value: '15' }, 
    { label: '1h', value: '60' }, { label: '4h', value: '240' }, { label: '1D', value: 'D' }, { label: '1W', value: 'W' }
  ];
  const RANGES = ['1D', '5D', '1M', '3M', '6M', '1Y', '5Y'];

  useEffect(() => {
    // Attempt to fetch real price for sync if it's a known symbol
    const fetchRealPrice = async () => {
      if (symbol.includes('USD')) {
        try {
          const binanceSym = symbol === 'BTCUSD' ? 'BTCUSDT' : 
                            symbol === 'ETHUSD' ? 'ETHUSDT' : 
                            symbol === 'SOLUSD' ? 'SOLUSDT' : 
                            symbol === 'BNBUSD' ? 'BNBUSDT' : null;
          
          if (binanceSym) {
            const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${binanceSym}`);
            const data = await res.json();
            if (data.price) {
              const livePrice = parseFloat(data.price);
              setCurrentPrice(livePrice);
              setPriceHistory(h => [...h.slice(-49), livePrice]);
            }
          }
        } catch (e) {
          console.warn("Could not sync live price:", e);
        }
      }
    };

    fetchRealPrice();
    const intervalId = setInterval(fetchRealPrice, 30000); // Sync every 30s
    return () => clearInterval(intervalId);
  }, [symbol]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
      // Market Jitter: small random moves between syncs
      setCurrentPrice(prev => {
        const volatility = symbol.includes('USD') ? 0.0005 : 0.001;
        const move = (Math.random() - 0.5) * volatility * prev;
        const newPrice = prev + move;
        setPriceHistory(history => [...history.slice(-49), newPrice]);
        return newPrice;
      });
    }, 1000); 
    return () => clearInterval(timer);
  }, [symbol]);

  useEffect(() => {
    if (user.uid === 'guest') {
      const localTrades = JSON.parse(localStorage.getItem('investo_guest_trades') || '[]');
      setOpenTrades(localTrades.filter((t: any) => t.status === 'open'));
      return;
    }
    const q = query(collection(db, 'users', user.uid, 'trades'), where('uid', '==', user.uid), where('status', '==', 'open'));
    const unsubscribe = onSnapshot(q, (snap) => {
      setOpenTrades(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Trade)));
    }, (e) => {
      handleFirestoreError(e, OperationType.GET, `users/${user.uid}/trades`);
    });
    return () => unsubscribe();
  }, [user.uid]);

  // TP/SL Logic
  useEffect(() => {
    const checkTrades = async () => {
      for (const trade of openTrades) {
        if (trade.symbol !== symbol) continue;

        let shouldClose = false;
        let exitPrice = currentPrice;

        if (trade.type === 'buy') {
          if (trade.takeProfit && currentPrice >= trade.takeProfit) {
            shouldClose = true;
            exitPrice = trade.takeProfit;
          } else if (trade.stopLoss && currentPrice <= trade.stopLoss) {
            shouldClose = true;
            exitPrice = trade.stopLoss;
          }
        } else {
          if (trade.takeProfit && currentPrice <= trade.takeProfit) {
            shouldClose = true;
            exitPrice = trade.takeProfit;
          } else if (trade.stopLoss && currentPrice >= trade.stopLoss) {
            shouldClose = true;
            exitPrice = trade.stopLoss;
          }
        }

        if (shouldClose && trade.id) {
          const profit = trade.type === 'buy' 
            ? (exitPrice - trade.entryPrice) * trade.amount 
            : (trade.entryPrice - exitPrice) * trade.amount;
          
          try {
            if (user.uid === 'guest') {
              const localTrades = JSON.parse(localStorage.getItem('investo_guest_trades') || '[]');
              const updatedTrades = localTrades.map((t: any) => 
                t.id === trade.id ? { ...t, status: 'closed', exitPrice, profit, exitTime: new Date().toISOString() } : t
              );
              localStorage.setItem('investo_guest_trades', JSON.stringify(updatedTrades));
              setOpenTrades(updatedTrades.filter((t: any) => t.status === 'open'));
              onUpdateUser({ balance: user.balance + (trade.amount * 100) + profit });
            } else {
              await updateDoc(doc(db, 'users', user.uid, 'trades', trade.id), {
                status: 'closed',
                exitPrice,
                profit,
                exitTime: serverTimestamp()
              });
              await updateDoc(doc(db, 'users', user.uid), {
                balance: increment((trade.amount * 100) + profit) // Return margin + profit
              });
            }
            setNotification(`Trade closed at $${exitPrice.toFixed(2)} (${profit >= 0 ? '+' : ''}$${profit.toFixed(2)})`);
          } catch (e) {
            handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}/trades/${trade.id}`);
          }
        }
      }
    };
    checkTrades();
  }, [currentPrice, openTrades, symbol, user.uid, user.balance]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleTrade = async () => {
    const userBalance = user?.balance ?? 0;
    const cost = amount * 100; 
    
    if (userBalance < cost) {
      setNotification(`Insufficient balance! You need $${cost.toLocaleString()}.`);
      return;
    }

    // Optional validation if they ARE provided
    if (tp !== '' && orderType === 'buy' && tp <= currentPrice) {
      setNotification("Buy: TP must be > Price");
      return;
    }
    if (tp !== '' && orderType === 'sell' && tp >= currentPrice) {
      setNotification("Sell: TP must be < Price");
      return;
    }
    if (sl !== '' && orderType === 'buy' && sl >= currentPrice) {
      setNotification("Buy: SL must be < Price");
      return;
    }
    if (sl !== '' && orderType === 'sell' && sl <= currentPrice) {
      setNotification("Sell: SL must be > Price");
      return;
    }

    const trade: any = {
      uid: user.uid,
      symbol,
      type: orderType,
      entryPrice: currentPrice,
      amount,
      takeProfit: tp === '' ? null : tp,
      stopLoss: sl === '' ? null : sl,
      status: 'open',
      timestamp: user.uid === 'guest' ? new Date().toISOString() : serverTimestamp()
    };
    
    try {
      if (user.uid === 'guest') {
        trade.id = Math.random().toString(36).substr(2, 9);
        const localTrades = JSON.parse(localStorage.getItem('investo_guest_trades') || '[]');
        const updatedTrades = [trade, ...localTrades];
        localStorage.setItem('investo_guest_trades', JSON.stringify(updatedTrades));
        setOpenTrades(updatedTrades.filter((t: any) => t.status === 'open'));
        onUpdateUser({ balance: user.balance - cost });
      } else {
        await addDoc(collection(db, 'users', user.uid, 'trades'), trade);
        await updateDoc(doc(db, 'users', user.uid), {
          balance: increment(-cost)
        });
      }
      setNotification(`Trade executed! ${orderType.toUpperCase()} ${amount} ${symbol} at $${currentPrice.toFixed(2)}`);
      setTp('');
      setSl('');
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${user.uid}/trades`);
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const res = await getTutorResponse(`Analyze the current market for ${symbol}. Current price is ${currentPrice.toFixed(2)}. Focus on key levels and trend. Be very brief and simple.`);
      setAnalysis(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const updateTradeSettings = async () => {
    if (!isAdjusting) return;
    const { id, type, value } = isAdjusting;

    try {
      if (user.uid === 'guest') {
        const localTrades = JSON.parse(localStorage.getItem('investo_guest_trades') || '[]');
        const updatedTrades = localTrades.map((t: any) => 
          t.id === id ? { ...t, [type === 'tp' ? 'takeProfit' : 'stopLoss']: value } : t
        );
        localStorage.setItem('investo_guest_trades', JSON.stringify(updatedTrades));
        setOpenTrades(updatedTrades.filter((t: any) => t.status === 'open'));
      } else {
        await updateDoc(doc(db, 'users', user.uid, 'trades', id), {
          [type === 'tp' ? 'takeProfit' : 'stopLoss']: value
        });
      }
      setNotification(`${type.toUpperCase()} updated to ${value}`);
      setIsAdjusting(null);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}/trades/${id}`);
    }
  };

  const getPricePercentage = (price: number) => {
    // We synchronize the overlay with a 10% vertical window around the current price
    // This makes the lines move as the price fluctuates, making it feel "live"
    const windowPercent = 0.1; 
    const halfWindow = (currentPrice * windowPercent) / 2;
    const min = currentPrice - halfWindow;
    const max = currentPrice + halfWindow;
    
    // Calculate percentage from top (0% at max, 100% at min)
    const percent = ((price - min) / (max - min)) * 100;
    return Math.max(0, Math.min(100, 100 - percent));
  };

  const getTradingViewSymbol = (s: string) => {
    if (s.includes('USD')) {
      if (s === 'BTCUSD') return 'BINANCE:BTCUSDT';
      if (s === 'ETHUSD') return 'BINANCE:ETHUSDT';
      if (s === 'SOLUSD') return 'BINANCE:SOLUSDT';
      if (s === 'BNBUSD') return 'BINANCE:BNBUSDT';
      return s;
    }
    return `NASDAQ:${s}`;
  };

  return (
    <div className="fixed inset-0 top-16 bottom-20 bg-slate-950 flex flex-col md:flex-row overflow-hidden">
      {/* Market Sidebar */}
      <div className="w-full md:w-48 bg-slate-900 border-r border-slate-800 overflow-y-auto p-2 hidden md:block">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest p-2 mb-2">Markets</h3>
        <div className="space-y-1">
          {STOCKS.map(s => (
            <button
              key={s}
              onClick={() => { setSymbol(s); setAnalysis(null); }}
              className={cn(
                "w-full px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between",
                symbol === s ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              )}
            >
              {s}
              {symbol === s && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="flex-1 relative flex flex-col">
        <div className="bg-slate-900 border-b border-slate-800 p-2 flex items-center justify-between overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-lg">
              <span className="text-white font-black">{symbol}</span>
              <span className="text-emerald-400 font-mono text-xs">${currentPrice.toFixed(2)}</span>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-slate-500 font-mono text-[10px]">LIVE {currentTime}</span>
              </div>
            </div>
            <div className="flex gap-1">
              {INTERVALS.map(i => (
                <button 
                  key={i.value} 
                  onClick={() => setIntervalState(i.value)}
                  className={cn("px-2 py-1 rounded text-[10px] font-bold transition-all", interval === i.value ? "bg-indigo-600 text-white" : "text-slate-500 hover:text-slate-300")}
                >
                  {i.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-1">
            {RANGES.map(r => (
              <button 
                key={r} 
                onClick={() => setRange(r)}
                className={cn("px-2 py-1 rounded text-[10px] font-bold transition-all", range === r ? "bg-slate-700 text-white" : "text-slate-600 hover:text-slate-400")}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 relative bg-slate-900">
          <iframe
            src={`https://www.tradingview-widget.com/embed-widget/advanced-chart/?symbol=${getTradingViewSymbol(symbol)}&interval=${interval}&theme=dark&style=1&locale=en&enable_publishing=false&hide_top_toolbar=false&hide_legend=false&save_image=false&container_id=tradingview_chart&range=${range}`}
            className="w-full h-full border-none"
            title="TradingView Chart"
            key={`${symbol}-${interval}-${range}`}
          />
          

          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Pending execution lines */}
            {tp !== '' && (
              <div className="absolute left-0 right-0 border-t-2 border-emerald-500/50 flex items-center justify-end px-4 z-10" style={{ top: `${getPricePercentage(Number(tp))}%` }}>
                <span className="bg-emerald-600 text-[8px] font-bold text-white px-1.5 py-0.5 rounded shadow-lg uppercase">Plan TP: ${tp}</span>
              </div>
            )}
            {sl !== '' && (
              <div className="absolute left-0 right-0 border-t-2 border-rose-500/50 flex items-center justify-end px-4 z-10" style={{ top: `${getPricePercentage(Number(sl))}%` }}>
                <span className="bg-rose-600 text-[8px] font-bold text-white px-1.5 py-0.5 rounded shadow-lg uppercase">Plan SL: ${sl}</span>
              </div>
            )}

            {openTrades.filter(t => t.symbol === symbol).map(t => (
              <React.Fragment key={t.id}>
                {t.takeProfit && (
                  <div 
                    className="absolute left-0 right-0 border-t-2 border-solid border-emerald-500 flex items-center justify-end px-4 pointer-events-auto cursor-ns-resize group z-20" 
                    style={{ top: `${getPricePercentage(t.takeProfit)}%` }}
                    onClick={() => {
                      const newVal = Number(prompt("Update Take Profit price:", t.takeProfit?.toString()));
                      if (newVal && !isNaN(newVal) && newVal > 0) {
                        setIsAdjusting({ id: t.id!, type: 'tp', value: newVal });
                      }
                    }}
                  >
                    <span className="bg-emerald-600 text-[10px] font-bold text-white px-2 py-0.5 rounded shadow-xl border border-emerald-400/30">TP: ${t.takeProfit}</span>
                    <div className="hidden group-hover:block absolute right-24 text-[8px] font-black text-emerald-400 bg-slate-950 px-2 py-1 rounded shadow-2xl border border-emerald-500/50">Adjust</div>
                  </div>
                )}
                {t.stopLoss && (
                  <div 
                    className="absolute left-0 right-0 border-t-2 border-solid border-rose-500 flex items-center justify-end px-4 pointer-events-auto cursor-ns-resize group z-20" 
                    style={{ top: `${getPricePercentage(t.stopLoss)}%` }}
                    onClick={() => {
                      const newVal = Number(prompt("Update Stop Loss price:", t.stopLoss?.toString()));
                      if (newVal && !isNaN(newVal) && newVal > 0) {
                        setIsAdjusting({ id: t.id!, type: 'sl', value: newVal });
                      }
                    }}
                  >
                    <span className="bg-rose-600 text-[10px] font-bold text-white px-2 py-0.5 rounded shadow-xl border border-rose-400/30">SL: ${t.stopLoss}</span>
                    <div className="hidden group-hover:block absolute right-24 text-[8px] font-black text-rose-400 bg-slate-950 px-2 py-1 rounded shadow-2xl border border-rose-500/50">Adjust</div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="md:hidden absolute top-4 left-4 flex gap-2 overflow-x-auto max-w-[80%] scrollbar-hide">
            {STOCKS.map(s => (
              <button
                key={s}
                onClick={() => { setSymbol(s); setAnalysis(null); }}
                className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-bold border backdrop-blur-md transition-all whitespace-nowrap",
                  symbol === s ? "bg-indigo-600/80 border-indigo-500 text-white" : "bg-slate-900/60 border-slate-800 text-slate-400"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Side Panel: Trading & Analysis */}
      <div className="w-full md:w-80 bg-slate-900 border-l border-slate-800 flex flex-col">
        <div className="p-4 space-y-6 flex-1 overflow-y-auto">
          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Trade Execution</h3>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setOrderType('buy')} className={cn("py-3 rounded-xl text-sm font-black transition-all", orderType === 'buy' ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20" : "bg-slate-800 text-slate-500")}>BUY</button>
              <button onClick={() => setOrderType('sell')} className={cn("py-3 rounded-xl text-sm font-black transition-all", orderType === 'sell' ? "bg-rose-600 text-white shadow-lg shadow-rose-500/20" : "bg-slate-800 text-slate-500")}>SELL</button>
            </div>
            
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 uppercase">Amount (Units)</label>
                <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase">Take Profit</label>
                  <input placeholder="TP" type="number" value={tp} onChange={(e) => setTp(e.target.value === '' ? '' : Number(e.target.value))} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase">Stop Loss</label>
                  <input placeholder="SL" type="number" value={sl} onChange={(e) => setSl(e.target.value === '' ? '' : Number(e.target.value))} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500" />
                </div>
              </div>
            </div>
            
            <Button onClick={handleTrade} className="w-full py-4 font-black text-lg">EXECUTE ORDER</Button>
          </div>

          <div className="h-px bg-slate-800" />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">AI Analysis</h3>
              <Button onClick={handleAnalyze} variant="ghost" className="p-1 h-auto text-[10px]">
                <BrainCircuit size={14} /> {isAnalyzing ? '...' : 'Refresh'}
              </Button>
            </div>
            
            <AnimatePresence mode="wait">
              {analysis ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-indigo-900/10 border border-indigo-500/20 rounded-2xl p-4">
                  <div className="markdown-body text-xs leading-relaxed">
                    <div className="markdown-body">
                      <Markdown>{analysis}</Markdown>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-slate-800 rounded-2xl">
                  <Sparkles size={24} className="mx-auto text-slate-700 mb-2" />
                  <p className="text-[10px] text-slate-600 px-4">Click "Refresh" to get AI insights for {symbol}</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        <div className="p-4 bg-slate-950 border-t border-slate-800">
          <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase mb-2">
            <span>Available Balance</span>
            <span className="text-white">${user.balance.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Floating AI Tutor for Simulator */}
      <div className="fixed bottom-24 right-6 z-[120]">
        <AnimatePresence>
          {showTutor && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="absolute bottom-20 right-0 w-80 h-96 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b border-slate-800 bg-indigo-600 flex justify-between items-center">
                <span className="font-bold text-white flex items-center gap-2">
                  <Bot size={18} /> Tutor Popup
                </span>
                <button onClick={() => setShowTutor(false)} className="text-white/70 hover:text-white">✕</button>
              </div>
              <div className="flex-1 overflow-hidden">
                <ChatView user={user} isFloating />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <button 
          onClick={() => setShowTutor(!showTutor)}
          className="w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-xl hover:bg-indigo-500 transition-colors"
        >
          <Bot size={28} />
        </button>
      </div>

      <AnimatePresence>
        {isAdjusting && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
            <Card className="max-w-sm w-full space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <History className="text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Adjust Settings</h3>
                <p className="text-slate-400 text-sm mt-2">
                  Confirm changing {isAdjusting.type.toUpperCase()} from its current value to <span className="text-white font-bold">{isAdjusting.value}</span>?
                </p>
              </div>
              <div className="flex gap-3">
                <Button onClick={() => setIsAdjusting(null)} variant="secondary" className="flex-1">Cancel</Button>
                <Button onClick={updateTradeSettings} className="flex-1">Confirm</Button>
              </div>
            </Card>
          </div>
        )}

        {notification && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[150]">
            <div className="bg-indigo-600 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3">
              <CheckCircle2 size={20} />
              <span className="font-bold">{notification}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ChatView = ({ user, isFloating }: { user: UserProfile, isFloating?: boolean }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user.uid === 'guest') {
      const localChat = JSON.parse(localStorage.getItem('investo_guest_chat') || '[]');
      if (localChat.length === 0) {
        setMessages([{ role: 'ai', text: "Hello! I'm your Investo tutor. Ask me anything about trading!" }]);
      } else {
        setMessages(localChat);
      }
      return;
    }
    const q = query(collection(db, 'users', user.uid, 'chat'), where('uid', '==', user.uid), orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      const msgs = snap.docs.map(doc => doc.data() as { role: 'user' | 'ai', text: string });
      if (msgs.length === 0) {
        setMessages([{ role: 'ai', text: "Hello! I'm your Investo tutor. Ask me anything about trading!" }]);
      } else {
        setMessages(msgs);
      }
    }, (e) => {
      handleFirestoreError(e, OperationType.GET, `users/${user.uid}/chat`);
    });
    return () => unsubscribe();
  }, [user.uid]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setInput('');
    
    try {
      if (user.uid === 'guest') {
        const localChat = JSON.parse(localStorage.getItem('investo_guest_chat') || '[]');
        const newUserMsg = { uid: user.uid, role: 'user', text: userMsg, timestamp: new Date().toISOString() };
        const updatedChatWithUser = [...localChat, newUserMsg];
        localStorage.setItem('investo_guest_chat', JSON.stringify(updatedChatWithUser));
        setMessages(updatedChatWithUser);

        setIsTyping(true);
        const history = updatedChatWithUser.map((m: any) => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }]
        }));
        const response = await getTutorResponse(userMsg, history);
        const newAiMsg = { uid: user.uid, role: 'ai', text: response || "I'm sorry, I couldn't process that.", timestamp: new Date().toISOString() };
        const updatedChatWithAi = [...updatedChatWithUser, newAiMsg];
        localStorage.setItem('investo_guest_chat', JSON.stringify(updatedChatWithAi));
        setMessages(updatedChatWithAi);
      } else {
        await addDoc(collection(db, 'users', user.uid, 'chat'), {
          uid: user.uid,
          role: 'user',
          text: userMsg,
          timestamp: serverTimestamp()
        });
        
        setIsTyping(true);
        const history = messages.map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }]
        }));
        const response = await getTutorResponse(userMsg, history);
        await addDoc(collection(db, 'users', user.uid, 'chat'), {
          uid: user.uid,
          role: 'ai',
          text: response || "I'm sorry, I couldn't process that.",
          timestamp: serverTimestamp()
        });
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${user.uid}/chat`);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className={cn("h-full flex flex-col gap-4", !isFloating && "p-0")}>
      {!isFloating && <h2 className="text-3xl font-black text-white italic">AI TUTOR</h2>}
      
      <div className={cn(
        "flex-1 bg-slate-900/50 border border-slate-800 rounded-3xl p-6 overflow-y-auto space-y-4",
        isFloating && "rounded-none border-none p-4"
      )} ref={scrollRef}>
        {messages.map((m, i) => (
          <div key={i} className={cn("flex", m.role === 'user' ? "justify-end" : "justify-start")}>
            <div className={cn(
              "max-w-[80%] p-4 rounded-2xl",
              m.role === 'user' ? "bg-indigo-600 text-white rounded-tr-none" : "bg-slate-800 text-slate-200 rounded-tl-none"
            )}>
              <div className="markdown-body prose prose-invert text-sm">
                <div className="markdown-body">
                  <Markdown>{m.text}</Markdown>
                </div>
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-slate-800 text-slate-400 p-4 rounded-2xl rounded-tl-none animate-pulse">
              Investo is thinking...
            </div>
          </div>
        )}
      </div>

      <div className={cn("flex gap-2", isFloating && "p-2 border-t border-slate-800 bg-slate-900")}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask about technical analysis, stocks..."
          className={cn(
            "flex-1 bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-indigo-500",
            isFloating && "px-4 py-2 text-xs rounded-xl"
          )}
        />
        <Button onClick={handleSend} className={cn("px-8", isFloating && "px-3")}>
          {isFloating ? <ChevronRight size={16} /> : <MessageSquare size={20} />}
        </Button>
      </div>
    </div>
  );
};

const ProfileView = ({ user, onUpdateUser }: { user: UserProfile, onUpdateUser: (data: Partial<UserProfile>) => void }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(user.displayName);
  const [newPhoto, setNewPhoto] = useState(user.photoURL || '');
  const [newLevel, setNewLevel] = useState(user.level || 'beginner');
  const [showJournal, setShowJournal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [trades, setTrades] = useState<Trade[]>([]);

  useEffect(() => {
    if (user.uid === 'guest') {
      const localTrades = JSON.parse(localStorage.getItem('investo_guest_trades') || '[]');
      setTrades(localTrades);
      return;
    }
    const q = query(collection(db, 'users', user.uid, 'trades'), where('uid', '==', user.uid), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      setTrades(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Trade)));
    }, (e) => {
      handleFirestoreError(e, OperationType.GET, `users/${user.uid}/trades`);
    });
    return () => unsubscribe();
  }, [user.uid]);

  const handleSave = async () => {
    try {
      if (user.uid === 'guest') {
        onUpdateUser({ 
          displayName: newName,
          photoURL: newPhoto,
          level: newLevel
        });
      } else {
        await updateDoc(doc(db, 'users', user.uid), { 
          displayName: newName,
          photoURL: newPhoto,
          level: newLevel
        });
      }
      setIsEditing(false);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const handleReset = async () => {
    try {
      if (user.uid === 'guest') {
        onUpdateUser({
          balance: INITIAL_BALANCE,
          xp: 0,
          completedLessons: [],
          unlockedGames: [],
          streak: 1,
          streakStartDate: new Date().toISOString(),
          lastSignIn: new Date().toISOString()
        });
        localStorage.removeItem('investo_guest_trades');
        localStorage.removeItem('investo_guest_chat');
        setTrades([]);
      } else {
        await updateDoc(doc(db, 'users', user.uid), {
          balance: INITIAL_BALANCE,
          xp: 0,
          completedLessons: [],
          unlockedGames: [],
          streak: 1,
          streakStartDate: new Date().toISOString(),
          lastSignIn: new Date().toISOString()
        });

        const tradesSnap = await getDocs(query(collection(db, 'users', user.uid, 'trades'), where('uid', '==', user.uid)));
        for (const t of tradesSnap.docs) {
          try {
            await deleteDoc(t.ref);
          } catch (e) {
            handleFirestoreError(e, OperationType.DELETE, `users/${user.uid}/trades/${t.id}`);
          }
        }

        const chatSnap = await getDocs(query(collection(db, 'users', user.uid, 'chat'), where('uid', '==', user.uid)));
        for (const c of chatSnap.docs) {
          try {
            await deleteDoc(c.ref);
          } catch (e) {
            handleFirestoreError(e, OperationType.DELETE, `users/${user.uid}/chat/${c.id}`);
          }
        }
      }

      setShowResetConfirm(false);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const progress = Math.round((user.completedLessons.length / LESSONS.length) * 100);

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="w-32 h-32 rounded-full bg-slate-800 border-4 border-indigo-500 flex items-center justify-center text-6xl overflow-hidden relative group">
          {user.photoURL ? (
            <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <span className="w-full h-full flex items-center justify-center">{user.petType === 'bull' ? '🐂' : '🐻'}</span>
          )}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
            <Button onClick={async () => {
              const nextPet = user.petType === 'bull' ? 'bear' : 'bull';
              const nextBot = user.botType === 'bull' ? 'bear' : 'bull';
              try {
                if (user.uid === 'guest') {
                  onUpdateUser({ petType: nextPet, botType: nextBot });
                } else {
                  await updateDoc(doc(db, 'users', user.uid), { petType: nextPet, botType: nextBot });
                }
              } catch (e) {
                handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}`);
              }
            }} variant="ghost" className="text-xs">Swap</Button>
          </div>
        </div>
        <div>
          {isEditing ? (
            <div className="space-y-3 max-w-xs mx-auto">
              <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Name" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white" />
              <input value={newPhoto} onChange={(e) => setNewPhoto(e.target.value)} placeholder="Photo URL" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white" />
              <select value={newLevel} onChange={(e) => setNewLevel(e.target.value as any)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white">
                <option value="beginner">Beginner</option>
                <option value="proficient">Proficient</option>
                <option value="expert">Expert</option>
              </select>
              <div className="flex gap-2">
                <Button onClick={handleSave} className="flex-1">Save</Button>
                <Button onClick={() => setIsEditing(false)} variant="secondary" className="flex-1">Cancel</Button>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-3xl font-black text-white">{user.displayName}</h2>
              <p className="text-slate-500">{user.email}</p>
              <div className="mt-4 max-w-xs mx-auto">
                <div className="flex justify-between text-xs font-bold text-slate-500 uppercase mb-1">
                  <span>Course Progress</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-indigo-500" />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center">
          <Trophy className="mx-auto mb-2 text-orange-500" />
          <p className="text-slate-500 text-xs uppercase font-bold">Streak</p>
          <p className="text-2xl font-black text-white">{user.streak} Days</p>
        </Card>
        <Card className="text-center">
          <BarChart2 className="mx-auto mb-2 text-indigo-400" />
          <p className="text-slate-500 text-xs uppercase font-bold">XP Earned</p>
          <p className="text-2xl font-black text-white">{user.xp}</p>
        </Card>
        <Card className="text-center">
          <Wallet className="mx-auto mb-2 text-emerald-400" />
          <p className="text-slate-500 text-xs uppercase font-bold">Balance</p>
          <p className="text-2xl font-black text-white">${user.balance.toLocaleString()}</p>
        </Card>
      </div>

      <div className="space-y-4">
        <Button onClick={() => setIsEditing(!isEditing)} variant="secondary" className="w-full justify-between py-4">
          <span className="flex items-center gap-3"><User size={20} /> Edit Profile</span>
          <ChevronRight size={16} />
        </Button>
        <Button onClick={() => setShowJournal(true)} variant="secondary" className="w-full justify-between py-4">
          <span className="flex items-center gap-3"><History size={20} /> Trading Journal</span>
          <ChevronRight size={16} />
        </Button>
        {user.uid !== 'guest' && (
          <Button onClick={() => signOut(auth)} variant="danger" className="w-full py-4 mt-8">
            <LogOut size={20} /> Sign Out
          </Button>
        )}
        <Button onClick={() => setShowResetConfirm(true)} variant="ghost" className="w-full py-4 text-rose-500 hover:text-rose-400 hover:bg-rose-500/10">
          Reset Account
        </Button>
      </div>

      <AnimatePresence>
        {showResetConfirm && (
          <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-6">
            <Card className="max-w-sm w-full text-center space-y-6 border-rose-500/50">
              <div className="text-6xl">⚠️</div>
              <h3 className="text-2xl font-black text-white">Reset Account?</h3>
              <p className="text-slate-400">This will permanently delete all your trades, chat history, and reset your progress and balance. This action cannot be undone.</p>
              <div className="flex gap-3">
                <Button onClick={handleReset} variant="danger" className="flex-1">Yes, Reset</Button>
                <Button onClick={() => setShowResetConfirm(false)} variant="secondary" className="flex-1">Cancel</Button>
              </div>
            </Card>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showJournal && (
          <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-6">
            <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto relative">
              <button onClick={() => setShowJournal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white">✕</button>
              <h3 className="text-2xl font-black text-white mb-6">Trading Journal</h3>
              <div className="space-y-3">
                {trades.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">No trades recorded yet.</p>
                ) : (
                  trades.map(t => (
                    <div key={t.id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                      <div>
                        <p className="font-bold text-white">{t.symbol} <span className={t.type === 'buy' ? 'text-emerald-400' : 'text-rose-400'}>{t.type.toUpperCase()}</span></p>
                        <p className="text-xs text-slate-500">{t.timestamp?.toDate ? t.timestamp.toDate().toLocaleString() : 'Just now'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-white">${t.entryPrice}</p>
                        <p className="text-xs text-slate-400">Qty: {t.amount}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface GameSummaryProps {
  score: number;
  gameOver: boolean;
  user: UserProfile;
  mistakes: string[];
  xpReward: number;
  onReset: () => void;
  onUpdateUser: (data: Partial<UserProfile>) => void;
  exitGame: () => void;
}

const GameSummary = ({ score, gameOver, user, mistakes, xpReward, onReset, onUpdateUser, exitGame }: GameSummaryProps) => {
  const rating = score > 4 ? 'Expert' : score > 2 ? 'Skilled' : 'Beginner';
  
  useEffect(() => {
    if (score > 0) {
      const xpGain = (score * 20) + (gameOver ? 0 : xpReward);
      if (user.uid === 'guest') {
        onUpdateUser({ xp: user.xp + xpGain });
      } else {
        updateDoc(doc(db, 'users', user.uid), {
          xp: user.xp + xpGain
        }).catch(err => {
          try {
            handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
          } catch (e) {}
        });
      }
    }
  }, []);

  return (
    <div className="text-center space-y-6 py-8">
      <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-6xl">
        {score > 3 ? '🏆' : '📈'}
      </motion.div>
      <h3 className="text-4xl font-black text-white italic">SUMMARY</h3>
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-slate-800/50">
          <p className="text-xs text-slate-500 uppercase">Performance</p>
          <p className="text-2xl font-black text-indigo-400">{rating}</p>
        </Card>
        <Card className="bg-slate-800/50">
          <p className="text-xs text-slate-500 uppercase">Score</p>
          <p className="text-2xl font-black text-white">{score}</p>
        </Card>
      </div>
      {mistakes.length > 0 && (
        <div className="text-left bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4">
          <p className="text-xs font-bold text-rose-400 uppercase mb-2">Key Mistakes:</p>
          <ul className="text-sm text-slate-400 list-disc list-inside space-y-1">
            {mistakes.map((m, i) => <li key={i}>{m}</li>)}
          </ul>
        </div>
      )}
      <div className="flex gap-3">
        <Button onClick={onReset} className="flex-1">Play Again</Button>
        <Button onClick={exitGame} variant="secondary" className="flex-1">Exit</Button>
      </div>
    </div>
  );
};

interface GameProps {
  user: UserProfile;
  score: number;
  setScore: React.Dispatch<React.SetStateAction<number>>;
  mistakes: string[];
  setMistakes: React.Dispatch<React.SetStateAction<string[]>>;
  gameOver: boolean;
  setGameOver: React.Dispatch<React.SetStateAction<boolean>>;
  askAi: (context: string) => void;
  isAiLoading: boolean;
  onUpdateUser: (data: Partial<UserProfile>) => void;
  exitGame: () => void;
}

const BullRunGame = ({ user, score, setScore, mistakes, setMistakes, gameOver, setGameOver, askAi, isAiLoading, onUpdateUser, exitGame }: GameProps) => {
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  
  const userLevel = user.xp < 2500 ? 'beginner' : user.xp < 7500 ? 'proficient' : 'expert';
  const scenarios = useMemo(() => 
    GAME_SCENARIOS.bullRun.filter(s => (s as any).difficulty === userLevel),
  [userLevel]);

  const isAnswered = useRef(false);
  const timerRef = useRef<any>(null);

  const resetGame = () => {
    setScenarioIndex(0);
    setSelectedOption(null);
    setScore(0);
    setGameOver(false);
    setMistakes([]);
    isAnswered.current = false;
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const handleAction = (index: number) => {
    if (isAnswered.current) return;
    isAnswered.current = true;
    
    setSelectedOption(index);
    const scenario = scenarios[scenarioIndex];
    const isCorrect = index === scenario.correct;
    
    if (isCorrect) {
      setScore(s => s + 1);
    } else {
      setMistakes(prev => [...prev, `Incorrect action for: ${scenario.event}`]);
    }
  };

  const handleAskAi = () => {
    askAi(`In Bull Run game, the event is "${scenarios[scenarioIndex].event}" and the action options were ${scenarios[scenarioIndex].options.join(', ')}. The player chose: "${scenarios[scenarioIndex].options[selectedOption!]}". The correct answer was "${scenarios[scenarioIndex].options[scenarios[scenarioIndex].correct]}".`);
  };

  const prevQuestion = () => {
    if (scenarioIndex > 0) {
      setSelectedOption(null);
      setScenarioIndex(prev => prev - 1);
      isAnswered.current = false;
    }
  };

  const nextQuestion = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setSelectedOption(null);
    if (scenarioIndex < scenarios.length - 1) {
      setScenarioIndex(prev => prev + 1);
      isAnswered.current = false;
    } else {
      setGameOver(true);
    }
  };

  return (
    <Card className="relative overflow-hidden border-indigo-500/30">
      <AnimatePresence>
        {selectedOption !== null && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 2 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center pointer-events-none"
          >
            <div className="text-9xl">
              {selectedOption === scenarios[scenarioIndex].correct ? '🐂' : '🐻'}
            </div>
            <motion.h4 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "text-6xl font-black italic mt-4",
                selectedOption === scenarios[scenarioIndex].correct ? "text-emerald-400" : "text-rose-400"
              )}
            >
              {selectedOption === scenarios[scenarioIndex].correct ? 'BULLISH!' : 'REJECTED!'}
            </motion.h4>
          </motion.div>
        )}
      </AnimatePresence>
      {!gameOver ? (
        <div className="space-y-6" key={scenarioIndex}>
          <div className="flex justify-between items-start">
            <button onClick={exitGame} className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors group">
              <XCircle size={20} className="group-hover:text-rose-500 transition-colors" />
              <span className="text-[10px] font-black uppercase tracking-widest">Exit Challenge</span>
            </button>
            <div className="text-right">
              <span className="text-[10px] font-black text-slate-600 uppercase block leading-none mb-1">Bull Run • {scenarioIndex + 1}/{scenarios.length}</span>
              <span className="text-indigo-400 font-black text-xl leading-none">{score} <span className="text-[10px] text-slate-500 italic">XP</span></span>
            </div>
          </div>
          
          <div className="bg-slate-800/50 rounded-2xl p-6 text-center animate-in fade-in slide-in-from-bottom-2">
            <div className="text-4xl mb-4">{scenarios[scenarioIndex].type === 'bull' ? '🚀' : scenarios[scenarioIndex].type === 'bear' ? '📉' : '⚖️'}</div>
            <h4 className="text-xl font-bold text-white leading-tight">{scenarios[scenarioIndex].event}</h4>
          </div>

          <div className="grid gap-3">
            {scenarios[scenarioIndex].options.map((opt, i) => (
              <Button 
                key={i} 
                variant={selectedOption === i ? (i === scenarios[scenarioIndex].correct ? 'primary' : 'danger') : 'secondary'}
                onClick={() => handleAction(i)}
                className="py-4 justify-between px-6"
                disabled={selectedOption !== null}
              >
                {opt}
                {selectedOption === i && (i === scenarios[scenarioIndex].correct ? <CheckCircle size={18} /> : <span>✕</span>)}
              </Button>
            ))}
          </div>

          <div className="flex flex-col gap-3 pt-4">
            {selectedOption !== null ? (
               <div className="flex gap-2 w-full">
                 <Button 
                   variant="outline" 
                   size="sm" 
                   onClick={prevQuestion}
                   disabled={scenarioIndex === 0}
                   className="flex-1 text-xs border-slate-700 text-slate-400 hover:bg-slate-800"
                 >
                   <ChevronLeft size={14} className="mr-1" /> Previous
                 </Button>
                 
                 <Button 
                   variant="outline" 
                   size="sm" 
                   onClick={handleAskAi}
                   disabled={isAiLoading}
                   className="flex-1 text-xs bg-indigo-600/20 text-indigo-300 border-indigo-500/30 hover:bg-indigo-600/40"
                 >
                   <Bot size={14} className="mr-1" /> {isAiLoading ? 'Analyzing...' : 'Ask AI why?'}
                 </Button>

                 <Button 
                   variant="secondary" 
                   onClick={nextQuestion} 
                   className="flex-1 text-xs border-indigo-500/20 bg-indigo-500/10"
                 >
                   {scenarioIndex === scenarios.length - 1 ? 'Finish' : 'Next'} <ChevronRight size={14} className="ml-1" />
                 </Button>
               </div>
            ) : (
              <Button 
                variant="ghost" 
                disabled 
                className="w-full text-xs text-slate-500 italic"
              >
                Choose an option to reveal navigation
              </Button>
            )}
          </div>
        </div>
      ) : (
        <GameSummary score={score} gameOver={gameOver} user={user} mistakes={mistakes} xpReward={500} onReset={resetGame} onUpdateUser={onUpdateUser} exitGame={exitGame} />
      )}
    </Card>
  );
};

const ChartMasterGame = ({ user, score, setScore, mistakes, setMistakes, gameOver, setGameOver, askAi, isAiLoading, onUpdateUser, exitGame }: GameProps) => {
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [clicked, setClicked] = useState(false);
  const [lastHit, setLastHit] = useState<boolean | null>(null);
  
  const userLevel = user.xp < 2500 ? 'beginner' : user.xp < 7500 ? 'proficient' : 'expert';
  const scenarios = useMemo(() => 
    GAME_SCENARIOS.chartMaster.filter(s => (s as any).difficulty === userLevel),
  [userLevel]);

  const isAnswered = useRef(false);
  const timerRef = useRef<any>(null);

  const resetGame = () => {
    setScenarioIndex(0);
    setClicked(false);
    setLastHit(null);
    setScore(0);
    setGameOver(false);
    setMistakes([]);
    isAnswered.current = false;
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const handleChartClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isAnswered.current) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (200 / rect.width);
    const y = (e.clientY - rect.top) * (200 / rect.height);

    const targets = scenarios[scenarioIndex].points;
    const hit = targets.some(target => {
      const dist = Math.sqrt(Math.pow(x - target.x, 2) + Math.pow(y - target.y, 2));
      return dist < 30; // Slightly tighter tolerance for accuracy
    });

    isAnswered.current = true;
    setClicked(true);
    setLastHit(hit);

    if (hit) {
      setScore(s => s + 1);
    } else {
      setMistakes(prev => [...prev, `Missed the target pattern for: ${scenarios[scenarioIndex].question}`]);
    }
  };

  const handleAskAi = () => {
    askAi(`In Chart Master game, the pattern being identified is: "${scenarios[scenarioIndex].question}". The correct targets were at coordinates ${JSON.stringify(scenarios[scenarioIndex].points)}. Help me understand how to spot this chart pattern.`);
  };

  const prevQuestion = () => {
    if (scenarioIndex > 0) {
      setClicked(false);
      setLastHit(null);
      setScenarioIndex(prev => prev - 1);
      isAnswered.current = false;
    }
  };

  const nextQuestion = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setClicked(false);
    setLastHit(null);
    if (scenarioIndex < scenarios.length - 1) {
      setScenarioIndex(prev => prev + 1);
      isAnswered.current = false;
    } else {
      setGameOver(true);
    }
  };

  return (
    <Card className="relative overflow-hidden border-indigo-500/30">
      <AnimatePresence>
        {lastHit !== null && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 2 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center pointer-events-none"
          >
            <div className="text-9xl">
              {lastHit ? '🎯' : '⭕️'}
            </div>
            <motion.h4 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "text-6xl font-black italic mt-4",
                lastHit ? "text-emerald-400" : "text-rose-400"
              )}
            >
              {lastHit ? 'ACCURATE!' : 'MISSED!'}
            </motion.h4>
          </motion.div>
        )}
      </AnimatePresence>
      {!gameOver ? (
        <div className="space-y-6" key={scenarioIndex}>
          <div className="flex justify-between items-start">
            <button onClick={exitGame} className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors group">
              <XCircle size={20} className="group-hover:text-rose-500 transition-colors" />
              <span className="text-[10px] font-black uppercase tracking-widest">Exit Challenge</span>
            </button>
            <div className="text-right">
              <span className="text-[10px] font-black text-slate-600 uppercase block leading-none mb-1">Chart Master • {scenarioIndex + 1}/{scenarios.length}</span>
              <span className="text-indigo-400 font-black text-xl leading-none">{score} <span className="text-[10px] text-slate-500 italic">XP</span></span>
            </div>
          </div>

          <div className="text-center">
            <h4 className="text-lg font-bold text-white mb-4">{scenarios[scenarioIndex].question}</h4>
            <div className="bg-slate-950 rounded-3xl p-4 border border-slate-800 relative cursor-crosshair group overflow-hidden">
              <svg viewBox="0 0 200 200" className="w-full h-64" onClick={handleChartClick}>
                {/* Background Grid */}
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#ffffff05" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
                
                {/* Simplistic candles */}
                {scenarios[scenarioIndex].chartData.map((h, i) => (
                  <motion.rect 
                    key={`${scenarioIndex}-${i}`}
                    initial={{ height: 0, y: 200 }}
                    animate={{ height: h - 20, y: 200 - h }}
                    transition={{ delay: i * 0.1, type: "spring", stiffness: 100 }}
                    x={i * 30 + 10} 
                    width="15" 
                    fill={i % 2 === 0 ? '#10b981' : '#f43f5e'} 
                    opacity="0.8" 
                    rx="2"
                  />
                ))}
                {clicked && scenarios[scenarioIndex].points.map((p, i) => (
                  <motion.circle 
                    key={i} 
                    initial={{ r: 0 }}
                    animate={{ r: [0, 45, 25] }}
                    cx={p.x} cy={p.y} 
                    fill="#6366f1" 
                    className="opacity-40"
                  />
                ))}
              </svg>
              {!clicked && <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity bg-indigo-600/10"><span className="text-xs font-bold text-indigo-400">Tap the area</span></div>}
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            {clicked ? (
               <div className="flex gap-2 w-full">
                 <Button 
                   variant="outline" 
                   size="sm" 
                   onClick={prevQuestion}
                   disabled={scenarioIndex === 0}
                   className="flex-1 text-xs border-slate-700 text-slate-400 hover:bg-slate-800"
                 >
                   <ChevronLeft size={14} className="mr-1" /> Previous
                 </Button>
                 
                 <Button 
                   variant="outline" 
                   size="sm" 
                   onClick={handleAskAi}
                   disabled={isAiLoading}
                   className="flex-1 text-xs bg-indigo-600/20 text-indigo-300 border-indigo-500/30 hover:bg-indigo-600/40"
                 >
                   <Bot size={14} className="mr-1" /> {isAiLoading ? 'Analyzing...' : 'Ask AI why?'}
                 </Button>

                 <Button 
                   variant="secondary" 
                   onClick={nextQuestion} 
                   className="flex-1 text-xs border-indigo-500/20 bg-indigo-500/10"
                 >
                   {scenarioIndex === scenarios.length - 1 ? 'Finish' : 'Next'} <ChevronRight size={14} className="ml-1" />
                 </Button>
               </div>
            ) : (
              <Button 
                variant="ghost" 
                disabled 
                className="w-full text-xs text-slate-500 italic"
              >
                Locate the pattern to reveal navigation
              </Button>
            )}
          </div>
        </div>
      ) : (
        <GameSummary score={score} gameOver={gameOver} user={user} mistakes={mistakes} xpReward={1000} onReset={resetGame} onUpdateUser={onUpdateUser} exitGame={exitGame} />
      )}
    </Card>
  );
};

const WhaleWatchGame = ({ user, score, setScore, mistakes, setMistakes, gameOver, setGameOver, askAi, isAiLoading, onUpdateUser, exitGame }: GameProps) => {
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  
  const userLevel = user.xp < 2500 ? 'beginner' : user.xp < 7500 ? 'proficient' : 'expert';
  const scenarios = useMemo(() => 
    GAME_SCENARIOS.whaleWatch.filter(s => (s as any).difficulty === userLevel),
  [userLevel]);

  const isAnswered = useRef(false);
  const timerRef = useRef<any>(null);

  const resetGame = () => {
    setScenarioIndex(0);
    setSelectedOption(null);
    setScore(0);
    setGameOver(false);
    setMistakes([]);
    isAnswered.current = false;
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const handleAction = (index: number) => {
    if (isAnswered.current) return;
    isAnswered.current = true;
    setSelectedOption(index);
    const scenario = scenarios[scenarioIndex];
    const isCorrect = index === scenario.correct;
    
    if (isCorrect) setScore(s => s + 1);
    else setMistakes(prev => [...prev, `Incorrect response to smart money move.`]);
  };

  const handleAskAi = () => {
    askAi(`Whale Watch event: ${scenarios[scenarioIndex].event}. Choices: ${scenarios[scenarioIndex].options.join(', ')}. Player chose: ${scenarios[scenarioIndex].options[selectedOption!]}. Correct was: ${scenarios[scenarioIndex].options[scenarios[scenarioIndex].correct]}.`);
  };

  const prevQuestion = () => {
    if (scenarioIndex > 0) {
      setSelectedOption(null);
      setScenarioIndex(prev => prev - 1);
      isAnswered.current = false;
    }
  };

  const nextQuestion = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setSelectedOption(null);
    if (scenarioIndex < scenarios.length - 1) {
      setScenarioIndex(prev => prev + 1);
      isAnswered.current = false;
    } else {
      setGameOver(true);
    }
  };

  return (
    <Card className="relative overflow-hidden border-indigo-500/30">
      <AnimatePresence>
        {selectedOption !== null && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 2 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center pointer-events-none"
          >
            <div className="text-9xl">
              {selectedOption === scenarios[scenarioIndex].correct ? '🐋' : '⚓️'}
            </div>
            <motion.h4 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "text-6xl font-black italic mt-4",
                selectedOption === scenarios[scenarioIndex].correct ? "text-emerald-400" : "text-rose-400"
              )}
            >
              {selectedOption === scenarios[scenarioIndex].correct ? 'WHALE MOVE!' : 'TRAPPED!'}
            </motion.h4>
          </motion.div>
        )}
      </AnimatePresence>
      {!gameOver ? (
        <div className="space-y-6" key={scenarioIndex}>
          <div className="flex justify-between items-start">
            <button onClick={exitGame} className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors group">
              <XCircle size={20} className="group-hover:text-rose-500 transition-colors" />
              <span className="text-[10px] font-black uppercase tracking-widest">Exit Challenge</span>
            </button>
            <div className="text-right">
              <span className="text-[10px] font-black text-slate-600 uppercase block leading-none mb-1">Whale Watch • {scenarioIndex + 1}/{scenarios.length}</span>
              <span className="text-indigo-400 font-black text-xl leading-none">{score} <span className="text-[10px] text-slate-500 italic">XP</span></span>
            </div>
          </div>

          <div className="bg-slate-800/10 border-2 border-dashed border-indigo-500/20 rounded-3xl p-8 text-center relative overflow-hidden">
             <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 3 }} className="text-6xl mb-4">🐋</motion.div>
             <p className="text-white font-medium italic">{scenarios[scenarioIndex].event}</p>
          </div>

          <div className="grid gap-3">
            {scenarios[scenarioIndex].options.map((opt, i) => (
              <Button 
                key={i} 
                variant={selectedOption === i ? (i === scenarios[scenarioIndex].correct ? 'primary' : 'danger') : 'secondary'}
                onClick={() => handleAction(i)}
                className="py-4 justify-between px-6"
                disabled={selectedOption !== null}
              >
                {opt}
                {selectedOption === i && (i === scenarios[scenarioIndex].correct ? <CheckCircle size={18} /> : <span>✕</span>)}
              </Button>
            ))}
          </div>

          <div className="flex flex-col gap-3 pt-4">
            {selectedOption !== null ? (
               <div className="flex gap-2 w-full">
                 <Button 
                   variant="outline" 
                   size="sm" 
                   onClick={prevQuestion}
                   disabled={scenarioIndex === 0}
                   className="flex-1 text-xs border-slate-700 text-slate-400 hover:bg-slate-800"
                 >
                   <ChevronLeft size={14} className="mr-1" /> Previous
                 </Button>
                 
                 <Button 
                   variant="outline" 
                   size="sm" 
                   onClick={handleAskAi}
                   disabled={isAiLoading}
                   className="flex-1 text-xs bg-indigo-600/20 text-indigo-300 border-indigo-500/30 hover:bg-indigo-600/40"
                 >
                   <Bot size={14} className="mr-1" /> {isAiLoading ? 'Analyzing...' : 'Ask AI why?'}
                 </Button>

                 <Button 
                   variant="secondary" 
                   onClick={nextQuestion} 
                   className="flex-1 text-xs border-indigo-500/20 bg-indigo-500/10"
                 >
                   {scenarioIndex === scenarios.length - 1 ? 'Finish' : 'Next'} <ChevronRight size={14} className="ml-1" />
                 </Button>
               </div>
            ) : (
              <Button 
                variant="ghost" 
                disabled 
                className="w-full text-xs text-slate-500 italic"
              >
                Choose an action to reveal navigation
              </Button>
            )}
          </div>
        </div>
      ) : (
        <GameSummary score={score} gameOver={gameOver} user={user} mistakes={mistakes} xpReward={2000} onReset={resetGame} onUpdateUser={onUpdateUser} exitGame={exitGame} />
      )}
    </Card>
  );
};

const ArcadeView = ({ user, onUpdateUser }: { user: UserProfile, onUpdateUser: (data: Partial<UserProfile>) => void }) => {
  const [activeGame, setActiveTab] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [mistakes, setMistakes] = useState<string[]>([]);
  const [showAiExplanation, setShowAiExplanation] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const GAMES = [
    { id: 'bull-run', title: 'Bull Run', cost: 0, icon: '🐂', desc: 'Survival mode: Protect your capital from market bears.' },
    { id: 'chart-master', title: 'Chart Master', cost: 1000, icon: '📈', desc: 'Identify patterns and trends in record time.' },
    { id: 'whale-watch', title: 'Whale Watch', cost: 1500, icon: '🐋', desc: 'Follow the smart money. Spot accumulation and traps.' }
  ];

  const handleUnlock = async (game: any) => {
    const isUnlocked = game.cost === 0 || user.unlockedGames?.includes(game.id) || user.xp >= game.cost;
    
    if (isUnlocked) {
      // If XP is high enough but not in unlockedGames array, we could persist it or just allow entry
      // For simplicity and immediate access based on XP, we check XP here
      setActiveTab(game.id);
      setScore(0);
      setGameOver(false);
      setMistakes([]);
      return;
    }

    // If not unlocked by XP
    alert(`To unlock ${game.title}, you need at least ${game.cost.toLocaleString()} XP! Current XP: ${user.xp.toLocaleString()}`);
  };

  const askAi = async (context: string) => {
    console.log("askAi triggered with context:", context);
    setIsAiLoading(true);
    try {
      const response = await getTutorResponse(`The player is playing an investing mini-game. Context: ${context}. Explain why the decision was correct or incorrect and give a quick tip.`);
      console.log("AI Response received:", response);
      if (response) {
        setShowAiExplanation(response);
      } else {
        alert("AI responded with empty content. Please try again.");
      }
    } catch (e: any) {
      console.error("AI Tutor Error:", e);
      alert(`AI Tutor Error: ${e.message || "An unknown error occurred"}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="space-y-6 relative min-h-[600px]">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black text-white italic">TRADING ARCADE</h2>
      </div>
      
      <AnimatePresence mode="wait">
        {activeGame === 'bull-run' ? (
          <motion.div key="bull" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <BullRunGame 
              user={user} 
              score={score} 
              setScore={setScore} 
              mistakes={mistakes} 
              setMistakes={setMistakes} 
              gameOver={gameOver} 
              setGameOver={setGameOver} 
              askAi={askAi} 
              isAiLoading={isAiLoading} 
              onUpdateUser={onUpdateUser} 
              exitGame={() => setActiveTab(null)} 
            />
          </motion.div>
        ) : activeGame === 'chart-master' ? (
          <motion.div key="chart" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <ChartMasterGame 
              user={user} 
              score={score} 
              setScore={setScore} 
              mistakes={mistakes} 
              setMistakes={setMistakes} 
              gameOver={gameOver} 
              setGameOver={setGameOver} 
              askAi={askAi} 
              isAiLoading={isAiLoading} 
              onUpdateUser={onUpdateUser} 
              exitGame={() => setActiveTab(null)} 
            />
          </motion.div>
        ) : activeGame === 'whale-watch' ? (
          <motion.div key="whale" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <WhaleWatchGame 
              user={user} 
              score={score} 
              setScore={setScore} 
              mistakes={mistakes} 
              setMistakes={setMistakes} 
              gameOver={gameOver} 
              setGameOver={setGameOver} 
              askAi={askAi} 
              isAiLoading={isAiLoading} 
              onUpdateUser={onUpdateUser} 
              exitGame={() => setActiveTab(null)} 
            />
          </motion.div>
        ) : (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {GAMES.map(game => {
              const isUnlocked = game.cost === 0 || user.unlockedGames?.includes(game.id) || user.xp >= game.cost;
              const progressPercent = Math.min(100, (user.xp / game.cost) * 100);
              
              return (
                <Card key={game.id} className={cn(
                  "flex flex-col justify-between transition-all relative overflow-hidden group",
                  isUnlocked ? "border-emerald-500/50 bg-emerald-500/5 shadow-lg shadow-emerald-500/5" : "border-slate-800 bg-slate-900/50 grayscale opacity-80"
                )}>
                  {!isUnlocked && (
                    <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px] flex items-center justify-center z-10">
                      <div className="bg-slate-900/90 border border-slate-700 rounded-2xl p-4 text-center shadow-2xl transform group-hover:scale-105 transition-transform">
                        <Lock size={24} className="mx-auto mb-2 text-indigo-400" />
                        <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-1">Unlocks At</p>
                        <p className="text-xl font-black text-white">{game.cost.toLocaleString()} <span className="text-xs text-indigo-400">XP</span></p>
                        <div className="mt-3 w-24 h-1 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500" style={{ width: `${progressPercent}%` }} />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <div className={cn(
                      "text-4xl w-16 h-16 rounded-2xl flex items-center justify-center transition-colors",
                      isUnlocked ? "bg-emerald-500/10" : "bg-slate-800"
                    )}>{game.icon}</div>
                    <div>
                      <h4 className="text-xl font-bold text-white flex items-center gap-2">
                        {game.title}
                        {isUnlocked && <CheckCircle size={14} className="text-emerald-500" />}
                      </h4>
                      <p className="text-slate-400 text-sm leading-relaxed">{game.desc}</p>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Trophy size={14} className={isUnlocked ? "text-indigo-400" : "text-slate-600"} />
                        <span className={cn("text-xs font-bold", isUnlocked ? "text-indigo-400" : "text-slate-600")}>
                          {game.cost > 0 ? `${game.cost.toLocaleString()} XP` : 'Starter'}
                        </span>
                      </div>
                      <Button 
                        onClick={() => handleUnlock(game)} 
                        variant={isUnlocked ? "primary" : "ghost"}
                        disabled={!isUnlocked}
                        className={cn("px-8", !isUnlocked && "border-slate-800 text-slate-600")}
                      >
                        {isUnlocked ? "Play" : "Locked"}
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAiExplanation && (
          <div className="fixed inset-0 z-[999] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md w-full"
            >
              <Card className="border-indigo-500 shadow-2xl shadow-indigo-500/20 w-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white"><Bot size={24} /></div>
                    <h4 className="text-xl font-black text-white italic">INVESTO TIPS</h4>
                  </div>
                  <button onClick={() => setShowAiExplanation(null)} className="text-slate-500 hover:text-white">✕</button>
                </div>
                <div className="prose prose-invert text-sm max-h-[400px] overflow-y-auto">
                  <div className="markdown-body p-1 text-slate-300 leading-relaxed">
                    <Markdown>{showAiExplanation}</Markdown>
                  </div>
                </div>
                <Button onClick={() => setShowAiExplanation(null)} className="w-full mt-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4">
                  Got it!
                </Button>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Main App ---

const App = () => {
  const { user: authUser, loading } = useAuth();
  const [guestUser, setGuestUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'lessons' | 'simulator' | 'chat' | 'profile' | 'arcade'>('dashboard');

  const user = authUser || guestUser;

  const handleDemo = () => {
    setGuestUser({
      uid: 'guest',
      displayName: 'Guest Trader',
      email: 'guest@example.com',
      photoURL: '',
      streak: 1,
      streakStartDate: new Date().toISOString(),
      lastSignIn: new Date().toISOString(),
      balance: INITIAL_BALANCE,
      xp: 1500, // Enough to unlock one game but not all
      completedLessons: ['intro-1', 'intro-2'], // Partial progress
      unlockedGames: ['bull-run'],
      petType: 'bull',
      botType: 'bear'
    });
    setActiveTab('arcade');
  };

  const handleUpdateUser = (data: Partial<UserProfile>) => {
    if (guestUser) {
      setGuestUser({ ...guestUser, ...data });
    } else if (authUser) {
      updateDoc(doc(db, 'users', authUser.uid), data).catch(err => {
        try {
          handleFirestoreError(err, OperationType.UPDATE, `users/${authUser.uid}`);
        } catch (e) {}
      });
    }
  };

  const handleQuizComplete = async (level: string, tab: 'lessons' | 'simulator' | 'arcade') => {
    if (user) {
      handleUpdateUser({ level: level as UserProfile['level'] });
      setActiveTab(tab);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-6xl"
        >
          🐂
        </motion.div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      {!user ? (
        <LandingView onDemo={handleDemo} />
      ) : (
        <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col">
          {/* Quiz for new users */}
          {!user.level && <QuizView onComplete={handleQuizComplete} />}
          {/* Main Content */}
          <main className="flex-1 overflow-y-auto p-6 pb-32 max-w-4xl mx-auto w-full">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {activeTab === 'dashboard' && <DashboardView user={user} onUpdateUser={handleUpdateUser} onNavigate={setActiveTab} />}
              {activeTab === 'lessons' && <LessonsView user={user} onUpdateUser={handleUpdateUser} />}
              {activeTab === 'simulator' && <SimulatorView user={user} onUpdateUser={handleUpdateUser} />}
              {activeTab === 'chat' && <ChatView user={user} />}
              {activeTab === 'arcade' && <ArcadeView user={user} onUpdateUser={handleUpdateUser} />}
              {activeTab === 'profile' && <ProfileView user={user} onUpdateUser={handleUpdateUser} />}
            </motion.div>
          </main>

          {/* Bottom Navigation */}
          <nav className="fixed bottom-0 left-0 right-0 p-6 z-40">
            <div className="max-w-md mx-auto bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-2 flex items-center justify-between shadow-2xl shadow-indigo-500/10">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={cn("p-4 rounded-2xl transition-all", activeTab === 'dashboard' ? "bg-indigo-600 text-white" : "text-slate-500 hover:text-slate-300")}
              >
                <BarChart2 size={24} />
              </button>
              <button
                onClick={() => setActiveTab('lessons')}
                className={cn("p-4 rounded-2xl transition-all", activeTab === 'lessons' ? "bg-indigo-600 text-white" : "text-slate-500 hover:text-slate-300")}
              >
                <BookOpen size={24} />
              </button>
              <button
                onClick={() => setActiveTab('simulator')}
                className={cn("p-4 rounded-2xl transition-all", activeTab === 'simulator' ? "bg-indigo-600 text-white" : "text-slate-500 hover:text-slate-300")}
              >
                <TrendingUp size={24} />
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={cn("p-4 rounded-2xl transition-all", activeTab === 'chat' ? "bg-indigo-600 text-white" : "text-slate-500 hover:text-slate-300")}
              >
                <MessageSquare size={24} />
              </button>
              <button
                onClick={() => setActiveTab('arcade')}
                className={cn("p-4 rounded-2xl transition-all", activeTab === 'arcade' ? "bg-indigo-600 text-white" : "text-slate-500 hover:text-slate-300")}
              >
                <Trophy size={24} />
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={cn("p-4 rounded-2xl transition-all", activeTab === 'profile' ? "bg-indigo-600 text-white" : "text-slate-500 hover:text-slate-300")}
              >
                <User size={24} />
              </button>
            </div>
          </nav>
        </div>
      )}
    </ErrorBoundary>
  );
};

export default App;
