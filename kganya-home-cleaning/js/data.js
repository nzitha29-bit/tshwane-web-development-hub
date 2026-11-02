/* data.js
   All the content that JavaScript loads into the pages:
   services and prices, quote rules, and map locations.
   To change a price or add a service, edit this file only. */
'use strict';

const SITE_DATA = {
  name: 'Kganya Home Cleaning',
  contactEmail: 'info@kganyacleaning.co.za', // recipient for the contact form
  mapColour: '#00786D',

  /* ---------- Services and pricing (services.html) ---------- */
  services: [
    {
      id: 'standard',
      name: 'Standard Clean',
      category: 'Residential',
      price: 450,
      unit: 'per visit',
      duration: '3 to 4 hours',
      summary: 'Dusting, vacuuming, mopping, kitchen and bathroom sanitising.',
      includes: ['Dust all reachable surfaces', 'Vacuum and mop floors', 'Clean and sanitise kitchen counters and sink', 'Clean bathrooms and toilets', 'Empty bins'],
      bestFor: 'Weekly or bi-weekly upkeep of a lived-in home',
      popular: true
    },
    {
      id: 'deep',
      name: 'Deep Clean',
      category: 'Residential',
      price: 850,
      unit: 'per visit',
      duration: '5 to 7 hours',
      summary: 'Standard clean plus inside cupboards, appliances and skirtings.',
      includes: ['Everything in the Standard Clean', 'Inside kitchen cupboards', 'Skirting boards and door frames', 'Light switches and handles', 'Behind and under movable furniture'],
      bestFor: 'A first clean with us, or a seasonal refresh'
    },
    {
      id: 'move',
      name: 'Move-in / Move-out Clean',
      category: 'Residential',
      price: 1200,
      unit: 'per visit',
      duration: '6 to 8 hours',
      summary: 'Full property clean before or after a move, including windows.',
      includes: ['Everything in the Deep Clean', 'Inside all cupboards and built-in wardrobes', 'Interior windows and sills', 'Inside oven and fridge', 'Garage sweep'],
      bestFor: 'Tenants, landlords and new homeowners'
    },
    {
      id: 'office',
      name: 'Small Office Package',
      category: 'Commercial',
      price: 1500,
      unit: 'per month',
      duration: 'Weekly or bi-weekly visits',
      summary: 'Weekly or bi-weekly servicing for offices up to 150 m².',
      includes: ['Desks and workstations wiped', 'Floors vacuumed and mopped', 'Kitchenette and bathrooms sanitised', 'Bins emptied', 'Consumables restocked (supplied by client)'],
      bestFor: 'Offices and small businesses up to 150 m²',
      popular: true
    },
    {
      id: 'custom',
      name: 'Custom Commercial Contract',
      category: 'Commercial',
      price: null,
      unit: 'quote after site visit',
      duration: 'Agreed with you',
      summary: 'Tailored scope and frequency for larger premises, shops or estates.',
      includes: ['Free site visit and assessment', 'Cleaning schedule built around your hours', 'Dedicated team lead', 'Monthly quality check'],
      bestFor: 'Premises larger than 150 m², retail and estates'
    },
    {
      id: 'oven',
      name: 'Inside Oven Clean',
      category: 'Add-on',
      price: 150,
      unit: 'per visit',
      duration: 'About 45 minutes',
      summary: 'Degreasing of oven interior, racks and glass door.',
      includes: ['Racks soaked and scrubbed', 'Interior degreased', 'Door glass cleaned'],
      bestFor: 'Adding to any residential clean'
    },
    {
      id: 'fridge',
      name: 'Inside Fridge Clean',
      category: 'Add-on',
      price: 100,
      unit: 'per visit',
      duration: 'About 30 minutes',
      summary: 'Shelves and drawers removed, washed and sanitised.',
      includes: ['Shelves and drawers washed', 'Interior wiped and sanitised', 'Door seals cleaned'],
      bestFor: 'Adding to any residential clean'
    },
    {
      id: 'windows',
      name: 'Interior Windows',
      category: 'Add-on',
      price: 200,
      unit: 'per visit',
      duration: 'About 1 hour',
      summary: 'Inside of all reachable windows, sills and tracks.',
      includes: ['Glass cleaned streak-free', 'Sills wiped', 'Tracks vacuumed'],
      bestFor: 'Adding to a Standard or Deep Clean'
    },
    {
      id: 'ironing',
      name: 'Ironing',
      category: 'Add-on',
      price: 120,
      unit: 'per hour',
      duration: 'Booked by the hour',
      summary: 'Clothes and linen ironed and folded or hung.',
      includes: ['Clothes ironed and hung or folded', 'Bed linen pressed'],
      bestFor: 'Busy households'
    }
  ],

  /* ---------- Quote calculator rules (enquiry.html) ---------- */
  quote: {
    // Base price for up to 2 bedrooms, by service and property type
    base: {
      standard: { apartment: 450, house: 600 },
      deep: { apartment: 850, house: 1100 },
      move: { apartment: 1200, house: 1600 }
    },
    extraBedroom: { standard: 80, deep: 150, move: 200 },
    extraBathroom: 60,
    officeMonthly: { 'bi-weekly': 1500, weekly: 2700 }, // Small Office Package, up to 150 m²
    officeMaxSize: 150,
    // Discount for regular bookings (Standard Clean only)
    frequencyDiscount: { 'once-off': 0, monthly: 0.05, 'bi-weekly': 0.10, weekly: 0.15 },
    addOns: { oven: 150, fridge: 100, windows: 200, ironing: 120 },
    serviceAreas: ['pretoria-east', 'centurion', 'midrand'],
    travelFee: 150, // charged for other Gauteng areas
    // Days we do not work (South African public holidays)
    closedDates: ['2026-12-16', '2026-12-25', '2026-12-26', '2027-01-01', '2027-03-22', '2027-03-26', '2027-03-29', '2027-04-27', '2027-05-01', '2027-06-16', '2027-08-09', '2027-09-24', '2027-12-16', '2027-12-25', '2027-12-27']
  },

  /* ---------- Map locations (contact.html) ---------- */
  locations: [
    { name: 'Pretoria East (head office)', lat: -25.7838, lng: 28.2757, radiusKm: 10, detail: 'Head office and Pretoria East service area. Office hours Mon to Fri, 07:00 to 17:00.' },
    { name: 'Centurion', lat: -25.8601, lng: 28.1891, radiusKm: 9, detail: 'Service area: homes and offices across Centurion.' },
    { name: 'Midrand', lat: -25.9964, lng: 28.1283, radiusKm: 9, detail: 'Service area: homes and offices across Midrand.' }
  ]
};
