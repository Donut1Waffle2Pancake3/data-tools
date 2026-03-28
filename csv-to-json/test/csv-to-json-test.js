/**
 * CSV to JSON tests — same logic as csv-to-json/index.html (parseCSVRows, csvToJson).
 * Run: node csv-to-json-test.js
 */
const fs = require('fs');
const path = require('path');

const FIXTURES = path.join(__dirname, 'fixtures');

function delimMatchesAt(s, i, delimiter) {
  if (!delimiter || i + delimiter.length > s.length) return false;
  for (let k = 0; k < delimiter.length; k++) {
    if (s[i + k] !== delimiter[k]) return false;
  }
  return true;
}

function parseCSVRows(text, delimiter) {
  const delim = delimiter || ',';
  const normalized = (text || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const trimmed = normalized.replace(/\n+$/, '');
  if (!trimmed) return [];
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;
  for (let i = 0; i < trimmed.length; i++) {
    const ch = trimmed[i];
    if (ch === '"') {
      if (inQuotes && trimmed[i + 1] === '"') {
        cell += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (!inQuotes) {
      if (delimMatchesAt(trimmed, i, delim)) {
        row.push(cell.trim());
        cell = '';
        i += delim.length - 1;
      } else if (ch === '\n') {
        row.push(cell.trim());
        rows.push(row);
        row = [];
        cell = '';
      } else {
        cell += ch;
      }
    } else {
      cell += ch;
    }
  }
  row.push(cell.trim());
  rows.push(row);
  if (inQuotes) throw new Error('CSV appears malformed: a quoted field was never closed.');
  return rows;
}

function toSnakeCase(name) {
  return String(name)
    .trim()
    .replace(/\s+/g, '_')
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[^a-zA-Z0-9_]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .toLowerCase();
}

function dedupeKeyList(keys) {
  const seen = Object.create(null);
  const out = keys.slice();
  for (let i = 0; i < out.length; i++) {
    if (out[i] === '') continue;
    const k = out[i];
    const n = (seen[k] = (seen[k] || 0) + 1);
    if (n > 1) out[i] = `${k}_${n}`;
  }
  return out;
}

function nestingConflictKey(headers) {
  const roots = Object.create(null);
  for (let i = 0; i < headers.length; i++) {
    const h = headers[i];
    if (!h || h.indexOf('.') === -1) continue;
    roots[h.split('.')[0]] = true;
  }
  for (let j = 0; j < headers.length; j++) {
    const h2 = headers[j];
    if (!h2 || h2.indexOf('.') !== -1) continue;
    if (roots[h2]) return h2;
  }
  return null;
}

function nestFlatObject(flat) {
  const out = {};
  for (const k of Object.keys(flat)) {
    const parts = k.split('.');
    if (parts.length === 1) {
      out[k] = flat[k];
      continue;
    }
    let cur = out;
    for (let p = 0; p < parts.length - 1; p++) {
      const seg = parts[p];
      if (cur[seg] != null && typeof cur[seg] !== 'object') {
        throw new Error(`Nested key conflict at "${seg}"`);
      }
      if (!cur[seg]) cur[seg] = {};
      cur = cur[seg];
    }
    cur[parts[parts.length - 1]] = flat[k];
  }
  return out;
}

function inferCellValue(cell, forceString) {
  if (forceString) return cell;
  const t = String(cell).trim();
  if (t === '') return null;
  const tl = t.toLowerCase();
  if (tl === 'true') return true;
  if (tl === 'false') return false;
  if (tl === 'null') return null;
  if (/^-?\d+$/.test(t)) {
    const ni = parseInt(t, 10);
    if (String(ni) === t) return ni;
  }
  if (/^-?\d+\.\d+$/.test(t) || /^-?\d+e[+-]?\d+$/i.test(t)) {
    const nf = parseFloat(t);
    if (Number.isFinite(nf)) return nf;
  }
  return t;
}

function csvToJson(csvText, opts) {
  const delim = (opts && opts.delimiter) || ',';
  const rows = parseCSVRows(csvText, delim);
  if (rows.length === 0) throw new Error('The CSV appears to be empty.');
  const headerRow = rows[0].map((c) => c.trim());
  const nonempty = headerRow.filter((h) => h !== '');
  if (nonempty.length === 0) throw new Error('The first row must contain at least one column name.');
  const numHeaders = headerRow.length;
  const snakeCase = opts && opts.snakeCase;
  const dedupe = opts && opts.dedupe;
  const nest = opts && opts.nest;
  const simple = opts && opts.simple;
  const forceStr = (opts && opts.forceString) || {};

  let keys = [];
  for (let c = 0; c < numHeaders; c++) {
    const raw = headerRow[c];
    if (raw === '') keys.push('');
    else keys.push(snakeCase ? toSnakeCase(raw) : raw);
  }
  if (dedupe) keys = dedupeKeyList(keys);

  if (nest) {
    const bad = nestingConflictKey(keys);
    if (bad) throw new Error(`Nested keys conflict: ${bad}`);
  }

  const result = [];
  for (let r = 1; r < rows.length; r++) {
    const cells = rows[r];
    const flat = {};
    for (let c2 = 0; c2 < numHeaders; c2++) {
      let key = keys[c2];
      if (key === '') key = `extra_${c2 + 1}`;
      const rawCell = c2 < cells.length ? cells[c2] : '';
      const asStr = !!forceStr[key];
      const val = simple ? rawCell : inferCellValue(rawCell, asStr);
      flat[key] = val;
    }
    for (let c3 = numHeaders; c3 < cells.length; c3++) {
      flat[`extra_${c3 + 1}`] = simple ? cells[c3] : inferCellValue(cells[c3], false);
    }
    result.push(nest ? nestFlatObject(flat) : flat);
  }
  return result;
}

function assert(condition, message) {
  if (!condition) {
    console.error('FAIL:', message);
    process.exit(1);
  }
}

const defaultOpts = {
  delimiter: ',',
  simple: true,
  snakeCase: false,
  dedupe: false,
  nest: false,
  forceString: {},
};

console.log('CSV to JSON tests\n');

// Test 1: Simple CSV to JSON
console.log('Test 1: Simple CSV to JSON');
const simple = fs.readFileSync(path.join(FIXTURES, 'simple.csv'), 'utf8');
const json1 = csvToJson(simple, defaultOpts);
assert(Array.isArray(json1), 'Output should be an array');
assert(json1.length === 2, 'Expected 2 objects, got ' + json1.length);
assert(json1[0].name === 'Alice' && json1[0].age === '28' && json1[0].city === 'New York', 'First row object');
assert(json1[1].name === 'Bob' && json1[1].age === '35' && json1[1].city === 'Chicago', 'Second row object');
console.log('  OK: Header row becomes keys, data rows become objects\n');

// Test 2: Quoted fields (comma and escaped quote)
console.log('Test 2: Quoted fields with comma and ""');
const withQuotes = fs.readFileSync(path.join(FIXTURES, 'with-quotes.csv'), 'utf8');
const json2 = csvToJson(withQuotes, defaultOpts);
assert(json2.length === 2, 'Expected 2 objects');
assert(json2[0].id === '1' && json2[0].company === 'Acme, Inc' && json2[0].value === '100', 'Comma inside quotes preserved');
assert(json2[1].company === 'Say "hello"', 'Escaped "" inside quoted field');
console.log('  OK: Quoted fields and escaped quotes preserved\n');

// Test 3: Empty input throws
console.log('Test 3: Empty CSV throws');
try {
  csvToJson('', defaultOpts);
  assert(false, 'Should throw on empty input');
} catch (e) {
  assert(e.message.includes('empty'), 'Error should mention empty');
}
console.log('  OK: Empty input throws\n');

// Test 4: Header-only (no data rows) → empty array
console.log('Test 4: Header only gives empty array');
const headerOnly = 'a,b,c\n';
const json4 = csvToJson(headerOnly, defaultOpts);
assert(Array.isArray(json4) && json4.length === 0, 'Header only should yield []');
console.log('  OK: Header only yields []\n');

// Test 5: Missing headers (all blank) throws
console.log('Test 5: All-blank header row throws');
try {
  csvToJson(',,\n1,2,3', defaultOpts);
  assert(false, 'Should throw when no column names');
} catch (e) {
  assert(e.message.includes('first row') || e.message.includes('column'), 'Error should mention header/column');
}
console.log('  OK: All-blank header throws\n');

// Test 6: Uneven columns — missing cells → "", extra cells → extra_1, extra_2
console.log('Test 6: Uneven columns (missing and extra)');
const uneven = 'x,y\n1,2,3\n4\n5,6';
const json6 = csvToJson(uneven, defaultOpts);
assert(json6.length === 3, 'Expected 3 objects');
assert(json6[0].x === '1' && json6[0].y === '2' && json6[0].extra_3 === '3', 'Extra column becomes extra_3');
assert(json6[1].x === '4' && json6[1].y === '', 'Missing cell is empty string');
assert(json6[2].x === '5' && json6[2].y === '6', 'Row 3 normal');
console.log('  OK: Missing → "", extra → extra_N\n');

// Test 7: Windows line endings
console.log('Test 7: Windows line endings');
const crlf = 'a,b\r\n1,2\r\n3,4\r\n';
const json7 = csvToJson(crlf, defaultOpts);
assert(json7.length === 2, 'Expected 2 objects');
assert(json7[0].a === '1' && json7[0].b === '2', 'CRLF parsed');
console.log('  OK: CRLF handled\n');

// Test 8: Trailing blank lines ignored
console.log('Test 8: Trailing blank lines ignored');
const trailing = 'p,q\n1,2\n\n\n';
const json8 = csvToJson(trailing, defaultOpts);
assert(json8.length === 1, 'Only one data row; trailing blanks ignored');
assert(json8[0].p === '1' && json8[0].q === '2', 'Content correct');
console.log('  OK: Trailing blank lines stripped\n');

// Test 9: Output is valid JSON
console.log('Test 9: Output is valid JSON');
const str = JSON.stringify(csvToJson(simple, defaultOpts));
const parsed = JSON.parse(str);
assert(Array.isArray(parsed) && parsed.length === 2, 'Round-trip valid');
console.log('  OK: Output is valid JSON\n');

// Test 10: Tab delimiter
console.log('Test 10: Tab delimiter');
const tsv = 'a\tb\n1\t2\n';
const j10 = csvToJson(tsv, { ...defaultOpts, delimiter: '\t' });
assert(j10.length === 1 && j10[0].a === '1' && j10[0].b === '2', 'TSV');
console.log('  OK: Tab delimiter\n');

// Test 11: Typed mode
console.log('Test 11: Typed inference');
const typedCsv = 'n,f,e\n42,true,\n3.5,false,null\n';
const j11 = csvToJson(typedCsv, { ...defaultOpts, simple: false });
assert(j11[0].n === 42 && j11[0].f === true && j11[0].e === null, 'Row 0 typed');
assert(j11[1].n === 3.5 && j11[1].f === false && j11[1].e === null, 'Row 1 typed');
console.log('  OK: Typed values\n');

// Test 12: snake_case + dedupe
console.log('Test 12: snake_case and dedupe');
const dup = 'User Name,user name,x\na,b,c\n';
const j12 = csvToJson(dup, { ...defaultOpts, snakeCase: true, dedupe: true });
assert(j12[0].user_name === 'a' && j12[0].user_name_2 === 'b', 'snake + dedupe');
console.log('  OK: Header normalization\n');

// Test 13: Nested keys
console.log('Test 13: Nested dotted headers');
const nestCsv = 'user.name,user.age\nAnn,30\n';
const j13 = csvToJson(nestCsv, { ...defaultOpts, nest: true });
assert(j13[0].user.name === 'Ann' && j13[0].user.age === '30', 'nested');
console.log('  OK: Nesting\n');

// Test 14: Nesting conflict
console.log('Test 14: Nesting conflict throws');
try {
  csvToJson('user,user.id\na,b\n', { ...defaultOpts, nest: true });
  assert(false, 'expected throw');
} catch (e) {
  assert(e.message.includes('conflict'), 'conflict message');
}
console.log('  OK: Conflict detected\n');

console.log('All tests passed. CSV to JSON logic matches the tool behavior.');
