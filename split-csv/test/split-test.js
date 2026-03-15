/**
 * Split CSV tests — same logic as split-csv/index.html (parseCSVLines + split).
 * Run: node split-test.js
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

// Replicate split logic from split-csv/index.html (returns array of { name, content, rows })
function splitCsv(content, fileName, rowsPerFile) {
  const lines = parseCSVLines(content);

  if (lines.length === 0) throw new Error('The CSV file appears to be empty.');
  if (lines.length === 1) throw new Error('The CSV file contains only a header row and no data rows to split.');

  const headerLine = lines[0];
  const dataLines = lines.slice(1);

  if (rowsPerFile >= dataLines.length) {
    throw new Error(
      `The file only has ${dataLines.length} data row${dataLines.length !== 1 ? 's' : ''}, which is less than or equal to your requested ${rowsPerFile} rows per file. No splitting needed.`
    );
  }

  const baseName = fileName.replace(/\.[^/.]+$/, '');
  const parts = [];

  for (let i = 0; i < dataLines.length; i += rowsPerFile) {
    const chunk = dataLines.slice(i, i + rowsPerFile);
    const partContent = [headerLine, ...chunk].join('\n');
    const name = `${baseName}-part-${parts.length + 1}.csv`;
    parts.push({ name, content: partContent, rows: chunk.length });
  }

  return parts;
}

function assert(condition, message) {
  if (!condition) {
    console.error('FAIL:', message);
    process.exit(1);
  }
}

console.log('Split CSV tests\n');

// Test 1: Basic split — 10 data rows, 3 per file → 4 parts (3+3+3+1)
console.log('Test 1: Split 10 data rows into 3 rows per file');
const sample = fs.readFileSync(path.join(FIXTURES, 'sample.csv'), 'utf8');
const parts = splitCsv(sample, 'sample.csv', 3);
assert(parts.length === 4, 'Expected 4 parts, got ' + parts.length);
assert(parts[0].rows === 3 && parts[1].rows === 3 && parts[2].rows === 3 && parts[3].rows === 1, 'Row counts should be 3,3,3,1');
parts.forEach((p, i) => {
  const lines = p.content.split('\n');
  assert(lines[0] === 'id,name,score', `Part ${i + 1} should have header`);
  assert(lines.length === p.rows + 1, `Part ${i + 1} should have 1 header + ${p.rows} data rows`);
});
assert(parts[0].name === 'sample-part-1.csv' && parts[4 - 1].name === 'sample-part-4.csv', 'Filenames should be sample-part-N.csv');
// Reassemble and compare data rows
const allDataRows = parts.flatMap((p) => p.content.split('\n').slice(1));
const originalData = parseCSVLines(sample).slice(1);
assert(allDataRows.length === originalData.length && allDataRows.every((r, i) => r === originalData[i]), 'Reassembled data should match original');
console.log('  OK: 4 parts (3+3+3+1), header in each, data preserved\n');

// Test 2: Exact split — 6 rows, 2 per file → 3 parts of 2 each
console.log('Test 2: Exact split (6 rows, 2 per file)');
const sixRows = 'a,b\n1,2\n3,4\n5,6\n7,8\n9,10\n11,12';
const parts2 = splitCsv(sixRows, 'data.csv', 2);
assert(parts2.length === 3, 'Expected 3 parts');
assert(parts2.every((p) => p.rows === 2), 'Each part should have 2 data rows');
assert(parts2.every((p) => p.content.startsWith('a,b\n')), 'Each part should start with header a,b');
console.log('  OK: 3 parts of 2 rows each\n');

// Test 3: Quoted fields (newline inside quoted field)
console.log('Test 3: Quoted fields preserved');
const withQuotes = fs.readFileSync(path.join(FIXTURES, 'with-quotes.csv'), 'utf8');
const linesQ = parseCSVLines(withQuotes);
assert(linesQ.length === 3, 'Expected 3 lines (header + 2 data)');
const parts3 = splitCsv(withQuotes, 'with-quotes.csv', 1);
assert(parts3.length === 2, '2 data rows → 2 parts');
assert(parts3[0].content.includes('"line one'), 'First part should contain quoted multi-line field');
assert(parts3[1].content.includes('"quoted, comma"'), 'Second part should contain quoted comma');
console.log('  OK: Quoted fields preserved in split parts\n');

// Test 4: Empty file throws
console.log('Test 4: Empty file rejects split');
try {
  splitCsv('', 'empty.csv', 2);
  assert(false, 'Should throw on empty file');
} catch (e) {
  assert(e.message.includes('empty'), 'Error should mention empty');
}
console.log('  OK: Empty file throws\n');

// Test 5: Header only throws
console.log('Test 5: Header-only file rejects split');
try {
  splitCsv('id,name\n', 'header-only.csv', 2);
  assert(false, 'Should throw on header only');
} catch (e) {
  assert(e.message.includes('only a header'), 'Error should mention header only');
}
console.log('  OK: Header-only throws\n');

// Test 6: rowsPerFile >= data length throws
console.log('Test 6: No split when rows per file >= data rows');
try {
  splitCsv(sample, 'sample.csv', 10);
  assert(false, 'Should throw when no splitting needed');
} catch (e) {
  assert(e.message.includes('No splitting needed') || e.message.includes('less than or equal'), 'Error should say no split needed');
}
console.log('  OK: Rejects when no split needed\n');

console.log('All tests passed. Split logic matches the tool behavior.');
