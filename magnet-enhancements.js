
function applyFilter() {
    const selectedCountry = document.getElementById('countryFilter').value;
    const selectedType = document.getElementById('typeFilter').value;

    document.querySelectorAll('.mapboxgl-popup').forEach(popup => popup.remove());

    fetch("magnet_coverage_TOOLTIP_FULL.json.json")
        .then(res => res.json())
        .then(geojson => {
            const filteredFeatures = geojson.features.filter(feature => {
                const countryMatch = selectedCountry === 'all' || feature.properties.country === selectedCountry;
                const typeMatch = selectedType === 'all' || feature.properties.type === selectedType;
                return countryMatch && typeMatch;
            });

            const filteredData = { type: 'FeatureCollection', features: filteredFeatures };

            if (map.getLayer('pins-layer')) map.removeLayer('pins-layer');
            if (map.getSource('pins')) map.removeSource('pins');

            map.addSource('pins', {
                type: 'geojson',
                data: filteredData
            });

            map.addLayer({
                id: 'pins-layer',
                type: 'symbol',
                source: 'pins',
                layout: {
                    'icon-image': ['concat', ['get', 'type'], '-icon'],
                    'icon-size': 0.2,
                    'icon-allow-overlap': true
                }
            });

            if (selectedCountry !== 'all' && filteredFeatures.length > 0) {
                const targetFeature = filteredFeatures[0];
                map.flyTo({
                    center: targetFeature.geometry.coordinates,
                    zoom: 4.5,
                    duration: 2000
                });
            } else {
                map.flyTo({ center: [30, 20], zoom: 1.5, duration: 2000 });
            }
        });
}

map.on('click', 'pins-layer', (e) => {
    const coordinates = e.features[0].geometry.coordinates.slice();
    const props = e.features[0].properties;
    const isAir = props.type === "Air";
    const certificates = isAir ? "IATA, FIATA & Local Association Certificates" : "FIATA & Local Association Certificates";

    const tooltipHTML = `
        <div style="font-family:'Inter',sans-serif; font-size:14px;">
            <strong>${props.country} | ${props.type} Magnetizer</strong><br><br>
            <strong>Experienced in:</strong><br>
            ${props.type} Freight with ${certificates}<br><br>
            📩 <a href="mailto:magnet-cargoqueries@m-ln.com" style="background:#FF5A00;color:#fff;padding:5px 10px;text-decoration:none;border-radius:5px;">Request a Quote</a>
        </div>
    `;

    new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setHTML(tooltipHTML)
        .addTo(map);
});

map.on('mouseenter', 'pins-layer', () => map.getCanvas().style.cursor = 'pointer');
map.on('mouseleave', 'pins-layer', () => map.getCanvas().style.cursor = '');
