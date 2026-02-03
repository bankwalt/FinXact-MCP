/**
 * Parse CSV content into an array of transaction objects
 * @param {string} content - Raw CSV content
 * @param {string} type - 'bank' or 'ledger'
 * @returns {Array} Array of transaction objects
 */
export function parseCSV(content, type) {
  const lines = content.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim());
  const transactions = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === 0) continue;

    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index]?.trim() || '';
    });

    const transaction = normalizeTransaction(row, type, i);
    if (transaction) {
      transactions.push(transaction);
    }
  }

  return transactions;
}

/**
 * Parse a single CSV line, handling quoted values
 */
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);

  return result.map(val => val.replace(/^"|"$/g, '').trim());
}

/**
 * Normalize transaction data to a common format
 */
function normalizeTransaction(row, type, index) {
  // Try to find date field
  const dateField = findField(row, ['date', 'transaction_date', 'trans_date', 'posting_date']);
  // Try to find amount field
  const amountField = findField(row, ['amount', 'transaction_amount', 'trans_amount', 'value']);
  // Try to find description field
  const descField = findField(row, ['description', 'desc', 'memo', 'narrative', 'details', 'reference']);

  if (!dateField || !amountField) return null;

  const amount = parseAmount(row[amountField]);
  if (isNaN(amount)) return null;

  return {
    id: `${type}-${index}-${Date.now()}`,
    date: parseDate(row[dateField]),
    rawDate: row[dateField],
    amount: amount,
    description: row[descField] || '',
    type: type,
    matched: false,
    matchId: null,
    original: row
  };
}

/**
 * Find a field in the row by checking multiple possible names
 */
function findField(row, possibleNames) {
  const keys = Object.keys(row);
  for (const name of possibleNames) {
    const found = keys.find(k => k.toLowerCase().includes(name.toLowerCase()));
    if (found) return found;
  }
  return null;
}

/**
 * Parse amount string to number
 */
function parseAmount(value) {
  if (!value) return NaN;
  // Remove currency symbols, spaces, and handle parentheses for negative
  let cleaned = value.toString()
    .replace(/[$€£¥,\s]/g, '')
    .trim();

  // Handle parentheses as negative
  if (cleaned.startsWith('(') && cleaned.endsWith(')')) {
    cleaned = '-' + cleaned.slice(1, -1);
  }

  return parseFloat(cleaned);
}

/**
 * Parse date string to standardized format
 */
function parseDate(value) {
  if (!value) return null;

  const date = new Date(value);
  if (!isNaN(date.getTime())) {
    return date.toISOString().split('T')[0];
  }

  // Try MM/DD/YYYY format
  const parts = value.split(/[/-]/);
  if (parts.length === 3) {
    const [a, b, c] = parts.map(p => parseInt(p, 10));
    // Assume MM/DD/YYYY
    if (a <= 12) {
      const year = c < 100 ? 2000 + c : c;
      return `${year}-${String(a).padStart(2, '0')}-${String(b).padStart(2, '0')}`;
    }
  }

  return value;
}

/**
 * Generate sample CSV content for demo purposes
 */
export function generateSampleBankCSV() {
  return `Date,Description,Amount
2024-01-15,Wire Transfer - ABC Corp,5000.00
2024-01-16,Check #1234,-1500.00
2024-01-17,ACH Payment - XYZ Ltd,2500.00
2024-01-18,Wire Transfer - DEF Inc,-3000.00
2024-01-19,Deposit,10000.00
2024-01-20,Service Fee,-25.00`;
}

export function generateSampleLedgerCSV() {
  return `Date,Description,Amount
2024-01-15,Payment from ABC Corp,5000.00
2024-01-16,Payment to Vendor,-1500.00
2024-01-17,Payment from XYZ Ltd,2500.00
2024-01-18,Payment to DEF Inc,-3000.00
2024-01-19,Capital Contribution,10000.00
2024-01-22,Office Supplies,-150.00`;
}
