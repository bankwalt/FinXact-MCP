import { useState } from 'react';
import { useReconciliation } from '../context/ReconciliationContext';
import TransactionTable from './TransactionTable';

export default function UnmatchedTransactions() {
  const { unmatchedBank, unmatchedLedger, performManualMatch } = useReconciliation();
  const [selectedBank, setSelectedBank] = useState(null);
  const [selectedLedger, setSelectedLedger] = useState(null);

  const handleManualMatch = () => {
    if (selectedBank && selectedLedger) {
      performManualMatch(selectedBank, selectedLedger);
      setSelectedBank(null);
      setSelectedLedger(null);
    }
  };

  if (unmatchedBank.length === 0 && unmatchedLedger.length === 0) {
    return null;
  }

  return (
    <div className="unmatched-section">
      <div className="section-header">
        <h2>Unmatched Transactions</h2>
        {(selectedBank || selectedLedger) && (
          <button
            className="btn btn-primary btn-sm"
            onClick={handleManualMatch}
            disabled={!selectedBank || !selectedLedger}
          >
            Match Selected
          </button>
        )}
      </div>

      <div className="unmatched-grid">
        <div className="unmatched-column">
          <div className="column-header">
            <h3>Bank Statement</h3>
            <span className="count-badge">{unmatchedBank.length}</span>
          </div>
          <TransactionTable
            transactions={unmatchedBank}
            type="bank"
            showSelect={true}
            selectedId={selectedBank?.id}
            onSelect={setSelectedBank}
          />
        </div>

        <div className="unmatched-column">
          <div className="column-header">
            <h3>General Ledger</h3>
            <span className="count-badge">{unmatchedLedger.length}</span>
          </div>
          <TransactionTable
            transactions={unmatchedLedger}
            type="ledger"
            showSelect={true}
            selectedId={selectedLedger?.id}
            onSelect={setSelectedLedger}
          />
        </div>
      </div>

      {(selectedBank || selectedLedger) && (
        <div className="selection-summary">
          <div className="selection-item">
            <span className="label">Bank:</span>
            {selectedBank ? (
              <span className="value">{selectedBank.description} ({formatAmount(selectedBank.amount)})</span>
            ) : (
              <span className="placeholder">Select a bank transaction</span>
            )}
          </div>
          <div className="selection-item">
            <span className="label">Ledger:</span>
            {selectedLedger ? (
              <span className="value">{selectedLedger.description} ({formatAmount(selectedLedger.amount)})</span>
            ) : (
              <span className="placeholder">Select a ledger transaction</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function formatAmount(amount) {
  const formatted = Math.abs(amount).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD'
  });
  return amount < 0 ? `(${formatted})` : formatted;
}
