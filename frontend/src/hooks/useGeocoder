import { useState, useEffect } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";

/**
 * Custom hook to manage Google Maps Geocoder instance
 * @returns {google.maps.Geocoder|null} Initialized geocoder instance
 */
export function useGeocoder() {
  const geocodingLib = useMapsLibrary("geocoding");
  const [geocoder, setGeocoder] = useState(null);

  useEffect(() => {
    if (geocodingLib && !geocoder) {
      setGeocoder(new window.google.maps.Geocoder());
    }
  }, [geocodingLib, geocoder]);

  return geocoder;
}