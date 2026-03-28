(function () {
  var HAS_WORKER = typeof Worker !== 'undefined';
  /** With a parse worker: higher cap; without Worker, match JSON viewer (main-thread only). */
  var MAX_JSON_INPUT_BYTES = HAS_WORKER ? 25 * 1024 * 1024 : 10 * 1024 * 1024;
  var MAX_JSON_SIZE_MSG = HAS_WORKER
    ? 'This input is larger than 25 MB (UTF-8). Paste a smaller file, split the JSON, or use a desktop tool.'
    : 'This input is larger than 10 MB. Paste a smaller file, split the JSON, or use a desktop tool so your browser stays responsive.';
  /** At or above this size, parse off-thread when Worker is available (reduces UI jank). */
  var WORKER_PARSE_MIN_BYTES = 256 * 1024;

  var parseWorker = null;
  var workerSeq = 0;

  function getParseWorker() {
    if (!HAS_WORKER) return null;
    if (!parseWorker) {
      try {
        parseWorker = new Worker('parse-worker.js');
      } catch (err) {
        return null;
      }
    }
    return parseWorker;
  }

  function utf8ByteLength(str) {
    if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(str).length;
    return str.length;
  }

  const jsonInput = document.getElementById('jsonInput');
  const fileInput = document.getElementById('fileInput');
  const dropZone = document.getElementById('dropZone');
  const validateBtn = document.getElementById('validateBtn');
  const clearLink = document.getElementById('clearLink');
  const successMsg = document.getElementById('successMsg');
  const successText = document.getElementById('successText');
  const errorMsg = document.getElementById('errorMsg');
  const errorText = document.getElementById('errorText');
  const errorDetails = document.getElementById('errorDetails');
  const errorLine = document.getElementById('errorLine');
  const errorColumn = document.getElementById('errorColumn');
  const errorSnippet = document.getElementById('errorSnippet');
  const copyErrorWrap = document.getElementById('copyErrorWrap');
  const copyErrorBtn = document.getElementById('copyErrorBtn');

  let lastErrorMessage = '';

  /**
   * Get line and column from a character position (0-based).
   * Lines are 1-based for display.
   */
  function positionToLineColumn(text, position) {
    if (position < 0 || !text.length) return { line: 1, column: 1 };
    const before = text.slice(0, position);
    const line = (before.match(/\n/g) || []).length + 1;
    const lastNewline = before.lastIndexOf('\n');
    const column = lastNewline === -1 ? position + 1 : position - lastNewline;
    return { line: line, column: column };
  }

  /**
   * Extract position from JSON.parse error message.
   * Handles "at position 148" (Chrome/V8) and "at line 3 column 5" (Firefox/Safari) patterns.
   */
  function getPositionFromError(message, text) {
    var positionMatch = message.match(/position\s+(\d+)/i);
    if (positionMatch) {
      var pos = parseInt(positionMatch[1], 10);
      return positionToLineColumn(text, pos);
    }
    var lineMatch = message.match(/line\s+(\d+)/i);
    var colMatch = message.match(/column\s+(\d+)/i);
    if (lineMatch && colMatch) {
      return {
        line: parseInt(lineMatch[1], 10),
        column: parseInt(colMatch[1], 10)
      };
    }
    return null;
  }

  /**
   * Get a short snippet of text around the error line (e.g. that line ± 1).
   */
  function getErrorSnippet(text, line, column, maxLines) {
    maxLines = maxLines || 3;
    var lines = text.split(/\r\n|\r|\n/);
    var start = Math.max(0, line - 1 - Math.floor((maxLines - 1) / 2));
    var end = Math.min(lines.length, start + maxLines);
    var snippetLines = [];
    for (var i = start; i < end; i++) {
      var num = i + 1;
      var content = lines[i] || '';
      snippetLines.push(num + ' | ' + content);
    }
    var snippet = snippetLines.join('\n');
    if (snippet.length > 400) {
      snippet = snippet.slice(0, 400) + '…';
    }
    return snippet;
  }

  function showSuccess(msg) {
    successText.textContent = msg;
    successMsg.classList.add('visible');
    clearToolError(errorMsg);
    copyErrorWrap.style.display = 'none';
  }

  function showError(msg, details) {
    lastErrorMessage = msg;
    if (details && (details.line !== undefined || details.column !== undefined || details.snippet)) {
      errorDetails.style.display = 'block';
      errorLine.textContent = details.line != null ? details.line : '—';
      errorColumn.textContent = details.column != null ? details.column : '—';
      errorSnippet.textContent = details.snippet || '';
    } else {
      errorDetails.style.display = 'none';
    }
    showToolError(errorMsg, errorText, msg);
    successMsg.classList.remove('visible');
    copyErrorWrap.style.display = 'inline-flex';
  }

  function clearMessages() {
    successMsg.classList.remove('visible');
    clearToolError(errorMsg);
    copyErrorWrap.style.display = 'none';
    errorDetails.style.display = 'none';
    lastErrorMessage = '';
  }

  function updateButtonState() {
    var hasInput = (jsonInput.value || '').trim().length > 0;
    validateBtn.disabled = !hasInput;
    clearLink.classList.toggle('clear-link--enabled', hasInput);
    clearLink.setAttribute('aria-disabled', hasInput ? 'false' : 'true');
  }

  function applyParseResult(errMsg, text) {
    if (errMsg == null) {
      showSuccess('Valid JSON. No syntax errors found.');
      return;
    }
    var pos = getPositionFromError(errMsg, text);
    var line = pos ? pos.line : null;
    var column = pos ? pos.column : null;
    var snippet = line != null && line > 0 ? getErrorSnippet(text, line, column, 5) : '';
    showError(errMsg, {
      line: line,
      column: column,
      snippet: snippet
    });
  }

  function finishValidateUI() {
    validateBtn.classList.remove('spinning');
    validateBtn.removeAttribute('aria-busy');
    updateButtonState();
  }

  function runValidate() {
    clearMessages();
    var text = (jsonInput.value || '').trim();
    if (!text) {
      showError('Enter JSON to validate.');
      jsonInput.focus();
      return;
    }
    var bytes = utf8ByteLength(text);
    if (bytes > MAX_JSON_INPUT_BYTES) {
      showError(MAX_JSON_SIZE_MSG);
      return;
    }
    validateBtn.disabled = true;
    validateBtn.classList.add('spinning');
    validateBtn.setAttribute('aria-busy', 'true');

    var useWorker = HAS_WORKER && bytes >= WORKER_PARSE_MIN_BYTES;
    var w = useWorker ? getParseWorker() : null;
    if (!useWorker || !w) {
      try {
        JSON.parse(text);
        applyParseResult(null, text);
      } catch (err) {
        var msg = err instanceof SyntaxError ? (err.message || 'Invalid JSON.') : String(err.message || 'Invalid JSON.');
        applyParseResult(msg, text);
      }
      finishValidateUI();
      return;
    }

    var reqId = ++workerSeq;
    var sentText = text;

    function onMsg(ev) {
      if (!ev.data || ev.data.reqId !== reqId) return;
      w.removeEventListener('message', onMsg);
      w.removeEventListener('error', onErr);
      if ((jsonInput.value || '').trim() !== sentText) {
        finishValidateUI();
        return;
      }
      if (ev.data.ok) {
        applyParseResult(null, text);
      } else {
        applyParseResult(ev.data.message || 'Invalid JSON.', text);
      }
      finishValidateUI();
    }

    function onErr() {
      w.removeEventListener('message', onMsg);
      w.removeEventListener('error', onErr);
      if (parseWorker === w) {
        parseWorker.terminate();
        parseWorker = null;
      }
      if ((jsonInput.value || '').trim() !== sentText) {
        finishValidateUI();
        return;
      }
      try {
        JSON.parse(text);
        applyParseResult(null, text);
      } catch (err2) {
        var msg2 =
          err2 instanceof SyntaxError ? (err2.message || 'Invalid JSON.') : String(err2.message || 'Invalid JSON.');
        applyParseResult(msg2, text);
      }
      finishValidateUI();
    }

    w.addEventListener('message', onMsg);
    w.addEventListener('error', onErr);
    try {
      w.postMessage({ reqId: reqId, text: text });
    } catch (postErr) {
      w.removeEventListener('message', onMsg);
      w.removeEventListener('error', onErr);
      if (parseWorker === w) {
        parseWorker.terminate();
        parseWorker = null;
      }
      try {
        JSON.parse(text);
        applyParseResult(null, text);
      } catch (err3) {
        var msg3 =
          err3 instanceof SyntaxError ? (err3.message || 'Invalid JSON.') : String(err3.message || 'Invalid JSON.');
        applyParseResult(msg3, text);
      }
      finishValidateUI();
    }
  }

  clearLink.addEventListener('click', function (e) {
    e.preventDefault();
    if (!(jsonInput.value || '').trim()) return;
    jsonInput.value = '';
    clearMessages();
    updateButtonState();
    jsonInput.focus();
  });

  jsonInput.addEventListener('input', function () {
    clearMessages();
    updateButtonState();
  });

  validateBtn.addEventListener('click', runValidate);

  copyErrorBtn.addEventListener('click', function () {
    if (!lastErrorMessage) return;
    var toCopy = lastErrorMessage;
    var lineEl = document.getElementById('errorLine');
    var colEl = document.getElementById('errorColumn');
    if (errorDetails.style.display !== 'none' && lineEl && colEl) {
      var lineText = lineEl.textContent;
      var colText = colEl.textContent;
      if (lineText !== '—' || colText !== '—') {
        toCopy += '\nLine: ' + lineText + '\nColumn: ' + colText;
      }
    }
    window.TinyDataToolClipboard.copyWithFeedback(
      toCopy,
      copyErrorBtn,
      function () {
        showError('Copy failed. Select and copy the error text manually.');
      },
      { durationMs: 2000, labelSelector: 'span' }
    );
  });

  function setInputFromFile(text) {
    jsonInput.value = text;
    clearMessages();
    updateButtonState();
  }
  initDropZone({
    dropZoneId: 'dropZone',
    fileInputId: 'fileInput',
    accept: function (f) { return f.name.toLowerCase().endsWith('.json') || f.type === 'application/json'; },
    setContent: setInputFromFile,
    showError: showError,
    dropErrorMsg: 'Please drop a .json file.',
    maxFileBytes: MAX_JSON_INPUT_BYTES,
    maxFileBytesMessage: MAX_JSON_SIZE_MSG
  });

  updateButtonState();
})();
