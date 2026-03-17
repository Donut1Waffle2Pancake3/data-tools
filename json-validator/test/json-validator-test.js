/**
 * JSON Validator tests — core logic used by json-validator/script.js.
 * Run: node json-validator-test.js
 */
'use strict';

function positionToLineColumn(text, position) {
  if (position < 0 || !text.length) return { line: 1, column: 1 };
  const before = text.slice(0, position);
  const line = (before.match(/\n/g) || []).length + 1;
  const lastNewline = before.lastIndexOf('\n');
  const column = lastNewline === -1 ? position + 1 : position - lastNewline;
  return { line: line, column: column };
}

function getPositionFromError(message, text) {
  const positionMatch = message.match(/position\s+(\d+)/i);
  if (positionMatch) {
    const pos = parseInt(positionMatch[1], 10);
    return positionToLineColumn(text, pos);
  }
  const lineMatch = message.match(/line\s+(\d+)/i);
  const colMatch = message.match(/column\s+(\d+)/i);
  if (lineMatch && colMatch) {
    return {
      line: parseInt(lineMatch[1], 10),
      column: parseInt(colMatch[1], 10)
    };
  }
  return null;
}

function getErrorSnippet(text, line, column, maxLines) {
  maxLines = maxLines || 3;
  const lines = text.split(/\r\n|\r|\n/);
  const start = Math.max(0, line - 1 - Math.floor((maxLines - 1) / 2));
  const end = Math.min(lines.length, start + maxLines);
  const snippetLines = [];
  for (let i = start; i < end; i++) {
    const num = i + 1;
    const content = lines[i] || '';
    snippetLines.push(num + ' | ' + content);
  }
  let snippet = snippetLines.join('\n');
  if (snippet.length > 400) snippet = snippet.slice(0, 400) + '…';
  return snippet;
}

function validate(text) {
  const trimmed = (text || '').trim();
  if (!trimmed) return { valid: false, error: 'Enter JSON to validate.' };
  try {
    JSON.parse(trimmed);
    return { valid: true };
  } catch (err) {
    const msg = err instanceof SyntaxError ? (err.message || 'Invalid JSON.') : String(err.message || 'Invalid JSON.');
    const pos = getPositionFromError(msg, trimmed);
    const line = pos ? pos.line : null;
    const column = pos ? pos.column : null;
    const snippet = (line != null && line > 0) ? getErrorSnippet(trimmed, line, column, 5) : '';
    return { valid: false, error: msg, line, column, snippet };
  }
}

function assert(condition, message) {
  if (!condition) {
    console.error('FAIL:', message);
    process.exit(1);
  }
}

console.log('JSON Validator tests\n');

// --- positionToLineColumn ---
console.log('Test 1: positionToLineColumn');
assert(positionToLineColumn('abc', 0).line === 1 && positionToLineColumn('abc', 0).column === 1, 'First char is line 1 col 1');
assert(positionToLineColumn('a\nb', 2).line === 2 && positionToLineColumn('a\nb', 2).column === 1, 'After newline is line 2 col 1');
assert(positionToLineColumn('{"a":1}', 5).line === 1 && positionToLineColumn('{"a":1}', 5).column === 6, 'Single line column');
console.log('  OK\n');

// --- getPositionFromError (position pattern) ---
console.log('Test 2: getPositionFromError "at position N"');
const posResult = getPositionFromError('Unexpected token } in JSON at position 10', '{"a":1,}');
assert(posResult !== null, 'Returns position info');
assert(posResult.line >= 1 && posResult.column >= 1, 'Line and column are 1-based');
console.log('  OK\n');

// --- getErrorSnippet ---
console.log('Test 3: getErrorSnippet');
const multi = '{\n  "a": 1,\n  "b": 2\n}';
const snippet = getErrorSnippet(multi, 2, 3, 5);
assert(snippet.includes('2 |'), 'Snippet includes line number');
assert(snippet.includes('"a": 1'), 'Snippet includes line content');
console.log('  OK\n');

// --- validate: empty / whitespace ---
console.log('Test 4: Empty input');
const empty = validate('');
assert(empty.valid === false && empty.error === 'Enter JSON to validate.', 'Empty returns enter-prompt');
const spaces = validate('   \n\t  ');
assert(spaces.valid === false && spaces.error === 'Enter JSON to validate.', 'Whitespace returns enter-prompt');
console.log('  OK\n');

// --- validate: valid JSON ---
console.log('Test 5: Valid JSON');
assert(validate('{}').valid === true, 'Empty object is valid');
assert(validate('[]').valid === true, 'Empty array is valid');
assert(validate('{"a":1,"b":[2,3]}').valid === true, 'Object with array is valid');
assert(validate('  { "x": null }  ').valid === true, 'Trimmed valid JSON');
console.log('  OK\n');

// --- validate: invalid JSON ---
console.log('Test 6: Invalid JSON');
const trailing = validate('{"a":1,}');
assert(trailing.valid === false && trailing.error && trailing.error.length > 0, 'Trailing comma invalid');
const unclosed = validate('{"a":1');
assert(unclosed.valid === false, 'Unclosed brace invalid');
assert(validate('{"a": 1').valid === false, 'Unclosed object invalid');
const noComma = validate('{"a":1 "b":2}');
assert(noComma.valid === false, 'Missing comma invalid');
console.log('  OK\n');

// --- validate: error includes line/column when parser provides position ---
console.log('Test 7: Invalid JSON reports line/column when available');
let invalidWithPos;
try {
  JSON.parse('{"a":1,}');
} catch (e) {
  invalidWithPos = validate('{"a":1,}');
}
assert(invalidWithPos && invalidWithPos.valid === false, 'Invalid result');
if (invalidWithPos.line != null) assert(invalidWithPos.line >= 1, 'Line is 1-based');
if (invalidWithPos.column != null) assert(invalidWithPos.column >= 1, 'Column is 1-based');
if (invalidWithPos.snippet) assert(invalidWithPos.snippet.length > 0, 'Snippet non-empty when line known');
console.log('  OK\n');

// --- Edge: very small valid ---
console.log('Test 8: Very small JSON');
assert(validate('0').valid === true, 'Single number valid');
assert(validate('"x"').valid === true, 'Single string valid');
assert(validate('true').valid === true, 'Single boolean valid');
console.log('  OK\n');

// --- Edge: malformed array ---
console.log('Test 9: Malformed array');
assert(validate('[1,2,]').valid === false, 'Trailing comma in array');
assert(validate('[1,2').valid === false, 'Unclosed array');
console.log('  OK\n');

console.log('All JSON Validator tests passed.');
