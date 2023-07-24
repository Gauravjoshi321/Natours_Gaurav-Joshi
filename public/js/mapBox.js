export const displayMap = function (locations) {

  mapboxgl.accessToken = 'pk.eyJ1IjoiZ2F1cmF2am9zaGkxMjMiLCJhIjoiY2xqd3M3MXdqMGZmZDNqbnZrdnpwbGRvMiJ9.u_OAbwdM-AqpfP35T8J8dw';

  const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/gauravjoshi123/cljwvi9wk025t01pk9k4q5k9h', // style URL
    scrollZoom: false,
    // center: [-74.5, 40], // starting position [lng, lat]
    // zoom: 9, // starting zoom,
    // interactive: false
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach(loc => {
    // Create Marker
    const el = document.createElement('div');
    el.className = 'marker';

    // Add Marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom'
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // Add Pop Up
    new mapboxgl.Popup({
      offset: 30
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    // Extend map bounds to include cuurent location
    bounds.extend(loc.coordinates);
  })
  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      right: 100,
      left: 100
    }
  });
}