import * as params from "@params";

const styleMap = new Map([
  [
    "gsi",
    "https://raw.githubusercontent.com/gsi-cyberjapan/optimal_bvmap/52ba56f645334c979998b730477b2072c7418b94/style/std.json",
  ],
  ["outdoor", "mapbox://styles/takasumir/cm80zylz4007101sj9hpbb07x"],
  ["default", "mapbox://styles/takasumir/cl0nj4uwb004b14pk7x9zje2a"],
]);

async function mapInit() {
  mapboxgl.accessToken = params.apiKey;

  const mapConts = document.getElementsByClassName("mapbox");

  for (mapCont of mapConts) {
    const response = await fetch(mapCont.dataset.json);
    const geojsondata = await response.json();
    const center = JSON.parse(mapCont.dataset.center);
    const zoom = parseInt(mapCont.dataset.zoom);
    const map = new mapboxgl.Map({
      container: mapCont,
      style: styleMap.get(mapCont.dataset.style) ?? styleMap.get("default"),
      center: center,
      zoom: zoom,
    });

    map.on("load", () => {
      const parser = new DOMParser();

      for (feature of geojsondata.features) {
        switch (feature.geometry.type) {
          case "LineString":
            map.addSource(feature.properties.name, {
              type: "geojson",
              data: feature,
            });
            map.addLayer({
              id: feature.properties.name,
              type: "line",
              source: feature.properties.name,
              layout: {
                "line-join": "round",
                "line-cap": "round",
              },
              paint: {
                "line-color": "#2222ff",
                "line-opacity": 0.8,
                "line-width": 4,
              },
            });
            break;

          case "Point":
            let pin = null;
            if ("marker" in feature.properties) {
              pin = parser.parseFromString(
                feature.properties.marker,
                "image/svg+xml",
              ).documentElement;
            }
            const marker = new mapboxgl.Marker({
              element: pin,
              anchor: "bottom",
              offset: [0, 6],
              color: feature.properties.color,
            })
              .setLngLat(feature.geometry.coordinates)
              .setPopup(
                new mapboxgl.Popup({
                  offset: { top: [0, 0], bottom: [0, -40] },
                }).setHTML(feature.properties.html),
              )
              .addTo(map);
            break;
        }
      }
    });
  }
}
document.addEventListener("DOMContentLoaded", (event) => {
  mapInit();
});
