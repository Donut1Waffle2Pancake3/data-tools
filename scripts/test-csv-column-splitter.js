/**
 * Tests for CSV Column Splitter core logic (parse, split by columns, placement A/B, serialize).
 * Run: node scripts/test-csv-column-splitter.js
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

function escapeCsvCell(val) {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (/[",\r\n]/.test(str)) return '"' + str.replace(/"/g, '""') + '"';
  return str;
}

function rowsToCsv(rows) {
  return rows.map((cells) => cells.map(escapeCsvCell).join(',')).join('\n');
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

/** Split rows into selected (A) and remaining (B) columns. Matches page logic. */
function splitByColumns(rows, selectedIndices) {
  const selectedSet = {};
  for (let i = 0; i < selectedIndices.length; i++) selectedSet[selectedIndices[i]] = true;
  const rowsA = [];
  const rowsB = [];
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    const cellsA = [];
    const cellsB = [];
    for (let c = 0; c < row.length; c++) {
      if (selectedSet[c]) cellsA.push(row[c]);
      else cellsB.push(row[c]);
    }
    if (cellsA.length) rowsA.push(cellsA);
    if (cellsB.length) rowsB.push(cellsB);
  }
  return { rowsA, rowsB };
}

function getOutputs(rowsA, rowsB, placementA) {
  const outFirst = placementA ? rowsA : rowsB;
  const outSecond = placementA ? rowsB : rowsA;
  return { csvFirst: rowsToCsv(outFirst), csvSecond: rowsToCsv(outSecond) };
}

// --- test helpers ---
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

// --- parseCSV (same as other tools) ---
const rows1 = parseCSV('a,b,c\n1,2,3\n4,5,6');
same(rows1.length, 3, '3 rows');
same(rows1[0], ['a', 'b', 'c'], 'header row');
same(rows1[1], ['1', '2', '3'], 'data row 1');

const rows2 = parseCSV('name,note\n"Doc, Jr.",hello');
same(rows2.length, 2, '2 rows with quoted comma');
same(rows2[1][0], 'Doc, Jr.', 'quoted comma preserved');

const rows3 = parseCSV('x\n"say ""hi"""');
same(rows3[1][0], 'say "hi"', 'escaped quote');

const rows4 = parseCSV('a,,c\n1,,3');
same(rows4[0], ['a', '', 'c'], 'empty middle cell');

same(parseCSV(''), [], 'empty string returns empty array');
same(parseCSV('  \n  '), [], 'whitespace only returns empty array');

// --- headerDisplayNames ---
same(headerDisplayNames(['a', 'b', 'a']), ['a', 'b', 'a (2)'], 'duplicate column names');

// --- rowsToCsv ---
same(rowsToCsv([['a', 'b'], ['x,y', 'z']]), 'a,b\n"x,y",z', 'comma in cell is quoted');

// --- normalize + split: basic ---
const data = normalizeColumnCount([['name', 'age', 'city'], ['Alice', '30', 'NYC'], ['Bob', '25', 'LA']]);
const { rowsA: rA1, rowsB: rB1 } = splitByColumns(data, [0, 2]); // name, city
same(rA1.length, 3, 'rowsA has 3 rows');
same(rA1[0], ['name', 'city'], 'selected columns header');
same(rA1[1], ['Alice', 'NYC'], 'selected columns row 1');
same(rB1.length, 3, 'rowsB has 3 rows');
same(rB1[0], ['age'], 'remaining column header');
same(rB1[1], ['30'], 'remaining column row 1');

// --- placement A: selected first ---
const outPlaceA = getOutputs(rA1, rB1, true);
same(outPlaceA.csvFirst, 'name,city\nAlice,NYC\nBob,LA', 'placement A: first output is selected');
same(outPlaceA.csvSecond, 'age\n30\n25', 'placement A: second output is remaining');

// --- placement B: remaining first ---
const outPlaceB = getOutputs(rA1, rB1, false);
same(outPlaceB.csvFirst, 'age\n30\n25', 'placement B: first output is remaining');
same(outPlaceB.csvSecond, 'name,city\nAlice,NYC\nBob,LA', 'placement B: second output is selected');

// --- select none: all go to B ---
const { rowsA: rA0, rowsB: rB0 } = splitByColumns(data, []);
same(rA0.length, 0, 'no selected -> rowsA empty');
same(rB0.length, 3, 'no selected -> rowsB has all rows');
same(rB0[0].length, 3, 'rowsB has all columns');

// --- select all: all go to A ---
const { rowsA: rAAll, rowsB: rBAll } = splitByColumns(data, [0, 1, 2]);
same(rAAll.length, 3, 'all selected -> rowsA has all rows');
same(rBAll.length, 0, 'all selected -> rowsB empty');
same(rAAll[0], ['name', 'age', 'city'], 'rowsA full row');

// --- single column selected ---
const { rowsA: rA1col, rowsB: rB1col } = splitByColumns(data, [1]);
same(rA1col[0], ['age'], 'single selected column header');
same(rB1col[0], ['name', 'city'], 'remaining two columns');

// --- round-trip: CSV -> parse -> normalize -> split -> serialize -> parse ---
const csvIn = 'x,y,z\n1,2,3\n4,5,6';
const parsed = parseCSV(csvIn);
const norm = normalizeColumnCount(parsed);
const { rowsA: ra, rowsB: rb } = splitByColumns(norm, [0, 2]);
const { csvFirst, csvSecond } = getOutputs(ra, rb, true);
same(csvFirst, 'x,z\n1,3\n4,6', 'round-trip first output');
same(csvSecond, 'y\n2\n5', 'round-trip second output');
const reparse1 = parseCSV(csvFirst);
const reparse2 = parseCSV(csvSecond);
same(reparse1.length, 3, 'reparse first has 3 rows');
same(reparse2.length, 3, 'reparse second has 3 rows');

// --- ragged rows: normalized then split ---
const ragged = [['a', 'b', 'c'], ['1', '2']];
const normRag = normalizeColumnCount(ragged);
same(normRag[1].length, 3, 'ragged row padded to 3');
const { rowsA: rARag } = splitByColumns(normRag, [2]);
same(rARag[0], ['c'], 'third column from header');
same(rARag[1], [''], 'third column from padded row is empty');

console.log('Passed: ' + passed + ', Failed: ' + failed);
process.exit(failed > 0 ? 1 : 0);
