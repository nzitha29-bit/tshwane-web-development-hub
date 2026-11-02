/* catalogue.js
   Builds the "Upcoming intakes" cards on services.html from SITE_DATA.intakes,
   and lets visitors search, filter and sort them without reloading.
   Intakes whose start date has passed are hidden automatically.
   The chosen filters are kept in the address bar so a view can be shared. */
'use strict';

(function intakeCatalogue() {
  const list = document.getElementById('catalogue');
  if (!list) return;

  const search = document.getElementById('search');
  const type = document.getElementById('filter-type');
  const venue = document.getElementById('filter-venue');
  const sort = document.getElementById('sort');
  const openOnly = document.getElementById('filter-open');
  const status = document.getElementById('results-status');
  const modal = document.getElementById('detail-modal');

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const DAY = 24 * 60 * 60 * 1000;

  function startDate(intake) { return new Date(intake.start + 'T00:00:00'); }
  function daysUntil(intake) { return Math.round((startDate(intake) - today) / DAY); }

  const upcoming = SITE_DATA.intakes.filter(function (i) { return daysUntil(i) >= 0; });
  const pastCount = SITE_DATA.intakes.length - upcoming.length;

  function formatDate(intake) {
    return startDate(intake).toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
  }

  function countdown(intake) {
    const d = daysUntil(intake);
    if (d === 0) return 'Starts today';
    if (d === 1) return 'Starts tomorrow';
    if (d < 14) return 'Starts in ' + d + ' days';
    return 'Starts in ' + Math.round(d / 7) + ' weeks';
  }

  function seatsBadge(intake) {
    if (intake.seatsLeft === 0) return '<span class="badge badge-full">Full: waiting list</span>';
    if (intake.seatsLeft <= 10) return '<span class="badge badge-warn">Only ' + intake.seatsLeft + ' seats left</span>';
    return '<span class="badge">' + intake.seatsLeft + ' seats open</span>';
  }

  function applyLink(intake) {
    return 'enquiry.html?role=learner&programme=' + encodeURIComponent(intake.programme) +
      '&venue=' + encodeURIComponent(intake.venue);
  }

  // Wraps the search term in <mark> tags, escaping everything else
  function highlight(text, term) {
    if (!term) return escapeHTML(text);
    const pattern = new RegExp('(' + term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig');
    return text.split(pattern).map(function (part, i) {
      return i % 2 === 1 ? '<mark>' + escapeHTML(part) + '</mark>' : escapeHTML(part);
    }).join('');
  }

  function matches(intake, term) {
    if (!term) return true;
    const haystack = [intake.title, intake.type, intake.venue, intake.summary]
      .concat(intake.outcomes).join(' ').toLowerCase();
    return haystack.indexOf(term.toLowerCase()) !== -1;
  }

  function sorted(items) {
    const copy = items.slice();
    if (sort.value === 'date') copy.sort(function (a, b) { return startDate(a) - startDate(b); });
    if (sort.value === 'seats') copy.sort(function (a, b) { return b.seatsLeft - a.seatsLeft; });
    if (sort.value === 'name') copy.sort(function (a, b) { return a.title.localeCompare(b.title) || startDate(a) - startDate(b); });
    return copy;
  }

  function render() {
    const term = search.value.trim();
    const results = sorted(upcoming.filter(function (i) {
      return (type.value === 'all' || i.type === type.value) &&
        (venue.value === 'all' || i.venue === venue.value) &&
        (!openOnly.checked || i.seatsLeft > 0) &&
        matches(i, term);
    }));

    list.innerHTML = '';

    if (!results.length) {
      list.innerHTML =
        '<li class="empty-state"><div><p><strong>No upcoming intakes match your search.</strong></p>' +
        '<p>Try another venue or programme type, or clear the filters.</p>' +
        '<button type="button" class="btn btn-secondary" id="clear-filters">Clear filters</button></div></li>';
      document.getElementById('clear-filters').addEventListener('click', clearFilters);
    }

    results.forEach(function (intake, n) {
      const full = intake.seatsLeft === 0;
      const li = document.createElement('li');
      li.innerHTML =
        '<article class="card card-hover">' +
          '<span class="badge">' + escapeHTML(intake.type) + '</span>' +
          '<h3>' + highlight(intake.title, term) + '</h3>' +
          '<p class="meta"><strong>' + highlight(intake.venue, term) + '</strong> &middot; ' +
            escapeHTML(formatDate(intake)) + '<br>' + escapeHTML(intake.duration) + ' &middot; ' + escapeHTML(countdown(intake)) + '</p>' +
          '<p>' + highlight(intake.summary, term) + '</p>' +
          seatsBadge(intake) +
          '<p class="card-actions">' +
            '<button type="button" class="btn btn-outline-dark btn-small" data-intake="' + intake.id + '">Details</button>' +
            '<a class="btn btn-small" href="' + applyLink(intake) + '">' + (full ? 'Join waiting list' : 'Apply') + '</a>' +
          '</p>' +
        '</article>';
      li.querySelector('article').style.animationDelay = (n * 0.05) + 's';
      list.appendChild(li);
    });

    status.textContent = 'Showing ' + results.length + ' of ' + upcoming.length + ' upcoming intakes' +
      (venue.value !== 'all' ? ' in ' + venue.value : '') +
      (term ? ' matching "' + term + '"' : '') + '.' +
      (pastCount ? ' ' + pastCount + ' past ' + (pastCount === 1 ? 'event is' : 'events are') + ' hidden.' : '');

    saveToURL();
  }

  function clearFilters() {
    search.value = '';
    type.value = 'all';
    venue.value = 'all';
    sort.value = 'date';
    openOnly.checked = false;
    render();
    search.focus();
  }

  function saveToURL() {
    const params = new URLSearchParams();
    if (search.value.trim()) params.set('q', search.value.trim());
    if (type.value !== 'all') params.set('type', type.value);
    if (venue.value !== 'all') params.set('venue', venue.value);
    if (sort.value !== 'date') params.set('sort', sort.value);
    if (openOnly.checked) params.set('open', '1');
    const query = params.toString();
    history.replaceState(null, '', location.pathname + (query ? '?' + query : ''));
  }

  function loadFromURL() {
    const params = new URLSearchParams(location.search);
    if (params.get('q')) search.value = params.get('q');
    if (params.get('type')) type.value = params.get('type');
    if (params.get('venue')) venue.value = params.get('venue');
    if (params.get('sort')) sort.value = params.get('sort');
    openOnly.checked = params.get('open') === '1';
    if (!type.value) type.value = 'all';
    if (!venue.value) venue.value = 'all';
    if (!sort.value) sort.value = 'date';
  }

  function openDetails(id) {
    const intake = upcoming.find(function (i) { return i.id === id; });
    if (!intake) return;
    modal.querySelector('#detail-title').textContent = intake.title + ' (' + intake.venue + ')';
    modal.querySelector('.modal-body').innerHTML =
      '<p>' + seatsBadge(intake) + '</p>' +
      '<p>' + escapeHTML(intake.summary) + '</p>' +
      '<p><strong>Starts:</strong> ' + escapeHTML(formatDate(intake)) + ' (' + escapeHTML(countdown(intake).toLowerCase()) + ')<br>' +
      '<strong>Duration:</strong> ' + escapeHTML(intake.duration) + '<br>' +
      '<strong>When:</strong> ' + escapeHTML(intake.schedule) + '<br>' +
      '<strong>Prerequisite:</strong> ' + escapeHTML(intake.prerequisite) + '<br>' +
      '<strong>Cost to learners:</strong> Free</p>' +
      '<h3>What you will be able to do</h3>' +
      '<ul>' + intake.outcomes.map(function (o) { return '<li>' + escapeHTML(o) + '</li>'; }).join('') + '</ul>' +
      '<p><a class="btn" href="' + applyLink(intake) + '">' + (intake.seatsLeft === 0 ? 'Join the waiting list' : 'Apply for this intake') + '</a></p>';
    openModal(modal);
  }

  list.addEventListener('click', function (e) {
    const button = e.target.closest('[data-intake]');
    if (button) openDetails(button.dataset.intake);
  });

  let timer;
  search.addEventListener('input', function () {
    clearTimeout(timer);
    timer = setTimeout(render, 200);
  });
  [type, venue, sort, openOnly].forEach(function (control) {
    control.addEventListener('change', render);
  });
  document.getElementById('catalogue-form').addEventListener('submit', function (e) {
    e.preventDefault();
    render();
  });

  loadFromURL();
  render();
})();
