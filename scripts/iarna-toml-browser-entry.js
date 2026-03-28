'use strict';
const parse = require('@iarna/toml/parse-string.js');
const stringify = require('@iarna/toml/stringify.js');
globalThis.IarnaToml = { parse, stringify };
