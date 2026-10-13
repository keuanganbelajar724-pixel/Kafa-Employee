export type AgentStatus = 'idle' | 'working' | 'collaborating' | 'offline';

export type Department = 
  | 'Leadership' 
  | 'Research' 
  | 'Engineering' 
  | 'Content' 
  | 'Quality Assurance'
  | 'Growth & Marketing'
  | 'Finance'
  | 'Cybersecurity'
  | 'Product'
  | 'Legal';

export type BehaviorState = 
  | 'at_desk' 
  | 'walking' 
  | 'coffee_break' 
  | 'meeting' 
  | 'chatting' 
  | 'whiteboard' 
  | 'water_cooler' 
  | 'gym' 
  | 'break_room' 
  | 'kitchen' 
  | 'toilet'
  | 'watering_garden'
  | 'in_garage'
  | 'searching_data';

export interface AgentApiEngine {
  engineName: string;
  engineType: 'chatgpt' | 'gemini' | 'dreamina' | 'claude' | 'deepseek' | 'perplexity' | 'fingpt' | 'cybersec' | 'notion' | 'harvey';
  badge: string;
  icon: string;
  provider: string;
  description: string;
  category: string;
  capabilities: string[];
  imageUrl?: string;
}

export interface Agent {
  id: string;
  userId?: string;
  name: string;
  role: string;
  department: Department;
  status: AgentStatus;
  currentAction?: string;
  currentTaskId?: string;
  avatar3d: string;
  deskPosition: { x: number; y: number };
  currentPos?: { x: number; y: number };
  targetPos?: { x: number; y: number };
  behaviorState?: BehaviorState;
  facingDirection?: 'left' | 'right';
  speechBubble?: {
    text: string;
    expiresAt: number;
    type?: 'chat' | 'thought' | 'action';
  } | null;
  color: string;
  accentBg: string;
  model: string;
  apiEngine?: AgentApiEngine;
  systemPrompt: string;
  skills: string[];
  tasksCompleted: number;
  bio: string;
}

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

export interface TaskStep {
  id: string;
  agentId: string;
  agentName: string;
  stageName: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  summary?: string;
  details?: string;
  timestamp: string;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  priority: TaskPriority;
  status: TaskStatus;
  provider: string;
  assignedAgents: string[];
  steps: TaskStep[];
  finalReport?: string;
  metrics?: {
    totalDurationSeconds?: number;
    tokensUsed?: number;
    providerUsed?: string;
    modelUsed?: string;
    agentsCount?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  agentId: string;
  agentName: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface ProviderStatus {
  id: 'gemini' | 'groq' | 'openrouter';
  name: string;
  isAvailable: boolean;
  model: string;
  tier: 'Free' | 'Tier-1';
  rateLimit: string;
  requestsCount: number;
  lastUsed?: string;
  statusText: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role?: string;
  createdAt: string;
}
