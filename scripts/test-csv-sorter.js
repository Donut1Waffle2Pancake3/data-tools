/**
 * Tests for CSV Sorter core logic (parse, normalize, detectValueType, toSortKey, compareKeys, sort, serialize).
 * Run: node scripts/test-csv-sorter.js
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
      if (inQuotes && normalized[i + 1] === '"') { cell += '"'; i++; } else { inQuotes = !inQuotes; }
    } else if ((ch === ',' || ch === '\n') && !inQuotes) {
      if (ch === ',') { row.push(cell); cell = ''; } else { row.push(cell); rows.push(row); row = []; cell = ''; }
    } else { cell += ch; }
  }
  row.push(cell);
  rows.push(row);
  return rows;
}

function normalizeColumnCount(rows) {
  let numCols = 0;
  for (let r = 0; r < rows.length; r++) if (rows[r].length > numCols) numCols = rows[r].length;
  for (let r = 0; r < rows.length; r++) while (rows[r].length < numCols) rows[r].push('');
  return rows;
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

function detectValueType(values) {
  let numeric = 0, dateLike = 0, sample = 0;
  for (let i = 0; i < values.length && sample < 100; i++) {
    const v = (values[i] || '').trim();
    if (v === '') continue;
    sample++;
    if (!isNaN(parseFloat(v)) && /^-?\d*\.?\d*$/.test(v.trim())) numeric++;
    else if (/^\d{4}-\d{2}-\d{2}/.test(v) || /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/.test(v)) dateLike++;
  }
  if (sample === 0) return 'text';
  if (numeric / sample >= 0.8) return 'number';
  if (dateLike / sample >= 0.6) return 'date';
  return 'text';
}

function toSortKey(val, valueType, caseInsensitive) {
  const s = (val === null || val === undefined) ? '' : String(val).trim();
  if (valueType === 'number') {
    const n = parseFloat(s);
    return isNaN(n) ? null : n;
  }
  if (valueType === 'date') {
    const d = Date.parse(s);
    return (d !== d) ? null : d;
  }
  if (caseInsensitive) return s.toLowerCase();
  return s;
}

function compareKeys(a, b, emptyLast) {
  const aEmpty = a === null || a === undefined || a === '';
  const bEmpty = b === null || b === undefined || b === '';
  if (aEmpty && bEmpty) return 0;
  if (emptyLast) {
    if (aEmpty && !bEmpty) return 1;
    if (!aEmpty && bEmpty) return -1;
  }
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

function runSort(rows, hasHeader, colIdx, ascending, valueType, caseInsensitive, emptyLast) {
  const dataStart = hasHeader ? 1 : 0;
  const normalized = normalizeColumnCount(rows.map((r) => r.slice()));
  const header = hasHeader ? [normalized[0]] : [];
  const data = normalized.slice(dataStart);
  let type = valueType;
  if (type === 'auto') {
    const colValues = data.map((row) => (row[colIdx] || '').trim()).filter(Boolean);
    type = detectValueType(colValues);
  }
  const sorted = data.slice().sort((rowA, rowB) => {
    const a = rowA[colIdx];
    const b = rowB[colIdx];
    const keyA = toSortKey(a, type, caseInsensitive);
    const keyB = toSortKey(b, type, caseInsensitive);
    const cmp = compareKeys(keyA, keyB, emptyLast);
    return ascending ? cmp : -cmp;
  });
  return header.concat(sorted);
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

// Parse
const rows1 = parseCSV('id,name\n1,Alice\n2,Bob');
same(rows1.length, 3, '3 rows');
same(rows1[0], ['id', 'name'], 'header');
same(rows1[1], ['1', 'Alice'], 'row1');

const rows2 = parseCSV('x,y\n"a,b",z');
same(rows2[1][0], 'a,b', 'quoted comma');

// normalizeColumnCount
const ragged = [['a', 'b'], ['1']];
const norm = normalizeColumnCount(ragged.map((r) => r.slice()));
same(norm[1].length, 2, 'ragged padded');

// detectValueType
const numVals = ['10', '2', '100', '5'];
ok(detectValueType(numVals) === 'number', 'detect number');
const textVals = ['a', 'b', 'c'];
ok(detectValueType(textVals) === 'text', 'detect text');

// toSortKey
ok(toSortKey('42', 'number', false) === 42, 'toSortKey number');
ok(toSortKey('  ', 'text', true) === '', 'toSortKey empty');
ok(toSortKey('AbC', 'text', true).toLowerCase() === 'abc', 'toSortKey case insensitive');

// compareKeys emptyLast
ok(compareKeys('', 'b', true) > 0, 'emptyLast: empty after b');
ok(compareKeys('a', '', true) < 0, 'emptyLast: a before empty');
ok(compareKeys('a', 'b', false) < 0, 'compare a < b');

// Sort asc text
const data = [['id', 'name'], ['2', 'Bob'], ['1', 'Alice'], ['3', 'Carol']];
const outAsc = runSort(data, true, 0, true, 'number', false, false);
same(outAsc[0], ['id', 'name'], 'header kept');
same(outAsc[1], ['1', 'Alice'], 'first data row asc');
same(outAsc[2], ['2', 'Bob'], 'second');
same(outAsc[3], ['3', 'Carol'], 'third');

// Sort desc (by name: Carol, Bob, Alice)
const outDesc = runSort(data, true, 1, false, 'text', false, false);
same(outDesc[1], ['3', 'Carol'], 'first data row desc by name');
same(outDesc[3], ['1', 'Alice'], 'last desc');

// Sort by column index 1 (name), asc text
const byName = runSort(data, true, 1, true, 'text', false, false);
same(byName[1], ['1', 'Alice'], 'sort by name col');

// emptyLast (asc, empty last: a, b, k, then empty)
const withEmpty = [['k'], ['b'], [''], ['a']];
const emptyLast = runSort(withEmpty, false, 0, true, 'text', false, true);
same(emptyLast.map((r) => r[0]), ['a', 'b', 'k', ''], 'empty values last');

// Round-trip CSV
const csvIn = 'id,name\n2,Bob\n1,Alice';
const parsed = parseCSV(csvIn);
const sorted = runSort(parsed, true, 0, true, 'number', false, false);
const csvOut = rowsToCsv(sorted);
same(csvOut, 'id,name\n1,Alice\n2,Bob', 'round-trip sort');

console.log('Passed: ' + passed + ', Failed: ' + failed);
process.exit(failed > 0 ? 1 : 0);
