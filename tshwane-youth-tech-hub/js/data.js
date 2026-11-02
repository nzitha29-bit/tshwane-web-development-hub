/* data.js
   All the content that JavaScript loads into the pages:
   upcoming programme intakes, sponsorship costs and venue locations.
   To add a new intake or change seats, edit this file only. */
'use strict';

const SITE_DATA = {
  name: 'Tshwane Youth Tech Hub',
  contactEmail: 'info@tshwaneyouthtechhub.org.za', // recipient for the contact form
  mapColour: '#4A148C',

  programmes: {
    'web-dev': 'Intro to Web Development',
    'python': 'Intro to Python',
    'digital-literacy': 'Digital Literacy Workshop',
    'career': 'Career Readiness'
  },

  /* ---------- Upcoming intakes and events (services.html) ---------- */
  intakes: [
    {
      id: 'wd-sosh-jan27', programme: 'web-dev', type: 'Coding bootcamp',
      title: 'Intro to Web Development', venue: 'Soshanguve',
      start: '2027-01-16', duration: '8 weeks', schedule: 'Saturdays, 09:00 to 13:00',
      seats: 25, seatsLeft: 7, prerequisite: 'None',
      summary: 'Build and publish your first website with HTML, CSS and JavaScript.',
      outcomes: ['Structure pages with semantic HTML', 'Style responsive layouts with CSS', 'Add interactivity with JavaScript', 'Publish a portfolio site online']
    },
    {
      id: 'wd-atte-feb27', programme: 'web-dev', type: 'Coding bootcamp',
      title: 'Intro to Web Development', venue: 'Atteridgeville',
      start: '2027-02-06', duration: '8 weeks', schedule: 'Saturdays, 09:00 to 13:00',
      seats: 25, seatsLeft: 15, prerequisite: 'None',
      summary: 'Build and publish your first website with HTML, CSS and JavaScript.',
      outcomes: ['Structure pages with semantic HTML', 'Style responsive layouts with CSS', 'Add interactivity with JavaScript', 'Publish a portfolio site online']
    },
    {
      id: 'py-sosh-mar27', programme: 'python', type: 'Coding bootcamp',
      title: 'Intro to Python', venue: 'Soshanguve',
      start: '2027-03-06', duration: '6 weeks', schedule: 'Saturdays, 09:00 to 13:00',
      seats: 20, seatsLeft: 12, prerequisite: 'Digital Literacy Workshop',
      summary: 'Programming fundamentals: variables, loops, functions and small projects.',
      outcomes: ['Write and run Python programs', 'Use loops, conditions and functions', 'Work with lists and files', 'Complete a small final project']
    },
    {
      id: 'py-atte-apr27', programme: 'python', type: 'Coding bootcamp',
      title: 'Intro to Python', venue: 'Atteridgeville',
      start: '2027-04-10', duration: '6 weeks', schedule: 'Saturdays, 09:00 to 13:00',
      seats: 20, seatsLeft: 20, prerequisite: 'Digital Literacy Workshop',
      summary: 'Programming fundamentals: variables, loops, functions and small projects.',
      outcomes: ['Write and run Python programs', 'Use loops, conditions and functions', 'Work with lists and files', 'Complete a small final project']
    },
    {
      id: 'dl-mame-nov26', programme: 'digital-literacy', type: 'Digital literacy',
      title: 'Digital Literacy Workshop', venue: 'Mamelodi',
      start: '2026-11-21', duration: '2 days', schedule: 'Saturday and Sunday, 09:00 to 15:00',
      seats: 30, seatsLeft: 20, prerequisite: 'None',
      summary: 'Computer basics, internet safety, email and essential office software.',
      outcomes: ['Use a computer and keyboard with confidence', 'Search the internet safely', 'Create and send email', 'Write a document in a word processor']
    },
    {
      id: 'dl-atte-dec26', programme: 'digital-literacy', type: 'Digital literacy',
      title: 'Digital Literacy Workshop', venue: 'Atteridgeville',
      start: '2026-12-05', duration: '2 days', schedule: 'Saturday and Sunday, 09:00 to 15:00',
      seats: 30, seatsLeft: 0, prerequisite: 'None',
      summary: 'Computer basics, internet safety, email and essential office software.',
      outcomes: ['Use a computer and keyboard with confidence', 'Search the internet safely', 'Create and send email', 'Write a document in a word processor']
    },
    {
      id: 'dl-sosh-jan27', programme: 'digital-literacy', type: 'Digital literacy',
      title: 'Digital Literacy Workshop', venue: 'Soshanguve',
      start: '2027-01-09', duration: '2 days', schedule: 'Saturday and Sunday, 09:00 to 15:00',
      seats: 30, seatsLeft: 26, prerequisite: 'None',
      summary: 'Computer basics, internet safety, email and essential office software.',
      outcomes: ['Use a computer and keyboard with confidence', 'Search the internet safely', 'Create and send email', 'Write a document in a word processor']
    },
    {
      id: 'cr-sosh-nov26', programme: 'career', type: 'Career readiness',
      title: 'CV and Interview Skills Day', venue: 'Soshanguve',
      start: '2026-11-28', duration: '1 day', schedule: 'Saturday, 09:00 to 14:00',
      seats: 40, seatsLeft: 18, prerequisite: 'None',
      summary: 'Write a strong CV and practise interviews with volunteer recruiters.',
      outcomes: ['A finished, printed CV', 'Two practice interviews with feedback', 'A plan for your next application']
    },
    {
      id: 'cr-mame-jan27', programme: 'career', type: 'Career readiness',
      title: 'Bursaries and Learnerships Info Session', venue: 'Mamelodi',
      start: '2027-01-23', duration: '1 day', schedule: 'Saturday, 10:00 to 13:00',
      seats: 60, seatsLeft: 41, prerequisite: 'None',
      summary: 'How to find and apply for bursaries, learnerships and entry-level tech roles.',
      outcomes: ['A list of open bursaries and learnerships', 'Help with online applications', 'Contacts at partner employers']
    },
    {
      id: 'cr-atte-oct26', programme: 'career', type: 'Career readiness',
      title: 'CV and Interview Skills Day', venue: 'Atteridgeville',
      start: '2026-10-17', duration: '1 day', schedule: 'Saturday, 09:00 to 14:00',
      seats: 40, seatsLeft: 0, prerequisite: 'None',
      summary: 'Write a strong CV and practise interviews with volunteer recruiters.',
      outcomes: ['A finished, printed CV', 'Two practice interviews with feedback', 'A plan for your next application']
    }
  ],

  /* ---------- Sponsorship costs (enquiry.html) ---------- */
  costs: {
    bootcampLearner: 2500,   // one learner through an 8-week bootcamp
    workshopLearner: 400,    // one learner through a 2-day workshop
    laptop: 6500             // one refurbished laptop for the computer lab
  },

  // Which programmes each volunteer skill can support
  skillProgrammes: {
    'web': ['web-dev'],
    'python': ['python'],
    'computer-basics': ['digital-literacy'],
    'careers': ['career']
  },

  /* ---------- Map locations (contact.html) ---------- */
  locations: [
    { name: 'Soshanguve venue', lat: -25.5225, lng: 28.0997, detail: 'Coding bootcamps, workshops and career days.' },
    { name: 'Atteridgeville venue', lat: -25.7740, lng: 28.0700, detail: 'Coding bootcamps and digital literacy workshops.' },
    { name: 'Mamelodi outreach', lat: -25.7110, lng: 28.3950, detail: 'Digital literacy workshops and career information sessions.' }
  ]
};
