package com.flagcamp.dispatchanddelivery.controller;

import com.flagcamp.dispatchanddelivery.model.request.RegisterBody;
import com.flagcamp.dispatchanddelivery.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import com.flagcamp.dispatchanddelivery.model.response.RegisterResponse;



@RestController
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/signup")
    public ResponseEntity<RegisterResponse> signUp(@RequestBody RegisterBody body) {
        try {
            userService.signUp(body.email(),  body.password());
            String successMsg = "User registered successfully!";
            return ResponseEntity.status(HttpStatus.CREATED).body(new RegisterResponse(successMsg));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(new RegisterResponse(e.getMessage()));
        }
    }
}
