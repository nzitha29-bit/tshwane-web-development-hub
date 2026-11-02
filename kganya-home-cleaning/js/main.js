/* main.js
   Shared interface behaviour used on every page:
   mobile navigation, scroll animations, number counters,
   accordion, tabs, modals and the lightbox gallery.
   Written in plain (vanilla) JavaScript, so no library is needed. */
'use strict';

document.documentElement.classList.add('js');

/* ---------- 1. Mobile navigation toggle ---------- */
(function navigation() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('primary-nav');
  if (!toggle || !nav) return;

  function setOpen(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    nav.classList.toggle('is-open', open);
  }

  toggle.addEventListener('click', function () {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });

  // Close the menu with Escape or when a link is chosen
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      setOpen(false);
      toggle.focus();
    }
  });
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) setOpen(false);
  });
})();

/* ---------- 2. Current year in the footer ---------- */
document.querySelectorAll('[data-year]').forEach(function (el) {
  el.textContent = new Date().getFullYear();
});

/* ---------- 3. Reveal-on-scroll animation and number counters ---------- */
(function scrollEffects() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealItems = document.querySelectorAll('.reveal');
  const counters = document.querySelectorAll('[data-count]');

  function animateCounter(el) {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    if (reduceMotion) { el.textContent = target.toLocaleString('en-ZA') + suffix; return; }
    const duration = 1400;
    const start = performance.now();
    function frame(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out
      el.textContent = Math.round(target * eased).toLocaleString('en-ZA') + suffix;
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  if (!('IntersectionObserver' in window)) {
    revealItems.forEach(function (el) { el.classList.add('is-visible'); });
    counters.forEach(animateCounter);
    return;
  }

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      if (el.hasAttribute('data-count')) animateCounter(el);
      else el.classList.add('is-visible');
      observer.unobserve(el);
    });
  }, { threshold: 0.15 });

  revealItems.forEach(function (el) { observer.observe(el); });
  counters.forEach(function (el) { observer.observe(el); });
})();

/* ---------- 4. Accordion ---------- */
function initAccordions(root) {
  (root || document).querySelectorAll('.accordion-trigger').forEach(function (button) {
    if (button.dataset.ready) return;
    button.dataset.ready = 'true';
    button.addEventListener('click', function () {
      const panel = document.getElementById(button.getAttribute('aria-controls'));
      const open = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!open));
      panel.hidden = open;
    });
  });
}
initAccordions();

/* ---------- 5. Tabs (with arrow-key support) ---------- */
document.querySelectorAll('[role="tablist"]').forEach(function (tablist) {
  const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));

  function select(tab) {
    tabs.forEach(function (t) {
      const selected = t === tab;
      t.setAttribute('aria-selected', String(selected));
      t.tabIndex = selected ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !selected;
    });
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { select(tab); });
    tab.addEventListener('keydown', function (e) {
      let next = null;
      if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
      if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
      if (e.key === 'Home') next = tabs[0];
      if (e.key === 'End') next = tabs[tabs.length - 1];
      if (next) { e.preventDefault(); select(next); next.focus(); }
    });
  });
});

/* ---------- 6. Modals (native <dialog> element) ---------- */
function openModal(dialog) {
  if (typeof dialog.showModal === 'function') dialog.showModal();
  else dialog.setAttribute('open', '');
}

document.addEventListener('click', function (e) {
  const opener = e.target.closest('[data-modal-target]');
  if (opener) {
    const dialog = document.getElementById(opener.dataset.modalTarget);
    if (dialog) { e.preventDefault(); openModal(dialog); }
  }
  const closer = e.target.closest('[data-close]');
  if (closer) closer.closest('dialog').close();
});

// Clicking the dark backdrop outside the box closes a modal
document.querySelectorAll('dialog.modal').forEach(function (dialog) {
  dialog.addEventListener('click', function (e) {
    if (e.target === dialog) dialog.close();
  });
});

/* ---------- 7. Lightbox gallery ---------- */
(function lightbox() {
  const links = Array.from(document.querySelectorAll('[data-lightbox]'));
  if (!links.length) return;

  // Build the lightbox once and add it to the page (DOM manipulation)
  const box = document.createElement('dialog');
  box.className = 'lightbox';
  box.setAttribute('aria-label', 'Image viewer');
  box.innerHTML =
    '<figure class="lightbox-figure">' +
      '<img class="lightbox-img" alt="">' +
      '<figcaption class="lightbox-caption"></figcaption>' +
    '</figure>' +
    '<p class="lightbox-count" aria-live="polite"></p>' +
    '<button type="button" class="lightbox-btn lightbox-prev" aria-label="Previous image">&#8249;</button>' +
    '<button type="button" class="lightbox-btn lightbox-next" aria-label="Next image">&#8250;</button>' +
    '<button type="button" class="lightbox-btn lightbox-close" aria-label="Close image viewer">&times;</button>';
  document.body.appendChild(box);

  const img = box.querySelector('.lightbox-img');
  const caption = box.querySelector('.lightbox-caption');
  const count = box.querySelector('.lightbox-count');
  let index = 0;

  function show(i) {
    index = (i + links.length) % links.length;
    const link = links[index];
    const thumb = link.querySelector('img');
    img.classList.remove('is-loaded');
    img.src = link.href;
    img.alt = thumb ? thumb.alt : '';
    caption.textContent = link.dataset.caption || (thumb ? thumb.alt : '');
    count.textContent = 'Image ' + (index + 1) + ' of ' + links.length;
  }

  img.addEventListener('load', function () { img.classList.add('is-loaded'); });

  links.forEach(function (link, i) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      show(i);
      openModal(box);
    });
  });

  box.querySelector('.lightbox-prev').addEventListener('click', function () { show(index - 1); });
  box.querySelector('.lightbox-next').addEventListener('click', function () { show(index + 1); });
  box.querySelector('.lightbox-close').addEventListener('click', function () { box.close(); });
  box.addEventListener('click', function (e) { if (e.target === box) box.close(); });
  box.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') show(index + 1);
    if (e.key === 'ArrowLeft') show(index - 1);
  });
})();

/* ---------- 8. Small helper used by other scripts ---------- */
// Escapes text before it is placed inside HTML, so user input can never inject code.
function escapeHTML(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
