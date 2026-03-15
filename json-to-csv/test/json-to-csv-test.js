/**
 * JSON to CSV tests — same logic as json-to-csv/index.html (escapeCsvValue, getAllKeys, jsonToCsv).
 * Run: node json-to-csv-test.js
 */
const fs = require('fs');
const path = require('path');

const FIXTURES = path.join(__dirname, 'fixtures');

// Replicate escapeCsvValue from json-to-csv page
function escapeCsvValue(val) {
  if (val === null || val === undefined) return '';
  const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
  if (/[",\r\n]/.test(str)) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

// Replicate getAllKeys from json-to-csv page
function getAllKeys(rows) {
  const keySet = new Set();
  const order = [];
  for (const row of rows) {
    for (const k of Object.keys(row)) {
      if (!keySet.has(k)) {
        keySet.add(k);
        order.push(k);
      }
    }
  }
  return order;
}

// Replicate jsonToCsv from json-to-csv page
function jsonToCsv(data) {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('JSON must be a non-empty array of objects.');
  }
  const rows = data.map((item) => {
    if (item !== null && typeof item === 'object' && !Array.isArray(item)) return item;
    throw new Error('Each array element must be an object.');
  });
  const keys = getAllKeys(rows);
  if (keys.length === 0) throw new Error('Objects must have at least one key.');
  const headerRow = keys.map((k) => escapeCsvValue(k)).join(',');
  const dataRows = rows.map((row) =>
    keys.map((k) => escapeCsvValue(row[k])).join(',')
  );
  return [headerRow, ...dataRows].join('\n');
}

function assert(condition, message) {
  if (!condition) {
    console.error('FAIL:', message);
    process.exit(1);
  }
}

console.log('JSON to CSV tests\n');

// Test 1: Basic conversion
console.log('Test 1: Basic array of objects');
const simple = JSON.parse(fs.readFileSync(path.join(FIXTURES, 'simple.json'), 'utf8'));
const csv1 = jsonToCsv(simple);
const lines1 = csv1.split('\n');
assert(lines1.length === 3, 'Expected 1 header + 2 data rows');
assert(lines1[0] === 'name,age,city', 'Header should be name,age,city');
assert(lines1[1] === 'Alice,28,New York', 'Row 1 content');
assert(lines1[2] === 'Bob,35,Chicago', 'Row 2 content');
console.log('  OK: Header and rows match\n');

// Test 2: Special characters (comma, quotes, newline)
console.log('Test 2: Escaping (comma, quotes, newline)');
const special = JSON.parse(fs.readFileSync(path.join(FIXTURES, 'with-special-chars.json'), 'utf8'));
const csv2 = jsonToCsv(special);
assert(csv2.includes('"has, comma"'), 'Comma in value should be quoted');
assert(csv2.includes('"has ""quotes"""'), 'Quotes should be doubled');
assert(csv2.includes('"line1\nline2"'), 'Newline should be in quoted field');
console.log('  OK: Special characters escaped\n');

// Test 3: Nested objects/arrays → JSON string
console.log('Test 3: Nested values as JSON strings');
const nested = JSON.parse(fs.readFileSync(path.join(FIXTURES, 'nested.json'), 'utf8'));
const csv3 = jsonToCsv(nested);
const lines3 = csv3.split('\n');
assert(lines3.length === 3, '2 data rows + header');
assert(lines3[0].includes('meta') && lines3[0].includes('tags'), 'Header includes nested keys');
assert(lines3[1].includes('api') && lines3[2].includes('upload'), 'Nested values present in output');
console.log('  OK: Nested values stringified\n');

// Test 4: Missing keys → empty cells
console.log('Test 4: Missing keys output empty cells');
const withMissing = [
  { a: 1, b: 2 },
  { a: 3 },
  { b: 4 },
];
const csv4 = jsonToCsv(withMissing);
const lines4 = csv4.split('\n');
assert(lines4[0] === 'a,b', 'Header a,b');
assert(lines4[1] === '1,2', 'Row 1');
assert(lines4[2] === '3,', 'Row 2: b missing → empty');
assert(lines4[3] === ',4', 'Row 3: a missing → empty');
console.log('  OK: Missing keys → empty cells\n');

// Test 5: Invalid — empty array
console.log('Test 5: Empty array throws');
try {
  jsonToCsv([]);
  assert(false, 'Should throw on empty array');
} catch (e) {
  assert(e.message.includes('non-empty array'), 'Error message');
}
console.log('  OK: Empty array throws\n');

// Test 6: Invalid — not an array
console.log('Test 6: Non-array throws');
try {
  jsonToCsv({});
  assert(false, 'Should throw on object');
} catch (e) {
  assert(e.message.includes('array'), 'Error message');
}
try {
  jsonToCsv([{ a: 1 }, 'not an object']);
  assert(false, 'Should throw on non-object element');
} catch (e) {
  assert(e.message.includes('object'), 'Error message');
}
console.log('  OK: Non-array / non-object throws\n');

// Test 7: Empty objects (no keys) throws
console.log('Test 7: Empty objects throw');
try {
  jsonToCsv([{}, {}]);
  assert(false, 'Should throw when no keys');
} catch (e) {
  assert(e.message.includes('at least one key'), 'Error message');
}
console.log('  OK: Empty objects throw\n');

console.log('All tests passed. JSON to CSV logic matches the tool behavior.');
