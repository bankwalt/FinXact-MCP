/**
 * Reconciliation Engine
 * Matches bank transactions with ledger entries
 */

/**
 * Auto-match transactions between bank and ledger
 * @param {Array} bankTransactions - Bank transactions
 * @param {Array} ledgerTransactions - Ledger transactions
 * @param {Object} options - Matching options
 * @returns {Object} { matched, unmatchedBank, unmatchedLedger }
 */
export function reconcileTransactions(bankTransactions, ledgerTransactions, options = {}) {
  const {
    amountTolerance = 0.01,
    dateTolerance = 3, // days
    useDescriptionMatching = true
  } = options;

  const matched = [];
  const unmatchedBank = [...bankTransactions];
  const unmatchedLedger = [...ledgerTransactions];

  // First pass: Exact amount and date match
  for (let i = unmatchedBank.length - 1; i >= 0; i--) {
    const bankTx = unmatchedBank[i];

    for (let j = unmatchedLedger.length - 1; j >= 0; j--) {
      const ledgerTx = unmatchedLedger[j];

      const matchScore = calculateMatchScore(bankTx, ledgerTx, {
        amountTolerance,
        dateTolerance,
        useDescriptionMatching
      });

      if (matchScore >= 0.8) {
        const matchId = `match-${Date.now()}-${i}-${j}`;

        matched.push({
          id: matchId,
          bank: { ...bankTx, matched: true, matchId },
          ledger: { ...ledgerTx, matched: true, matchId },
          score: matchScore,
          matchType: getMatchType(matchScore)
        });

        unmatchedBank.splice(i, 1);
        unmatchedLedger.splice(j, 1);
        break;
      }
    }
  }

  return {
    matched,
    unmatchedBank,
    unmatchedLedger
  };
}

/**
 * Calculate match score between two transactions
 */
function calculateMatchScore(bankTx, ledgerTx, options) {
  const { amountTolerance, dateTolerance, useDescriptionMatching } = options;

  let score = 0;
  let weights = { amount: 0.5, date: 0.3, description: 0.2 };

  // Amount matching (most important)
  const amountDiff = Math.abs(bankTx.amount - ledgerTx.amount);
  if (amountDiff <= amountTolerance) {
    score += weights.amount;
  } else if (amountDiff <= amountTolerance * 10) {
    score += weights.amount * 0.5;
  }

  // Date matching
  const dateDiff = getDateDifference(bankTx.date, ledgerTx.date);
  if (dateDiff === 0) {
    score += weights.date;
  } else if (dateDiff <= dateTolerance) {
    score += weights.date * (1 - dateDiff / (dateTolerance + 1));
  }

  // Description matching (fuzzy)
  if (useDescriptionMatching && bankTx.description && ledgerTx.description) {
    const descScore = calculateStringSimilarity(
      bankTx.description.toLowerCase(),
      ledgerTx.description.toLowerCase()
    );
    score += weights.description * descScore;
  } else {
    // Redistribute weight if no description matching
    score = score / (1 - weights.description);
  }

  return score;
}

/**
 * Get the difference in days between two dates
 */
function getDateDifference(date1, date2) {
  if (!date1 || !date2) return Infinity;

  const d1 = new Date(date1);
  const d2 = new Date(date2);

  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return Infinity;

  const diffTime = Math.abs(d2 - d1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Calculate string similarity using Levenshtein distance
 */
function calculateStringSimilarity(str1, str2) {
  if (!str1 || !str2) return 0;
  if (str1 === str2) return 1;

  // Check for common words
  const words1 = str1.split(/\s+/).filter(w => w.length > 2);
  const words2 = str2.split(/\s+/).filter(w => w.length > 2);

  let matchingWords = 0;
  for (const word of words1) {
    if (words2.some(w => w.includes(word) || word.includes(w))) {
      matchingWords++;
    }
  }

  const maxWords = Math.max(words1.length, words2.length);
  if (maxWords === 0) return 0;

  return matchingWords / maxWords;
}

/**
 * Determine match type based on score
 */
function getMatchType(score) {
  if (score >= 0.95) return 'exact';
  if (score >= 0.85) return 'high';
  if (score >= 0.7) return 'medium';
  return 'low';
}

/**
 * Manually match two transactions
 */
export function manualMatch(bankTx, ledgerTx) {
  const matchId = `manual-${Date.now()}`;

  return {
    id: matchId,
    bank: { ...bankTx, matched: true, matchId },
    ledger: { ...ledgerTx, matched: true, matchId },
    score: 1,
    matchType: 'manual'
  };
}

/**
 * Unmatch a previously matched pair
 */
export function unmatch(matchedPair) {
  return {
    bank: { ...matchedPair.bank, matched: false, matchId: null },
    ledger: { ...matchedPair.ledger, matched: false, matchId: null }
  };
}

/**
 * Calculate reconciliation summary statistics
 */
export function calculateSummary(matched, unmatchedBank, unmatchedLedger) {
  const totalBankAmount = [...matched.map(m => m.bank.amount), ...unmatchedBank.map(t => t.amount)]
    .reduce((sum, amt) => sum + amt, 0);

  const totalLedgerAmount = [...matched.map(m => m.ledger.amount), ...unmatchedLedger.map(t => t.amount)]
    .reduce((sum, amt) => sum + amt, 0);

  const matchedBankAmount = matched.reduce((sum, m) => sum + m.bank.amount, 0);
  const matchedLedgerAmount = matched.reduce((sum, m) => sum + m.ledger.amount, 0);

  const unmatchedBankAmount = unmatchedBank.reduce((sum, t) => sum + t.amount, 0);
  const unmatchedLedgerAmount = unmatchedLedger.reduce((sum, t) => sum + t.amount, 0);

  const totalBankCount = matched.length + unmatchedBank.length;
  const totalLedgerCount = matched.length + unmatchedLedger.length;

  return {
    totalBankTransactions: totalBankCount,
    totalLedgerTransactions: totalLedgerCount,
    matchedCount: matched.length,
    unmatchedBankCount: unmatchedBank.length,
    unmatchedLedgerCount: unmatchedLedger.length,
    matchRate: totalBankCount > 0 ? (matched.length / totalBankCount * 100).toFixed(1) : 0,
    totalBankAmount,
    totalLedgerAmount,
    matchedBankAmount,
    matchedLedgerAmount,
    unmatchedBankAmount,
    unmatchedLedgerAmount,
    difference: totalBankAmount - totalLedgerAmount,
    isReconciled: unmatchedBank.length === 0 && unmatchedLedger.length === 0
  };
}
