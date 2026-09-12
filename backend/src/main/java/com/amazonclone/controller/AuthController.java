package com.amazonclone.controller;

import com.amazonclone.dto.AuthDtos.*;
import com.amazonclone.model.User;
import com.amazonclone.repository.UserRepository;
import com.amazonclone.security.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.beans.factory.annotation.Value;

import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final JavaMailSender mailSender;
    private final Map<String, PendingSignup> pendingSignups = new ConcurrentHashMap<>();

    @Value("${mail.from:}")
    private String mailFrom;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil, JavaMailSender mailSender) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.mailSender = mailSender;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
        return ResponseEntity.status(410).body(Map.of("error", "Email verification is required before creating an account."));
    }

    @PostMapping("/request-otp")
    public ResponseEntity<?> requestOtp(@Valid @RequestBody RegisterRequest req) {
        if (userRepository.existsByEmail(req.email)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already registered"));
        }

        if (mailFrom.isBlank()) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Email delivery is not configured on the backend."));
        }

        String otp = String.format("%06d", new java.security.SecureRandom().nextInt(1_000_000));
        pendingSignups.put(req.email.toLowerCase(), new PendingSignup(req.fullName, req.password, otp, Instant.now().plusSeconds(600)));
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(mailFrom);
            message.setTo(req.email);
            message.setSubject("Your Amazon.clone verification code");
            message.setText("Your verification code is " + otp + ". It expires in 10 minutes.");
            mailSender.send(message);
            return ResponseEntity.ok(Map.of("message", "Verification code sent."));
        } catch (RuntimeException exception) {
            pendingSignups.remove(req.email.toLowerCase());
            return ResponseEntity.internalServerError().body(Map.of("error", "Could not send verification email."));
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@Valid @RequestBody VerifyOtpRequest req) {
        PendingSignup pending = pendingSignups.get(req.email.toLowerCase());
        if (pending == null || pending.expiresAt.isBefore(Instant.now()) || !pending.otp.equals(req.otp)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid or expired verification code."));
        }

        User user = new User();
        user.setEmail(req.email.toLowerCase());
        user.setFullName(pending.fullName);
        user.setPasswordHash(passwordEncoder.encode(pending.password));
        userRepository.save(user);
        pendingSignups.remove(req.email.toLowerCase());

        String token = jwtUtil.generateToken(user.getEmail());
        return ResponseEntity.ok(new AuthResponse(token, user.getEmail(), user.getFullName()));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        User user = userRepository.findByEmail(req.email).orElse(null);
        if (user == null || !passwordEncoder.matches(req.password, user.getPasswordHash())) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid email or password"));
        }

        String token = jwtUtil.generateToken(user.getEmail());
        return ResponseEntity.ok(new AuthResponse(token, user.getEmail(), user.getFullName()));
    }

    private record PendingSignup(String fullName, String password, String otp, Instant expiresAt) {}
}
