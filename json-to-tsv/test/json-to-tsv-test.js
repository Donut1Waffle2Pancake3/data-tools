/**
 * JSON to TSV tests — same logic as json-to-tsv/index.html
 * (getAllKeys, cellValue, escapeTsvCell, jsonToTsv, normalizeInput).
 * Run: node test/json-to-tsv-test.js
 */
const fs = require('fs');
const path = require('path');

const FIXTURES_JSON_TO_CSV = path.join(__dirname, '../../json-to-csv/test/fixtures');

function getAllKeys(rows) {
  const keySet = {};
  const order = [];
  for (let i = 0; i < rows.length; i++) {
    const keys = Object.keys(rows[i]);
    for (let k = 0; k < keys.length; k++) {
      if (!keySet[keys[k]]) {
        keySet[keys[k]] = true;
        order.push(keys[k]);
      }
    }
  }
  return order;
}

function cellValue(val) {
  if (val === null || val === undefined) return '';
  if (typeof val === 'object') return JSON.stringify(val);
  return String(val);
}

function escapeTsvCell(str) {
  if (str === null || str === undefined) return '';
  const s = String(str);
  return s.replace(/\t/g, ' ').replace(/[\r\n]+/g, ' ');
}

function jsonToTsv(rows) {
  if (rows.length === 0) throw new Error('The JSON array is empty, so there is no TSV to generate.');
  const keys = getAllKeys(rows);
  if (keys.length === 0) throw new Error('Objects must have at least one key.');
  const headerRow = keys.map(k => escapeTsvCell(k)).join('\t');
  const dataRows = rows.map(row =>
    keys.map(k => escapeTsvCell(cellValue(row[k]))).join('\t')
  );
  return [headerRow, ...dataRows].join('\n');
}

function normalizeInput(data) {
  if (Array.isArray(data)) {
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      if (item === null || typeof item !== 'object' || Array.isArray(item)) {
        throw new Error('The JSON array must contain only objects. Item at index ' + i + ' is not an object.');
      }
    }
    return data;
  }
  if (data !== null && typeof data === 'object' && !Array.isArray(data)) {
    return [data];
  }
  throw new Error('JSON must be an array of objects or a single object. Primitives and other types cannot be converted to a table.');
}

function fullConvert(jsonText) {
  const data = JSON.parse(jsonText);
  const rows = normalizeInput(data);
  return jsonToTsv(rows);
}

function assert(condition, message) {
  if (!condition) {
    console.error('FAIL:', message);
    process.exit(1);
  }
}

console.log('JSON to TSV tests\n');

// Test 1: Basic array of objects
console.log('Test 1: Basic array of objects → TSV (tabs)');
const simple = JSON.parse(fs.readFileSync(path.join(FIXTURES_JSON_TO_CSV, 'simple.json'), 'utf8'));
const tsv1 = jsonToTsv(simple);
const lines1 = tsv1.split('\n');
assert(lines1.length === 3, 'Expected 1 header + 2 data rows');
assert(lines1[0] === 'name\tage\tcity', 'Header should be tab-separated');
assert(lines1[1] === 'Alice\t28\tNew York', 'Row 1 content');
assert(lines1[2] === 'Bob\t35\tChicago', 'Row 2 content');
console.log('  OK: Header and rows match\n');

// Test 2: Single object → one row
console.log('Test 2: Single object → one row');
const single = { name: 'Eve', age: 40 };
const rows2 = normalizeInput(single);
assert(rows2.length === 1 && rows2[0].name === 'Eve', 'Single object becomes one row');
const tsv2 = jsonToTsv(rows2);
assert(tsv2.split('\n').length === 2, 'One header + one data row');
assert(tsv2.includes('Eve') && tsv2.includes('40'), 'Values present');
console.log('  OK: Single object → one row\n');

// Test 3: fullConvert from JSON string (array)
console.log('Test 3: fullConvert with array');
const tsv3 = fullConvert(JSON.stringify(simple));
assert(tsv3 === tsv1, 'fullConvert(array) matches jsonToTsv(normalized)');
console.log('  OK: fullConvert array\n');

// Test 4: fullConvert from JSON string (single object)
console.log('Test 4: fullConvert with single object');
const tsv4 = fullConvert(JSON.stringify(single));
assert(tsv4.split('\n').length === 2, 'fullConvert(single object) → 2 lines');
console.log('  OK: fullConvert single object\n');

// Test 5: Missing keys → empty cells
console.log('Test 5: Missing keys → empty cells');
const withMissing = [
  { a: 1, b: 2 },
  { a: 3 },
  { b: 4 },
];
const tsv5 = jsonToTsv(withMissing);
const lines5 = tsv5.split('\n');
assert(lines5[0] === 'a\tb', 'Header a\tb');
assert(lines5[1] === '1\t2', 'Row 1');
assert(lines5[2] === '3\t', 'Row 2: b missing → empty');
assert(lines5[3] === '\t4', 'Row 3: a missing → empty');
console.log('  OK: Missing keys → empty cells\n');

// Test 6: Nested objects/arrays → JSON string in cell
console.log('Test 6: Nested values → JSON string in cell');
const nested = JSON.parse(fs.readFileSync(path.join(FIXTURES_JSON_TO_CSV, 'nested.json'), 'utf8'));
const tsv6 = jsonToTsv(nested);
const lines6 = tsv6.split('\n');
assert(lines6.length === 3, '2 data rows + header');
assert(lines6[0].includes('meta') && lines6[0].includes('tags'), 'Header includes nested keys');
assert(lines6[1].includes('api') || lines6[2].includes('upload'), 'Nested values present');
assert(lines6[1].includes('{"source":"api"}') || lines6[2].includes('["a","b"]'), 'Nested serialized as JSON');
console.log('  OK: Nested stringified in cell\n');

// Test 7: Tabs and newlines in values → replaced (escapeTsvCell)
console.log('Test 7: Tabs and newlines in cell values replaced');
const withTabs = [{ x: 'a\tb', y: 'c\nd' }];
const tsv7 = jsonToTsv(withTabs);
assert(!tsv7.includes('\t\t'), 'No double tab from value');
assert(tsv7.includes('a b') || tsv7.includes('c d'), 'Tab/newline replaced with space');
console.log('  OK: Tabs/newlines in values normalized\n');

// Test 8: Empty array throws
console.log('Test 8: Empty array throws');
try {
  jsonToTsv([]);
  assert(false, 'Should throw on empty array');
} catch (e) {
  assert(e.message.includes('empty') && e.message.includes('TSV'), 'Error message');
}
console.log('  OK: Empty array throws\n');

// Test 9: normalizeInput — array of non-objects throws
console.log('Test 9: Array of non-objects throws');
try {
  normalizeInput([{ a: 1 }, 'not an object']);
  assert(false, 'Should throw');
} catch (e) {
  assert(e.message.includes('index 1') && e.message.includes('not an object'), 'Error message');
}
console.log('  OK: Non-object element throws\n');

// Test 10: Primitive throws
console.log('Test 10: Primitive throws');
try {
  normalizeInput(42);
  assert(false, 'Should throw on number');
} catch (e) {
  assert(e.message.includes('array of objects') || e.message.includes('single object'), 'Error message');
}
try {
  normalizeInput('hello');
  assert(false, 'Should throw on string');
} catch (e) {
  assert(e.message.length > 0, 'Error message');
}
console.log('  OK: Primitive throws\n');

// Test 11: Empty objects throw
console.log('Test 11: Empty objects (no keys) throw');
try {
  jsonToTsv([{}, {}]);
  assert(false, 'Should throw when no keys');
} catch (e) {
  assert(e.message.includes('at least one key'), 'Error message');
}
console.log('  OK: Empty objects throw\n');

// Test 12: Key order — first-seen order
console.log('Test 12: Key order is first-seen');
const orderCheck = [
  { b: 1, a: 2 },
  { a: 3, c: 4 },
];
const tsv12 = jsonToTsv(orderCheck);
assert(tsv12.startsWith('b\ta\tc'), 'Header order b, a, c');
console.log('  OK: First-seen key order\n');

console.log('All tests passed. JSON to TSV logic matches the tool behavior.');
