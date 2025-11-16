/**
 * Decode Google Encoded Polyline
 * Algorithm reference: https://developers.google.com/maps/documentation/utilities/polylinealgorithm
 */
export function decodePolyline(encoded) {
  if (!encoded) return [];

  const points = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte;

    // Decode latitude
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLat = (result & 1) ? ~(result >> 1) : (result >> 1);
    lat += deltaLat;

    shift = 0;
    result = 0;

    // Decode longitude
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLng = (result & 1) ? ~(result >> 1) : (result >> 1);
    lng += deltaLng;

    points.push([lat / 1e5, lng / 1e5]);
  }

  return points;
}

/**
 * Encode coordinates to Google Encoded Polyline
 */
export function encodePolyline(coordinates) {
  if (!coordinates || coordinates.length === 0) return '';

  let lat = 0;
  let lng = 0;
  let encoded = '';

  for (const [currentLat, currentLng] of coordinates) {
    const deltaLat = Math.round((currentLat - lat) * 1e5);
    const deltaLng = Math.round((currentLng - lng) * 1e5);

    encoded += encodeValue(deltaLat);
    encoded += encodeValue(deltaLng);

    lat = currentLat;
    lng = currentLng;
  }

  return encoded;
}

function encodeValue(value) {
  let encoded = '';
  let signedValue = value << 1;
  if (value < 0) {
    signedValue = ~signedValue;
  }

  while (signedValue >= 0x20) {
    encoded += String.fromCharCode((0x20 | (signedValue & 0x1f)) + 63);
    signedValue >>= 5;
  }

  encoded += String.fromCharCode(signedValue + 63);
  return encoded;
}
