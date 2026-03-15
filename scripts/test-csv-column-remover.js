/**
 * Tests for CSV Column Remover core logic (parse, header detection, column removal, serialize).
 * Run: node scripts/test-csv-column-remover.js
 */
const assert = require('assert');

function parseCSV(text) {
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
    } else if ((ch === ',' || ch === '\n') && !inQuotes) {
      if (ch === ',') {
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

function headerDisplayNames(headerCells) {
  const counts = {};
  return headerCells.map((name) => {
    const key = (name || '').trim();
    counts[key] = (counts[key] || 0) + 1;
    return counts[key] === 1 ? key : key + ' (' + counts[key] + ')';
  });
}

function detectHeaderRow(rows) {
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    for (let c = 0; c < row.length; c++) {
      if ((row[c] || '').trim() !== '') return r;
    }
  }
  return -1;
}

function escapeCsvCell(val) {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (/[",\r\n]/.test(str)) return '"' + str.replace(/"/g, '""') + '"';
  return str;
}

function rowsToCsv(rows) {
  return rows.map((cells) => cells.map(escapeCsvCell).join(',')).join('\n');
}

function removeColumns(rows, indicesToRemove) {
  const set = new Set(indicesToRemove);
  return rows.map((row) => row.filter((_, c) => !set.has(c)));
}

function normalizeColumnCount(rows) {
  let numCols = 0;
  for (let r = 0; r < rows.length; r++) {
    if (rows[r].length > numCols) numCols = rows[r].length;
  }
  const out = rows.map((row) => [...row]);
  for (let r = 0; r < out.length; r++) {
    while (out[r].length < numCols) out[r].push('');
  }
  return out;
}

// --- tests ---
let passed = 0;
let failed = 0;

function ok(condition, msg) {
  if (condition) {
    passed++;
    return;
  }
  failed++;
  console.error('FAIL: ' + msg);
}

function same(actual, expected, msg) {
  const a = JSON.stringify(actual);
  const b = JSON.stringify(expected);
  if (a === b) {
    passed++;
    return;
  }
  failed++;
  console.error('FAIL: ' + msg);
  console.error('  expected: ' + b);
  console.error('  actual:   ' + a);
}

// Basic parse
const rows1 = parseCSV('a,b,c\n1,2,3\n4,5,6');
same(rows1.length, 3, '3 rows');
same(rows1[0], ['a', 'b', 'c'], 'header row');
same(rows1[1], ['1', '2', '3'], 'data row 1');

// Quoted comma
const rows2 = parseCSV('name,note\n"Doc, Jr.",hello');
same(rows2.length, 2, '2 rows with quoted comma');
same(rows2[1][0], 'Doc, Jr.', 'quoted comma preserved');

// Escaped quote
const rows3 = parseCSV('x\n"say ""hi"""');
same(rows3[1][0], 'say "hi"', 'escaped quote');

// Empty cells
const rows4 = parseCSV('a,,c\n1,,3');
same(rows4[0], ['a', '', 'c'], 'empty middle cell');
same(rows4[1], ['1', '', '3'], 'empty middle cell data');

// Header detection
same(detectHeaderRow([['', ''], ['a', 'b'], ['1', '2']]), 1, 'header is first non-empty row');
same(detectHeaderRow([['', ''], ['', '']]), -1, 'no header when all blank');
same(detectHeaderRow([['a', 'b']]), 0, 'single row is header');

// Duplicate column names
same(headerDisplayNames(['a', 'b', 'a']), ['a', 'b', 'a (2)'], 'duplicate gets (2)');

// Normalize column count
const ragged = [['a', 'b'], ['1']];
const norm = normalizeColumnCount(ragged);
same(norm[1].length, 2, 'ragged row padded');
same(norm[1][1], '', 'padding is empty string');

// Remove one column
const data = [['a', 'b', 'c'], ['1', '2', '3'], ['4', '5', '6']];
const removed = removeColumns(data, [1]);
same(removed[0], ['a', 'c'], 'remove column index 1');
same(removed[1], ['1', '3'], 'data row');

// Round-trip: CSV -> parse -> remove -> serialize -> parse
const csvIn = 'name,email,phone\nAlice,a@b.com,555-001\nBob,b@c.com,555-002';
const parsed = parseCSV(csvIn);
const hi = detectHeaderRow(parsed);
same(hi, 0, 'header at 0');
const normalized = normalizeColumnCount(parsed);
const withoutEmail = removeColumns(normalized, [1]);
const csvOut = rowsToCsv(withoutEmail);
same(csvOut, 'name,phone\nAlice,555-001\nBob,555-002', 'round-trip remove column');

// Quoted output when needed
const withComma = [['a', 'b'], ['x,y', 'z']];
same(rowsToCsv(withComma), 'a,b\n"x,y",z', 'comma in cell is quoted');

console.log('Passed: ' + passed + ', Failed: ' + failed);
process.exit(failed > 0 ? 1 : 0);
