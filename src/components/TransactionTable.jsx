export default function TransactionTable({ transactions, type, onSelect, selectedId, showSelect = false }) {
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
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (transactions.length === 0) {
    return (
      <div className="empty-state">
        <p>No transactions</p>
      </div>
    );
  }

  return (
    <div className="transaction-table-wrapper">
      <table className="transaction-table">
        <thead>
          <tr>
            {showSelect && <th style={{ width: '40px' }}></th>}
            <th>Date</th>
            <th>Description</th>
            <th className="amount-col">Amount</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr
              key={tx.id}
              className={`
                ${tx.amount < 0 ? 'debit' : 'credit'}
                ${selectedId === tx.id ? 'selected' : ''}
                ${showSelect ? 'selectable' : ''}
              `}
              onClick={() => showSelect && onSelect?.(tx)}
            >
              {showSelect && (
                <td>
                  <input
                    type="radio"
                    checked={selectedId === tx.id}
                    onChange={() => onSelect?.(tx)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </td>
              )}
              <td className="date-col">{formatDate(tx.date)}</td>
              <td className="desc-col">{tx.description || '-'}</td>
              <td className={`amount-col ${tx.amount < 0 ? 'negative' : 'positive'}`}>
                {formatAmount(tx.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
