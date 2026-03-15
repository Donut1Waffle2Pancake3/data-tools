/* ============================================================
   TinyDataTool — Global header module
   Injects the site header into #site-header-root.
   Set data-base (e.g. "../" for pages in a subfolder) and
   data-active (e.g. "split-csv") on the placeholder.
============================================================ */

(function () {
  const NAV_ITEMS = [
    { id: 'split-csv', href: 'split-csv/index.html', label: 'Split CSV' },
    { id: 'merge-csv', href: 'merge-csv/index.html', label: 'Merge CSV' },
    { id: 'json-to-csv', href: 'json-to-csv/index.html', label: 'JSON to CSV' },
    { id: 'json-formatter', href: 'json-formatter/index.html', label: 'JSON Formatter' },
    { id: 'csv-to-json', href: 'csv-to-json/index.html', label: 'CSV to JSON' },
    { id: 'csv-to-tsv', href: 'csv-to-tsv/index.html', label: 'CSV to TSV' },
    { id: 'tsv-to-csv', href: 'tsv-to-csv/index.html', label: 'TSV to CSV' },
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

    const drawerItemsHtml = NAV_ITEMS.map(function (item) {
      const isActive = item.id === active;
      const activeClass = isActive ? ' nav-drawer__item--active' : '';
      const ariaCurrent = isActive ? ' aria-current="page"' : '';
      return '<a href="' + baseSlash + item.href + '" class="nav-drawer__item' + activeClass + '"' + ariaCurrent + '>' + item.label + '</a>';
    }).join('\n            ');

    return (
      '<header class="site-header" role="banner">\n' +
      '  <div class="site-header__inner">\n' +
      '\n' +
      '    <a href="' + homeHref + '" aria-label="TinyDataTool home" style="display:flex;align-items:center;line-height:1;flex-shrink:0">\n' +
      '      <img src="' + logoSrc + '" alt="TinyDataTool" width="87" height="37" />\n' +
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
      '          Tools\n' +
      '          <svg class="nav-dropdown__chevron" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">\n' +
      '            <path d="M3 5l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>\n' +
      '          </svg>\n' +
      '        </button>\n' +
      '        <div class="nav-dropdown__menu" id="csvDropdownMenu" role="menu" aria-labelledby="csvDropdownTrigger">\n' +
      '            ' + navItemsHtml + '\n' +
      '        </div>\n' +
      '      </div>\n' +
      '    </nav>\n' +
      '\n' +
      '    <button class="nav-burger" id="navBurger" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="navDrawer">\n' +
      '      <span class="nav-burger__line"></span>\n' +
      '      <span class="nav-burger__line"></span>\n' +
      '      <span class="nav-burger__line"></span>\n' +
      '    </button>\n' +
      '  </div>\n' +
      '\n' +
      '  <div class="nav-drawer-overlay" id="navDrawerOverlay" aria-hidden="true"></div>\n' +
      '  <div class="nav-drawer" id="navDrawer" role="dialog" aria-label="Tools menu" aria-modal="true">\n' +
      '    <div class="nav-drawer__inner">\n' +
      '      <button class="nav-drawer__close" id="navDrawerClose" type="button" aria-label="Close menu">\n' +
      '        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">\n' +
      '          <path d="M14.793 6.27L11.043 10.02L14.762 13.738C15.074 14.02 15.074 14.488 14.762 14.77C14.48 15.082 14.012 15.082 13.73 14.77L9.98 11.05L6.262 14.77C5.98 15.082 5.512 15.082 5.23 14.77C4.918 14.488 4.918 14.02 5.23 13.707L8.949 9.988L5.23 6.27C4.918 5.988 4.918 5.52 5.23 5.207C5.512 4.926 5.98 4.926 6.293 5.207L10.012 8.957L13.73 5.238C14.012 4.926 14.48 4.926 14.793 5.238C15.074 5.52 15.074 5.988 14.793 6.27Z" fill="currentColor"/>\n' +
      '        </svg>\n' +
      '      </button>\n' +
      '      <nav class="nav-drawer__nav" aria-label="Tools">\n' +
      '        ' + drawerItemsHtml + '\n' +
      '      </nav>\n' +
      '    </div>\n' +
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
