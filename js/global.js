/* ============================================================
   TinyTools — Global JavaScript
   Shared utilities and UI behaviours used across all tool pages.
   Each page calls initNavDropdown() and initFaqAccordion() on load,
   then uses the utility functions directly in its own inline script.
============================================================ */

/* ============================================================
   NAV DROPDOWN
   Expects the following IDs in the page HTML:
     #csvDropdown        — the wrapper element
     #csvDropdownTrigger — the <button> that opens/closes it
     #csvDropdownMenu    — the <div> containing menu links
   The active page sets .nav-dropdown__item--active in its HTML.
============================================================ */
function initNavDropdown() {
  const dropdown = document.getElementById('csvDropdown');
  const trigger  = document.getElementById('csvDropdownTrigger');
  const menu     = document.getElementById('csvDropdownMenu');

  if (!dropdown || !trigger || !menu) return;

  function open() {
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

  // Toggle on trigger click
  trigger.addEventListener('click', () => {
    isOpen() ? close() : open();
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target)) close();
  });

  // Keyboard navigation
  dropdown.addEventListener('keydown', (e) => {
    const items = Array.from(menu.querySelectorAll('.nav-dropdown__item'));
    const idx   = items.indexOf(document.activeElement);

    if (e.key === 'Escape') {
      close();
      trigger.focus();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen()) open();
      const next = idx < items.length - 1 ? items[idx + 1] : items[0];
      next.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = idx > 0 ? items[idx - 1] : items[items.length - 1];
      prev.focus();
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
  initFaqAccordion();
});
