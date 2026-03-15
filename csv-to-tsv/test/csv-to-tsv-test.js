/**
 * CSV to TSV tests — same logic as csv-to-tsv/index.html (parseCSVLines, parseCSVRow, escapeTsvCell, csvToTsv).
 * Run: node csv-to-tsv-test.js
 */
const fs = require('fs');
const path = require('path');

const FIXTURES = path.join(__dirname, 'fixtures');

// Replicate parseCSVLines from js/global.js
function parseCSVLines(text) {
  const lines = [];
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  if (!normalized) return lines;

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
        current += ch;
      }
    } else if (ch === '\n' && !inQuotes) {
      lines.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  if (current !== '') lines.push(current);
  return lines;
}

// Replicate parseCSVRow from csv-to-tsv page
function parseCSVRow(rowStr) {
  const cells = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < rowStr.length; i++) {
    const ch = rowStr[i];
    if (ch === '"') {
      if (inQuotes && rowStr[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      cells.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  cells.push(current);
  return cells;
}

// Replicate escapeTsvCell from csv-to-tsv page
function escapeTsvCell(val) {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (/[\t\n"]/.test(str)) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

// Replicate csvToTsv from csv-to-tsv page
function csvToTsv(csvText) {
  const rowStrings = parseCSVLines(csvText);
  if (rowStrings.length === 0) throw new Error('The CSV appears to be empty.');
  const rows = rowStrings.map((rowStr) => parseCSVRow(rowStr));
  const tsvRows = rows.map((cells) =>
    cells.map(escapeTsvCell).join('\t')
  );
  return tsvRows.join('\n');
}

function assert(condition, message) {
  if (!condition) {
    console.error('FAIL:', message);
    process.exit(1);
  }
}

console.log('CSV to TSV tests\n');

// Test 1: Basic conversion
console.log('Test 1: Simple CSV to TSV');
const simple = fs.readFileSync(path.join(FIXTURES, 'simple.csv'), 'utf8');
const tsv1 = csvToTsv(simple);
const lines1 = tsv1.split('\n');
assert(lines1.length === 3, 'Expected 3 rows, got ' + lines1.length);
assert(lines1[0] === 'name\tage\tcity', 'Header should be tab-separated');
assert(lines1[1] === 'Alice\t28\tNew York', 'Row 1 content');
assert(lines1[2] === 'Bob\t35\tChicago', 'Row 2 content');
console.log('  OK: Header and rows tab-separated\n');

// Test 2: Quoted fields (comma inside value)
console.log('Test 2: Quoted fields with commas');
const withQuotes = fs.readFileSync(path.join(FIXTURES, 'with-quotes.csv'), 'utf8');
const tsv2 = csvToTsv(withQuotes);
const lines2 = tsv2.split('\n');
assert(lines2.length === 3, 'Expected 3 rows');
assert(lines2[0] === 'id\tcompany\tvalue', 'Header');
assert(lines2[1].includes('Acme, Inc'), 'Comma inside quoted field preserved');
assert(lines2[1].split('\t').length === 3, 'Row 1 should have 3 columns');
assert(lines2[2].includes('hello'), 'Escaped quotes: cell should contain hello');
assert(lines2[2].split('\t').length === 3, 'Row 2 should have 3 columns');
console.log('  OK: Quoted commas and escaped quotes preserved\n');

// Test 3: Empty input throws
console.log('Test 3: Empty CSV throws');
try {
  csvToTsv('');
  assert(false, 'Should throw on empty input');
} catch (e) {
  assert(e.message.includes('empty'), 'Error should mention empty');
}
console.log('  OK: Empty input throws\n');

// Test 4: TSV escaping (value with tab)
console.log('Test 4: Cell with tab is quoted in TSV');
const csvWithTab = 'a,b,c\nx\ty,z,w';
const tsv4 = csvToTsv(csvWithTab);
assert(tsv4.includes('"x\ty"'), 'Tab in value should be quoted in TSV');
assert(tsv4.split('\n').length === 2, 'Still 2 rows');
console.log('  OK: Tab in cell escaped\n');

// Test 5: Row order preserved
console.log('Test 5: Row order preserved');
const csvOrder = 'first,second\n1,2\n3,4';
const tsv5 = csvToTsv(csvOrder);
const rows5 = tsv5.split('\n');
assert(rows5[0] === 'first\tsecond' && rows5[1] === '1\t2' && rows5[2] === '3\t4', 'Order preserved');
console.log('  OK: Row order preserved\n');

console.log('All tests passed. CSV to TSV logic matches the tool behavior.');
