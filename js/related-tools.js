/* ============================================================
   TinyTools — Related tools section (CSV / data tools)
   Injects the Related tools block into #related-tools-root.
   Set data-base (e.g. "../") and data-current (e.g. "csv-to-tsv")
   so the current tool can be excluded from the list.
============================================================ */

(function () {
  const CSV_RELATED_TOOLS = [
    { id: 'split-csv', href: 'split-csv/split-csv.html', label: 'Split CSV' },
    { id: 'merge-csv', href: 'merge-csv/merge-csv.html', label: 'Merge CSV' },
    { id: 'json-to-csv', href: 'json-to-csv/index.html', label: 'JSON to CSV' },
    { id: 'csv-to-tsv', href: 'csv-to-tsv/index.html', label: 'CSV to TSV' },
  ];

  const INTRO = 'Need help with other file conversion tasks? Try these tools.';

  function getRelatedToolsHtml(base, currentId) {
    const baseSlash = base ? base.replace(/\/?$/, '/') : '';
    const links = CSV_RELATED_TOOLS
      .filter(function (item) { return item.id !== currentId; })
      .map(function (item) {
        return '<a href="' + baseSlash + item.href + '" class="btn-secondary">' + item.label + '</a>';
      })
      .join('\n          ');

    return (
      '<section class="content-section" aria-labelledby="related-heading">\n' +
      '  <div class="container--wide">\n' +
      '    <p class="section-label">More tools</p>\n' +
      '    <h2 class="section-title" id="related-heading">Related tools</h2>\n' +
      '    <p class="section-body">' + INTRO + '</p>\n' +
      '    <div class="related-tools-list">\n' +
      '          ' + links + '\n' +
      '    </div>\n' +
      '  </div>\n' +
      '</section>'
    );
  }

  function injectRelatedTools() {
    const root = document.getElementById('related-tools-root');
    if (!root) return;
    const base = root.getAttribute('data-base') || '';
    const current = root.getAttribute('data-current') || '';
    root.outerHTML = getRelatedToolsHtml(base, current);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectRelatedTools);
  } else {
    injectRelatedTools();
  }
})();
