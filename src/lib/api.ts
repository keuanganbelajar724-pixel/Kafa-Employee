import { Agent, TaskPriority, TaskStep } from '../types';

export interface WorkflowRunResponse {
  success: boolean;
  title: string;
  steps: TaskStep[];
  finalReport: string;
  metrics: {
    totalDurationSeconds: number;
    providerUsed: string;
    modelUsed: string;
    agentsCount: number;
  };
  error?: string;
}

export async function fetchProvidersStatus() {
  const res = await fetch('/api/providers/status');
  if (!res.ok) throw new Error('Failed to fetch provider status');
  return res.json();
}

export async function runMultiAgentTask(payload: {
  taskTitle: string;
  taskDescription: string;
  category: string;
  priority: TaskPriority;
  agents: Agent[];
  provider?: string;
}): Promise<WorkflowRunResponse> {
  const res = await fetch('/api/agent/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(errorJson.error || `Server responded with ${res.status}`);
  }

  return res.json();
}

export async function runSingleAgentStep(payload: {
  agent: Agent;
  taskTitle: string;
  taskDescription: string;
  previousContext?: string;
  provider?: string;
}) {
  const res = await fetch('/api/agent/step', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({ error: 'Step failed' }));
    throw new Error(errorJson.error || `Step failed with status ${res.status}`);
  }

  return res.json();
}

export interface CommandAgentResponse {
  success: boolean;
  agentId: string;
  agentName: string;
  role: string;
  department: string;
  specialization: string;
  output: string;
  imageUrl?: string;
  apiEngine?: any;
  providerUsed: string;
  metrics: {
    durationSeconds: number;
    timestamp: string;
  };
}

export interface SearchDataResult {
  agentId: string;
  agentName: string;
  role: string;
  department: string;
  apiEngine: any;
  output: string;
  imageUrl?: string;
  status: 'completed' | 'simulated';
}

export interface SearchDataResponse {
  success: boolean;
  mode: 'single' | 'multi';
  query: string;
  agent?: any;
  output?: string;
  imageUrl?: string;
  engineBadge?: string;
  results?: SearchDataResult[];
  providerUsed?: string;
  durationSeconds: number;
  timestamp: string;
}

export async function commandSingleAgent(payload: {
  agentId: string;
  prompt: string;
  taskTitle?: string;
  provider?: string;
  customSystemPrompt?: string;
}): Promise<CommandAgentResponse> {
  const res = await fetch('/api/command-agent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({ error: 'Perintah gagal diproses' }));
    throw new Error(errData.error || `Error status ${res.status}`);
  }

  return res.json();
}

export async function searchOfficeData(payload: {
  query: string;
  targetAgentId?: string;
}): Promise<SearchDataResponse> {
  const res = await fetch('/api/search-data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({ error: 'Pencarian data gagal diproses' }));
    throw new Error(errData.error || `Error status ${res.status}`);
  }

  return res.json();
}

export async function fetchAgentsDirectory() {
  const res = await fetch('/api/agents');
  if (!res.ok) throw new Error('Gagal memuat direktori agen');
  return res.json();
}

