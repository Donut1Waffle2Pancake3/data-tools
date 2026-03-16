/**
 * Tests for CSV Row Filter core logic (parseCSV, normalizeColumnCount, filter ops, logic all/any, mode keep/remove).
 * Run: node scripts/test-csv-row-filter.js
 */
const path = require('path');

function getDelimiterChar(val) {
  if (val === 'tab') return '\t';
  return val || ',';
}

function parseCSV(text, delimiter) {
  const delim = getDelimiterChar(delimiter);
  const normalized = (text || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  if (!normalized) return [];
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;
  for (let i = 0; i < normalized.length; i++) {
    const ch = normalized[i];
    if (ch === '"') {
      if (inQuotes && normalized[i + 1] === '"') {
        cell += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if ((ch === delim || ch === '\n') && !inQuotes) {
      if (ch === delim) {
        row.push(cell);
        cell = '';
      } else {
        row.push(cell);
        rows.push(row);
        row = [];
        cell = '';
      }
    } else {
      cell += ch;
    }
  }
  row.push(cell);
  rows.push(row);
  return rows;
}

function normalizeColumnCount(rows) {
  let numCols = 0;
  for (let r = 0; r < rows.length; r++) {
    if (rows[r].length > numCols) numCols = rows[r].length;
  }
  for (let r = 0; r < rows.length; r++) {
    while (rows[r].length < numCols) rows[r].push('');
  }
  return rows;
}

function rowMatches(cells, filters, logic) {
  return filters[logic === 'all' ? 'every' : 'some'](function (f) {
    const raw = (cells[f.colIndex] || '');
    const cell = raw.trim();
    const value = (f.value || '').trim();
    const cellLower = cell.toLowerCase();
    const valueLower = value.toLowerCase();

    switch (f.op) {
      case 'eq': return cellLower === valueLower;
      case 'neq': return cellLower !== valueLower;
      case 'contains': return cellLower.indexOf(valueLower) !== -1;
      case 'not_contains': return cellLower.indexOf(valueLower) === -1;
      case 'starts_with': return cellLower.startsWith(valueLower);
      case 'ends_with': return cellLower.endsWith(valueLower);
      case 'empty': return cell === '';
      case 'not_empty': return cell !== '';
      case 'gt':
      case 'lt':
      case 'gte':
      case 'lte': {
        const numCell = parseFloat(cell);
        const numVal = parseFloat(value);
        if (!isFinite(numCell) || !isFinite(numVal)) return false;
        if (f.op === 'gt') return numCell > numVal;
        if (f.op === 'lt') return numCell < numVal;
        if (f.op === 'gte') return numCell >= numVal;
        return numCell <= numVal;
      }
      default:
        return false;
    }
  });
}

function applyFilterLogic(rows, hasHeader, filters, logic, mode) {
  const header = hasHeader ? rows[0] : null;
  const dataRows = hasHeader ? rows.slice(1) : rows.slice(0);
  const kept = [];
  const removed = [];
  for (let i = 0; i < dataRows.length; i++) {
    const cells = dataRows[i];
    const matches = rowMatches(cells, filters, logic);
    const keep = mode === 'keep' ? matches : !matches;
    (keep ? kept : removed).push(cells);
  }
  return { header, kept, removed };
}

let passed = 0;
let failed = 0;

function ok(condition, msg) {
  if (condition) { passed++; return; }
  failed++;
  console.error('FAIL: ' + msg);
}

function same(actual, expected, msg) {
  const a = JSON.stringify(actual);
  const b = JSON.stringify(expected);
  if (a === b) { passed++; return; }
  failed++;
  console.error('FAIL: ' + msg);
  console.error('  expected: ' + b);
  console.error('  actual:   ' + a);
}

// --- parseCSV ---
const rows1 = parseCSV('id,name\n1,Alice\n2,Bob', ',');
same(rows1.length, 3, 'parseCSV 3 rows');
same(rows1[0], ['id', 'name'], 'parseCSV header');
same(rows1[1], ['1', 'Alice'], 'parseCSV row1');

const rows2 = parseCSV('x,y\n"a,b",z', ',');
same(rows2[1][0], 'a,b', 'parseCSV quoted comma');

const rowsTab = parseCSV('a\tb\n1\t2', 'tab');
same(rowsTab[0], ['a', 'b'], 'parseCSV tab delimiter');
same(rowsTab[1], ['1', '2'], 'parseCSV tab row');

// --- normalizeColumnCount ---
const ragged = [['a', 'b'], ['1']];
const norm = normalizeColumnCount(ragged.map((r) => r.slice()));
same(norm[1].length, 2, 'normalizeColumnCount padded');
same(norm[1][1], '', 'normalizeColumnCount empty cell');

// --- filter: eq ---
const data = [['id', 'name'], ['1', 'Alice'], ['2', 'Bob'], ['3', 'Alice']];
const rowsNorm = normalizeColumnCount(data.map((r) => r.slice()));
const eqFilter = [{ colIndex: 1, op: 'eq', value: 'alice' }];
const outEq = applyFilterLogic(rowsNorm, true, eqFilter, 'all', 'keep');
same(outEq.kept.length, 2, 'eq: two rows match alice (case insensitive)');
same(outEq.kept[0][1], 'Alice', 'eq: first kept');

// --- filter: neq ---
const neqFilter = [{ colIndex: 1, op: 'neq', value: 'Bob' }];
const outNeq = applyFilterLogic(rowsNorm, true, neqFilter, 'all', 'keep');
same(outNeq.kept.length, 2, 'neq: two rows not Bob');

// --- filter: contains ---
const containsFilter = [{ colIndex: 1, op: 'contains', value: 'li' }];
const outContains = applyFilterLogic(rowsNorm, true, containsFilter, 'all', 'keep');
same(outContains.kept.length, 2, 'contains: Alice x2');

// --- filter: not_contains ---
const notContainsFilter = [{ colIndex: 1, op: 'not_contains', value: 'o' }];
const outNotContains = applyFilterLogic(rowsNorm, true, notContainsFilter, 'all', 'keep');
same(outNotContains.kept.length, 2, 'not_contains: rows without o');

// --- filter: starts_with / ends_with ---
const startsFilter = [{ colIndex: 1, op: 'starts_with', value: 'Ali' }];
const outStarts = applyFilterLogic(rowsNorm, true, startsFilter, 'all', 'keep');
same(outStarts.kept.length, 2, 'starts_with: Alice x2');

const endsFilter = [{ colIndex: 1, op: 'ends_with', value: 'ce' }];
const outEnds = applyFilterLogic(rowsNorm, true, endsFilter, 'all', 'keep');
same(outEnds.kept.length, 2, 'ends_with: Alice x2');

// --- filter: empty / not_empty ---
const withEmpty = [['a', 'b'], ['1', ''], ['2', 'x']];
const normEmpty = normalizeColumnCount(withEmpty.map((r) => r.slice()));
const emptyFilter = [{ colIndex: 1, op: 'empty', value: '' }];
const outEmpty = applyFilterLogic(normEmpty, true, emptyFilter, 'all', 'keep');
same(outEmpty.kept.length, 1, 'empty: one row has empty col 1');
same(outEmpty.kept[0][0], '1', 'empty: that row is 1,');

const notEmptyFilter = [{ colIndex: 1, op: 'not_empty', value: '' }];
const outNotEmpty = applyFilterLogic(normEmpty, true, notEmptyFilter, 'all', 'keep');
same(outNotEmpty.kept.length, 1, 'not_empty: one row has non-empty col 1');

// --- filter: gt, lt, gte, lte ---
const numData = [['id', 'score'], ['a', '10'], ['b', '20'], ['c', '30']];
const numNorm = normalizeColumnCount(numData.map((r) => r.slice()));
const gtFilter = [{ colIndex: 1, op: 'gt', value: '15' }];
const outGt = applyFilterLogic(numNorm, true, gtFilter, 'all', 'keep');
same(outGt.kept.length, 2, 'gt: 20 and 30');
const ltFilter = [{ colIndex: 1, op: 'lt', value: '25' }];
const outLt = applyFilterLogic(numNorm, true, ltFilter, 'all', 'keep');
same(outLt.kept.length, 2, 'lt: 10 and 20');
const gteFilter = [{ colIndex: 1, op: 'gte', value: '20' }];
const outGte = applyFilterLogic(numNorm, true, gteFilter, 'all', 'keep');
same(outGte.kept.length, 2, 'gte: 20 and 30');
const lteFilter = [{ colIndex: 1, op: 'lte', value: '20' }];
const outLte = applyFilterLogic(numNorm, true, lteFilter, 'all', 'keep');
same(outLte.kept.length, 2, 'lte: 10 and 20');

// --- logic: any vs all ---
const twoFilters = [
  { colIndex: 1, op: 'eq', value: 'Alice' },
  { colIndex: 1, op: 'eq', value: 'Bob' }
];
const outAll = applyFilterLogic(rowsNorm, true, twoFilters, 'all', 'keep');
same(outAll.kept.length, 0, 'all: no row is both Alice and Bob');
const outAny = applyFilterLogic(rowsNorm, true, twoFilters, 'any', 'keep');
same(outAny.kept.length, 3, 'any: all three rows are Alice or Bob');

// --- mode: remove ---
const oneFilter = [{ colIndex: 1, op: 'eq', value: 'Bob' }];
const outRemove = applyFilterLogic(rowsNorm, true, oneFilter, 'all', 'remove');
same(outRemove.kept.length, 2, 'mode remove: two rows kept (not Bob)');
same(outRemove.removed.length, 1, 'mode remove: one row removed');

// --- header preserved ---
const withHeader = [['id', 'name'], ['1', 'Alice']];
const normH = normalizeColumnCount(withHeader.map((r) => r.slice()));
const res = applyFilterLogic(normH, true, [{ colIndex: 0, op: 'eq', value: '1' }], 'all', 'keep');
ok(res.header != null, 'header present when hasHeader true');
same(res.header, ['id', 'name'], 'header unchanged');
same(res.kept.length, 1, 'one data row kept');

console.log('CSV Row Filter tests: Passed: ' + passed + ', Failed: ' + failed);
process.exit(failed > 0 ? 1 : 0);
