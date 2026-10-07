package com.Expensive.management.controller;

import com.Expensive.management.dto.AuthResponse;
import com.Expensive.management.dto.LoginRequest;
import com.Expensive.management.dto.RegisterRequest;
import com.Expensive.management.entity.User;
import com.Expensive.management.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(
            @Valid @RequestBody RegisterRequest request) {

        User user = userService.register(request);

        return ResponseEntity.ok(
                "User registered successfully"
        );
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request) {

        String token = userService.login(request);

        return ResponseEntity.ok(new AuthResponse(token));
    }
}