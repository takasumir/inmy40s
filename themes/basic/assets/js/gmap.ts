import * as params from "@params";
// console.log(params.apiKey);

// Bootstrap Loader
((g) => {
  var h,
    a,
    k,
    p = "The Google Maps JavaScript API",
    c = "google",
    l = "importLibrary",
    q = "__ib__",
    m = document,
    b = window;
  b = b[c] || (b[c] = {});
  var d = b.maps || (b.maps = {}),
    r = new Set(),
    e = new URLSearchParams(),
    u = () =>
      h ||
      (h = new Promise(async (f, n) => {
        await (a = m.createElement("script"));
        e.set("libraries", [...r] + "");
        for (k in g)
          e.set(
            k.replace(/[A-Z]/g, (t) => "_" + t[0].toLowerCase()),
            g[k],
          );
        e.set("callback", c + ".maps." + q);
        a.src = `https://maps.${c}apis.com/maps/api/js?` + e;
        d[q] = f;
        a.onerror = () => (h = n(Error(p + " could not load.")));
        a.nonce = m.querySelector("script[nonce]")?.nonce || "";
        m.head.append(a);
      }));
  d[l]
    ? console.warn(p + " only loads once. Ignoring:", g)
    : (d[l] = (f, ...n) => r.add(f) && u().then(() => d[l](f, ...n)));
})({
  key: params.apiKey,
  v: "weekly",
  // Use the 'v' parameter to indicate the version to use (weekly, beta, alpha, etc.).
  // Add other bootstrap parameters as needed, using camel case.
});

let map: google.maps.Map;
async function initMap(): Promise<void> {
  const { Map } = (await google.maps.importLibrary(
    "maps",
  )) as google.maps.MapsLibrary;
  const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
  mapConts = document.getElementsByClassName("gmap") as Array<HTMLElement>;
  for (mapCont of mapConts) {
    // read map settings form mapCont
    const response = await fetch(mapCont.dataset.json);
    const geojsondata = await response.json();
    const center = JSON.parse(mapCont.dataset.center);
    const zoom = parseInt(mapCont.dataset.zoom);
    const type = mapCont.dataset.style ?? "46b4720545513a2c";
    map = new Map(mapCont as HTMLElement, {
      center: center,
      mapId: "46b4720545513a2c",
      zoom: zoom,
    });
    const parser = new DOMParser();
    for (const feature of geojsondata.features) {
      switch (feature.geometry.type) {
        case "LineString":
          const latlng = feature.geometry.coordinates.map(([x, y]) => {
            return { lat: y, lng: x };
          });
          const line = new google.maps.Polyline({
            path: latlng,
            strokeColor: "#2222ff",
            strokeOpacity: 0.8,
            strokeWeight: 4,
          });
          line.setMap(map);
          break;

        case "Point":
          let pin = null;
          if ("marker" in feature.properties) {
            pin = parser.parseFromString(
              feature.properties.marker,
              "image/svg+xml",
            ).documentElement;
          }
          const marker = new AdvancedMarkerElement({
            map,
            position: {
              lng: feature.geometry.coordinates[0],
              lat: feature.geometry.coordinates[1],
            },
            content: pin,
            title: feature.properties.name,
          });
          const infowindow = new google.maps.InfoWindow({
            headerContent: feature.properties.name,
            content: feature.properties.html,
            ariaLabel: feature.properties.name,
          });
          marker.addListener("click", () => {
            infowindow.open({
              anchor: marker,
              map,
            });
          });
          break;
      }
    }
  }
}

initMap();
