async function leafletInit() {
  const parser = new DOMParser();
  const lmapConts = document.getElementsByClassName("leaflet");

  for (lmapCont of lmapConts) {
    const response = await fetch(lmapCont.dataset.json);
    const geojsondata = await response.json();
    const center = JSON.parse(lmapCont.dataset.center);
    const zoom = parseInt(lmapCont.dataset.zoom);
    const map = L.map(lmapCont, {
      center: center,
      zoom: zoom,
    });
    L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png", {
      attribution:
        "<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>",
    }).addTo(map);

    for (feature of geojsondata.features) {
      switch (feature.geometry.type) {
        case "LineString":
          L.geoJSON(feature, {
            style: () => {
              return { color: "#2222ff", weight: 4, opacity: 0.8 };
            },
          }).addTo(map);
          break;

        case "Point":
          let pin = null;

          if ("marker" in feature.properties) {
            const pinsvg = parser.parseFromString(
              feature.properties.marker,
              "image/svg+xml",
            ).documentElement;

            pin = L.divIcon({
              html: pinsvg,
              iconAnchor: [20, 40],
              popupAnchor: [0, -40],
              className: "my-div-icon",
            });
          }
          L.geoJSON(feature, {
            pointToLayer: function (feature, latlng) {
              return L.marker(latlng, {
                icon: pin ?? new L.Icon.Default(),
              });
            },
          })
            .bindPopup(function (layer) {
              return layer.feature.properties.html;
            })
            .addTo(map);
          break;
      }
    }
  }
}
document.addEventListener("DOMContentLoaded", (event) => {
  leafletInit();
});
