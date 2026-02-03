import { createContext, useContext, useReducer, useCallback } from 'react';
import { reconcileTransactions, manualMatch, unmatch, calculateSummary } from '../utils/reconciliationEngine';

const ReconciliationContext = createContext(null);

const initialState = {
  bankTransactions: [],
  ledgerTransactions: [],
  matched: [],
  unmatchedBank: [],
  unmatchedLedger: [],
  summary: null,
  bankFileName: null,
  ledgerFileName: null,
  isReconciled: false
};

function reconciliationReducer(state, action) {
  switch (action.type) {
    case 'SET_BANK_TRANSACTIONS': {
      return {
        ...state,
        bankTransactions: action.payload.transactions,
        bankFileName: action.payload.fileName,
        isReconciled: false
      };
    }

    case 'SET_LEDGER_TRANSACTIONS': {
      return {
        ...state,
        ledgerTransactions: action.payload.transactions,
        ledgerFileName: action.payload.fileName,
        isReconciled: false
      };
    }

    case 'RUN_RECONCILIATION': {
      const { matched, unmatchedBank, unmatchedLedger } = reconcileTransactions(
        state.bankTransactions,
        state.ledgerTransactions,
        action.payload?.options
      );

      const summary = calculateSummary(matched, unmatchedBank, unmatchedLedger);

      return {
        ...state,
        matched,
        unmatchedBank,
        unmatchedLedger,
        summary,
        isReconciled: true
      };
    }

    case 'MANUAL_MATCH': {
      const { bankTx, ledgerTx } = action.payload;
      const matchedPair = manualMatch(bankTx, ledgerTx);

      const newMatched = [...state.matched, matchedPair];
      const newUnmatchedBank = state.unmatchedBank.filter(t => t.id !== bankTx.id);
      const newUnmatchedLedger = state.unmatchedLedger.filter(t => t.id !== ledgerTx.id);

      const summary = calculateSummary(newMatched, newUnmatchedBank, newUnmatchedLedger);

      return {
        ...state,
        matched: newMatched,
        unmatchedBank: newUnmatchedBank,
        unmatchedLedger: newUnmatchedLedger,
        summary
      };
    }

    case 'UNMATCH': {
      const matchId = action.payload;
      const matchedPair = state.matched.find(m => m.id === matchId);

      if (!matchedPair) return state;

      const { bank, ledger } = unmatch(matchedPair);

      const newMatched = state.matched.filter(m => m.id !== matchId);
      const newUnmatchedBank = [...state.unmatchedBank, bank];
      const newUnmatchedLedger = [...state.unmatchedLedger, ledger];

      const summary = calculateSummary(newMatched, newUnmatchedBank, newUnmatchedLedger);

      return {
        ...state,
        matched: newMatched,
        unmatchedBank: newUnmatchedBank,
        unmatchedLedger: newUnmatchedLedger,
        summary
      };
    }

    case 'RESET': {
      return initialState;
    }

    default:
      return state;
  }
}

export function ReconciliationProvider({ children }) {
  const [state, dispatch] = useReducer(reconciliationReducer, initialState);

  const setBankTransactions = useCallback((transactions, fileName) => {
    dispatch({ type: 'SET_BANK_TRANSACTIONS', payload: { transactions, fileName } });
  }, []);

  const setLedgerTransactions = useCallback((transactions, fileName) => {
    dispatch({ type: 'SET_LEDGER_TRANSACTIONS', payload: { transactions, fileName } });
  }, []);

  const runReconciliation = useCallback((options) => {
    dispatch({ type: 'RUN_RECONCILIATION', payload: { options } });
  }, []);

  const performManualMatch = useCallback((bankTx, ledgerTx) => {
    dispatch({ type: 'MANUAL_MATCH', payload: { bankTx, ledgerTx } });
  }, []);

  const performUnmatch = useCallback((matchId) => {
    dispatch({ type: 'UNMATCH', payload: matchId });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const value = {
    ...state,
    setBankTransactions,
    setLedgerTransactions,
    runReconciliation,
    performManualMatch,
    performUnmatch,
    reset,
    canReconcile: state.bankTransactions.length > 0 && state.ledgerTransactions.length > 0
  };

  return (
    <ReconciliationContext.Provider value={value}>
      {children}
    </ReconciliationContext.Provider>
  );
}

export function useReconciliation() {
  const context = useContext(ReconciliationContext);
  if (!context) {
    throw new Error('useReconciliation must be used within a ReconciliationProvider');
  }
  return context;
}
