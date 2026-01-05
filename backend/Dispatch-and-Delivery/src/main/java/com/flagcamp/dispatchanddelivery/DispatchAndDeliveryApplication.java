package com.flagcamp.dispatchanddelivery;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class DispatchAndDeliveryApplication {
    
    public static void main(String[] args) {
        // Load .env from parent directory (project root)
        Dotenv dotenv = Dotenv.configure()
            .directory("../../")  // Go up two levels from backend/Dispatch-and-Delivery
            .ignoreIfMissing()
            .load();
        
        // Set environment variables for Spring
        dotenv.entries().forEach(entry -> 
            System.setProperty(entry.getKey(), entry.getValue())
        );
        
        SpringApplication.run(DispatchAndDeliveryApplication.class, args);
    }
}