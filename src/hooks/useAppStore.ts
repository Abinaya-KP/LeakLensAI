import { useState, useCallback, useEffect } from 'react';
import { Transaction, AppState, RecoveryAction, RecoveryResult } from '@/types';
import { SAMPLE_TRANSACTIONS } from '@/constants/sampleData';
import { analyzeTransactions, computeMetrics, generateRecoveryActions } from '@/lib/analysisEngine';

const STORAGE_KEY = 'leaklens_state';

function buildState(transactions: Transaction[], existingActions?: RecoveryAction[]): Omit<AppState, 'isLoaded'> {
  const { leaks, totalLeakage } = analyzeTransactions(transactions);
  const recoveredRevenue = existingActions
    ? existingActions.filter(a => a.status === 'executed').reduce((s, a) => s + (a.result?.recovered || 0), 0)
    : 0;
  const metrics = computeMetrics(transactions, leaks, recoveredRevenue);
  const actions = existingActions || generateRecoveryActions(leaks);
  return { transactions, leaks, recoveryActions: actions, metrics };
}

export function useAppStore() {
  const [state, setState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...parsed, isLoaded: true };
      }
    } catch {}
    const initial = buildState(SAMPLE_TRANSACTIONS);
    return { ...initial, isLoaded: true };
  });

  const saveState = useCallback((newState: AppState) => {
    setState(newState);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    } catch {}
  }, []);

  const loadTransactions = useCallback((transactions: Transaction[]) => {
    const built = buildState(transactions);
    saveState({ ...built, isLoaded: true });
  }, [saveState]);

  const approveRecoveryAction = useCallback((actionId: string) => {
    setState(prev => {
      const newActions = prev.recoveryActions.map(a => {
        if (a.id !== actionId) return a;
        const recovered = Math.round(a.estimatedRecovery * (0.6 + Math.random() * 0.2));
        const result: RecoveryResult = {
          targeted: a.targetedAmount,
          recovered,
          recoveryRate: Math.round((recovered / a.targetedAmount) * 100),
          customersRecovered: Math.round(a.affectedCustomers * 0.65),
          stillAtRisk: a.targetedAmount - recovered,
          executedAt: new Date().toISOString(),
        };
        return { ...a, status: 'executed' as const, executedAt: new Date().toISOString(), result };
      });
      const recoveredRevenue = newActions.filter(a => a.status === 'executed').reduce((s, a) => s + (a.result?.recovered || 0), 0);
      const newMetrics = computeMetrics(prev.transactions, prev.leaks, recoveredRevenue);
      const newState = { ...prev, recoveryActions: newActions, metrics: newMetrics };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(newState)); } catch {}
      return newState;
    });
  }, []);

  const rejectRecoveryAction = useCallback((actionId: string) => {
    setState(prev => {
      const newState = {
        ...prev,
        recoveryActions: prev.recoveryActions.map(a =>
          a.id === actionId ? { ...a, status: 'rejected' as const } : a
        ),
      };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(newState)); } catch {}
      return newState;
    });
  }, []);

  const resetToSample = useCallback(() => {
    const built = buildState(SAMPLE_TRANSACTIONS);
    const newState = { ...built, isLoaded: true };
    saveState(newState);
  }, [saveState]);

  return {
    ...state,
    loadTransactions,
    approveRecoveryAction,
    rejectRecoveryAction,
    resetToSample,
  };
}
