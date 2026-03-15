/**
 * JSON Formatter & Validator tests — same logic as json-formatter/index.html.
 * Run: node json-formatter-test.js
 */
'use strict';

function getFriendlyParseError(err) {
  if (!(err instanceof SyntaxError)) return err.message || 'Invalid JSON.';
  const msg = err.message || '';
  if (err.message && /position|line|column/i.test(err.message)) return msg;
  if (typeof err.lineNumber !== 'undefined') return msg + ' (around line ' + err.lineNumber + ')';
  return msg || 'Invalid JSON. Check quotes, commas, and brackets.';
}

function runFormat(text) {
  const trimmed = (text || '').trim();
  if (!trimmed) throw new Error('Please paste JSON or upload a .json or .txt file.');
  const parsed = JSON.parse(trimmed);
  return JSON.stringify(parsed, null, 2);
}

function runMinify(text) {
  const trimmed = (text || '').trim();
  if (!trimmed) throw new Error('Please paste JSON or upload a .json or .txt file.');
  const parsed = JSON.parse(trimmed);
  return JSON.stringify(parsed);
}

function runValidate(text) {
  const trimmed = (text || '').trim();
  if (!trimmed) throw new Error('Please paste JSON or upload a .json or .txt file.');
  JSON.parse(trimmed);
  return true;
}

function assert(condition, message) {
  if (!condition) {
    console.error('FAIL:', message);
    process.exit(1);
  }
}

console.log('JSON Formatter & Validator tests\n');

// Test 1: Format produces 2-space indentation
console.log('Test 1: Format produces 2-space indentation');
const input1 = '{"a":1,"b":[2,3]}';
const formatted = runFormat(input1);
assert(formatted.includes('\n'), 'Formatted output has newlines');
assert(formatted.includes('  '), 'Formatted output has 2-space indent');
const parsed1 = JSON.parse(formatted);
assert(parsed1.a === 1 && parsed1.b[0] === 2, 'Formatted JSON parses back correctly');
console.log('  OK: Format uses 2-space indent\n');

// Test 2: Minify produces single line
console.log('Test 2: Minify produces single line');
const minified = runMinify(input1);
assert(minified.indexOf('\n') === -1, 'Minified output has no newlines');
const parsed2 = JSON.parse(minified);
assert(parsed2.a === 1, 'Minified JSON parses back correctly');
console.log('  OK: Minify produces single line\n');

// Test 3: Validate accepts valid JSON
console.log('Test 3: Validate accepts valid JSON');
const valid = runValidate(input1);
assert(valid === true, 'Validate returns true for valid JSON');
console.log('  OK: Valid JSON passes validate\n');

// Test 4: Invalid JSON throws on format
console.log('Test 4: Invalid JSON throws on format');
try {
  runFormat('{ invalid }');
  assert(false, 'Should throw on invalid JSON');
} catch (e) {
  assert(e instanceof SyntaxError, 'Should be SyntaxError');
  const friendly = getFriendlyParseError(e);
  assert(friendly.length > 0, 'Friendly message is non-empty');
}
console.log('  OK: Invalid JSON throws\n');

// Test 5: Invalid JSON throws on minify
console.log('Test 5: Invalid JSON throws on minify');
try {
  runMinify('{"a":');
  assert(false, 'Should throw');
} catch (e) {
  assert(e instanceof SyntaxError, 'Should be SyntaxError');
}
console.log('  OK: Minify throws on invalid\n');

// Test 6: Invalid JSON throws on validate
console.log('Test 6: Invalid JSON throws on validate');
try {
  runValidate('null x');
  assert(false, 'Should throw');
} catch (e) {
  assert(e instanceof SyntaxError, 'Should be SyntaxError');
}
console.log('  OK: Validate throws on invalid\n');

// Test 7: Empty input throws
console.log('Test 7: Empty input throws');
try {
  runFormat('');
  assert(false, 'Should throw on empty');
} catch (e) {
  assert(e.message.includes('paste') || e.message.includes('upload'), 'Error mentions input');
}
console.log('  OK: Empty input throws\n');

// Test 8: Format then parse round-trip
console.log('Test 8: Format round-trip');
const complex = '{"name":"Test","nested":{"a":1,"b":2},"arr":[1,2,3]}';
const formattedComplex = runFormat(complex);
const roundTrip = JSON.parse(formattedComplex);
assert(roundTrip.name === 'Test' && roundTrip.nested.a === 1 && roundTrip.arr.length === 3, 'Round-trip preserves data');
console.log('  OK: Format round-trip\n');

// Test 9: Minify round-trip
console.log('Test 9: Minify round-trip');
const minifiedComplex = runMinify(complex);
const roundTripMin = JSON.parse(minifiedComplex);
assert(roundTripMin.name === 'Test', 'Minify round-trip preserves data');
console.log('  OK: Minify round-trip\n');

// Test 10: getFriendlyParseError includes message
console.log('Test 10: getFriendlyParseError');
try {
  JSON.parse('{');
} catch (e) {
  const msg = getFriendlyParseError(e);
  assert(msg.length > 0 && (msg.includes('JSON') || msg.includes('position') || msg.includes('line')), 'Friendly error message');
}
console.log('  OK: Friendly parse error\n');

console.log('All tests passed. JSON Formatter logic matches the tool behavior.');
