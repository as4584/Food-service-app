import { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";
import { COLORS, RADII } from "../theme/tokens";
import { CAR_ICON_BASE64 } from "../assets/carIconBase64";

const HEIGHT = 220;

// A fixed short offset (~1-1.5km) standing in for the customer's delivery point,
// since we don't geocode the free-text address entered at checkout.
const DELIVERY_OFFSET_LAT = 0.012;
const DELIVERY_OFFSET_LNG = 0.015;

function buildMapHtml(restaurantLat: number, restaurantLng: number) {
  const deliveryLat = restaurantLat + DELIVERY_OFFSET_LAT;
  const deliveryLng = restaurantLng + DELIVERY_OFFSET_LNG;

  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<style>
  html, body, #map { height: 100%; margin: 0; padding: 0; background: ${COLORS.bg}; }
  .emoji-icon { font-size: 20px; text-align: center; }
  .car-icon { width: 30px; height: 30px; }
</style>
</head>
<body>
<div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
  var restaurantLatLng = [${restaurantLat}, ${restaurantLng}];
  var deliveryLatLng = [${deliveryLat}, ${deliveryLng}];

  var map = L.map('map', { zoomControl: false, attributionControl: true, scrollWheelZoom: false });
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);
  map.fitBounds(L.latLngBounds([restaurantLatLng, deliveryLatLng]), { padding: [36, 36] });

  function computeCurvedWaypoints(a, b, n) {
    var midLat = (a[0]+b[0])/2, midLng = (a[1]+b[1])/2;
    var dLat = b[0]-a[0], dLng = b[1]-a[1];
    var perpLat = -dLng, perpLng = dLat;
    var norm = Math.sqrt(perpLat*perpLat + perpLng*perpLng) || 1;
    var dist = Math.sqrt(dLat*dLat + dLng*dLng);
    var ctrlLat = midLat + (perpLat/norm) * dist * 0.35;
    var ctrlLng = midLng + (perpLng/norm) * dist * 0.35;
    var pts = [];
    for (var i = 0; i <= n; i++) {
      var t = i/n, mt = 1-t;
      pts.push([
        mt*mt*a[0] + 2*mt*t*ctrlLat + t*t*b[0],
        mt*mt*a[1] + 2*mt*t*ctrlLng + t*t*b[1]
      ]);
    }
    return pts;
  }

  var waypoints = computeCurvedWaypoints(restaurantLatLng, deliveryLatLng, 32);
  L.polyline(waypoints, { color: '${COLORS.primary}', weight: 4, opacity: 0.85 }).addTo(map);

  L.marker(restaurantLatLng, { icon: L.divIcon({ html: '🏪', className: 'emoji-icon', iconSize: [26,26] }) }).addTo(map);
  L.marker(deliveryLatLng, { icon: L.divIcon({ html: '🏠', className: 'emoji-icon', iconSize: [26,26] }) }).addTo(map);

  var carIcon = L.divIcon({
    html: '<img src="data:image/png;base64,${CAR_ICON_BASE64}" class="car-icon" style="transform: rotate(0deg);" />',
    className: '',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
  var carMarker = L.marker(waypoints[0], { icon: carIcon }).addTo(map);

  function bearing(p1, p2) {
    var toRad = Math.PI/180;
    var lat1 = p1[0]*toRad, lat2 = p2[0]*toRad;
    var dLng = (p2[1]-p1[1])*toRad;
    var y = Math.sin(dLng)*Math.cos(lat2);
    var x = Math.cos(lat1)*Math.sin(lat2) - Math.sin(lat1)*Math.cos(lat2)*Math.cos(dLng);
    return (Math.atan2(y,x) * 180/Math.PI + 360) % 360;
  }

  function pointAt(t) {
    var idx = t * (waypoints.length - 1);
    var i0 = Math.floor(idx);
    var i1 = Math.min(i0+1, waypoints.length-1);
    var frac = idx - i0;
    var a = waypoints[i0], b = waypoints[i1];
    return {
      lat: a[0] + (b[0]-a[0])*frac,
      lng: a[1] + (b[1]-a[1])*frac,
      i0: i0, i1: i1
    };
  }

  var currentT = 0, targetT = 0, animating = false;

  function render() {
    var p = pointAt(currentT);
    carMarker.setLatLng([p.lat, p.lng]);
    var brng = bearing(waypoints[p.i0], waypoints[p.i1]);
    var el = carMarker.getElement();
    if (el) {
      var img = el.querySelector('img');
      if (img) img.style.transform = 'rotate(' + brng + 'deg)';
    }
  }

  function animate() {
    if (!animating) return;
    var diff = targetT - currentT;
    if (Math.abs(diff) < 0.002) {
      currentT = targetT;
      render();
      animating = false;
      return;
    }
    currentT += diff * 0.12;
    render();
    requestAnimationFrame(animate);
  }

  window.setProgress = function(t) {
    targetT = Math.max(0, Math.min(1, t));
    if (!animating) { animating = true; requestAnimationFrame(animate); }
  };

  render();
  true;
</script>
</body>
</html>`;
}

export function DeliveryMap({
  restaurantLat,
  restaurantLng,
  progress,
  atRestaurant,
}: {
  restaurantLat: number | null;
  restaurantLng: number | null;
  /** 0 (just dispatched) to 1 (arrived) — only meaningful once out for delivery. */
  progress: number;
  /** True while the order hasn't been dispatched yet (placed/preparing). */
  atRestaurant: boolean;
}) {
  const webviewRef = useRef<WebView>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!loaded) return;
    const target = atRestaurant ? 0 : progress;
    webviewRef.current?.injectJavaScript(`window.setProgress(${target}); true;`);
  }, [progress, atRestaurant, loaded]);

  if (restaurantLat == null || restaurantLng == null) {
    return null;
  }

  return (
    <View style={styles.wrap}>
      <WebView
        ref={webviewRef}
        originWhitelist={["*"]}
        source={{ html: buildMapHtml(restaurantLat, restaurantLng) }}
        onLoadEnd={() => setLoaded(true)}
        style={styles.webview}
        scrollEnabled={false}
        javaScriptEnabled
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    height: HEIGHT,
    borderRadius: RADII.lg,
    overflow: "hidden",
  },
  webview: { flex: 1, backgroundColor: COLORS.bg },
});
