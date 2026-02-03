import { useReconciliation } from '../context/ReconciliationContext';

export default function MatchedTransactions() {
  const { matched, performUnmatch } = useReconciliation();

  const formatAmount = (amount) => {
    const formatted = Math.abs(amount).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD'
    });
    return amount < 0 ? `(${formatted})` : formatted;
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getMatchBadge = (matchType) => {
    const badges = {
      exact: { label: 'Exact', className: 'badge-exact' },
      high: { label: 'High', className: 'badge-high' },
      medium: { label: 'Medium', className: 'badge-medium' },
      manual: { label: 'Manual', className: 'badge-manual' },
      low: { label: 'Low', className: 'badge-low' }
    };
    return badges[matchType] || badges.low;
  };

  if (matched.length === 0) {
    return null;
  }

  return (
    <div className="matched-section">
      <div className="section-header">
        <h2>Matched Transactions</h2>
        <span className="count-badge">{matched.length}</span>
      </div>

      <div className="matched-list">
        {matched.map((match) => {
          const badge = getMatchBadge(match.matchType);
          return (
            <div key={match.id} className="matched-pair">
              <div className="match-indicator">
                <span className={`match-badge ${badge.className}`}>
                  {badge.label}
                </span>
              </div>

              <div className="match-details">
                <div className="match-row bank-row">
                  <span className="source-label">Bank</span>
                  <span className="date">{formatDate(match.bank.date)}</span>
                  <span className="description">{match.bank.description || '-'}</span>
                  <span className={`amount ${match.bank.amount < 0 ? 'negative' : 'positive'}`}>
                    {formatAmount(match.bank.amount)}
                  </span>
                </div>

                <div className="match-row ledger-row">
                  <span className="source-label">Ledger</span>
                  <span className="date">{formatDate(match.ledger.date)}</span>
                  <span className="description">{match.ledger.description || '-'}</span>
                  <span className={`amount ${match.ledger.amount < 0 ? 'negative' : 'positive'}`}>
                    {formatAmount(match.ledger.amount)}
                  </span>
                </div>
              </div>

              <button
                className="unmatch-btn"
                onClick={() => performUnmatch(match.id)}
                title="Unmatch"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
