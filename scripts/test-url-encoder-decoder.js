/**
 * Tests for URL Encoder/Decoder core logic (encode, decode, smart +, multi-pass, invalid handling).
 * Run: node scripts/test-url-encoder-decoder.js
 */
const assert = require('assert');

function findFirstInvalidPercentEscape(s) {
  for (let i = 0; i < s.length; i++) {
    if (s[i] !== '%') continue;
    if (i + 2 >= s.length) return i;
    const h1 = s[i + 1];
    const h2 = s[i + 2];
    const isHex = (c) => /[0-9a-fA-F]/.test(c);
    if (!isHex(h1) || !isHex(h2)) return i;
  }
  return -1;
}

function looksLikeQueryString(s) {
  return /[=&]/.test(s || '');
}

function preprocessDecodeInput(raw) {
  return looksLikeQueryString(raw) ? raw.replace(/\+/g, ' ') : raw;
}

function decodeOnceStrict(raw) {
  const text = preprocessDecodeInput(raw);
  const invalidAt = findFirstInvalidPercentEscape(text);
  if (invalidAt !== -1) {
    throw new Error('Invalid URL-encoded input. Check for malformed % sequences.');
  }
  try {
    return decodeURIComponent(text);
  } catch (err) {
    throw new Error('Invalid URL-encoded input. Check for malformed % sequences.');
  }
}

function hasPercentEncodedBytes(s) {
  return /%[0-9a-fA-F]{2}/.test(s || '');
}

function decodeStrict(raw, fullyDecode = false) {
  if (!fullyDecode) return decodeOnceStrict(raw);
  let cur = raw;
  for (let i = 0; i < 10; i++) {
    const next = decodeOnceStrict(cur);
    if (next === cur) return next;
    cur = next;
    if (!hasPercentEncodedBytes(cur)) break;
  }
  return cur;
}

function encodeText(raw) {
  return encodeURIComponent(raw);
}

// --- Tests ---

function testEncode() {
  assert.strictEqual(encodeText('hello'), 'hello');
  assert.strictEqual(encodeText('a b'), 'a%20b');
  assert.strictEqual(encodeText('a+b'), 'a%2Bb');
  assert.strictEqual(encodeText('x=y'), 'x%3Dy');
  assert.strictEqual(encodeText('foo&bar'), 'foo%26bar');
  assert.strictEqual(encodeText(''), '');
  console.log('  encode: ok');
}

function testDecodeBasic() {
  assert.strictEqual(decodeStrict('hello'), 'hello');
  assert.strictEqual(decodeStrict('a%20b'), 'a b');
  assert.strictEqual(decodeStrict('a%2Bb'), 'a+b');
  assert.strictEqual(decodeStrict('x%3Dy'), 'x=y');
  assert.strictEqual(decodeStrict(''), '');
  console.log('  decode basic: ok');
}

function testDecodeSmartPlus() {
  // Query-string-like: + becomes space
  assert.strictEqual(decodeStrict('a+b=c'), 'a b=c');
  assert.strictEqual(decodeStrict('q=hello+world'), 'q=hello world');
  // Not query-string-like: + stays
  assert.strictEqual(decodeStrict('a+b'), 'a+b');
  assert.strictEqual(decodeStrict('hello+'), 'hello+');
  console.log('  decode smart +: ok');
}

function testDecodeMultiPass() {
  // %2520 is double-encoded space: %25 -> %, %20 -> space; one pass -> %20, two pass -> space
  assert.strictEqual(decodeStrict('%2520', false), '%20');
  assert.strictEqual(decodeStrict('%2520', true), ' ');
  assert.strictEqual(decodeStrict('%253F', true), '?');
  console.log('  decode multi-pass: ok');
}

function testDecodeInvalid() {
  const msg = 'Invalid URL-encoded input. Check for malformed % sequences.';
  assert.throws(() => decodeOnceStrict('%'), (e) => e.message === msg);
  assert.throws(() => decodeOnceStrict('%2'), (e) => e.message === msg);
  assert.throws(() => decodeOnceStrict('%2g'), (e) => e.message === msg);
  assert.throws(() => decodeOnceStrict('a%'), (e) => e.message === msg);
  assert.throws(() => decodeOnceStrict('%%'), (e) => e.message === msg);
  console.log('  decode invalid: ok');
}

function testRoundtrip() {
  const samples = ['hello', 'a b', 'x=y&z=1', 'foo+bar', '100%'];
  for (const s of samples) {
    const encoded = encodeText(s);
    const decoded = decodeStrict(encoded);
    assert.strictEqual(decoded, s, `roundtrip "${s}" -> "${encoded}" -> "${decoded}"`);
  }
  console.log('  roundtrip: ok');
}

function run() {
  console.log('URL Encoder/Decoder tests');
  testEncode();
  testDecodeBasic();
  testDecodeSmartPlus();
  testDecodeMultiPass();
  testDecodeInvalid();
  testRoundtrip();
  console.log('All tests passed.');
}

run();
