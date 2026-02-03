import { useReconciliation } from '../context/ReconciliationContext';

export default function Summary() {
  const { summary, isReconciled } = useReconciliation();

  if (!isReconciled || !summary) return null;

  const formatAmount = (amount) => {
    const formatted = Math.abs(amount).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD'
    });
    return amount < 0 ? `-${formatted}` : formatted;
  };

  const isFullyReconciled = summary.unmatchedBankCount === 0 && summary.unmatchedLedgerCount === 0;

  return (
    <div className="summary-section">
      <div className={`reconciliation-status ${isFullyReconciled ? 'reconciled' : 'pending'}`}>
        {isFullyReconciled ? (
          <>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span>Fully Reconciled</span>
          </>
        ) : (
          <>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>Reconciliation In Progress</span>
          </>
        )}
      </div>

      <div className="summary-grid">
        <div className="summary-card">
          <div className="summary-label">Match Rate</div>
          <div className="summary-value highlight">{summary.matchRate}%</div>
        </div>

        <div className="summary-card">
          <div className="summary-label">Matched</div>
          <div className="summary-value">{summary.matchedCount}</div>
        </div>

        <div className="summary-card">
          <div className="summary-label">Unmatched Bank</div>
          <div className={`summary-value ${summary.unmatchedBankCount > 0 ? 'warning' : ''}`}>
            {summary.unmatchedBankCount}
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-label">Unmatched Ledger</div>
          <div className={`summary-value ${summary.unmatchedLedgerCount > 0 ? 'warning' : ''}`}>
            {summary.unmatchedLedgerCount}
          </div>
        </div>
      </div>

      <div className="amounts-summary">
        <table className="amounts-table">
          <thead>
            <tr>
              <th></th>
              <th>Bank</th>
              <th>Ledger</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Matched Total</td>
              <td>{formatAmount(summary.matchedBankAmount)}</td>
              <td>{formatAmount(summary.matchedLedgerAmount)}</td>
            </tr>
            <tr>
              <td>Unmatched Total</td>
              <td className={summary.unmatchedBankAmount !== 0 ? 'warning' : ''}>
                {formatAmount(summary.unmatchedBankAmount)}
              </td>
              <td className={summary.unmatchedLedgerAmount !== 0 ? 'warning' : ''}>
                {formatAmount(summary.unmatchedLedgerAmount)}
              </td>
            </tr>
            <tr className="total-row">
              <td>Grand Total</td>
              <td>{formatAmount(summary.totalBankAmount)}</td>
              <td>{formatAmount(summary.totalLedgerAmount)}</td>
            </tr>
          </tbody>
        </table>

        {summary.difference !== 0 && (
          <div className="difference-alert">
            <span className="label">Difference:</span>
            <span className={`value ${Math.abs(summary.difference) > 0.01 ? 'error' : ''}`}>
              {formatAmount(summary.difference)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
