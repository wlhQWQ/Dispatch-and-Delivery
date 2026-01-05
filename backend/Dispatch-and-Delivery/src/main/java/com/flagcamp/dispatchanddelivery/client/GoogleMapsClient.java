package com.flagcamp.dispatchanddelivery.client;

import com.google.maps.DirectionsApi;
import com.google.maps.GeoApiContext;
import com.google.maps.model.DirectionsResult;
import com.google.maps.model.LatLng;
import com.google.maps.model.TravelMode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;

@Component
public class GoogleMapsClient {
    
    @Value("${google.maps.api-key}")
    private String apiKey;
    
    private GeoApiContext context;
    
    @PostConstruct
    public void init() {
        this.context = new GeoApiContext.Builder()
            .apiKey(apiKey)
            .build();
    }
    
    @PreDestroy
    public void cleanup() {
        if (context != null) {
            context.shutdown();
        }
    }
    
    /**
     * Computes directions between two coordinates using Google Maps Directions API
     * 
     * @param fromLat Starting latitude
     * @param fromLng Starting longitude
     * @param toLat Destination latitude
     * @param toLng Destination longitude
     * @return DirectionsResult containing route information
     * @throws Exception if the API call fails
     */
    public DirectionsResult getDirections(double fromLat, double fromLng, double toLat, double toLng) throws Exception {
        LatLng origin = new LatLng(fromLat, fromLng);
        LatLng destination = new LatLng(toLat, toLng);
        
        return DirectionsApi.newRequest(context)
            .origin(origin)
            .destination(destination)
            .mode(TravelMode.DRIVING) // You can change this to WALKING, BICYCLING, or TRANSIT
            .await();
    }
    
    /**
     * Computes directions with waypoints
     * 
     * @param fromLat Starting latitude
     * @param fromLng Starting longitude
     * @param waypoints Array of waypoint LatLng objects
     * @param toLat Destination latitude
     * @param toLng Destination longitude
     * @return DirectionsResult containing route information
     * @throws Exception if the API call fails
     */
    public DirectionsResult getDirectionsWithWaypoints(double fromLat, double fromLng, 
                                                       LatLng[] waypoints,
                                                       double toLat, double toLng) throws Exception {
        LatLng origin = new LatLng(fromLat, fromLng);
        LatLng destination = new LatLng(toLat, toLng);
        
        return DirectionsApi.newRequest(context)
            .origin(origin)
            .destination(destination)
            .waypoints(waypoints)
            .mode(TravelMode.DRIVING)
            .await();
    }
}

