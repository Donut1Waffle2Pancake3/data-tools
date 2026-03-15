/**
 * Tests for CSV Deduplicator core logic (parse, dedupe by row, dedupe by columns, serialize, formatNum).
 * Run: node scripts/test-csv-deduplicator.js
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

function formatNum(n) {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function dedupe(rows, hasHeader, keyIndices) {
  const dataStart = hasHeader ? 1 : 0;
  const normalized = normalizeColumnCount(rows.map((r) => r.slice()));
  const header = hasHeader ? [normalized[0]] : [];
  const data = normalized.slice(dataStart);

  function rowKey(row) {
    if (keyIndices && keyIndices.length) {
      return keyIndices.map((c) => row[c] || '').join('\t');
    }
    return row.join('\t');
  }

  const seen = {};
  const result = [];
  for (let i = 0; i < data.length; i++) {
    const k = rowKey(data[i]);
    if (!seen[k]) { seen[k] = true; result.push(data[i]); }
  }
  return { header, result, total: data.length, removed: data.length - result.length };
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
const rows1 = parseCSV('a,b,c\n1,2,3\n4,5,6');
same(rows1.length, 3, '3 rows');
same(rows1[0], ['a', 'b', 'c'], 'header');
same(rows1[1], ['1', '2', '3'], 'row1');

const rows2 = parseCSV('x,y\n"a,b",z');
same(rows2[1][0], 'a,b', 'quoted comma');

// normalizeColumnCount
const ragged = [['a', 'b'], ['1']];
const norm = normalizeColumnCount(ragged.map((r) => r.slice()));
same(norm[1].length, 2, 'ragged padded');
same(norm[1][1], '', 'pad empty');

// formatNum
ok(formatNum(0) === '0', 'formatNum 0');
ok(formatNum(26194) === '26,194', 'formatNum 26194');
ok(formatNum(1000000) === '1,000,000', 'formatNum 1M');

// Dedupe exact, with header
const withDupes = [['id', 'name'], ['1', 'Alice'], ['2', 'Bob'], ['1', 'Alice'], ['3', 'Carol']];
const out1 = dedupe(withDupes, true, null);
same(out1.header.length, 1, 'header kept');
same(out1.result.length, 3, '3 unique data rows');
same(out1.total, 4, '4 data rows total');
same(out1.removed, 1, '1 duplicate removed');
same(out1.result[0], ['1', 'Alice'], 'first occurrence kept');
same(out1.result[1], ['2', 'Bob'], 'second row');
same(out1.result[2], ['3', 'Carol'], 'third row');

// Dedupe by column (id)
const out2 = dedupe(withDupes, true, [0]);
same(out2.result.length, 3, 'by column id: 3 unique');
same(out2.removed, 1, 'by column: 1 removed');

// Dedupe no header
const noHeader = [['1', 'a'], ['2', 'b'], ['1', 'a']];
const out3 = dedupe(noHeader, false, null);
same(out3.header.length, 0, 'no header');
same(out3.result.length, 2, '2 unique rows');
same(out3.removed, 1, '1 removed');

// Round-trip CSV
const csvIn = 'email,name\nalice@x.com,Alice\nbob@x.com,Bob\nalice@x.com,Alice';
const parsed = parseCSV(csvIn);
const out = dedupe(parsed, true, [0]);
const outRows = out.header.concat(out.result);
const csvOut = rowsToCsv(outRows);
same(csvOut, 'email,name\nalice@x.com,Alice\nbob@x.com,Bob', 'round-trip dedupe by column');

console.log('Passed: ' + passed + ', Failed: ' + failed);
process.exit(failed > 0 ? 1 : 0);
