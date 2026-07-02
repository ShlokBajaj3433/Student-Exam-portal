package com.examportal.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

/**
 * Utility class for JWT token generation, parsing, and validation.
 * This component handles all JWT operations including:
 *   Token generation with claims (subject, roles, issuedAt, expiration)
 *   Token validation (signature, expiry, subject matching)
 *   Claim extraction (username, roles, expiry, etc.)
 * 
 * Configuration properties:
 *   {@code app.jwt.secret}: Base64-encoded HS256 secret key (minimum 256-bit/32-byte)
 *   {@code app.jwt.expiration-ms}: Token expiration in milliseconds (default: 86400000 = 24 hours)
 */
@Component
public class JwtUtil {

    @Value("${app.jwt.secret}")
    private String secretKey;

    @Value("${app.jwt.expiration-ms:86400000}")
    private long expirationMs;

    private SecretKey signingKey;

    /**
     * Post-initialization to decode and validate the secret key.
     * The secret key must be Base64-encoded and at least 32 bytes (256 bits) for HS256.
     */
    @PostConstruct
    private void init() {
        if (secretKey == null || secretKey.isEmpty()) {
            throw new IllegalStateException("JWT secret key must not be null or empty");
        }

        byte[] decodedKey;
        try {
            decodedKey = Base64.getDecoder().decode(secretKey);
        } catch (IllegalArgumentException e) {
            throw new IllegalStateException("JWT secret key must be Base64-encoded", e);
        }

        if (decodedKey.length < 32) {
            throw new IllegalStateException("JWT secret key must be at least 256 bits (32 bytes)");
        }

        this.signingKey = Keys.hmacShaKeyFor(decodedKey);
    }

    /**
     * Generates a signed JWT token for the given user details.
     * The token includes:
     *   Subject (sub): Username (email)
     *   Issued At (iat): Current timestamp
     *   Expiration (exp): Current timestamp + expirationMs
     *   Custom claim "roles": List of user roles
     * 
     * @param userDetails the user details to encode in the token
     * @return a compact JWT string
     */
    public String generateToken(UserDetails userDetails) {
        if (userDetails == null || userDetails.getUsername() == null || userDetails.getUsername().isEmpty()) {
            throw new IllegalArgumentException("User details and username must not be null");
        }

        Map<String, Object> claims = new HashMap<>();
        claims.put("roles", userDetails.getAuthorities()
            .stream().map(grantedAuthority -> grantedAuthority.getAuthority()).toList());

        return Jwts.builder()
            .claims(claims)
            .subject(userDetails.getUsername())
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + expirationMs))
            .signWith(getSigningKey())
            .compact();
    }

    /**
     * Validates the JWT token against user details.
     * Checks if the token is valid, not expired, and the subject matches.
     * This method never throws exceptions for invalid tokens. Instead, it returns false
     * to indicate invalidity, allowing callers to handle invalid tokens gracefully.
     * @param token       the JWT token to validate
     * @param userDetails the user details to compare against
     * @return true if the token is valid, false otherwise
     */
    public boolean isTokenValid(String token, UserDetails userDetails) {
        if (token == null || token.isEmpty() || userDetails == null) {
            return false;
        }

        try {
            final String username = extractUsername(token);
            return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
        } catch (Exception e) {
            // Token is invalid (malformed, expired, signature mismatch, etc.)
            return false;
        }
    }

    /**
     * Extracts the username (subject) from the JWT token.
     * @param token the JWT token
     * @return the username extracted from the token
     */
    public String extractUsername(String token) {
        if (token == null || token.isEmpty()) {
            throw new IllegalArgumentException("Token must not be null or empty");
        }
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Extracts roles from the JWT token claims.
     * @param token the JWT token
     * @return list of role strings from the token
     */
    public List<String> extractRoles(String token) {
        Claims claims = extractAllClaims(token);
        return claims.get("roles", List.class);
    }

    /**
     * Extracts a specific claim from the JWT token.
     * @param token           the JWT token
     * @param claimsResolver  function to extract the claim
     * @param <T>             the claim type
     * @return the extracted claim value
     */
    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Extracts all claims from the JWT token.
     * @param token the JWT token
     * @return the Claims object containing all token claims
     */
    private Claims extractAllClaims(String token) {
        return Jwts.parser()
            .verifyWith(getSigningKey())
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }

    /**
     * Checks if the JWT token is expired.
     * @param token the JWT token
     * @return true if the token is expired, false otherwise
     */
    private boolean isTokenExpired(String token) {
        return extractClaim(token, Claims::getExpiration).before(new Date());
    }

    /**
     * Gets the signing key for JWT validation.
     * Decodes the base64-encoded secret key into a SecretKey.
     * @return the SecretKey for JWT signing/verification
     */
    private SecretKey getSigningKey() {
        return signingKey;
    }
}
