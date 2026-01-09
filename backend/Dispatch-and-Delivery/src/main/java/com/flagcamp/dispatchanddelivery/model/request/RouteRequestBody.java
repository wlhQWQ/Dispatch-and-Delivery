package com.flagcamp.dispatchanddelivery.model.request;

import com.fasterxml.jackson.annotation.JsonProperty;

public class RouteRequestBody {
    @JsonProperty("from_lat")
    public double fromLat;
    
    @JsonProperty("from_lng")
    public double fromLng;
    
    @JsonProperty("to_lat")
    public double toLat;
    
    @JsonProperty("to_lng")
    public double toLng;
    
    @JsonProperty("from_address")
    public String fromAddress;
    
    @JsonProperty("to_address")
    public String toAddress;
}
