package com.examportal.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.List;

/**
 * Utility class for JWT token generation, extraction, and validation.

 * This component handles all JWT operations including:
    Generating tokens with user details and roles
    Extracting claims from tokens
    Validating token signature and expiration
    Checking token validity against user details

 * The JWT uses HS256 algorithm with a secret key configured via
 * {@code app.jwt.secret} property (Base64-encoded 256-bit key).
 * Default token expiration is 24 hours (86400000 ms).
 */
@Component
public class JwtUtil {

    @Value("${app.jwt.secret}")
    private String secretKey;

    @Value("${app.jwt.expiration-ms:86400000}")
    private long expirationMs;

    /**
     * Generates a signed JWT token for the given user details.
     *
     * @param userDetails The user details to encode in the token
     * @return A compact, signed JWT string
     * @throws IllegalArgumentException if userDetails is null or username is empty
     */
    public String generateToken(org.springframework.security.core.userdetails.UserDetails userDetails) {
        if (userDetails == null || userDetails.getUsername() == null || userDetails.getUsername().isEmpty()) {
            throw new IllegalArgumentException("UserDetails and username must not be null");
        }

        return Jwts.builder()
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Validates if the given token is valid for the specified user details.
    
     * A token is considered valid if:
    
    The token is structurally valid (not malformed)
    The token has not expired
    The token subject matches the username in userDetails
    
     *
     * @param token       The JWT token to validate
     * @param userDetails The user details to compare against
     * @return true if the token is valid, false otherwise
     */
    public boolean isTokenValid(String token, org.springframework.security.core.userdetails.UserDetails userDetails) {
        final String username = extractUsername(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    /**
     * Extracts the username (subject) from the JWT token.
     *
     * @param token The JWT token
     * @return The username stored in the token subject
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Checks if the token has expired.
     *
     * @param token The JWT token
     * @return true if the token is expired, false otherwise
     */
    private boolean isTokenExpired(String token) {
        return extractClaim(token, Claims::getExpiration).before(new Date());
    }

    /**
     * Extracts a specific claim from the token using the provided claims resolver.
     *
     * @param token           The JWT token
     * @param claimsResolver  Function to extract the claim from Claims
     * @param <T>             The type of the claim
     * @return The extracted claim value
     */
    private <T> T extractClaim(String token, java.util.function.Function<Claims, T> claimsResolver) {
        final Claims claims = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return claimsResolver.apply(claims);
    }

    /**
     * Creates the signing key from the configured secret.
     *
     * @return The HMAC-SHA256 SecretKey for signing tokens
     */
    private SecretKey getSigningKey() {
        byte[] keyBytes = java.util.Base64.getDecoder().decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * Extracts all claims from the JWT token.
     *
     * @param token The JWT token
     * @return The Claims object containing all token claims
     */
    public Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * Extracts roles from the JWT token claims.
     *
     * @param token The JWT token
     * @return List of role strings from the token
     */
    public List<String> extractRoles(String token) {
        Claims claims = extractAllClaims(token);
        return claims.get("roles", List.class);
    }
}
