/* enquiry.js
   "Get involved" form on enquiry.html.
   1. Shows different questions for learners, volunteers, sponsors and partners.
   2. Validates every visible field with JavaScript and shows clear error messages.
   3. Responds with seat availability, matching programmes or sponsorship impact,
      using the intake data in data.js.
   4. Sends the enquiry with AJAX (fetch) to the URL in the form's action attribute. */
'use strict';

(function getInvolvedForm() {
  const form = document.getElementById('involve-form');
  if (!form) return;

  const R = Validate.rules;
  const MAX_MESSAGE = 500;
  const DAY = 24 * 60 * 60 * 1000;

  const role = document.getElementById('e-role');
  const programme = document.getElementById('e-programme');
  const dob = document.getElementById('e-dob');
  const sponsorType = document.getElementById('e-sponsor-type');
  const sections = {
    learner: document.getElementById('learner-fields'),
    volunteer: document.getElementById('volunteer-fields'),
    sponsor: document.getElementById('sponsor-fields'),
    partner: document.getElementById('partner-fields'),
    org: document.getElementById('org-fields')
  };
  const prerequisiteField = document.getElementById('prerequisite-field');
  const guardianField = document.getElementById('guardian-field');
  const amountLabel = document.querySelector('label[for="e-amount"]');
  const result = document.getElementById('involve-result');
  const submitButton = form.querySelector('button[type="submit"]');

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcoming = SITE_DATA.intakes
    .filter(function (i) { return new Date(i.start + 'T00:00:00') >= today; })
    .sort(function (a, b) { return a.start.localeCompare(b.start); });

  /* ---------- 1. Show the right questions for each role ---------- */
  function updateSections() {
    const r = role.value;
    sections.learner.hidden = r !== 'learner';
    sections.volunteer.hidden = r !== 'volunteer';
    sections.sponsor.hidden = r !== 'sponsor';
    sections.partner.hidden = r !== 'partner';
    sections.org.hidden = r !== 'sponsor' && r !== 'partner';
    updateLearnerExtras();
    // A venue has no Rand amount, so that question is hidden
    document.getElementById('amount-field').hidden = sponsorType.value === 'venue';
    amountLabel.firstChild.textContent = sponsorType.value === 'laptops'
      ? 'Value of laptops or equipment (R) ' : 'Amount you would like to give (R) ';
  }

  // Python needs the literacy workshop first; under-18s need a guardian's consent
  function updateLearnerExtras() {
    prerequisiteField.hidden = programme.value !== 'python';
    const age = dob.value ? Validate.ageFromDate(dob.value) : null;
    guardianField.hidden = !(age !== null && age < 18);
  }

  role.addEventListener('change', updateSections);
  programme.addEventListener('change', updateLearnerExtras);
  dob.addEventListener('change', updateLearnerExtras);
  sponsorType.addEventListener('change', updateSections);

  /* ---------- 2. Validation rules ---------- */
  dob.max = Validate.toISODate(today);

  const realBirthDate = function (v) {
    if (!v) return false;
    const age = Validate.ageFromDate(v);
    return age >= 10 && age <= 100;
  };

  const schema = {
    'e-name': [
      { test: R.required, message: 'Enter your full name.' },
      { test: R.name, message: 'Use letters only (2 to 60 characters).' }
    ],
    'e-email': [
      { test: R.required, message: 'Enter your email address.' },
      { test: R.email, message: 'Enter an email address in the format name@example.com.' }
    ],
    'e-phone': [
      { test: R.required, message: 'Enter your phone number.' },
      { test: R.saPhone, message: 'Enter a South African number, for example 072 123 4567.' }
    ],
    'e-role': [
      { test: R.required, message: 'Choose how you would like to get involved.' }
    ],
    // Learner
    'e-dob': [
      { test: R.required, message: 'Enter your date of birth.' },
      { test: realBirthDate, message: 'Enter a real date of birth.' }
    ],
    'e-programme': [
      { test: R.required, message: 'Choose a programme.' }
    ],
    'e-venue': [
      { test: R.required, message: 'Choose the venue closest to you.' }
    ],
    'e-guardian': [
      { test: R.checked, message: 'Learners under 18 need a parent or guardian to agree.' }
    ],
    // Volunteer
    'e-skills': [
      { test: R.oneChecked, message: 'Choose at least one skill you can share.' }
    ],
    'e-availability': [
      { test: R.required, message: 'Choose when you are available.' }
    ],
    'e-hours': [
      { test: R.number(2, 40), message: 'Enter between 2 and 40 hours a month.' }
    ],
    // Sponsor and partner
    'e-org': [
      { test: R.required, message: 'Enter your organisation’s name.' },
      { test: R.minLength(2), message: 'Enter at least 2 characters.' },
      { test: R.maxLength(100), message: 'Keep the name to 100 characters or fewer.' }
    ],
    'e-sponsor-type': [
      { test: R.required, message: 'Choose a type of support.' }
    ],
    'e-amount': [
      { test: R.number(500, 5000000), message: 'Enter an amount between R500 and R5 000 000, numbers only.' }
    ],
    'e-partner-type': [
      { test: R.required, message: 'Choose the type of organisation.' }
    ],
    'e-message': [
      { test: R.maxLength(MAX_MESSAGE), message: 'Keep your message to ' + MAX_MESSAGE + ' characters or fewer.' }
    ],
    'e-consent': [
      { test: R.checked, message: 'Please agree so we can use your details to reply.' }
    ]
  };

  Validate.counter(document.getElementById('e-message'), MAX_MESSAGE);

  /* ---------- 3. Building the response ---------- */
  function money(n) { return 'R' + Math.round(n).toLocaleString('en-ZA'); }
  function startDate(i) { return new Date(i.start + 'T00:00:00'); }
  function formatDate(i) {
    return startDate(i).toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }
  function weeksAway(i) {
    const days = Math.round((startDate(i) - today) / DAY);
    return days < 14 ? days + ' days' : Math.round(days / 7) + ' weeks';
  }
  function intakeLine(i) {
    return '<li><strong>' + escapeHTML(i.title) + '</strong>, ' + escapeHTML(i.venue) + ': ' + escapeHTML(formatDate(i)) +
      ' (in ' + weeksAway(i) + '), ' + (i.seatsLeft ? i.seatsLeft + ' seats left' : 'full, waiting list open') + '</li>';
  }
  function nextIntake(programmeKey, venue) {
    const options = upcoming.filter(function (i) { return i.programme === programmeKey; });
    const atVenue = options.filter(function (i) { return venue === 'any' || i.venue === venue; });
    return {
      open: atVenue.find(function (i) { return i.seatsLeft > 0; }),
      full: atVenue.find(function (i) { return i.seatsLeft === 0; }),
      elsewhere: options.find(function (i) { return i.seatsLeft > 0 && i.venue !== venue; })
    };
  }

  function learnerResponse(v) {
    const age = Validate.ageFromDate(v.dob);
    const name = SITE_DATA.programmes[v.programme];
    let html = '';

    if (age < 16 || age > 25) {
      html += '<div class="notice notice-warn">Our bootcamps and workshops are for learners aged 16 to 25, and you are ' + age +
        '. Our career information sessions are open to everyone, so you are still welcome at these:</div><ul>' +
        upcoming.filter(function (i) { return i.programme === 'career'; }).slice(0, 2).map(intakeLine).join('') + '</ul>';
      return { html: html, summary: 'Learner aged ' + age + ', outside 16 to 25' };
    }

    // Python needs the Digital Literacy Workshop first
    if (v.programme === 'python' && !v.prerequisite) {
      const dl = nextIntake('digital-literacy', v.venue).open || nextIntake('digital-literacy', 'any').open;
      html += '<div class="notice notice-warn"><strong>Before Intro to Python:</strong> you need to complete the Digital Literacy Workshop first.' +
        (dl ? ' The next one with space is:</div><ul>' + intakeLine(dl) + '</ul>' : '</div>');
    }

    const found = nextIntake(v.programme, v.venue);
    if (found.open) {
      html += '<p class="result-total">' + found.open.seatsLeft + ' seats left</p>' +
        '<div class="notice notice-ok"><strong>Next intake:</strong> ' + escapeHTML(name) + ' at ' + escapeHTML(found.open.venue) +
        ', starting ' + escapeHTML(formatDate(found.open)) + ' (in ' + weeksAway(found.open) + '). ' + escapeHTML(found.open.schedule) + '. The programme is free.</div>' +
        '<p>We will call you within 5 working days to confirm your seat' + (age < 18 ? ' and speak to your parent or guardian' : '') + '.</p>';
      return { html: html, summary: name + ', ' + found.open.venue + ', starts ' + found.open.start };
    }
    if (found.full) {
      html += '<p class="result-total">Waiting list</p>' +
        '<div class="notice notice-warn">The ' + escapeHTML(name) + ' intake at ' + escapeHTML(found.full.venue) + ' on ' + escapeHTML(formatDate(found.full)) +
        ' is full. We have added you to the waiting list and will call you if a seat opens.</div>';
    } else {
      html += '<div class="notice notice-warn">There is no upcoming ' + escapeHTML(name) + ' intake' + (v.venue === 'any' ? '' : ' in ' + escapeHTML(v.venue)) +
        ' yet. We will let you know when the next one is announced.</div>';
    }
    if (found.elsewhere) {
      html += '<p>There is space at another venue:</p><ul>' + intakeLine(found.elsewhere) + '</ul>';
    }
    return { html: html, summary: name + ', ' + v.venue + ', waiting list' };
  }

  function volunteerResponse(v) {
    const skills = [].concat(v.skills || []);
    const programmeKeys = [];
    skills.forEach(function (s) {
      SITE_DATA.skillProgrammes[s].forEach(function (p) { if (programmeKeys.indexOf(p) === -1) programmeKeys.push(p); });
    });
    const matches = upcoming.filter(function (i) { return programmeKeys.indexOf(i.programme) !== -1; }).slice(0, 3);
    const sessions = Math.max(1, Math.floor(Number(v.hours) / 4));

    // Volunteer induction: the first Saturday of next month
    const induction = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    while (induction.getDay() !== 6) induction.setDate(induction.getDate() + 1);

    let html = '<p class="result-total">' + matches.length + ' matching intake' + (matches.length === 1 ? '' : 's') + '</p>' +
      '<p>With ' + Number(v.hours) + ' hours a month you could lead about <strong>' + sessions + ' four-hour session' + (sessions > 1 ? 's' : '') + '</strong> a month. These upcoming intakes need your skills:</p>' +
      '<ul>' + matches.map(intakeLine).join('') + '</ul>';
    if (v.availability === 'weekday-evenings') {
      html += '<div class="notice notice-warn">Most classes run on Saturdays. On weekday evenings you can help with online mentoring and marking learner projects.</div>';
    }
    html += '<div class="notice notice-ok"><strong>Next volunteer induction:</strong> ' +
      induction.toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) +
      ', 10:00 to 12:00, Soshanguve venue. Please bring your ID for a background check.</div>';
    return { html: html, summary: 'Volunteer: ' + skills.join(', ') + '; ' + v.hours + ' h/month' };
  }

  function sponsorResponse(v) {
    const C = SITE_DATA.costs;
    const amount = Number(v.amount);
    let html = '<p class="result-total">' + money(amount) + '</p>';
    let summary = 'Sponsor ' + v.org + ': ' + v['sponsor-type'] + ', ' + money(amount);

    if (v['sponsor-type'] === 'laptops') {
      const laptops = Math.floor(amount / C.laptop);
      html += laptops >= 1
        ? '<div class="notice notice-ok">That is about <strong>' + laptops + ' refurbished laptop' + (laptops > 1 ? 's' : '') + '</strong> at ' + money(C.laptop) + ' each. Each laptop is used by around 12 learners a year.</div>'
        : '<div class="notice notice-ok">Thank you. Equipment such as mice, headsets and routers worth ' + money(amount) + ' helps keep our labs running.</div>';
    } else if (v['sponsor-type'] === 'venue') {
      html = '<p class="result-total">Venue support</p><div class="notice notice-ok">A venue lets us open a new intake. We will arrange a site visit to check space, power and connectivity.</div>';
      summary = 'Sponsor ' + v.org + ': venue';
    } else {
      const learners = Math.floor(amount / C.bootcampLearner);
      const workshop = Math.floor(amount / C.workshopLearner);
      html += learners >= 1
        ? '<div class="notice notice-ok">Your contribution could put <strong>' + learners + ' young ' + (learners > 1 ? 'people' : 'person') + '</strong> through a full 8-week coding bootcamp (' + money(C.bootcampLearner) + ' per learner).</div>'
        : '<div class="notice notice-ok">Your contribution could give <strong>' + workshop + ' learner' + (workshop > 1 ? 's' : '') + '</strong> a place on a 2-day Digital Literacy Workshop (' + money(C.workshopLearner) + ' per learner).</div>';
    }
    html += '<p>We will email ' + escapeHTML(v.org) + ' a sponsorship proposal and impact report within 3 working days.</p>';
    return { html: html, summary: summary };
  }

  function partnerResponse(v) {
    return {
      html: '<p class="result-total">Let’s meet</p>' +
        '<div class="notice notice-ok">Thank you, ' + escapeHTML(v.org) + '. We will contact you within 5 working days to set up an introductory meeting.</div>' +
        '<p>We currently run programmes in Soshanguve, Atteridgeville and Mamelodi, with ' + upcoming.length + ' intakes planned over the coming months.</p>',
      summary: 'Partner ' + v.org + ' (' + v['partner-type'] + ')'
    };
  }

  /* ---------- 4. Submit ---------- */
  Validate.attach(form, schema, function () {
    const v = Validate.values(form);
    const handlers = { learner: learnerResponse, volunteer: volunteerResponse, sponsor: sponsorResponse, partner: partnerResponse };
    const response = handlers[v.role](v);
    const reference = Validate.referenceNumber('TYTH');

    form.querySelector('[name="reference"]').value = reference;
    form.querySelector('[name="summary"]').value = response.summary;

    result.innerHTML =
      '<p class="result-ref">Reference: <strong>' + escapeHTML(reference) + '</strong></p>' +
      '<h3>Thank you, ' + escapeHTML(v.name.trim().split(' ')[0]) + '</h3>' +
      response.html +
      '<p class="send-status" aria-live="polite">Sending your enquiry&hellip;</p>' +
      '<p class="result-actions"><button type="button" class="btn btn-outline-dark" id="new-enquiry">Send another enquiry</button></p>';
    result.hidden = false;
    result.focus();
    result.scrollIntoView({ behavior: 'smooth', block: 'start' });

    document.getElementById('new-enquiry').addEventListener('click', function () {
      form.reset();
      updateSections();
      result.hidden = true;
      document.getElementById('e-name').focus();
    });

    submitButton.disabled = true;
    submitButton.textContent = 'Sending…';
    const sendStatus = result.querySelector('.send-status');

    Validate.submitAjax(form)
      .then(function () {
        sendStatus.innerHTML = '<span class="copy-status">✔ Enquiry sent. A copy of your reference number is shown above.</span>';
      })
      .catch(function () {
        sendStatus.innerHTML = 'We could not send your enquiry online just now. Please email <a href="mailto:' + SITE_DATA.contactEmail +
          '?subject=' + encodeURIComponent('Enquiry ' + reference) + '">' + SITE_DATA.contactEmail + '</a> or call <a href="tel:+27129876543">012 987 6543</a> and quote reference ' + escapeHTML(reference) + '.';
      })
      .finally(function () {
        submitButton.disabled = false;
        submitButton.textContent = 'Send enquiry';
      });
  });

  /* ---------- 5. Pre-fill from a link such as enquiry.html?role=learner&programme=python ---------- */
  (function prefill() {
    const params = new URLSearchParams(location.search);
    const set = function (el, value) {
      if (value && el.querySelector('option[value="' + CSS.escape(value) + '"]')) el.value = value;
    };
    set(role, params.get('role'));
    set(programme, params.get('programme'));
    set(document.getElementById('e-venue'), params.get('venue'));
  })();

  updateSections();
})();
