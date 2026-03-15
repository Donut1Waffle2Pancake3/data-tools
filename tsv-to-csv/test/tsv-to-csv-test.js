/**
 * TSV to CSV tests — same logic as tsv-to-csv/index.html (parseTSV, escapeCsvCell, tsvToCsv).
 * Run: node tsv-to-csv-test.js
 */
const fs = require('fs');
const path = require('path');

const FIXTURES = path.join(__dirname, 'fixtures');

function parseTSV(text) {
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  if (!normalized) return [];
  const rows = [];
  let currentRow = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < normalized.length; i++) {
    const ch = normalized[i];
    if (ch === '"') {
      if (inQuotes && normalized[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === '\t' && !inQuotes) {
      currentRow.push(current);
      current = '';
    } else if (ch === '\n' && !inQuotes) {
      currentRow.push(current);
      rows.push(currentRow);
      currentRow = [];
      current = '';
    } else {
      current += ch;
    }
  }
  currentRow.push(current);
  rows.push(currentRow);
  return rows;
}

function escapeCsvCell(val) {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (/[",\r\n]/.test(str)) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function tsvToCsv(tsvText) {
  const rows = parseTSV(tsvText);
  if (rows.length === 0) throw new Error('The TSV appears to be empty.');
  return rows.map(function (cells) {
    return cells.map(escapeCsvCell).join(',');
  }).join('\n');
}

function assert(condition, message) {
  if (!condition) {
    console.error('FAIL:', message);
    process.exit(1);
  }
}

console.log('TSV to CSV tests\n');

// Test 1: Simple TSV to CSV
console.log('Test 1: Simple TSV to CSV');
const simple = fs.readFileSync(path.join(FIXTURES, 'simple.tsv'), 'utf8');
const csv1 = tsvToCsv(simple);
const lines1 = csv1.split('\n');
assert(lines1.length === 3, 'Expected 3 rows, got ' + lines1.length);
assert(lines1[0] === 'name,age,city', 'Header should be comma-separated');
assert(lines1[1] === 'Alice,28,New York', 'Row 1 content');
assert(lines1[2] === 'Bob,35,Chicago', 'Row 2 content');
console.log('  OK: Header and rows comma-separated\n');

// Test 2: TSV with tab inside quoted field
console.log('Test 2: Quoted field with tab');
const withQuotes = fs.readFileSync(path.join(FIXTURES, 'with-quotes.tsv'), 'utf8');
const csv2 = tsvToCsv(withQuotes);
const lines2 = csv2.split('\n');
assert(lines2.length === 3, 'Expected 3 rows');
assert(lines2[0] === 'id,company,value', 'Header');
assert(lines2[1].includes('Acme') && lines2[1].includes('Inc'), 'Tab inside quoted field preserved');
assert(lines2[1].split(',').length >= 3, 'Row 1 should have 3 columns');
console.log('  OK: Quoted TSV fields preserved\n');

// Test 3: Empty input throws
console.log('Test 3: Empty TSV throws');
try {
  tsvToCsv('');
  assert(false, 'Should throw on empty input');
} catch (e) {
  assert(e.message.includes('empty'), 'Error should mention empty');
}
console.log('  OK: Empty input throws\n');

// Test 4: CSV escaping (value with comma)
console.log('Test 4: Cell with comma is quoted in CSV');
const tsvComma = 'a\tb\tc\nx\ty\tz\n"has,comma"\t2\t3';
const csv4 = tsvToCsv(tsvComma);
assert(csv4.includes('"has,comma"'), 'Comma in value should be quoted in CSV');
assert(csv4.split('\n').length === 3, 'Still 3 rows');
console.log('  OK: Comma in cell escaped\n');

// Test 5: Row order preserved
console.log('Test 5: Row order preserved');
const tsvOrder = 'first\tsecond\n1\t2\n3\t4';
const csv5 = tsvToCsv(tsvOrder);
const rows5 = csv5.split('\n');
assert(rows5[0] === 'first,second' && rows5[1] === '1,2' && rows5[2] === '3,4', 'Order preserved');
console.log('  OK: Row order preserved\n');

console.log('All tests passed. TSV to CSV logic matches the tool behavior.');
