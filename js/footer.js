/* ============================================================
   TinyDataTool — Global footer module
   Injects the site footer into #site-footer-root.
   Optional: set data-base (e.g. "../") on the placeholder if
   you add links that need to resolve relative to the page.
============================================================ */

(function () {
  function getFooterHtml() {
    return (
      '<footer class="site-footer" role="contentinfo">\n' +
      '  <div class="site-footer__inner">\n' +
      '    <p class="site-footer__copy">© 2026 TinyDataTool</p>\n' +
      '    <p class="site-footer__note">\n' +
      '      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">\n' +
      '        <path d="M6 1L2 2.8v3.5c0 2.3 1.7 4.3 4 4.7 2.3-.4 4-2.4 4-4.7V2.8L6 1z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>\n' +
      '      </svg>\n' +
      '      No uploads · No tracking · No accounts\n' +
      '    </p>\n' +
      '  </div>\n' +
      '</footer>'
    );
  }

  function injectFooter() {
    const root = document.getElementById('site-footer-root');
    if (!root) return;
    root.outerHTML = getFooterHtml();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectFooter);
  } else {
    injectFooter();
  }
})();
