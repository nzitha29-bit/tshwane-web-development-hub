/* catalogue.js
   Builds the service cards on services.html from SITE_DATA.services,
   and lets visitors search, filter and sort them without reloading.
   The chosen filters are kept in the address bar so a filtered view can be shared. */
'use strict';

(function serviceCatalogue() {
  const list = document.getElementById('catalogue');
  if (!list) return;

  const search = document.getElementById('search');
  const category = document.getElementById('filter-category');
  const budget = document.getElementById('filter-budget');
  const sort = document.getElementById('sort');
  const status = document.getElementById('results-status');
  const modal = document.getElementById('detail-modal');
  const services = SITE_DATA.services;

  function formatPrice(service) {
    if (service.price === null) return 'Quote after site visit';
    return 'From R' + service.price.toLocaleString('en-ZA') + ' ' + service.unit;
  }

  // Wraps the search term in <mark> tags, escaping everything else
  function highlight(text, term) {
    if (!term) return escapeHTML(text);
    const pattern = new RegExp('(' + term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig');
    return text.split(pattern).map(function (part, i) {
      return i % 2 === 1 ? '<mark>' + escapeHTML(part) + '</mark>' : escapeHTML(part);
    }).join('');
  }

  function matches(service, term) {
    if (!term) return true;
    const haystack = [service.name, service.category, service.summary, service.bestFor]
      .concat(service.includes).join(' ').toLowerCase();
    return haystack.indexOf(term.toLowerCase()) !== -1;
  }

  function sorted(items) {
    const copy = items.slice();
    const priceOf = function (s) { return s.price === null ? Infinity : s.price; };
    if (sort.value === 'price-asc') copy.sort(function (a, b) { return priceOf(a) - priceOf(b); });
    if (sort.value === 'price-desc') copy.sort(function (a, b) { return priceOf(b) - priceOf(a); });
    if (sort.value === 'name') copy.sort(function (a, b) { return a.name.localeCompare(b.name); });
    return copy; // 'featured' keeps the order in data.js
  }

  function render() {
    const term = search.value.trim();
    const maxPrice = budget.value === 'any' ? Infinity : Number(budget.value);

    const results = sorted(services.filter(function (s) {
      const inCategory = category.value === 'all' || s.category === category.value;
      const inBudget = maxPrice === Infinity || (s.price !== null && s.price <= maxPrice);
      return inCategory && inBudget && matches(s, term);
    }));

    list.innerHTML = '';

    if (!results.length) {
      list.innerHTML =
        '<li class="empty-state"><div><p><strong>No services match your search.</strong></p>' +
        '<p>Try a different word or clear the filters.</p>' +
        '<button type="button" class="btn btn-secondary" id="clear-filters">Clear filters</button></div></li>';
      document.getElementById('clear-filters').addEventListener('click', clearFilters);
    }

    results.forEach(function (s, i) {
      const li = document.createElement('li');
      li.innerHTML =
        '<article class="card card-hover">' +
          '<span class="badge">' + escapeHTML(s.category) + (s.popular ? ' &middot; Popular' : '') + '</span>' +
          '<h3>' + highlight(s.name, term) + '</h3>' +
          '<p>' + highlight(s.summary, term) + '</p>' +
          '<p class="price">' + escapeHTML(formatPrice(s)) + '</p>' +
          '<p class="meta">' + escapeHTML(s.duration) + '</p>' +
          '<p class="card-actions">' +
            '<button type="button" class="btn btn-secondary btn-small" data-service="' + s.id + '">View details</button>' +
            '<a class="btn btn-small" href="enquiry.html?service=' + encodeURIComponent(s.id) + '">Get a quote</a>' +
          '</p>' +
        '</article>';
      li.querySelector('article').style.animationDelay = (i * 0.05) + 's';
      list.appendChild(li);
    });

    status.textContent = 'Showing ' + results.length + ' of ' + services.length + ' services' +
      (category.value !== 'all' ? ' in ' + category.value : '') +
      (term ? ' matching "' + term + '"' : '') + '.';

    saveToURL();
  }

  function clearFilters() {
    search.value = '';
    category.value = 'all';
    budget.value = 'any';
    sort.value = 'featured';
    render();
    search.focus();
  }

  /* Keep filters in the URL, e.g. services.html?category=Residential */
  function saveToURL() {
    const params = new URLSearchParams();
    if (search.value.trim()) params.set('q', search.value.trim());
    if (category.value !== 'all') params.set('category', category.value);
    if (budget.value !== 'any') params.set('budget', budget.value);
    if (sort.value !== 'featured') params.set('sort', sort.value);
    const query = params.toString();
    history.replaceState(null, '', location.pathname + (query ? '?' + query : ''));
  }

  function loadFromURL() {
    const params = new URLSearchParams(location.search);
    if (params.get('q')) search.value = params.get('q');
    if (params.get('category')) category.value = params.get('category');
    if (params.get('budget')) budget.value = params.get('budget');
    if (params.get('sort')) sort.value = params.get('sort');
    // An unknown value in the URL falls back to the default option
    if (!category.value) category.value = 'all';
    if (!budget.value) budget.value = 'any';
    if (!sort.value) sort.value = 'featured';
  }

  /* Fill and open the details modal for one service */
  function openDetails(id) {
    const s = services.find(function (item) { return item.id === id; });
    if (!s) return;
    modal.querySelector('#detail-title').textContent = s.name;
    modal.querySelector('.modal-body').innerHTML =
      '<p><span class="badge">' + escapeHTML(s.category) + '</span></p>' +
      '<p>' + escapeHTML(s.summary) + '</p>' +
      '<p class="price">' + escapeHTML(formatPrice(s)) + '</p>' +
      '<h3>What is included</h3>' +
      '<ul>' + s.includes.map(function (x) { return '<li>' + escapeHTML(x) + '</li>'; }).join('') + '</ul>' +
      '<p><strong>Time on site:</strong> ' + escapeHTML(s.duration) + '</p>' +
      '<p><strong>Best for:</strong> ' + escapeHTML(s.bestFor) + '</p>' +
      '<p><a class="btn" href="enquiry.html?service=' + encodeURIComponent(s.id) + '">Get a quote for this service</a></p>';
    openModal(modal);
  }

  list.addEventListener('click', function (e) {
    const button = e.target.closest('[data-service]');
    if (button) openDetails(button.dataset.service);
  });

  // Wait briefly after typing before filtering (debounce)
  let timer;
  search.addEventListener('input', function () {
    clearTimeout(timer);
    timer = setTimeout(render, 200);
  });
  [category, budget, sort].forEach(function (control) {
    control.addEventListener('change', render);
  });
  document.getElementById('catalogue-form').addEventListener('submit', function (e) {
    e.preventDefault();
    render();
  });

  loadFromURL();
  render();
})();
