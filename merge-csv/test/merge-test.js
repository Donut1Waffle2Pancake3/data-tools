/**
 * Merge CSV tests — same logic as merge-csv/index.html (parseCSVLines + merge).
 * Run: node merge-test.js
 */
const fs = require('fs');
const path = require('path');

const FIXTURES = path.join(__dirname, 'fixtures');

// Replicate parseCSVLines from js/global.js (used by merge-csv page)
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

// Replicate merge logic from merge-csv/index.html
function mergeFiles(fileContents) {
  const parsed = [];
  for (let i = 0; i < fileContents.length; i++) {
    const text = fileContents[i];
    const lines = parseCSVLines(text);
    if (lines.length === 0) throw new Error(`File ${i + 1} appears to be empty.`);
    parsed.push({ name: `file${i + 1}.csv`, header: lines[0], rows: lines.slice(1) });
  }

  const refHeader = parsed[0].header;
  for (let i = 1; i < parsed.length; i++) {
    if (parsed[i].header !== refHeader) {
      throw new Error(`Header mismatch: file ${i + 1} has different columns than file 1.`);
    }
  }

  const allRows = parsed.flatMap((p) => p.rows.filter((r) => r.trim() !== ''));
  if (allRows.length === 0) {
    throw new Error('All selected files are empty or contain only header rows.');
  }

  return [refHeader, ...allRows].join('\n');
}

function assert(condition, message) {
  if (!condition) {
    console.error('FAIL:', message);
    process.exit(1);
  }
}

console.log('Merge CSV tests\n');

// Test 1: Basic merge — 3 files, same header
console.log('Test 1: Merge 3 files with same header');
const part1 = fs.readFileSync(path.join(FIXTURES, 'part1.csv'), 'utf8');
const part2 = fs.readFileSync(path.join(FIXTURES, 'part2.csv'), 'utf8');
const part3 = fs.readFileSync(path.join(FIXTURES, 'part3.csv'), 'utf8');
const merged = mergeFiles([part1, part2, part3]);
const mergedLines = merged.split('\n');
assert(mergedLines.length === 6, 'Expected 1 header + 5 data rows, got ' + mergedLines.length);
assert(mergedLines[0] === 'name,value,date', 'Header should be name,value,date');
assert(merged.includes('alpha,10,2024-01-01'), 'Should contain row from part1');
assert(merged.includes('gamma,30,2024-01-03'), 'Should contain row from part2');
assert(merged.includes('epsilon,50,2024-01-05'), 'Should contain row from part3');
console.log('  OK: 1 header + 5 data rows, all content present\n');

// Test 2: Quoted field (comma inside value)
console.log('Test 2: Quoted field with comma');
const withQuotes = fs.readFileSync(path.join(FIXTURES, 'with-quotes.csv'), 'utf8');
const linesQuotes = parseCSVLines(withQuotes);
assert(linesQuotes.length === 2, 'Expected 2 lines (header + 1 row)');
assert(linesQuotes[1] === '"alpha, inc",100,2024-02-01', 'Quoted field preserved');
const mergeTwo = mergeFiles([part1, withQuotes]);
assert(mergeTwo.includes('"alpha, inc",100,2024-02-01'), 'Merged output should contain quoted row');
console.log('  OK: Quoted fields preserved in merge\n');

// Test 3: Header mismatch should throw
console.log('Test 3: Header mismatch rejects merge');
const badHeader = 'id,amount\n1,99';
try {
  mergeFiles([part1, badHeader]);
  assert(false, 'Should throw on header mismatch');
} catch (e) {
  assert(e.message.includes('Header mismatch'), 'Error should mention header mismatch');
}
console.log('  OK: Header mismatch throws\n');

// Test 4: Empty file should throw
console.log('Test 4: Empty file rejects merge');
try {
  mergeFiles([part1, '']);
  assert(false, 'Should throw on empty file');
} catch (e) {
  assert(e.message.includes('empty'), 'Error should mention empty');
}
console.log('  OK: Empty file throws\n');

console.log('All tests passed. Merge logic matches the tool behavior.');
