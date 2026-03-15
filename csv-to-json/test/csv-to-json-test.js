/**
 * CSV to JSON tests — same logic as csv-to-json/index.html (parseCSVRows, csvToJson).
 * Run: node csv-to-json-test.js
 */
const fs = require('fs');
const path = require('path');

const FIXTURES = path.join(__dirname, 'fixtures');

function parseCSVRows(text) {
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const trimmed = normalized.replace(/\n+$/, '');
  if (!trimmed) return [];
  const rows = [];
  let currentRow = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < trimmed.length; i++) {
    const ch = trimmed[i];
    if (ch === '"') {
      if (inQuotes && trimmed[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      currentRow.push(current.trim());
      current = '';
    } else if (ch === '\n' && !inQuotes) {
      currentRow.push(current.trim());
      rows.push(currentRow);
      currentRow = [];
      current = '';
    } else {
      current += ch;
    }
  }
  currentRow.push(current.trim());
  rows.push(currentRow);
  return rows;
}

function csvToJson(csvText) {
  const rows = parseCSVRows(csvText);
  if (rows.length === 0) throw new Error('The CSV appears to be empty.');
  const headerRow = rows[0].map(function (c) { return c.trim(); });
  const headers = headerRow.filter(function (h) { return h !== ''; });
  if (headers.length === 0) throw new Error('The first row must contain at least one column name.');
  const numHeaders = headerRow.length;
  const result = [];
  for (let r = 1; r < rows.length; r++) {
    const cells = rows[r];
    const obj = {};
    for (let c = 0; c < numHeaders; c++) {
      let key = headerRow[c];
      if (key === '') key = 'extra_' + (c + 1);
      obj[key] = c < cells.length ? cells[c] : '';
    }
    for (let c = numHeaders; c < cells.length; c++) {
      obj['extra_' + (c + 1)] = cells[c];
    }
    result.push(obj);
  }
  return result;
}

function assert(condition, message) {
  if (!condition) {
    console.error('FAIL:', message);
    process.exit(1);
  }
}

console.log('CSV to JSON tests\n');

// Test 1: Simple CSV to JSON
console.log('Test 1: Simple CSV to JSON');
const simple = fs.readFileSync(path.join(FIXTURES, 'simple.csv'), 'utf8');
const json1 = csvToJson(simple);
assert(Array.isArray(json1), 'Output should be an array');
assert(json1.length === 2, 'Expected 2 objects, got ' + json1.length);
assert(json1[0].name === 'Alice' && json1[0].age === '28' && json1[0].city === 'New York', 'First row object');
assert(json1[1].name === 'Bob' && json1[1].age === '35' && json1[1].city === 'Chicago', 'Second row object');
console.log('  OK: Header row becomes keys, data rows become objects\n');

// Test 2: Quoted fields (comma and escaped quote)
console.log('Test 2: Quoted fields with comma and ""');
const withQuotes = fs.readFileSync(path.join(FIXTURES, 'with-quotes.csv'), 'utf8');
const json2 = csvToJson(withQuotes);
assert(json2.length === 2, 'Expected 2 objects');
assert(json2[0].id === '1' && json2[0].company === 'Acme, Inc' && json2[0].value === '100', 'Comma inside quotes preserved');
assert(json2[1].company === 'Say "hello"', 'Escaped "" inside quoted field');
console.log('  OK: Quoted fields and escaped quotes preserved\n');

// Test 3: Empty input throws
console.log('Test 3: Empty CSV throws');
try {
  csvToJson('');
  assert(false, 'Should throw on empty input');
} catch (e) {
  assert(e.message.includes('empty'), 'Error should mention empty');
}
console.log('  OK: Empty input throws\n');

// Test 4: Header-only (no data rows) → empty array
console.log('Test 4: Header only gives empty array');
const headerOnly = 'a,b,c\n';
const json4 = csvToJson(headerOnly);
assert(Array.isArray(json4) && json4.length === 0, 'Header only should yield []');
console.log('  OK: Header only yields []\n');

// Test 5: Missing headers (all blank) throws
console.log('Test 5: All-blank header row throws');
try {
  csvToJson(',,\n1,2,3');
  assert(false, 'Should throw when no column names');
} catch (e) {
  assert(e.message.includes('first row') || e.message.includes('column'), 'Error should mention header/column');
}
console.log('  OK: All-blank header throws\n');

// Test 6: Uneven columns — missing cells → "", extra cells → extra_1, extra_2
console.log('Test 6: Uneven columns (missing and extra)');
const uneven = 'x,y\n1,2,3\n4\n5,6';
const json6 = csvToJson(uneven);
assert(json6.length === 3, 'Expected 3 objects');
assert(json6[0].x === '1' && json6[0].y === '2' && json6[0].extra_3 === '3', 'Extra column becomes extra_3');
assert(json6[1].x === '4' && json6[1].y === '', 'Missing cell is empty string');
assert(json6[2].x === '5' && json6[2].y === '6', 'Row 3 normal');
console.log('  OK: Missing → "", extra → extra_N\n');

// Test 7: Windows line endings
console.log('Test 7: Windows line endings');
const crlf = 'a,b\r\n1,2\r\n3,4\r\n';
const json7 = csvToJson(crlf);
assert(json7.length === 2, 'Expected 2 objects');
assert(json7[0].a === '1' && json7[0].b === '2', 'CRLF parsed');
console.log('  OK: CRLF handled\n');

// Test 8: Trailing blank lines ignored
console.log('Test 8: Trailing blank lines ignored');
const trailing = 'p,q\n1,2\n\n\n';
const json8 = csvToJson(trailing);
assert(json8.length === 1, 'Only one data row; trailing blanks ignored');
assert(json8[0].p === '1' && json8[0].q === '2', 'Content correct');
console.log('  OK: Trailing blank lines stripped\n');

// Test 9: Output is valid JSON
console.log('Test 9: Output is valid JSON');
const str = JSON.stringify(csvToJson(simple));
const parsed = JSON.parse(str);
assert(Array.isArray(parsed) && parsed.length === 2, 'Round-trip valid');
console.log('  OK: Output is valid JSON\n');

console.log('All tests passed. CSV to JSON logic matches the tool behavior.');
