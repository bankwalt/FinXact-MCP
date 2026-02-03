import { ReconciliationProvider } from './context/ReconciliationContext';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import Summary from './components/Summary';
import MatchedTransactions from './components/MatchedTransactions';
import UnmatchedTransactions from './components/UnmatchedTransactions';
import './App.css';

function App() {
  return (
    <ReconciliationProvider>
      <div className="app">
        <Header />
        <main className="main-content">
          <FileUpload />
          <Summary />
          <MatchedTransactions />
          <UnmatchedTransactions />
        </main>
      </div>
    </ReconciliationProvider>
  );
}

export default App;
