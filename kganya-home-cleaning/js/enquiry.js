/* enquiry.js
   Quote request form on enquiry.html.
   1. Shows only the fields that apply to the chosen service.
   2. Validates every field with JavaScript and shows clear error messages.
   3. Calculates an estimated price and checks availability for the chosen date.
   4. Sends the request with AJAX (fetch) to the URL in the form's action attribute. */
'use strict';

(function quoteForm() {
  const form = document.getElementById('quote-form');
  if (!form) return;

  const Q = SITE_DATA.quote;
  const R = Validate.rules;
  const MAX_MESSAGE = 500;

  const service = document.getElementById('q-service');
  const frequency = document.getElementById('q-frequency');
  const dateInput = document.getElementById('q-date');
  const residentialFields = document.getElementById('residential-fields');
  const commercialFields = document.getElementById('commercial-fields');
  const frequencyField = document.getElementById('frequency-field');
  const result = document.getElementById('quote-result');
  const submitButton = form.querySelector('button[type="submit"]');

  const FREQUENCIES = {
    'once-off': 'Once-off',
    weekly: 'Weekly',
    'bi-weekly': 'Every second week',
    monthly: 'Monthly'
  };
  const VISITS_PER_MONTH = { 'once-off': 1, weekly: 4, 'bi-weekly': 2, monthly: 1 };
  const ADDON_NAMES = { oven: 'Inside oven', fridge: 'Inside fridge', windows: 'Interior windows', ironing: 'Ironing (1 hour)' };

  /* ---------- 1. Show the right fields for the chosen service ---------- */
  function isResidential() { return ['standard', 'deep', 'move'].indexOf(service.value) !== -1; }

  function setFrequencyOptions(values) {
    const current = frequency.value;
    frequency.innerHTML = '';
    values.forEach(function (v) {
      const option = document.createElement('option');
      option.value = v;
      option.textContent = FREQUENCIES[v];
      frequency.appendChild(option);
    });
    if (values.indexOf(current) !== -1) frequency.value = current;
  }

  function updateFields() {
    const residential = isResidential();
    residentialFields.hidden = !residential;
    commercialFields.hidden = residential || service.value === '';

    if (service.value === 'standard') {
      setFrequencyOptions(['once-off', 'weekly', 'bi-weekly', 'monthly']);
      frequencyField.hidden = false;
    } else if (service.value === 'office') {
      setFrequencyOptions(['bi-weekly', 'weekly']);
      frequencyField.hidden = false;
    } else {
      setFrequencyOptions(['once-off']);
      frequencyField.hidden = true;
    }
  }

  service.addEventListener('change', updateFields);

  /* ---------- 2. Validation rules for each field ---------- */
  dateInput.min = Validate.minDateString(2);
  dateInput.max = (function () { const d = new Date(); d.setMonth(d.getMonth() + 3); return Validate.toISODate(d); })();

  const schema = {
    'q-name': [
      { test: R.required, message: 'Enter your full name.' },
      { test: R.name, message: 'Use letters only (2 to 60 characters).' }
    ],
    'q-email': [
      { test: R.required, message: 'Enter your email address.' },
      { test: R.email, message: 'Enter an email address in the format name@example.com.' }
    ],
    'q-phone': [
      { test: R.required, message: 'Enter your phone number.' },
      { test: R.saPhone, message: 'Enter a South African number, for example 082 123 4567.' }
    ],
    'q-service': [
      { test: R.required, message: 'Choose the service you need.' }
    ],
    'q-property': [
      { test: R.required, message: 'Choose your property type.' }
    ],
    'q-bedrooms': [
      { test: R.number(1, 10), message: 'Enter between 1 and 10 bedrooms.' }
    ],
    'q-bathrooms': [
      { test: R.number(1, 6), message: 'Enter between 1 and 6 bathrooms.' }
    ],
    'q-size': [
      { test: R.number(20, 5000), message: 'Enter the floor size in square metres (20 to 5000).' }
    ],
    'q-area': [
      { test: R.required, message: 'Choose your area.' }
    ],
    'q-date': [
      { test: R.required, message: 'Choose a preferred date.' },
      { test: R.dateFromToday(2), message: 'Choose a date at least 2 days from today.' },
      { test: R.dateWithinMonths(3), message: 'We take bookings up to 3 months ahead.' },
      { test: R.notSunday, message: 'We do not work on Sundays. Please choose another day.' }
    ],
    'q-message': [
      { test: R.maxLength(MAX_MESSAGE), message: 'Keep additional details to ' + MAX_MESSAGE + ' characters or fewer.' }
    ],
    'q-consent': [
      { test: R.checked, message: 'Please agree so we can use your details to send your quote.' }
    ]
  };

  Validate.counter(document.getElementById('q-message'), MAX_MESSAGE);

  /* ---------- 3. Price calculation ---------- */
  function money(n) { return 'R' + Math.round(n).toLocaleString('en-ZA'); }

  function calculate(v) {
    const lines = [];
    let perVisit = 0;
    const travel = Q.serviceAreas.indexOf(v.area) === -1 ? Q.travelFee : 0;

    if (isResidential()) {
      const base = Q.base[v.service][v.property];
      lines.push([service.options[service.selectedIndex].text + ' (' + v.property + ', up to 2 bedrooms)', base]);
      perVisit += base;

      const extraBeds = Math.max(0, Number(v.bedrooms) - 2);
      if (extraBeds) {
        const cost = extraBeds * Q.extraBedroom[v.service];
        lines.push([extraBeds + ' extra bedroom' + (extraBeds > 1 ? 's' : ''), cost]);
        perVisit += cost;
      }
      const extraBaths = Math.max(0, Number(v.bathrooms) - 1);
      if (extraBaths) {
        const cost = extraBaths * Q.extraBathroom;
        lines.push([extraBaths + ' extra bathroom' + (extraBaths > 1 ? 's' : ''), cost]);
        perVisit += cost;
      }

      [].concat(v.addons || []).forEach(function (key) {
        lines.push([ADDON_NAMES[key], Q.addOns[key]]);
        perVisit += Q.addOns[key];
      });

      const discountRate = v.service === 'standard' ? Q.frequencyDiscount[v.frequency] : 0;
      if (discountRate) {
        const discount = perVisit * discountRate;
        lines.push([FREQUENCIES[v.frequency] + ' booking discount (' + discountRate * 100 + '%)', -discount]);
        perVisit -= discount;
      }
      if (travel) { lines.push(['Travel fee (outside our main service areas)', travel]); perVisit += travel; }

      const visits = VISITS_PER_MONTH[v.frequency] || 1;
      return {
        type: 'residential',
        lines: lines,
        total: perVisit,
        unit: 'per visit',
        monthly: visits > 1 ? perVisit * visits : null,
        visits: visits
      };
    }

    // Commercial
    const size = Number(v.size);
    if (v.service === 'office' && size <= Q.officeMaxSize) {
      const monthly = Q.officeMonthly[v.frequency];
      lines.push(['Small Office Package, ' + FREQUENCIES[v.frequency].toLowerCase() + ' (up to ' + Q.officeMaxSize + ' m²)', monthly]);
      if (travel) lines.push(['Travel fee (' + VISITS_PER_MONTH[v.frequency] + ' visits)', travel * VISITS_PER_MONTH[v.frequency]]);
      return {
        type: 'office',
        lines: lines,
        total: monthly + travel * VISITS_PER_MONTH[v.frequency],
        unit: 'per month'
      };
    }
    return { type: 'site-visit', size: size, tooBig: v.service === 'office' };
  }

  /* ---------- 4. Availability check for the chosen date ---------- */
  function nextWorkingDay(date) {
    const d = new Date(date);
    do { d.setDate(d.getDate() + 1); }
    while (d.getDay() === 0 || Q.closedDates.indexOf(Validate.toISODate(d)) !== -1);
    return d;
  }

  function formatDate(d) {
    return d.toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }

  function availability(v) {
    const chosen = new Date(v.date + 'T00:00:00');
    if (Q.closedDates.indexOf(v.date) !== -1) {
      return { ok: false, text: formatDate(chosen) + ' is a public holiday and we are closed. The next available day is ' + formatDate(nextWorkingDay(chosen)) + '.' };
    }
    if (chosen.getDay() === 6) {
      if (v.time === 'afternoon') {
        return { ok: false, text: 'On Saturdays we only work mornings (08:00 to 12:00). We have pencilled you in for the morning of ' + formatDate(chosen) + ' instead.' };
      }
      return { ok: true, text: formatDate(chosen) + ', morning: available. Saturday slots fill quickly, so we will confirm within one business day.' };
    }
    const slot = v.time === 'afternoon' ? 'afternoon (12:00 to 17:00)' : 'morning (07:00 to 12:00)';
    return { ok: true, text: formatDate(chosen) + ', ' + slot + ': available.' };
  }

  /* ---------- 5. Show the result ---------- */
  function showResult(v, quote, avail, reference) {
    let html = '<p class="result-ref">Reference: <strong>' + escapeHTML(reference) + '</strong></p>' +
      '<h3>Thank you, ' + escapeHTML(v.name.trim().split(' ')[0]) + '. Here is your estimate</h3>';

    if (quote.type === 'site-visit') {
      html += '<p class="result-total">Site visit needed</p>' +
        '<p>' + (quote.tooBig
          ? 'At ' + quote.size + ' m² your premises are larger than our Small Office Package (up to ' + Q.officeMaxSize + ' m²), so '
          : 'For a custom commercial contract, ') +
        'we will visit your premises free of charge and send a tailored quote. Commercial contracts start from ' + money(Q.officeMonthly['bi-weekly']) + ' per month.</p>';
    } else {
      html += '<p class="result-total">' + money(quote.total) + ' <small>' + quote.unit + '</small></p>';
      if (quote.monthly) html += '<p>About <strong>' + money(quote.monthly) + ' per month</strong> for ' + quote.visits + ' visits.</p>';
      html += '<table class="result-table"><caption class="visually-hidden">Price breakdown</caption><tbody>' +
        quote.lines.map(function (l) {
          return '<tr><th scope="row">' + escapeHTML(l[0]) + '</th><td>' + (l[1] < 0 ? '&minus;' + money(-l[1]) : money(l[1])) + '</td></tr>';
        }).join('') +
        '</tbody></table>' +
        '<p class="hint">This is an estimate. We confirm the final price after a short call, and it will not be more than 10% above this amount unless you change the scope.</p>';
    }

    html += '<div class="notice ' + (avail.ok ? 'notice-ok' : 'notice-warn') + '"><strong>Availability:</strong> ' + escapeHTML(avail.text) + '</div>' +
      '<p class="send-status" aria-live="polite">Sending your request&hellip;</p>' +
      '<p class="result-actions"><button type="button" class="btn btn-secondary" id="new-quote">Start a new quote</button></p>';

    result.innerHTML = html;
    result.hidden = false;
    result.focus();
    result.scrollIntoView({ behavior: 'smooth', block: 'start' });

    document.getElementById('new-quote').addEventListener('click', function () {
      form.reset();
      updateFields();
      result.hidden = true;
      document.getElementById('q-name').focus();
    });
  }

  /* ---------- 6. Submit ---------- */
  Validate.attach(form, schema, function () {
    const v = Validate.values(form);
    const quote = calculate(v);
    const avail = availability(v);
    const reference = Validate.referenceNumber('KHC');

    // Hidden fields so the business receives the estimate with the request
    form.querySelector('[name="reference"]').value = reference;
    form.querySelector('[name="estimate"]').value = quote.type === 'site-visit'
      ? 'Site visit needed' : money(quote.total) + ' ' + quote.unit;

    showResult(v, quote, avail, reference);

    submitButton.disabled = true;
    submitButton.textContent = 'Sending…';
    const sendStatus = result.querySelector('.send-status');

    Validate.submitAjax(form)
      .then(function () {
        sendStatus.innerHTML = '<span class="copy-status">✔ Request sent. We will email your confirmed quote within one business day.</span>';
      })
      .catch(function () {
        sendStatus.innerHTML = 'We could not send your request online just now. Please call <a href="tel:+27123456789">012 345 6789</a> or email <a href="mailto:' +
          SITE_DATA.contactEmail + '?subject=' + encodeURIComponent('Quote request ' + reference) + '">' + SITE_DATA.contactEmail + '</a> and quote reference ' + escapeHTML(reference) + '.';
      })
      .finally(function () {
        submitButton.disabled = false;
        submitButton.textContent = 'Get my quote';
      });
  });

  /* ---------- 7. Pre-fill from a link such as enquiry.html?service=deep ---------- */
  (function prefill() {
    const requested = new URLSearchParams(location.search).get('service');
    if (!requested) return;
    if (Q.addOns[requested] !== undefined) {
      service.value = 'standard';
      const box = form.querySelector('input[name="addons"][value="' + requested + '"]');
      if (box) box.checked = true;
    } else if (service.querySelector('option[value="' + requested + '"]')) {
      service.value = requested;
    }
  })();

  updateFields();
})();
