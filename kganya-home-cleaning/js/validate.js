/* validate.js
   Reusable client-side form validation.
   Each form script passes in a "schema": for every field, a list of rules.
   Errors are shown next to the field and summarised at the top of the form. */
'use strict';

const Validate = (function () {

  /* ---- Individual rules. Each returns true when the value is valid. ---- */
  const rules = {
    required: function (v) { return v.trim() !== ''; },
    name: function (v) { return /^[A-Za-zÀ-ÖØ-öø-ÿ' -]{2,60}$/.test(v.trim()); },
    email: function (v) { return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v.trim()); },
    // South African numbers: 0XX XXX XXXX or +27 XX XXX XXXX (spaces and dashes allowed)
    saPhone: function (v) { return /^(?:\+27|0)\d{9}$/.test(v.replace(/[\s-]/g, '')); },
    minLength: function (n) { return function (v) { return v.trim().length >= n; }; },
    maxLength: function (n) { return function (v) { return v.trim().length <= n; }; },
    number: function (min, max) {
      return function (v) {
        const num = Number(v);
        return v.trim() !== '' && Number.isFinite(num) && num >= min && num <= max;
      };
    },
    // Date must be at least `days` days after today
    dateFromToday: function (days) {
      return function (v) {
        if (!v) return false;
        const chosen = new Date(v + 'T00:00:00');
        const earliest = new Date();
        earliest.setHours(0, 0, 0, 0);
        earliest.setDate(earliest.getDate() + days);
        return chosen >= earliest;
      };
    },
    dateWithinMonths: function (months) {
      return function (v) {
        if (!v) return true;
        const latest = new Date();
        latest.setMonth(latest.getMonth() + months);
        return new Date(v + 'T00:00:00') <= latest;
      };
    },
    notSunday: function (v) { return !v || new Date(v + 'T00:00:00').getDay() !== 0; },
    ageBetween: function (min, max) {
      return function (v) {
        if (!v) return false;
        const age = ageFromDate(v);
        return age >= min && age <= max;
      };
    },
    checked: function (v, field) { return field.checked; },
    // At least one checkbox in a group (field is the fieldset)
    oneChecked: function (v, field) { return field.querySelectorAll('input:checked').length > 0; }
  };

  function ageFromDate(value) {
    const dob = new Date(value + 'T00:00:00');
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    return age;
  }

  /* ---- Showing and clearing error messages ---- */
  function errorElement(field) {
    const id = field.id + '-error';
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement('p');
      el.id = id;
      el.className = 'field-error';
      const anchor = field.closest('.field') || field.parentElement;
      anchor.appendChild(el);
    }
    return el;
  }

  function linkDescription(field, id, add) {
    const ids = (field.getAttribute('aria-describedby') || '').split(' ').filter(Boolean);
    const has = ids.indexOf(id) !== -1;
    if (add && !has) ids.push(id);
    if (!add && has) ids.splice(ids.indexOf(id), 1);
    if (ids.length) field.setAttribute('aria-describedby', ids.join(' '));
    else field.removeAttribute('aria-describedby');
  }

  function showError(field, message) {
    const el = errorElement(field);
    el.textContent = message;
    field.setAttribute('aria-invalid', 'true');
    field.closest('.field') && field.closest('.field').classList.add('has-error');
    linkDescription(field, el.id, true);
  }

  function clearError(field) {
    const el = document.getElementById(field.id + '-error');
    if (el) el.textContent = '';
    field.removeAttribute('aria-invalid');
    field.closest('.field') && field.closest('.field').classList.remove('has-error');
    if (el) linkDescription(field, el.id, false);
  }

  // A field inside a hidden section (for example, a role that was not chosen) is skipped
  function isActive(field) {
    return !field.disabled && !field.closest('[hidden]');
  }

  function checkField(field, fieldRules) {
    if (!isActive(field)) { clearError(field); return true; }
    const value = field.value || '';
    for (let i = 0; i < fieldRules.length; i++) {
      const rule = fieldRules[i];
      if (rule.optional && value.trim() === '') { clearError(field); return true; }
      if (!rule.test(value, field)) { showError(field, rule.message); return false; }
    }
    clearError(field);
    return true;
  }

  /* ---- Connect a schema to a form ---- */
  function attach(form, schema, onValid) {
    form.noValidate = true; // JavaScript takes over from the browser's default pop-ups
    const summary = form.querySelector('.form-summary');

    Object.keys(schema).forEach(function (id) {
      const field = document.getElementById(id);
      if (!field) return;
      // Check when the visitor leaves a field, then live once an error is showing
      const eventName = field.tagName === 'FIELDSET' ? 'change' : 'blur';
      field.addEventListener(eventName, function () { checkField(field, schema[id]); });
      field.addEventListener('input', function () {
        if (field.getAttribute('aria-invalid') === 'true') checkField(field, schema[id]);
      });
      field.addEventListener('change', function () {
        if (field.getAttribute('aria-invalid') === 'true') checkField(field, schema[id]);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const invalid = [];
      Object.keys(schema).forEach(function (id) {
        const field = document.getElementById(id);
        if (field && !checkField(field, schema[id])) invalid.push(field);
      });

      if (invalid.length) {
        if (summary) {
          summary.hidden = false;
          summary.innerHTML = '<p><strong>Please fix ' + invalid.length +
            (invalid.length === 1 ? ' problem' : ' problems') + ' before sending:</strong></p><ul></ul>';
          const list = summary.querySelector('ul');
          invalid.forEach(function (field) {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = '#' + field.id;
            a.textContent = document.getElementById(field.id + '-error').textContent;
            a.addEventListener('click', function (ev) { ev.preventDefault(); focusField(field); });
            li.appendChild(a);
            list.appendChild(li);
          });
          summary.focus();
        } else {
          focusField(invalid[0]);
        }
        return;
      }

      if (summary) summary.hidden = true;
      onValid(form);
    });
  }

  function focusField(field) {
    const target = field.tagName === 'FIELDSET' ? field.querySelector('input') : field;
    target.focus();
    target.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }

  /* ---- Character counter for textareas ---- */
  function counter(textarea, max) {
    const out = document.getElementById(textarea.id + '-count');
    if (!out) return;
    function update() {
      const len = textarea.value.length;
      out.textContent = len + ' / ' + max + ' characters';
      out.classList.toggle('is-over', len > max);
    }
    textarea.addEventListener('input', update);
    update();
  }

  /* ---- Turn form fields into a plain object ---- */
  function values(form) {
    const data = {};
    new FormData(form).forEach(function (value, key) {
      if (data[key] !== undefined) data[key] = [].concat(data[key], value);
      else data[key] = value;
    });
    return data;
  }

  /* ---- AJAX submission ----
     Sends the form to the URL in its action attribute without reloading the page.
     On Netlify this stores the submission (Netlify Forms). */
  function submitAjax(form) {
    const body = new URLSearchParams(new FormData(form)).toString();
    return fetch(form.getAttribute('action'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body
    }).then(function (response) {
      if (!response.ok) throw new Error('Server responded with ' + response.status);
      return true;
    });
  }

  function minDateString(daysAhead) {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    return toISODate(d);
  }

  function toISODate(d) {
    const pad = function (n) { return String(n).padStart(2, '0'); };
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  function referenceNumber(prefix) {
    const d = new Date();
    const random = Math.floor(1000 + Math.random() * 9000);
    return prefix + '-' + toISODate(d).replace(/-/g, '') + '-' + random;
  }

  return {
    rules: rules,
    attach: attach,
    counter: counter,
    values: values,
    submitAjax: submitAjax,
    ageFromDate: ageFromDate,
    minDateString: minDateString,
    toISODate: toISODate,
    referenceNumber: referenceNumber,
    clearError: clearError
  };
})();
