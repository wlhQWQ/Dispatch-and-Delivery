/**
 * Converts an address string to latitude/longitude coordinates
 * @param {google.maps.Geocoder} geocoder - Initialized geocoder instance
 * @param {string} address - Address to geocode
 * @returns {Promise<{lat: number, lng: number}|null>} Coordinates or null if failed
 */
export async function geocodeAddress(geocoder, address) {
    if (!geocoder) {
      console.warn("Geocoder not initialized");
      return null;
    }
  
    try {
      const res = await geocoder.geocode({ address });
      if (res.results && res.results.length > 0) {
        const location = res.results[0].geometry.location;
        return {
          lat: location.lat(),
          lng: location.lng(),
        };
      }
      return null;
    } catch (error) {
      console.error("Geocoding error:", error);
      return null;
    }
  }