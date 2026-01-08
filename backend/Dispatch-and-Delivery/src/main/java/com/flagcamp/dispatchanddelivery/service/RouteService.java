package com.flagcamp.dispatchanddelivery.service;

import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.flagcamp.dispatchanddelivery.client.GoogleMapsClient;
import com.flagcamp.dispatchanddelivery.entity.RouteEntity;
import com.flagcamp.dispatchanddelivery.model.RouteDTO;

import com.flagcamp.dispatchanddelivery.repository.RouteRepository;
import com.google.maps.internal.PolylineEncoding;
import com.google.maps.model.DirectionsResult;
import com.google.maps.model.DirectionsRoute;
import com.google.maps.model.LatLng;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class RouteService {
    private static final Logger logger = LoggerFactory.getLogger(RouteService.class);
    
    private final RouteRepository routeRepository;
    private final GoogleMapsClient googleMapsClient;

   

    public RouteService(RouteRepository routeRepository, 
                       GoogleMapsClient googleMapsClient) {
        this.routeRepository = routeRepository;
        this.googleMapsClient = googleMapsClient;
    }

    /**
     * Computes routes between two geographic coordinates.
     * Returns a list containing two routes:
     * 1. Robot route: Uses Google Maps Directions API to get the road-based route
     * 2. Drone route: Direct straight-line route between start and end locations
     * 
     * @param fromLat Starting point latitude in decimal degrees
     * @param fromLng Starting point longitude in decimal degrees
     * @param toLat Destination point latitude in decimal degrees
     * @param toLng Destination point longitude in decimal degrees
     * @return List of RouteDTO objects: [0] robot route (road-based), [1] drone route (straight-line)
     * @throws RuntimeException if Google Maps API call fails or no routes are found
     */
    
    public List<RouteDTO> computeRoute(double fromLat, double fromLng, double toLat, double toLng)      throws Exception {
        // Validate coordinates
        if (!isValidCoordinate(fromLat, fromLng)) {
            logger.error("Invalid origin coordinates: ({}, {})", fromLat, fromLng);
            throw new IllegalArgumentException("Invalid origin coordinates: (" + fromLat + ", " + fromLng + ")");
        }
        if (!isValidCoordinate(toLat, toLng)) {
            logger.error("Invalid destination coordinates: ({}, {})", toLat, toLng);
            throw new IllegalArgumentException("Invalid destination coordinates: (" + toLat + ", " + toLng + ")");
        }
        
        // Check if origin and destination are the same
        if (Math.abs(fromLat - toLat) < 0.0001 && Math.abs(fromLng - toLng) < 0.0001) {
            logger.error("Origin and destination are the same: ({}, {})", fromLat, fromLng);
            throw new IllegalArgumentException("Origin and destination cannot be the same location");
        }
        
        logger.info("Computing route from ({}, {}) to ({}, {})", fromLat, fromLng, toLat, toLng);
        
        // Call Google Maps API
        DirectionsResult result;
        try {
            result = googleMapsClient.getDirections(
                fromLat, 
                fromLng, 
                toLat, 
                toLng
            );
        } catch (com.google.maps.errors.ZeroResultsException e) {
            logger.error("Google Maps found no routes between ({}, {}) and ({}, {}). " +
                        "This usually means there's no road connection between these points.", 
                        fromLat, fromLng, toLat, toLng);
            throw new RuntimeException("No route found between the pickup and delivery locations. " +
                                     "Please check that both locations are accessible by road.", e);
        } catch (Exception e) {
            logger.error("Failed to get directions from Google Maps API for route from ({}, {}) to ({}, {})", 
                        fromLat, fromLng, toLat, toLng, e);
            throw new RuntimeException("Failed to compute route: " + e.getMessage(), e);
        }
        
        // Check if we got results
        if (result.routes == null || result.routes.length == 0) {
            throw new RuntimeException("No routes found for the given coordinates");
        }
        
        // Get the first route (for robot)
        DirectionsRoute route = result.routes[0];

        RouteDTO robotRouteDTO = new RouteDTO(
            route.overviewPolyline.getEncodedPath(),
            //position is the start position when Route is computed
            route.legs[0].startLocation.lat,
            route.legs[0].startLocation.lng,
            //distance, in meters
            route.legs[0].distance.inMeters
        );

        //Get the routeDTO for drone, which is just straight line between 2 points 
        //Create a straight line path with just start and end points
        List<LatLng> straightPath = new ArrayList<>();
        straightPath.add(new LatLng(fromLat, fromLng));
        straightPath.add(new LatLng(toLat, toLng));
        
        //Encode the straight line path
        String encodedStraightPath = PolylineEncoding.encode(straightPath);
        
        //Calculate straight-line distance using Haversine formula
        long straightLineDistance = (long) calculateDistance(
            new LatLng(fromLat, fromLng), 
            new LatLng(toLat, toLng)
        );
        
        RouteDTO droneRouteDTO = new RouteDTO(
            encodedStraightPath,
            fromLat,
            fromLng,
            straightLineDistance
        );
    
        return List.of(robotRouteDTO, droneRouteDTO);
    }
    

    /**
     * Stores a complete route entity in the database for a given order.
     * Creates a new route with a generated UUID and persists it to Redis.
     * 
     * @param orderId Unique identifier of the order
     * @param hubToPickup Encoded polyline string representing the path from hub to pickup location
     * @param pickupToEnd Encoded polyline string representing the path from pickup to end location
     * @param positionLat Initial position latitude (typically the hub location)
     * @param positionLng Initial position longitude (typically the hub location)
     * @param hubToPickupDistance Distance in meters from hub to pickup location
     * @param pickupToEndDistance Distance in meters from pickup to end location
     * @return The saved RouteEntity
     * @throws Exception if database save operation fails
     */
    public RouteEntity storeRoute(
        String orderId,
        String hubToPickup,
        String pickupToEnd,             
        double positionLat,
        double positionLng,
        long hubToPickupDistance,
        long pickupToEndDistance
    ) throws Exception {
        // need to add the route from hub to pickup, but for the sake of test, whatever

        RouteEntity routeEntity = new RouteEntity( 
            UUID.randomUUID().toString(), 
            orderId, 
            hubToPickup,
            pickupToEnd,
            positionLat,
            positionLng,
            hubToPickupDistance,
            pickupToEndDistance
        );

        routeRepository.save(routeEntity);
        logger.info("Route saved for order: {}",
                   orderId);
        
        return routeEntity;
    }

    /**
     * Computes the current position of a delivery robot along its route based on elapsed time and speed.
     * Calculates progress ratio as (distance_traveled / total_distance), then interpolates position
     * along the encoded polyline path. Updates and stores the new position in the database.
     * 
     * @param orderId Unique identifier of the order being tracked
     * @param speed Speed of the robot in kilometers per hour (km/h)
     * @param hasElapsed Time elapsed since the robot started this leg of the journey, in seconds
     * @param pickup If true, uses hub-to-pickup route; if false, uses pickup-to-end route
     * @return PositionResult containing the current position and whether the robot has arrived
     * @throws IllegalArgumentException if route is not found, path is invalid, or distance is non-positive
     */
    public PositionResult computeAndStorePosition(String orderId, double speed, int hasElapsed, boolean pickup){
        RouteEntity routeEntity = getRoutesByOrderId(orderId);
        if (routeEntity == null) {
            throw new IllegalArgumentException("Route not found for order: " + orderId);
        }
        // Decode using Google's built-in decoder
        List<LatLng> pathPoints = pickup?  PolylineEncoding.decode(routeEntity.getHubToPickup())
            :PolylineEncoding.decode(routeEntity.getPickupToEnd());

        long distance = pickup? routeEntity.getHubToPickupDistance()
            :routeEntity.getPickupToEndDistance();
        
        if (pathPoints == null || pathPoints.isEmpty()) {
            throw new IllegalArgumentException("Path points cannot be null or empty");
        }
        if (pathPoints.size() == 1) {
            return new PositionResult(pathPoints.get(0), true);
        }
        if (distance <= 0) {
            throw new IllegalArgumentException("Distance must be positive");
        }
        
        // Calculate progress ratio: (distance_traveled / total_distance)
        // speed is km/h, hasElapsed is in seconds, distance is in meters
        // Convert: speed (km/h) = speed × (1000 m/km) / (3600 s/h) = speed × (1000/3600) m/s
        // distance_traveled = speed × (1000/3600) × hasElapsed meters
        double progressRatio = Math.min(1.0, (speed * 1000 * hasElapsed) / (3600 * distance));
        
        // If progress >= 1.0, delivery is complete (at end location)
        if (progressRatio >= 1.0) {
            LatLng endPosition = pathPoints.get(pathPoints.size() - 1);
            updatePosition(orderId, endPosition.lat, endPosition.lng);
            return new PositionResult(endPosition, true);
        }
        
        LatLng currentPosition = getPositionAlongPath(pathPoints, progressRatio, distance);

        // Update position
        updatePosition(orderId, currentPosition.lat, currentPosition.lng);

        return new PositionResult(currentPosition, false);
    }


    /**
     * Computes the position of a robot along a path represented by multiple waypoints.
     * Uses the provided total distance and progress ratio to find the target point,
     * then uses Haversine formula to calculate relative segment distances for interpolation.
     * 
     * @param pathPoints List of LatLng coordinates representing the complete route path
     * @param progressRatio Value between 0.0 (start) and 1.0 (end) indicating delivery progress
     * @param totalRouteDistance Total route distance in meters (from Google Maps API)
     * @return LatLng coordinates of the interpolated position along the path.
     *         Returns the last point if progressRatio >= 1.0
     */
    private LatLng getPositionAlongPath(List<LatLng> pathPoints, double progressRatio, long totalRouteDistance) {
        
        // Calculate segment distances
        double calculatedTotal= 0;
        List<Double> segmentDistances = new ArrayList<>();
        
        for (int i = 0; i < pathPoints.size() - 1; i++) {
            double segmentDist = calculateDistance(pathPoints.get(i), pathPoints.get(i + 1));
            segmentDistances.add(segmentDist);
            calculatedTotal += segmentDist;
        }
        
        // Use the actual route distance from Google Maps to find target distance
        // This accounts for the fact that Haversine straight-line distances between
        // waypoints may differ from the actual road distance
        double targetDistance = totalRouteDistance * progressRatio;
        
        // Scale factor to convert from Google Maps distance to our calculated distance
        double scaleFactor = calculatedTotal / totalRouteDistance;
        double scaledTargetDistance = targetDistance * scaleFactor;
    
        // Find segment containing target distance
        double accumulatedDistance = 0;
        for (int i = 0; i < segmentDistances.size(); i++) {
            double segmentDist = segmentDistances.get(i);
        
            if (accumulatedDistance + segmentDist >= scaledTargetDistance) {
                double distanceIntoSegment = scaledTargetDistance - accumulatedDistance;
                double segmentRatio = distanceIntoSegment / segmentDist;
                return interpolate(pathPoints.get(i), pathPoints.get(i + 1), segmentRatio);
            }
        
            accumulatedDistance += segmentDist;
        }
    
        return pathPoints.get(pathPoints.size() - 1);
    }

    /**
     * Performs linear interpolation between two geographic points based on a ratio.
     * Used as a helper function for computing exact position along a route segment.
     * 
     * @param start Starting LatLng coordinate of the segment
     * @param end Ending LatLng coordinate of the segment
     * @param ratio Value between 0.0 (at start) and 1.0 (at end) for interpolation
     * @return Interpolated LatLng coordinates between start and end points
     */
    private LatLng interpolate(LatLng start, LatLng end, double ratio) {
        double lat = start.lat + (end.lat - start.lat) * ratio;
        double lng = start.lng + (end.lng - start.lng) * ratio;
        return new LatLng(lat, lng);
    }

    /**
     * Validates that latitude and longitude coordinates are within valid ranges.
     * Latitude must be between -90 and 90 degrees.
     * Longitude must be between -180 and 180 degrees.
     * 
     * @param lat Latitude coordinate
     * @param lng Longitude coordinate
     * @return true if coordinates are valid, false otherwise
     */
    private boolean isValidCoordinate(double lat, double lng) {
        return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180 && 
               !(lat == 0.0 && lng == 0.0); // Reject 0,0 as it's likely an error
    }

    /**
     * Calculates the great-circle distance between two geographic points using the Haversine formula.
     * Accounts for the spherical shape of the Earth (radius = 6,371 km) to compute
     * the shortest distance over the Earth's surface.
     * 
     * @param point1 First geographic point (LatLng)
     * @param point2 Second geographic point (LatLng)
     * @return Distance between the two points in meters
     */
    private double calculateDistance(LatLng point1, LatLng point2) {
        double R = 6371000; // meters
        double lat1Rad = Math.toRadians(point1.lat);
        double lat2Rad = Math.toRadians(point2.lat);
        double deltaLat = Math.toRadians(point2.lat - point1.lat);
        double deltaLng = Math.toRadians(point2.lng - point1.lng);
    
        double a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
               Math.cos(lat1Rad) * Math.cos(lat2Rad) *
               Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
        return R * c;
    }

    /**
     * Updates the current position (latitude and longitude) for a route in the database.
     * Retrieves the existing route, creates an updated copy with new coordinates,
     * and persists it back to Redis.
     * 
     * @param orderId Unique identifier of the order
     * @param lat Current latitude coordinate in decimal degrees
     * @param lng Current longitude coordinate in decimal degrees
     * @throws IllegalArgumentException if route is not found for the given orderId
     */
    private void updatePosition(String orderId, double lat, double lng) {
        RouteEntity route = getRoutesByOrderId(orderId);
        if (route == null) {
            throw new IllegalArgumentException("Route not found for order: " + orderId);
        }
        RouteEntity updatedRoute = new RouteEntity(
            route.getId(), 
            route.getOrderId(), 
            route.getHubToPickup(),
            route.getPickupToEnd(),
            lat, 
            lng, 
            route.getHubToPickupDistance(),
            route.getPickupToEndDistance()
        );
        routeRepository.save(updatedRoute);
        logger.info("Updated position for order {}: ({}, {})", orderId, lat, lng);
    }
    
    /**
     * Retrieves the route entity for a given order ID from the database.
     * 
     * @param orderId Unique identifier of the order
     * @return RouteEntity associated with the order
     * @throws IllegalArgumentException if route is not found for the given orderId
     */
    public RouteEntity getRoutesByOrderId(String orderId) {
        RouteEntity routeEntity =  routeRepository.findByOrderId(orderId);
        if (routeEntity == null) {
            throw new IllegalArgumentException("Route not found for order: " + orderId);
        }
        return routeEntity;
    }

     /**
     * Result class for computeAndStorePosition method.
     * Contains the current position and arrival status of the robot.
     */
     public static class PositionResult {
        private final LatLng currentPosition;
        private final boolean arrived;

        public PositionResult(LatLng currentPosition, boolean arrived) {
            this.currentPosition = currentPosition;
            this.arrived = arrived;
        }

        public LatLng getCurrentPosition() {
            return currentPosition;
        }

        public boolean isArrived() {
            return arrived;
        }
    }
}
