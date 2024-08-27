import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';

type User = { id: number; username: string };
type Answer = { id: number; question_id: number; answer: string };
type EloRanking = { id: number; answer: string; score: number };

interface GameContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  answers: Answer[];
  rankings: EloRanking[];
  progress: number;
  saveAnswer: (newAnswer: { questionId: number; answer: string; losingAnswer: string }) => Promise<void>;
  clearAnswers: () => Promise<void>;
  fetchAnswersAndRankings: () => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [rankings, setRankings] = useState<EloRanking[]>([]);
  const [progress, setProgress] = useState(0);

  const fetchAnswersAndRankings = useCallback(async () => {
    if (user) {
      try {
        const response = await fetch('/api/answers');
        const data = await response.json();
        setAnswers(data.answers);
        setRankings(data.rankings);
        setProgress(Math.min(data.answers.length / 20 * 100, 100));
      } catch (error) {
        console.error('Error fetching answers and rankings:', error);
      }
    }
  }, [user]);

  const saveAnswer = useCallback(async (newAnswer: { questionId: number; answer: string; losingAnswer: string }) => {
    if (user) {
      try {
        await fetch('/api/answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newAnswer),
        });
        await fetchAnswersAndRankings();
      } catch (error) {
        console.error('Error saving answer:', error);
      }
    }
  }, [user, fetchAnswersAndRankings]);

  const clearAnswers = useCallback(async () => {
    if (user) {
      try {
        await fetch('/api/clear-answers', { method: 'POST' });
        setAnswers([]);
        setRankings([]);
        setProgress(0);
      } catch (error) {
        console.error('Error clearing answers:', error);
      }
    }
  }, [user]);

  const login = useCallback(async (username: string, password: string) => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) {
        throw new Error('Login failed');
      }
      const userData = await response.json();
      setUser(userData);
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  }, []);

  const register = useCallback(async (username: string, password: string) => {
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) {
        throw new Error('Registration failed');
      }
      const userData = await response.json();
      setUser(userData);
    } catch (error) {
      console.error('Error during registration:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setAnswers([]);
    setRankings([]);
    setProgress(0);
  }, []);

  useEffect(() => {
    if (user) {
      fetchAnswersAndRankings();
    }
  }, [user, fetchAnswersAndRankings]);

  return (
    <GameContext.Provider value={{ 
      user, setUser, answers, rankings, progress, 
      saveAnswer, clearAnswers, fetchAnswersAndRankings,
      login, register, logout
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
