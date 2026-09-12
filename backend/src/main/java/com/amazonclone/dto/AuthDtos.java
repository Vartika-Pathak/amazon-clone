package com.amazonclone.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AuthDtos {

    public static class RegisterRequest {
        @NotBlank
        public String fullName;

        @Email
        @NotBlank
        public String email;

        @NotBlank
        @Size(min = 8, message = "Password must be at least 8 characters")
        public String password;
    }

    public static class LoginRequest {
        @Email
        @NotBlank
        public String email;

        @NotBlank
        public String password;
    }

    public static class VerifyOtpRequest extends RegisterRequest {
        @NotBlank
        @Size(min = 6, max = 6, message = "OTP must be 6 digits")
        public String otp;
    }

    public static class AuthResponse {
        public String token;
        public String email;
        public String fullName;

        public AuthResponse(String token, String email, String fullName) {
            this.token = token;
            this.email = email;
            this.fullName = fullName;
        }
    }
}
