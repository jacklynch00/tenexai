export interface SavedAnalysis {
  id: string;
  title: string;
  jobDescription: string;
  industry: string;
  analysis: any;
  createdAt: string;
}

const STORAGE_KEY = 'ai-opportunity-scanner-history';

export function generateId(): string {
  return `analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function saveAnalysis(data: Omit<SavedAnalysis, 'id' | 'createdAt'>): SavedAnalysis {
  const analysis: SavedAnalysis = {
    ...data,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };

  const history = getAnalysisHistory();
  history.unshift(analysis); // Add to beginning
  
  // Keep only last 20 analyses
  if (history.length > 20) {
    history.pop();
  }

  if (typeof window !== 'undefined') {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }

  return analysis;
}

export function getAnalysisHistory(): SavedAnalysis[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const data = sessionStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading analysis history:', error);
    return [];
  }
}

export function getAnalysisById(id: string): SavedAnalysis | null {
  const history = getAnalysisHistory();
  return history.find(item => item.id === id) || null;
}

export function clearHistory(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(STORAGE_KEY);
  }
}

export function deleteAnalysis(id: string): void {
  const history = getAnalysisHistory();
  const filtered = history.filter(item => item.id !== id);
  
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  }
}