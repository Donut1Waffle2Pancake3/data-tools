/* ============================================================
   TinyDataTool — Navigation config (shared by header and related tools)
   Add or reorder tools in NAV_GROUPS; header dropdowns and
   related-tools section stay in sync.
============================================================ */
const NAV_GROUPS = [
    {
      label: 'CSV',
      id: 'csv',
      items: [
        { id: 'split-csv', href: 'split-csv/index.html', label: 'Split CSV' },
        { id: 'merge-csv', href: 'merge-csv/index.html', label: 'Merge CSV' },
        { id: 'csv-column-remover', href: 'csv-column-remover/index.html', label: 'CSV Column Remover' },
        { id: 'csv-deduplicator', href: 'csv-deduplicator/index.html', label: 'CSV Deduplicator' },
        { id: 'csv-row-filter', href: 'csv-row-filter/index.html', label: 'CSV Row Filter' },
        { id: 'csv-sorter', href: 'csv-sorter/index.html', label: 'CSV Sorter' },
      ],
    },
    {
      label: 'JSON',
      id: 'json',
      items: [
        { id: 'json-formatter', href: 'json-formatter/index.html', label: 'JSON Formatter' },
        { id: 'json-to-csv', href: 'json-to-csv/index.html', label: 'JSON → CSV' },
        { id: 'csv-to-json', href: 'csv-to-json/index.html', label: 'CSV → JSON' },
      ],
    },
    {
      label: 'Converters',
      id: 'converters',
      items: [
        { id: 'csv-to-tsv', href: 'csv-to-tsv/index.html', label: 'CSV → TSV' },
        { id: 'tsv-to-csv', href: 'tsv-to-csv/index.html', label: 'TSV → CSV' },
      ],
    },
  ];

/* ============================================================
   TinyDataTool — Global header module
============================================================ */
(function () {
  function getHeaderHtml(base, active) {
    const baseSlash = base ? base.replace(/\/?$/, '/') : '';
    const homeHref = baseSlash ? baseSlash + 'index.html' : 'index.html';
    const logoSrc = baseSlash + 'assets/Logo%20-%20TinyDataTool.png';

    const dropdownsHtml = NAV_GROUPS.map(function (group) {
      const triggerId = 'navDropdown' + group.id + 'Trigger';
      const menuId = 'navDropdown' + group.id + 'Menu';
      const itemsHtml = group.items.map(function (item) {
        const isActive = item.id === active;
        const activeClass = isActive ? ' nav-dropdown__item--active' : '';
        const ariaCurrent = isActive ? ' aria-current="page"' : '';
        return '<a href="' + baseSlash + item.href + '" class="nav-dropdown__item' + activeClass + '" role="menuitem"' + ariaCurrent + '>' + item.label + '</a>';
      }).join('\n            ');
      return (
        '<div class="nav-dropdown" id="navDropdown' + group.id + '">\n' +
        '        <button class="nav-dropdown__trigger" aria-haspopup="true" aria-expanded="false" aria-controls="' + menuId + '" id="' + triggerId + '">\n' +
        '          ' + group.label + '\n' +
        '          <svg class="nav-dropdown__chevron" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">\n' +
        '            <path d="M3 5l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>\n' +
        '          </svg>\n' +
        '        </button>\n' +
        '        <div class="nav-dropdown__menu" id="' + menuId + '" role="menu" aria-labelledby="' + triggerId + '">\n' +
        '            ' + itemsHtml + '\n' +
        '        </div>\n' +
        '      </div>'
      );
    }).join('\n      ');

    const drawerParts = [];
    drawerParts.push('<a href="' + baseSlash + 'tools/index.html" class="nav-drawer__item' + (active === 'all-tools' ? ' nav-drawer__item--active' : '') + '"' + (active === 'all-tools' ? ' aria-current="page"' : '') + '>All Tools</a>');
    NAV_GROUPS.forEach(function (group, idx) {
      drawerParts.push('<span class="nav-drawer__group-label">' + group.label + '</span>');
      group.items.forEach(function (item) {
        const isActive = item.id === active;
        const activeClass = isActive ? ' nav-drawer__item--active' : '';
        const ariaCurrent = isActive ? ' aria-current="page"' : '';
        drawerParts.push('<a href="' + baseSlash + item.href + '" class="nav-drawer__item' + activeClass + '"' + ariaCurrent + '>' + item.label + '</a>');
      });
    });
    const drawerItemsHtml = drawerParts.join('\n        ');

    return (
      '<header class="site-header" role="banner">\n' +
      '  <div class="site-header__inner">\n' +
      '\n' +
      '    <a href="' + homeHref + '" aria-label="TinyDataTool home" style="display:flex;align-items:center;line-height:1;flex-shrink:0">\n' +
      '      <img class="site-header__logo" src="' + logoSrc + '" alt="TinyDataTool" width="82" height="41" />\n' +
      '    </a>\n' +
      '\n' +
      '    <nav class="site-nav" aria-label="Main navigation">\n' +
      '      <a href="' + baseSlash + 'tools/index.html" class="site-nav__link' + (active === 'all-tools' ? ' site-nav__link--active' : '') + '"' + (active === 'all-tools' ? ' aria-current="page"' : '') + '>All Tools</a>\n' +
      '      ' + dropdownsHtml + '\n' +
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

/* ============================================================
   TinyDataTool — Related tools section
   Injects the Related tools block into #related-tools-root.
   Shows only tools from the same nav group as the current page
   (e.g. on CSV Sorter, shows other CSV tools only).
   Set data-base (e.g. "../") and data-current (e.g. "csv-sorter").
============================================================ */

(function () {
  const INTRO = 'More tools in this category.';

  function getRelatedToolsHtml(base, currentId) {
    const baseSlash = base ? base.replace(/\/?$/, '/') : '';
    var relatedItems = [];
    for (var g = 0; g < NAV_GROUPS.length; g++) {
      var group = NAV_GROUPS[g];
      var inGroup = group.items.some(function (item) { return item.id === currentId; });
      if (inGroup) {
        relatedItems = group.items.filter(function (item) { return item.id !== currentId; });
        break;
      }
    }
    if (relatedItems.length === 0) {
      return '<section class="content-section" aria-labelledby="related-heading">\n' +
        '  <div class="container--wide">\n' +
        '    <p class="section-label">More tools</p>\n' +
        '    <h2 class="section-title" id="related-heading">Related tools</h2>\n' +
        '    <p class="section-body">' + INTRO + '</p>\n' +
        '    <div class="related-tools-list">\n' +
        '      <a href="' + baseSlash + 'tools/index.html" class="btn-secondary btn--sm">Browse all tools</a>\n' +
        '    </div>\n' +
        '  </div>\n' +
        '</section>';
    }
    var links = relatedItems.map(function (item) {
      return '<a href="' + baseSlash + item.href + '" class="btn-secondary btn--sm">' + item.label + '</a>';
    }).join('\n          ');

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

/* ============================================================
   TinyDataTool — Global JavaScript
   Shared utilities and UI behaviours used across all tool pages.
   Each page calls initNavDropdown() and initFaqAccordion() on load,
   then uses the utility functions directly in its own inline script.
============================================================ */

/* ============================================================
   NAV DROPDOWN (multiple grouped dropdowns)
   Each .nav-dropdown has .nav-dropdown__trigger and .nav-dropdown__menu.
   Opening one closes the others. Same behavior as single dropdown.
============================================================ */
function initNavDropdown() {
  const dropdowns = document.querySelectorAll('.nav-dropdown');
  if (!dropdowns.length) return;

  function closeAll() {
    dropdowns.forEach(function (d) {
      d.removeAttribute('data-open');
      const t = d.querySelector('.nav-dropdown__trigger');
      if (t) t.setAttribute('aria-expanded', 'false');
    });
  }

  dropdowns.forEach(function (dropdown) {
    const trigger = dropdown.querySelector('.nav-dropdown__trigger');
    const menu = dropdown.querySelector('.nav-dropdown__menu');
    if (!trigger || !menu) return;

    function open() {
      closeAll();
      dropdown.setAttribute('data-open', '');
      trigger.setAttribute('aria-expanded', 'true');
    }

    function close() {
      dropdown.removeAttribute('data-open');
      trigger.setAttribute('aria-expanded', 'false');
    }

    function isOpen() {
      return dropdown.hasAttribute('data-open');
    }

    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      isOpen() ? close() : open();
    });

    dropdown.addEventListener('keydown', function (e) {
      const items = Array.from(menu.querySelectorAll('.nav-dropdown__item'));
      const idx = items.indexOf(document.activeElement);

      if (e.key === 'Escape') {
        close();
        trigger.focus();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (!isOpen()) open();
        const next = idx < items.length - 1 ? items[idx + 1] : items[0];
        if (next) next.focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = idx > 0 ? items[idx - 1] : items[items.length - 1];
        if (prev) prev.focus();
      }
    });
  });

  document.addEventListener('click', function (e) {
    if (!e.target.closest('.nav-dropdown')) closeAll();
  });
}

/* ============================================================
   MOBILE NAV DRAWER (hamburger menu)
   At viewports ≤640px the Tools dropdown is hidden and a
   hamburger button is shown. Clicking it opens a slide-in
   drawer with the same tool links.
============================================================ */
function initNavDrawer() {
  const burger   = document.getElementById('navBurger');
  const drawer   = document.getElementById('navDrawer');
  const overlay  = document.getElementById('navDrawerOverlay');
  const closeBtn = document.getElementById('navDrawerClose');

  if (!burger || !drawer || !overlay) return;

  function openDrawer() {
    document.body.classList.add('nav-drawer-open');
    burger.setAttribute('aria-expanded', 'true');
    overlay.setAttribute('aria-hidden', 'false');
  }

  function closeDrawer() {
    document.body.classList.remove('nav-drawer-open');
    burger.setAttribute('aria-expanded', 'false');
    overlay.setAttribute('aria-hidden', 'true');
  }

  burger.addEventListener('click', () => openDrawer());
  overlay.addEventListener('click', () => closeDrawer());
  if (closeBtn) closeBtn.addEventListener('click', () => closeDrawer());

  drawer.querySelectorAll('.nav-drawer__item').forEach((link) => {
    link.addEventListener('click', () => closeDrawer());
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('nav-drawer-open')) {
      closeDrawer();
      burger.focus();
    }
  });
}

/* ============================================================
   FAQ ACCORDION
   Works on any page that has .faq-question / .faq-answer markup.
============================================================ */
function initFaqAccordion() {
  document.querySelectorAll('.faq-question').forEach((btn) => {
    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      const answerId = btn.getAttribute('aria-controls');
      const answer   = document.getElementById(answerId);

      // Close all
      document.querySelectorAll('.faq-question').forEach((b) => {
        b.setAttribute('aria-expanded', 'false');
      });
      document.querySelectorAll('.faq-answer').forEach((a) => {
        a.classList.remove('open');
      });

      // Open the clicked one (toggle off if already open)
      if (!expanded) {
        btn.setAttribute('aria-expanded', 'true');
        answer.classList.add('open');
      }
    });
  });
}

/* ============================================================
   UTILITY FUNCTIONS
============================================================ */

/**
 * Format a byte count into a human-readable string.
 * @param {number} bytes
 * @returns {string}
 */
function formatFileSize(bytes) {
  if (bytes < 1024)        return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

/**
 * Escape a string for safe HTML insertion.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Read a File object as UTF-8 text via FileReader.
 * Returns a Promise that resolves with the text content.
 * @param {File} file
 * @returns {Promise<string>}
 */
function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = (e) => resolve(e.target.result);
    reader.onerror = ()  => reject(new Error(`Failed to read "${file.name}". Please try again.`));
    reader.readAsText(file, 'UTF-8');
  });
}

/**
 * Parse a CSV string into an array of row strings.
 * Handles quoted fields that contain commas or embedded newlines.
 * Returns one string per logical CSV row (header + data).
 * @param {string} text
 * @returns {string[]}
 */
function parseCSVLines(text) {
  const lines      = [];
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  if (!normalized) return lines;

  let current  = '';
  let inQuotes = false;

  for (let i = 0; i < normalized.length; i++) {
    const ch = normalized[i];

    if (ch === '"') {
      // Handle escaped double-quotes ""
      if (inQuotes && normalized[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
        current += ch;
      }
    } else if (ch === '\n' && !inQuotes) {
      lines.push(current);
      current = '';
    } else {
      current += ch;
    }
  }

  if (current !== '') lines.push(current);

  return lines;
}

/* ============================================================
   AUTO-INIT on DOMContentLoaded
============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initNavDropdown();
  initNavDrawer();
  initFaqAccordion();
});
