import { useCallback } from 'react';
import { useReconciliation } from '../context/ReconciliationContext';
import { parseCSV, generateSampleBankCSV, generateSampleLedgerCSV } from '../utils/csvParser';

export default function FileUpload() {
  const {
    setBankTransactions,
    setLedgerTransactions,
    runReconciliation,
    bankTransactions,
    ledgerTransactions,
    canReconcile,
    isReconciled
  } = useReconciliation();

  const handleFileUpload = useCallback((event, type) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content === 'string') {
        const transactions = parseCSV(content, type);
        if (type === 'bank') {
          setBankTransactions(transactions, file.name);
        } else {
          setLedgerTransactions(transactions, file.name);
        }
      }
    };
    reader.readAsText(file);
  }, [setBankTransactions, setLedgerTransactions]);

  const loadSampleData = useCallback(() => {
    const bankTransactions = parseCSV(generateSampleBankCSV(), 'bank');
    const ledgerTransactions = parseCSV(generateSampleLedgerCSV(), 'ledger');
    setBankTransactions(bankTransactions, 'sample_bank.csv');
    setLedgerTransactions(ledgerTransactions, 'sample_ledger.csv');
  }, [setBankTransactions, setLedgerTransactions]);

  if (isReconciled) return null;

  return (
    <div className="file-upload-section">
      <div className="upload-grid">
        <div className="upload-card">
          <div className="upload-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18M9 21V9" />
            </svg>
          </div>
          <h3>Bank Statement</h3>
          <p>Upload your bank transaction export (CSV)</p>
          <label className="upload-btn">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => handleFileUpload(e, 'bank')}
              hidden
            />
            {bankTransactions.length > 0 ? (
              <span className="success">
                {bankTransactions.length} transactions loaded
              </span>
            ) : (
              'Select File'
            )}
          </label>
        </div>

        <div className="upload-card">
          <div className="upload-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <h3>General Ledger</h3>
          <p>Upload your accounting ledger export (CSV)</p>
          <label className="upload-btn">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => handleFileUpload(e, 'ledger')}
              hidden
            />
            {ledgerTransactions.length > 0 ? (
              <span className="success">
                {ledgerTransactions.length} transactions loaded
              </span>
            ) : (
              'Select File'
            )}
          </label>
        </div>
      </div>

      <div className="upload-actions">
        <button
          onClick={loadSampleData}
          className="btn btn-secondary"
        >
          Load Sample Data
        </button>

        <button
          onClick={() => runReconciliation()}
          disabled={!canReconcile}
          className="btn btn-primary"
        >
          Run Reconciliation
        </button>
      </div>
    </div>
  );
}
