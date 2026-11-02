/* contact.js
   Contact page form. After validation, the details are compiled into an
   email addressed to the organisation (SITE_DATA.contactEmail) and opened
   in the visitor's own email app, ready to send. */
'use strict';

(function contactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const RECIPIENT = SITE_DATA.contactEmail; // the email address that receives messages
  const MAX_MESSAGE = 1000;
  const R = Validate.rules;

  const schema = {
    'c-name': [
      { test: R.required, message: 'Enter your full name.' },
      { test: R.name, message: 'Use letters only (2 to 60 characters).' }
    ],
    'c-email': [
      { test: R.required, message: 'Enter your email address.' },
      { test: R.email, message: 'Enter an email address in the format name@example.com.' }
    ],
    'c-phone': [
      { test: R.saPhone, optional: true, message: 'Enter a South African number, for example 082 123 4567.' }
    ],
    'c-type': [
      { test: R.required, message: 'Choose the type of message.' }
    ],
    'c-subject': [
      { test: R.required, message: 'Enter a subject.' },
      { test: R.minLength(5), message: 'The subject must be at least 5 characters.' },
      { test: R.maxLength(80), message: 'The subject must be 80 characters or fewer.' }
    ],
    'c-message': [
      { test: R.required, message: 'Enter your message.' },
      { test: R.minLength(20), message: 'Your message must be at least 20 characters.' },
      { test: R.maxLength(MAX_MESSAGE), message: 'Your message must be ' + MAX_MESSAGE + ' characters or fewer.' }
    ],
    'c-consent': [
      { test: R.checked, message: 'Please agree so we can use your details to reply.' }
    ]
  };

  Validate.counter(document.getElementById('c-message'), MAX_MESSAGE);

  Validate.attach(form, schema, function () {
    const v = Validate.values(form);
    const typeLabel = form.querySelector('#c-type option:checked').textContent;

    const subject = '[' + typeLabel + '] ' + v.subject.trim();
    const lines = [
      'Hello ' + SITE_DATA.name + ',',
      '',
      v.message.trim(),
      '',
      '---',
      'Name: ' + v.name.trim(),
      'Email: ' + v.email.trim(),
      'Phone: ' + (v.phone.trim() || 'Not provided'),
      'Message type: ' + typeLabel,
      'Sent from the contact form on ' + new Date().toLocaleString('en-ZA')
    ];
    const body = lines.join('\n');
    const mailto = 'mailto:' + RECIPIENT +
      '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(body);

    // Show a preview of the compiled email
    const result = document.getElementById('contact-result');
    result.hidden = false;
    result.innerHTML =
      '<h3>Your email is ready to send</h3>' +
      '<p>Your email app should open with this message filled in. Press <strong>Send</strong> there to deliver it.</p>' +
      '<dl class="email-preview">' +
        '<dt>To</dt><dd>' + escapeHTML(RECIPIENT) + '</dd>' +
        '<dt>Subject</dt><dd>' + escapeHTML(subject) + '</dd>' +
        '<dt>Message</dt><dd><pre>' + escapeHTML(body) + '</pre></dd>' +
      '</dl>' +
      '<p class="result-actions">' +
        '<a class="btn" id="open-email">Open in email app</a>' +
        '<button type="button" class="btn btn-secondary" id="copy-email">Copy message</button>' +
      '</p>' +
      '<p class="copy-status" aria-live="polite"></p>';

    result.querySelector('#open-email').href = mailto;
    result.querySelector('#copy-email').addEventListener('click', function () {
      const status = result.querySelector('.copy-status');
      navigator.clipboard.writeText('To: ' + RECIPIENT + '\nSubject: ' + subject + '\n\n' + body)
        .then(function () { status.textContent = 'Copied. You can paste it into any email.'; })
        .catch(function () { status.textContent = 'Copy failed. Please select the text above instead.'; });
    });
    result.scrollIntoView({ behavior: 'smooth', block: 'start' });
    result.focus();

    window.location.href = mailto; // opens the visitor's email app
  });
})();
