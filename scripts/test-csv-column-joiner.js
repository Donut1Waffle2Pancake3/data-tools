/**
 * Tests for CSV Column Joiner core logic (parse, join columns, new column name, serialize).
 * Run: node scripts/test-csv-column-joiner.js
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

/**
 * Join selected columns into one. Matches page logic.
 * @param {string[][]} rows - normalized rows
 * @param {number[]} selected - sorted column indices to join
 * @param {string} delim - delimiter between joined values
 * @param {boolean} removeOriginal - if true, drop selected columns and append joined; else replace selected block with one column
 * @param {boolean} hasHeader
 * @param {string[]} displayNames - header display names (or Column 1, Column 2, ...)
 * @param {number} numCols
 * @returns {string[][]} outRows
 */
function joinColumns(rows, selected, delim, removeOriginal, hasHeader, displayNames, numCols) {
  const selectedSet = {};
  for (let i = 0; i < selected.length; i++) selectedSet[selected[i]] = true;

  let newColumnName;
  if (hasHeader && rows.length > 0) {
    const headerParts = [];
    for (let i = 0; i < selected.length; i++) {
      const name = (displayNames[selected[i]] || '').trim();
      if (name) headerParts.push(name);
    }
    newColumnName = headerParts.length > 0 ? headerParts.join('_') : 'Combined';
  } else {
    newColumnName = 'Combined';
  }

  const outRows = [];
  const dataStart = hasHeader ? 1 : 0;
  const firstSelected = selected[0];
  const lastSelected = selected[selected.length - 1];

  if (hasHeader && rows.length > 0) {
    const headerRow = rows[0];
    const outHeader = [];
    if (removeOriginal) {
      for (let c = 0; c < numCols; c++) {
        if (!selectedSet[c]) outHeader.push(headerRow[c]);
      }
      outHeader.push(newColumnName);
    } else {
      for (let c = 0; c < firstSelected; c++) outHeader.push(headerRow[c]);
      outHeader.push(newColumnName);
      for (let c = lastSelected + 1; c < numCols; c++) outHeader.push(headerRow[c]);
    }
    outRows.push(outHeader);
  }

  for (let r = dataStart; r < rows.length; r++) {
    const row = rows[r];
    const joinedParts = [];
    for (let i = 0; i < selected.length; i++) {
      const val = (row[selected[i]] !== undefined && row[selected[i]] !== null) ? String(row[selected[i]]) : '';
      joinedParts.push(val.trim());
    }
    const joinedValue = joinedParts.join(delim);

    const newCells = [];
    if (removeOriginal) {
      for (let c = 0; c < numCols; c++) {
        if (!selectedSet[c]) newCells.push(row[c]);
      }
      newCells.push(joinedValue);
    } else {
      for (let c = 0; c < firstSelected; c++) newCells.push(row[c]);
      newCells.push(joinedValue);
      for (let c = lastSelected + 1; c < numCols; c++) newCells.push(row[c]);
    }
    outRows.push(newCells);
  }

  return outRows;
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

same(headerDisplayNames(['First', 'Last', 'First']), ['First', 'Last', 'First (2)'], 'duplicate column names');
same(rowsToCsv([['a', 'b'], ['x,y', 'z']]), 'a,b\n"x,y",z', 'comma in cell is quoted');

// --- normalize ---
const ragged = [['a', 'b'], ['1']];
const normRag = normalizeColumnCount(ragged);
same(normRag[1].length, 2, 'ragged row padded');
same(normRag[1][1], '', 'padding is empty string');

// --- join: basic with header, keep original columns, comma delimiter ---
const data = normalizeColumnCount([['First', 'Last', 'City'], ['Alice', 'Smith', 'NYC'], ['Bob', 'Jones', 'LA']]);
const out1 = joinColumns(data, [0, 1], ',', false, true, ['First', 'Last', 'City'], 3);
same(out1.length, 3, 'join: 3 rows out');
same(out1[0], ['First_Last', 'City'], 'join: new header name and remaining column');
same(out1[1], ['Alice,Smith', 'NYC'], 'join: values with comma');
same(out1[2], ['Bob,Jones', 'LA'], 'join: row 2');

// --- join: custom delimiter (space) ---
const out2 = joinColumns(data, [0, 1], ' ', false, true, ['First', 'Last', 'City'], 3);
same(out2[1], ['Alice Smith', 'NYC'], 'join: space delimiter');

// --- join: remove original columns ---
const out3 = joinColumns(data, [0, 1], ',', true, true, ['First', 'Last', 'City'], 3);
same(out3[0], ['City', 'First_Last'], 'join removeOriginal: header order');
same(out3[1], ['NYC', 'Alice,Smith'], 'join removeOriginal: row 1');
same(out3[2], ['LA', 'Bob,Jones'], 'join removeOriginal: row 2');

// --- join: no header (Combined) ---
const noHeader = normalizeColumnCount([['a', 'b', 'c'], ['1', '2', '3']]);
const out4 = joinColumns(noHeader, [0, 1], '-', false, false, ['Column 1', 'Column 2', 'Column 3'], 3);
same(out4[0], ['a-b', 'c'], 'no header: first row joined');
same(out4[1], ['1-2', '3'], 'no header: second row joined');
// New column name when no header is "Combined"
same(out4.length, 2, 'no header: 2 data rows only');

// Actually when hasHeader is false, we don't push a header row - so outRows[0] is first data row. Let me check the page again.
// When hasHeader is false: dataStart = 0, we don't push outHeader. So outRows = [ row0_joined, row1_joined, ... ]. So out4[0] is the first data row with joined values. The "column name" for the new column would be "Combined" but we only output data rows. So out4 has 2 rows, each with [ joinedValue, otherCols... ]. Good.
// But wait - when there's no header, the first row of input is still data. So we have 2 rows of data. The displayNames would be Column 1, Column 2, Column 3. So newColumnName = 'Combined'. We don't push a header row. So outRows = [ [ 'a-b', 'c' ], [ '1-2', '3' ] ]. So we're not outputting a header at all - that's correct for "no header" mode. Good.

// --- join: empty cells trimmed ---
const withEmpty = normalizeColumnCount([['A', 'B', 'C'], ['x', '', 'z'], ['', 'y', '']]);
const out5 = joinColumns(withEmpty, [0, 1], ',', false, true, ['A', 'B', 'C'], 3);
same(out5[1], ['x,', 'z'], 'empty middle cell becomes empty string in join');

// --- join: three columns ---
const out6 = joinColumns(data, [0, 1, 2], ' | ', false, true, ['First', 'Last', 'City'], 3);
same(out6[0].length, 1, 'join 3 cols: single output column');
same(out6[0][0], 'First_Last_City', 'join 3 cols: header name');
same(out6[1][0], 'Alice | Smith | NYC', 'join 3 cols: delimiter');

// --- round-trip: CSV -> parse -> normalize -> join -> serialize -> parse ---
const csvIn = 'FirstName,LastName,Age\nAlice,Smith,30\nBob,Jones,25';
const parsed = parseCSV(csvIn);
const norm = normalizeColumnCount(parsed);
const outRows = joinColumns(norm, [0, 1], ' ', false, true, ['FirstName', 'LastName', 'Age'], 3);
const csvOut = rowsToCsv(outRows);
same(csvOut, 'FirstName_LastName,Age\nAlice Smith,30\nBob Jones,25', 'round-trip join first+last');
const reparse = parseCSV(csvOut);
same(reparse.length, 3, 'reparse has 3 rows');
same(reparse[0], ['FirstName_LastName', 'Age'], 'reparse header');
same(reparse[1], ['Alice Smith', '30'], 'reparse row 1');

// --- ragged: join columns from normalized row (empty for short row). Block 0..2 replaced by one column. ---
const raggedData = normalizeColumnCount([['X', 'Y', 'Z'], ['a', 'b'], ['c', 'd', 'e']]);
const outRag = joinColumns(raggedData, [0, 2], '-', false, true, ['X', 'Y', 'Z'], 3);
same(outRag[0], ['X_Z'], 'ragged: header (block 0..2 replaced)');
same(outRag[1], ['a-'], 'ragged: row 1 has empty for column 2');
same(outRag[2], ['c-e'], 'ragged: row 2 full');

console.log('Passed: ' + passed + ', Failed: ' + failed);
process.exit(failed > 0 ? 1 : 0);
