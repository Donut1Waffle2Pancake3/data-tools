/**
 * Tests for HTML encoder/decoder logic (mirrors the logic in index.html).
 * Run with: node html-encoder-decoder/test-html-encoder-decoder.js
 */

const NAMED_ENTITIES = {
  '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&apos;': "'", '&#39;': "'",
  '&nbsp;': '\u00A0', '&copy;': '\u00A9', '&reg;': '\u00AE', '&trade;': '\u2122',
  '&mdash;': '\u2014', '&ndash;': '\u2013', '&hellip;': '\u2026', '&lsquo;': '\u2018',
  '&rsquo;': '\u2019', '&ldquo;': '\u201C', '&rdquo;': '\u201D'
};

function encodeHtml(str, nonAscii) {
  if (nonAscii === undefined) nonAscii = false;
  let out = '';
  for (let i = 0; i < str.length; i++) {
    const c = str.charAt(i);
    const code = str.charCodeAt(i);
    if (c === '&') out += '&amp;';
    else if (c === '<') out += '&lt;';
    else if (c === '>') out += '&gt;';
    else if (c === '"') out += '&quot;';
    else if (c === "'") out += '&#39;';
    else if (nonAscii && code > 127) out += '&#' + code + ';';
    else out += c;
  }
  return out;
}

function decodeHtml(str) {
  let s = str;
  for (const key in NAMED_ENTITIES) {
    if (NAMED_ENTITIES.hasOwnProperty(key)) {
      s = s.split(key).join(NAMED_ENTITIES[key]);
    }
  }
  s = s.replace(/&#(\d+);/g, (_, dec) => {
    const n = parseInt(dec, 10);
    return n >= 0 && n <= 0x10FFFF ? String.fromCodePoint(n) : '';
  });
  s = s.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
    const n = parseInt(hex, 16);
    return n >= 0 && n <= 0x10FFFF ? String.fromCodePoint(n) : '';
  });
  return s;
}

let passed = 0;
let failed = 0;

function ok(cond, msg) {
  if (cond) {
    passed++;
    console.log('  ✓ ' + msg);
  } else {
    failed++;
    console.log('  ✗ ' + msg);
  }
}

function eq(a, b, msg) {
  const same = a === b;
  if (same) {
    passed++;
    console.log('  ✓ ' + msg);
  } else {
    failed++;
    console.log('  ✗ ' + msg + ' (got: ' + JSON.stringify(a) + ', expected: ' + JSON.stringify(b) + ')');
  }
}

console.log('HTML Encoder / Decoder — tests\n');

// --- Encode: basic unsafe characters ---
console.log('Encode (unsafe only):');
eq(encodeHtml('&'), '&amp;', '& → &amp;');
eq(encodeHtml('<'), '&lt;', '< → &lt;');
eq(encodeHtml('>'), '&gt;', '> → &gt;');
eq(encodeHtml('"'), '&quot;', '" → &quot;');
eq(encodeHtml("'"), '&#39;', "' → &#39;");
eq(encodeHtml('Tom & Jerry'), 'Tom &amp; Jerry', 'Tom & Jerry');
eq(encodeHtml('<div>'), '&lt;div&gt;', '<div>');
eq(encodeHtml('a<b>c'), 'a&lt;b&gt;c', 'a<b>c');
eq(encodeHtml('Say "hello"'), 'Say &quot;hello&quot;', 'Say "hello"');
eq(encodeHtml("it's"), 'it&#39;s', "it's");
eq(encodeHtml(''), '', 'empty string');
eq(encodeHtml('plain'), 'plain', 'plain text unchanged');

// --- Encode: line breaks preserved ---
console.log('\nEncode (line breaks):');
eq(encodeHtml('a\nb'), 'a\nb', 'newline preserved');
eq(encodeHtml('x\ny\nz'), 'x\ny\nz', 'multiple newlines');

// --- Encode: non-ASCII (option on) ---
console.log('\nEncode (non-ASCII on):');
eq(encodeHtml('é', true), '&#233;', 'é → &#233;');
eq(encodeHtml('☕', true), '&#9749;', '☕ → &#9749;');
eq(encodeHtml('François', true), 'Fran&#231;ois', 'ç encoded');
eq(encodeHtml('a', true), 'a', 'ASCII unchanged when nonAscii=true');

// --- Decode: named entities ---
console.log('\nDecode (named):');
eq(decodeHtml('&amp;'), '&', '&amp; → &');
eq(decodeHtml('&lt;'), '<', '&lt; → <');
eq(decodeHtml('&gt;'), '>', '&gt; → >');
eq(decodeHtml('&quot;'), '"', '&quot; → "');
eq(decodeHtml('&apos;'), "'", '&apos; → \'');
eq(decodeHtml('&lt;div&gt;Hello&lt;/div&gt;'), '<div>Hello</div>', 'tag roundtrip');
eq(decodeHtml('Tom &amp; Jerry'), 'Tom & Jerry', 'Tom &amp; Jerry');

// --- Decode: decimal numeric ---
console.log('\nDecode (decimal):');
eq(decodeHtml('&#38;'), '&', '&#38; → &');
eq(decodeHtml('&#60;'), '<', '&#60; → <');
eq(decodeHtml('&#9733;'), '★', '&#9733; → ★');

// --- Decode: hex ---
console.log('\nDecode (hex):');
eq(decodeHtml('&#x26;'), '&', '&#x26; → &');
eq(decodeHtml('&#x3C;'), '<', '&#x3C; → <');
eq(decodeHtml('&#x2605;'), '★', '&#x2605; → ★');

// --- Roundtrip ---
console.log('\nRoundtrip:');
const plain = 'Tom & Jerry\n<div class="note">Hello</div>';
const encoded = encodeHtml(plain);
eq(decodeHtml(encoded), plain, 'encode then decode = original');

// --- Empty / edge ---
console.log('\nEdge cases:');
eq(decodeHtml(''), '', 'decode empty');
eq(encodeHtml('&amp;'), '&amp;amp;', 'encode &amp; doubles ampersand');

console.log('\n' + (failed ? '---' : '') + (failed ? ` ${failed} failed, ` : '') + `${passed} passed`);
process.exit(failed ? 1 : 0);
