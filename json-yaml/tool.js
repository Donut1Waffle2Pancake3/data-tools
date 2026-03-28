(function () {
  var MAX_BYTES = 10 * 1024 * 1024;
  var MAX_MSG = 'Input exceeds 10 MB (UTF-8). Use a smaller file or split the document.';

  var modeJ2Y = 'j2y';
  var modeY2J = 'y2j';

  var textInput = document.getElementById('textInput');
  var clearLink = document.getElementById('clearLink');
  var dropZone = document.getElementById('dropZone');
  var fileInput = document.getElementById('fileInput');
  var tabJ2Y = document.getElementById('tabJ2Y');
  var tabY2J = document.getElementById('tabY2J');
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

  var mode = modeJ2Y;

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

  function getYaml() {
    var y = typeof jsyaml !== 'undefined' ? jsyaml : null;
    if (!y || typeof y.load !== 'function' || typeof y.dump !== 'function') {
      throw new Error('YAML library failed to load. Refresh the page.');
    }
    return y;
  }

  function setMode(next) {
    mode = next;
    var j2y = mode === modeJ2Y;
    tabJ2Y.classList.toggle('active', j2y);
    tabJ2Y.setAttribute('aria-selected', j2y ? 'true' : 'false');
    tabY2J.classList.toggle('active', !j2y);
    tabY2J.setAttribute('aria-selected', j2y ? 'false' : 'true');
    inputLabel.textContent = j2y ? 'JSON input' : 'YAML input';
    textInput.placeholder = j2y
      ? '{"hello": "world", "n": 1}'
      : 'hello: world\nn: 1';
    fileInput.setAttribute(
      'accept',
      j2y ? '.json,.txt,application/json,text/plain' : '.yaml,.yml,.txt,text/yaml,text/plain'
    );
    dropZone.querySelector('.drop-zone__label').textContent = j2y ? 'Or upload a JSON file' : 'Or upload a YAML file';
    indentSel.closest('.form-section').style.display = j2y ? '' : 'none';
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

    var yaml = getYaml();
    var indent = parseInt(indentSel.value, 10) || 2;
    var outStr;
    var outName;
    var outMime;

    convertBtn.classList.add('spinning');
    convertBtn.setAttribute('aria-busy', 'true');

    try {
      var yaml = getYaml();
      if (mode === modeJ2Y) {
        var obj = JSON.parse(raw);
        outStr =
          yaml.dump(obj, {
            indent: indent,
            lineWidth: -1,
            noRefs: true,
            quotingType: '"',
            sortKeys: false,
          }) || '';
        outName = 'output.yaml';
        outMime = 'text/yaml;charset=utf-8';
      } else {
        var data = yaml.load(raw, { schema: yaml.DEFAULT_SCHEMA });
        if (data === undefined) {
          outStr = 'null';
        } else {
          outStr = JSON.stringify(data, null, indent);
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

  tabJ2Y.addEventListener('click', function () {
    setMode(modeJ2Y);
  });
  tabY2J.addEventListener('click', function () {
    setMode(modeY2J);
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
    dropErrorMsg: 'Please drop a text, JSON, or YAML file.',
    maxFileBytes: MAX_BYTES,
    maxFileBytesMessage: MAX_MSG,
  });

  setMode(modeJ2Y);
})();
