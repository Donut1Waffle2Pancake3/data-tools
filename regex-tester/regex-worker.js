/* global self */
(function () {
  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  self.onmessage = function (e) {
    var id = e.data.id;
    var pattern = e.data.pattern;
    var flags = e.data.flags;
    var text = e.data.text;
    var maxMatches = e.data.maxMatches || 50000;

    var regex;
    try {
      regex = new RegExp(pattern, flags);
    } catch (err) {
      self.postMessage({
        id: id,
        error: err.message || String(err),
      });
      return;
    }

    var matches = [];
    var html = '';
    var sliceLast = 0;
    var m;
    var safety = 0;
    var budgetMs = typeof e.data.budgetMs === 'number' && e.data.budgetMs > 0 ? e.data.budgetMs : 8000;
    var t0 = typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();
    var checkEvery = 128;

    while ((m = regex.exec(text)) !== null && safety < maxMatches) {
      safety += 1;
      if ((safety & (checkEvery - 1)) === 0) {
        var now = typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();
        if (now - t0 > budgetMs) {
          html += escapeHtml(text.slice(sliceLast));
          self.postMessage({
            id: id,
            matches: matches,
            html: html,
            truncated: true,
            matchCount: matches.length,
            timedOut: true,
          });
          return;
        }
      }
      var full = m[0];
      var index = m.index;
      var end = index + full.length;

      html += escapeHtml(text.slice(sliceLast, index));
      html += '<mark class="regex-match">' + escapeHtml(full) + '</mark>';
      sliceLast = end;

      matches.push(full);
      if (full === '') regex.lastIndex += 1;
    }
    html += escapeHtml(text.slice(sliceLast));

    var truncated = false;
    if (safety >= maxMatches) {
      var probe = new RegExp(pattern, flags);
      probe.lastIndex = regex.lastIndex;
      truncated = probe.exec(text) !== null;
    }

    self.postMessage({
      id: id,
      matches: matches,
      html: html,
      truncated: truncated,
      matchCount: matches.length,
      timedOut: false,
    });
  };
})();
