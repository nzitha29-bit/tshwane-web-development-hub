/* map.js
   Interactive location map built with the Leaflet library and
   OpenStreetMap tiles. The locations come from SITE_DATA in data.js. */
'use strict';

(function initMap() {
  const mapEl = document.getElementById('map');
  if (!mapEl || typeof SITE_DATA === 'undefined') return;

  // If Leaflet could not load (for example, no internet connection), show a text fallback
  if (typeof L === 'undefined') {
    mapEl.classList.add('map-fallback');
    mapEl.textContent = 'The map could not load. Our locations are listed below.';
    return;
  }

  const locations = SITE_DATA.locations;
  const map = L.map(mapEl, { scrollWheelZoom: false });

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  const markers = [];
  locations.forEach(function (loc) {
    const marker = L.marker([loc.lat, loc.lng], { title: loc.name, alt: loc.name }).addTo(map);
    marker.bindPopup('<strong>' + escapeHTML(loc.name) + '</strong><br>' + escapeHTML(loc.detail));
    markers.push(marker);

    // Optional shaded circle showing a service radius
    if (loc.radiusKm) {
      L.circle([loc.lat, loc.lng], {
        radius: loc.radiusKm * 1000,
        color: SITE_DATA.mapColour,
        fillColor: SITE_DATA.mapColour,
        fillOpacity: 0.12,
        weight: 1
      }).addTo(map);
    }
  });

  map.fitBounds(L.featureGroup(markers).getBounds().pad(0.35));

  // Turn on scroll-zoom only after the visitor clicks the map, so the page scrolls normally
  map.on('click', function () { map.scrollWheelZoom.enable(); });

  // The location buttons under the map fly to each marker and open its popup
  document.querySelectorAll('[data-location]').forEach(function (button) {
    button.addEventListener('click', function () {
      const i = Number(button.dataset.location);
      map.flyTo([locations[i].lat, locations[i].lng], 13, { duration: 0.8 });
      markers[i].openPopup();
      document.querySelectorAll('[data-location]').forEach(function (b) {
        b.setAttribute('aria-pressed', String(b === button));
      });
    });
  });
})();
