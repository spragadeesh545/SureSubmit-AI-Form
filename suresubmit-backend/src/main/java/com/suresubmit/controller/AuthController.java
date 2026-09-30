package com.suresubmit.controller;

import com.suresubmit.dto.AuthRequest;
import com.suresubmit.dto.AuthResponse;
import com.suresubmit.dto.ForgotPasswordRequest;
import com.suresubmit.dto.ResetPasswordRequest;
import com.suresubmit.entity.User;
import com.suresubmit.entity.UserSession;
import com.suresubmit.repository.UserRepository;
import com.suresubmit.repository.UserSessionRepository;
import com.suresubmit.service.PasswordResetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserSessionRepository sessionRepository;

    @Autowired
    private PasswordResetService passwordResetService;

    private static final SecureRandom RANDOM = new SecureRandom();

    private String hashPassword(String password) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(password.getBytes("UTF-8"));
            return Base64.getEncoder().encodeToString(hash);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private String generateToken() {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private AuthResponse createSession(User user) {
        UserSession session = new UserSession();
        session.setUser(user);
        session.setToken(generateToken());
        session.setCreatedAt(LocalDateTime.now());
        session.setExpiresAt(LocalDateTime.now().plusDays(7));
        sessionRepository.save(session);
        return new AuthResponse(session.getToken(), user.getId(), user.getEmail(), user.getName());
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody AuthRequest request) {
        try {
            if (request.getEmail() == null || request.getEmail().isBlank()
                || request.getPassword() == null || request.getPassword().length() < 4) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
            }
            if (userRepository.existsByEmail(request.getEmail())) {
                return ResponseEntity.status(HttpStatus.CONFLICT).build();
            }

            User user = new User(
                request.getEmail(),
                request.getName() != null && !request.getName().isBlank() ? request.getName() : request.getEmail(),
                hashPassword(request.getPassword())
            );
            User saved = userRepository.save(user);

            return ResponseEntity.status(HttpStatus.CREATED).body(createSession(saved));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        try {
            User user = userRepository.findByEmail(request.getEmail()).orElse(null);
            if (user == null || !user.getPasswordHash().equals(hashPassword(request.getPassword()))) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            return ResponseEntity.ok(createSession(user));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse> me(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            String token = authHeader.substring(7);
            UserSession session = sessionRepository.findByToken(token).orElse(null);
            if (session == null || session.getExpiresAt().isBefore(LocalDateTime.now())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            User user = session.getUser();
            return ResponseEntity.ok(new AuthResponse(token, user.getId(), user.getEmail(), user.getName()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            sessionRepository.findByToken(token).ifPresent(sessionRepository::delete);
        }
        return ResponseEntity.ok().build();
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Void> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        try {
            passwordResetService.createResetToken(request.getEmail());
            // Always the same response, so the endpoint cannot be used to discover
            // which email addresses have accounts.
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@RequestBody ResetPasswordRequest request) {
        try {
            PasswordResetService.ResetResult result =
                passwordResetService.resetPassword(request.getToken(), request.getNewPassword());

            return switch (result) {
                case SUCCESS -> ResponseEntity.ok().build();
                case WEAK_PASSWORD -> ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
                case EXPIRED_TOKEN -> ResponseEntity.status(HttpStatus.GONE).build();
                case INVALID_TOKEN -> ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
            };
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}