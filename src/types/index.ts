export type Difficulty = 'easy' | 'medium' | 'hard';
export type Language = 'javascript' | 'typescript' | 'python' | 'html' | 'css' | 'java' | 'cpp';
export type SolutionStatus = 'pending' | 'accepted' | 'rejected';
export type UserLevel = 'beginner' | 'reviewer' | 'expert';

export interface User {
  id: string;
  nickname: string;
  avatar: string;
  trustRating: number;
  reviewBalance: number;
  reviewsCompleted: number;
  level: UserLevel;
  streak: number;
  badges: Badge[];
  joinedAt: Date;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  language: Language;
  completions: number;
  createdAt: Date;
}

export interface Solution {
  id: string;
  taskId: string;
  userId: string;
  code: string;
  status: SolutionStatus;
  reviews: Review[];
  submittedAt: Date;
}

export interface Review {
  id: string;
  solutionId: string;
  reviewerId: string;
  verdict: 'accepted' | 'rejected';
  comment: string;
  weight: number;
  createdAt: Date;
}

export interface LeaderboardEntry {
  rank: number;
  user: User;
  score: number;
}
