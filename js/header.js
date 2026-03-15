/* ============================================================
   TinyTools — Global header module
   Injects the site header into #site-header-root.
   Set data-base (e.g. "../" for pages in a subfolder) and
   data-active (e.g. "split-csv") on the placeholder.
============================================================ */

(function () {
  const NAV_ITEMS = [
    { id: 'split-csv', href: 'split-csv/split-csv.html', label: 'Split CSV' },
    { id: 'merge-csv', href: 'merge-csv/merge-csv.html', label: 'Merge CSV' },
  ];

  function getHeaderHtml(base, active) {
    const baseSlash = base ? base.replace(/\/?$/, '/') : '';
    const homeHref = baseSlash ? baseSlash + 'index.html' : 'index.html';
    const logoSrc = baseSlash + 'assets/Logo%20PNG%20Compressed.png';

    const navItemsHtml = NAV_ITEMS.map(function (item) {
      const isActive = item.id === active;
      const activeClass = isActive ? ' nav-dropdown__item--active' : '';
      const ariaCurrent = isActive ? ' aria-current="page"' : '';
      return '<a href="' + baseSlash + item.href + '" class="nav-dropdown__item' + activeClass + '" role="menuitem"' + ariaCurrent + '>' + item.label + '</a>';
    }).join('\n            ');

    return (
      '<header class="site-header" role="banner">\n' +
      '  <div class="site-header__inner">\n' +
      '\n' +
      '    <a href="' + homeHref + '" aria-label="TinyTools home" style="display:flex;align-items:center;line-height:1;flex-shrink:0">\n' +
      '      <img src="' + logoSrc + '" alt="TinyTools" width="87" height="37" />\n' +
      '    </a>\n' +
      '\n' +
      '    <span class="site-header__badge">Instant · Free · Private</span>\n' +
      '\n' +
      '    <nav class="site-nav" aria-label="Main navigation">\n' +
      '      <div class="nav-dropdown" id="csvDropdown">\n' +
      '        <button\n' +
      '          class="nav-dropdown__trigger"\n' +
      '          aria-haspopup="true"\n' +
      '          aria-expanded="false"\n' +
      '          aria-controls="csvDropdownMenu"\n' +
      '          id="csvDropdownTrigger"\n' +
      '        >\n' +
      '          CSV Tools\n' +
      '          <svg class="nav-dropdown__chevron" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">\n' +
      '            <path d="M3 5l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>\n' +
      '          </svg>\n' +
      '        </button>\n' +
      '        <div class="nav-dropdown__menu" id="csvDropdownMenu" role="menu" aria-labelledby="csvDropdownTrigger">\n' +
      '            ' + navItemsHtml + '\n' +
      '        </div>\n' +
      '      </div>\n' +
      '    </nav>\n' +
      '  </div>\n' +
      '</header>'
    );
  }

  function injectHeader() {
    const root = document.getElementById('site-header-root');
    if (!root) return;
    const base = root.getAttribute('data-base') || '';
    const active = root.getAttribute('data-active') || '';
    root.outerHTML = getHeaderHtml(base, active);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectHeader);
  } else {
    injectHeader();
  }
})();
