import { useReconciliation } from '../context/ReconciliationContext';

export default function Header() {
  const { reset, isReconciled, bankFileName, ledgerFileName } = useReconciliation();

  return (
    <header className="header">
      <div className="header-left">
        <h1>Bank Reconciliation</h1>
        {(bankFileName || ledgerFileName) && (
          <div className="file-badges">
            {bankFileName && <span className="badge bank">Bank: {bankFileName}</span>}
            {ledgerFileName && <span className="badge ledger">Ledger: {ledgerFileName}</span>}
          </div>
        )}
      </div>
      <div className="header-right">
        {isReconciled && (
          <button onClick={reset} className="btn btn-secondary">
            Start Over
          </button>
        )}
      </div>
    </header>
  );
}
