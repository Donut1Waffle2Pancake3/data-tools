(function () {
  var MAX_BYTES = 10 * 1024 * 1024;
  var MAX_MSG = 'Input exceeds 10 MB (UTF-8). Use a smaller file or split the document.';

  var modeJ2T = 'j2t';
  var modeT2J = 't2j';

  var textInput = document.getElementById('textInput');
  var clearLink = document.getElementById('clearLink');
  var dropZone = document.getElementById('dropZone');
  var fileInput = document.getElementById('fileInput');
  var tabJ2T = document.getElementById('tabJ2T');
  var tabT2J = document.getElementById('tabT2J');
  var panelMain = document.getElementById('panel-main');
  var inputLabel = document.getElementById('inputLabel');
  var indentSel = document.getElementById('indentSel');
  var convertBtn = document.getElementById('convertBtn');
  var errorMsg = document.getElementById('errorMsg');
  var errorText = document.getElementById('errorText');
  var resultSection = document.getElementById('resultSection');
  var textOutput = document.getElementById('textOutput');
  var copyBtn = document.getElementById('copyBtn');
  var downloadLink = document.getElementById('downloadLink');
  var blobUrl = null;

  var mode = modeJ2T;

  function utf8ByteLength(str) {
    if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(str).length;
    return str.length;
  }

  function showError(msg) {
    errorText.textContent = msg;
    errorMsg.classList.add('visible');
    resultSection.classList.remove('visible');
    if (blobUrl) {
      URL.revokeObjectURL(blobUrl);
      blobUrl = null;
    }
    downloadLink.style.display = 'none';
  }

  function clearError() {
    errorText.textContent = '';
    errorMsg.classList.remove('visible');
  }

  function getTomlLib() {
    var t = typeof globalThis !== 'undefined' ? globalThis.IarnaToml : null;
    if (!t || typeof t.parse !== 'function' || typeof t.stringify !== 'function') {
      throw new Error('TOML library failed to load. Refresh the page.');
    }
    return t;
  }

  function setMode(next) {
    mode = next;
    var j2t = mode === modeJ2T;
    tabJ2T.classList.toggle('active', j2t);
    tabJ2T.setAttribute('aria-selected', j2t ? 'true' : 'false');
    tabT2J.classList.toggle('active', !j2t);
    tabT2J.setAttribute('aria-selected', j2t ? 'false' : 'true');
    if (panelMain) panelMain.setAttribute('aria-labelledby', j2t ? 'tabJ2T' : 'tabT2J');
    inputLabel.textContent = j2t ? 'JSON input' : 'TOML input';
    textInput.placeholder = j2t
      ? '{"title": "demo", "count": 1}'
      : 'title = "demo"\ncount = 1\n\n[section]\nkey = true';
    fileInput.setAttribute(
      'accept',
      j2t ? '.json,.txt,application/json,text/plain' : '.toml,.tml,.txt,text/plain'
    );
    dropZone.querySelector('.drop-zone__label').textContent = j2t ? 'Or upload a JSON file' : 'Or upload a TOML file';
    indentSel.closest('.form-section').style.display = j2t ? 'none' : '';
    clearError();
    resultSection.classList.remove('visible');
    if (blobUrl) {
      URL.revokeObjectURL(blobUrl);
      blobUrl = null;
    }
    downloadLink.style.display = 'none';
    textOutput.value = '';
    updateBtn();
  }

  function updateBtn() {
    var v = (textInput.value || '').trim();
    convertBtn.disabled = !v;
    clearLink.classList.toggle('clear-link--enabled', !!v);
    clearLink.setAttribute('aria-disabled', v ? 'false' : 'true');
  }

  function runConvert() {
    clearError();
    var raw = (textInput.value || '').trim();
    if (!raw) {
      showError('Paste or upload something to convert.');
      return;
    }
    if (utf8ByteLength(raw) > MAX_BYTES) {
      showError(MAX_MSG);
      return;
    }

    var toml = getTomlLib();
    var indent = parseInt(indentSel.value, 10) || 2;
    var outStr;
    var outName;
    var outMime;

    convertBtn.classList.add('spinning');
    convertBtn.setAttribute('aria-busy', 'true');

    try {
      if (mode === modeJ2T) {
        var obj = JSON.parse(raw);
        if (obj === null || Array.isArray(obj) || typeof obj !== 'object') {
          showError(
            'JSON at the root must be a plain object (not an array or primitive) to emit TOML.'
          );
          return;
        }
        outStr = toml.stringify(obj) || '';
        outName = 'output.toml';
        outMime = 'text/plain;charset=utf-8';
      } else {
        var data = toml.parse(raw);
        if (data === undefined) {
          outStr = 'null';
        } else {
          outStr = JSON.stringify(data, function (k, v) {
            if (typeof v === 'bigint') return v.toString();
            return v;
          }, indent);
        }
        outName = 'output.json';
        outMime = 'application/json;charset=utf-8';
      }
      textOutput.value = outStr;
      resultSection.classList.add('visible');
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      blobUrl = URL.createObjectURL(new Blob([outStr], { type: outMime }));
      downloadLink.href = blobUrl;
      downloadLink.setAttribute('download', outName);
      downloadLink.style.display = 'inline-flex';
    } catch (err) {
      var msg = err && err.message ? String(err.message) : String(err);
      showError(msg);
    } finally {
      convertBtn.classList.remove('spinning');
      convertBtn.removeAttribute('aria-busy');
    }
  }

  tabJ2T.addEventListener('click', function () {
    setMode(modeJ2T);
  });
  tabT2J.addEventListener('click', function () {
    setMode(modeT2J);
  });

  textInput.addEventListener('input', updateBtn);

  clearLink.addEventListener('click', function (e) {
    e.preventDefault();
    if (!(textInput.value || '').trim()) return;
    textInput.value = '';
    textOutput.value = '';
    resultSection.classList.remove('visible');
    if (blobUrl) {
      URL.revokeObjectURL(blobUrl);
      blobUrl = null;
    }
    downloadLink.style.display = 'none';
    updateBtn();
    textInput.focus();
  });

  convertBtn.addEventListener('click', runConvert);

  copyBtn.addEventListener('click', function () {
    var t = textOutput.value;
    if (!t) return;
    window.TinyDataToolClipboard.copyWithFeedback(t, copyBtn, function () {
      showError('Copy failed. Select the output text manually.');
    });
  });

  function setInputFromFile(text) {
    textInput.value = text;
    clearError();
    updateBtn();
  }

  initDropZone({
    dropZoneId: 'dropZone',
    fileInputId: 'fileInput',
    accept: function () {
      return true;
    },
    setContent: setInputFromFile,
    showError: showError,
    dropErrorMsg: 'Please drop a text, JSON, or TOML file.',
    maxFileBytes: MAX_BYTES,
    maxFileBytesMessage: MAX_MSG,
  });

  setMode(modeJ2T);
})();
