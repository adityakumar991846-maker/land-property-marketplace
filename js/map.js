/**
 * TerraTrade Marketplace - Discovery Map Module
 * Uses Leaflet with OpenStreetMap tiles (no external API key required)
 */

const PropertyMap = {
  map: null,
  markersLayer: null,
  radiusCircleLayer: null,
  userLocationMarker: null,

  init() {
    const mapEl = document.getElementById('discovery-map');
    if (!mapEl || !window.L) return;

    if (this.map) {
      this.map.invalidateSize();
      return;
    }

    // Default center on US geographic center
    this.map = L.map('discovery-map', {
      center: [39.8283, -98.5795],
      zoom: 4,
      zoomControl: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(this.map);

    this.markersLayer = L.layerGroup().addTo(this.map);
  },

  updateMarkers(properties) {
    if (!this.map || !this.markersLayer) {
      this.init();
    }
    if (!this.markersLayer) return;

    this.markersLayer.clearLayers();

    const bounds = [];

    properties.forEach(prop => {
      if (prop.latitude && prop.longitude) {
        const latLng = [prop.latitude, prop.longitude];
        bounds.push(latLng);

        const formattedPrice = Number(prop.price).toLocaleString();

        const popupContent = `
          <div style="width: 220px; font-family: sans-serif;">
            <img src="${prop.cover_image}" style="width: 100%; height: 110px; object-fit: cover; border-radius: 6px; margin-bottom: 6px;">
            <div style="font-weight: 700; color: #1b4332; font-size: 1.1rem; margin-bottom: 2px;">$${formattedPrice}</div>
            <div style="font-weight: 600; font-size: 0.85rem; line-height: 1.2; margin-bottom: 4px;">${prop.title}</div>
            <div style="color: #64748b; font-size: 0.75rem; margin-bottom: 8px;">${prop.city}, ${prop.state}</div>
            <a href="#property?id=${prop.id}" class="btn btn-sm btn-primary w-100" style="font-size: 0.75rem; padding: 4px 8px;">View Details</a>
          </div>
        `;

        const marker = L.marker(latLng).bindPopup(popupContent);
        this.markersLayer.addLayer(marker);
      }
    });

    // If radius circle exists, fit bounds including circle
    if (this.radiusCircleLayer && this.map) {
      this.map.fitBounds(this.radiusCircleLayer.getBounds(), { padding: [30, 30] });
    } else if (bounds.length > 0 && this.map) {
      this.map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
  },

  setNearbyRadius(lat, lng, radiusKm = 100) {
    if (!this.map) {
      this.init();
    }
    if (!this.map || !window.L) return;

    // Clear existing
    this.clearNearbyRadius();

    const latLng = [lat, lng];
    const radiusMeters = radiusKm * 1000;

    // Draw user location pin
    const userIcon = L.divIcon({
      className: 'user-geo-pin',
      html: `<div style="background-color: #dc3545; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px rgba(220,53,69,0.5); border: 2px solid white;"><i class="bi bi-geo-alt-fill" style="font-size: 16px;"></i></div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16]
    });

    this.userLocationMarker = L.marker(latLng, { icon: userIcon })
      .bindPopup(`<strong>Your Location</strong><br>Searching within ${radiusKm} km radius.`)
      .addTo(this.map);

    // Draw radius circle
    this.radiusCircleLayer = L.circle(latLng, {
      radius: radiusMeters,
      color: '#1b4332',
      fillColor: '#2d6a4f',
      fillOpacity: 0.12,
      weight: 2,
      dashArray: '6, 6'
    }).addTo(this.map);

    this.map.fitBounds(this.radiusCircleLayer.getBounds(), { padding: [30, 30] });
  },

  clearNearbyRadius() {
    if (this.radiusCircleLayer && this.map) {
      this.map.removeLayer(this.radiusCircleLayer);
      this.radiusCircleLayer = null;
    }
    if (this.userLocationMarker && this.map) {
      this.map.removeLayer(this.userLocationMarker);
      this.userLocationMarker = null;
    }
  },

  toggleView(mode) {
    const mapContainer = document.getElementById('map-view-container');
    const gridContainer = document.getElementById('properties-grid-container');
    const btnGrid = document.getElementById('btn-view-grid');
    const btnMap = document.getElementById('btn-view-map');

    if (mode === 'map') {
      if (mapContainer) mapContainer.classList.remove('d-none');
      if (gridContainer) gridContainer.classList.add('d-none');
      if (btnMap) btnMap.classList.add('active');
      if (btnGrid) btnGrid.classList.remove('active');

      this.init();
      if (this.map) {
        setTimeout(() => {
          this.map.invalidateSize();
          if (this.radiusCircleLayer) {
            this.map.fitBounds(this.radiusCircleLayer.getBounds(), { padding: [30, 30] });
          }
        }, 200);
      }
    } else {
      if (mapContainer) mapContainer.classList.add('d-none');
      if (gridContainer) gridContainer.classList.remove('d-none');
      if (btnGrid) btnGrid.classList.add('active');
      if (btnMap) btnMap.classList.remove('active');
    }
  }
};

window.PropertyMap = PropertyMap;
