export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  level?: 'beginner' | 'proficient' | 'expert';
  streak: number;
  streakStartDate?: string;
  lastSignIn: string;
  balance: number;
  xp: number;
  completedLessons: string[];
  lastRewardClaimedAt?: string;
  petType?: 'bull' | 'bear';
  botType?: 'bull' | 'bear';
  unlockedGames?: string[];
}

export interface Trade {
  id?: string;
  uid: string;
  symbol: string;
  type: 'buy' | 'sell';
  entryPrice: number;
  exitPrice?: number;
  amount: number;
  status: 'open' | 'closed';
  takeProfit?: number;
  stopLoss?: number;
  timestamp: any;
  profit?: number;
}

export interface SubTopic {
  id: string;
  title: string;
  content: string;
  funFact?: string;
  visualData?: any;
  quickQuestion?: QuizQuestion;
}

export type QuestionType = 'MCQ' | 'WQ' | 'TQ' | 'MQ';

export interface QuizQuestion {
  question: string;
  type: QuestionType;
  options?: string[]; // For MCQ, TQ
  correctAnswer?: number | string | number[]; // MCQ (index), WQ (text), TQ (indices)
  pairs?: { left: string; right: string }[]; // For MQ
  explanation: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  section: 'Assets' | 'Terminology' | 'Analysis';
  category: string;
  content: string;
  xpReward: number;
  subTopics: SubTopic[];
  quiz: QuizQuestion[];
  videoUrl?: string;
  articleUrl?: string;
}

export interface LessonProgress {
  uid: string;
  lessonId: string;
  completed: boolean;
  score: number;
  timestamp: any;
}
