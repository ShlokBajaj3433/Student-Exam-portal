package com.examportal.security;

import io.jsonwebtoken.Claims;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * JWT authentication filter that extracts and validates JWT tokens from requests.
 * Sets the authentication in SecurityContextHolder if the token is valid.
 * <p>
 * Requirements: 2.6, 2.7
 *
 * @author Kiro
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private JwtUtil jwtUtil;
    private UserDetailsService userDetailsService;

    @Autowired
    public void setJwtUtil(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Autowired
    public void setUserDetailsService(UserDetailsService userDetailsService) {
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String username;

        // Skip filter if no Authorization header or token doesn't start with "Bearer "
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Extract token from Authorization header
        jwt = authHeader.substring(7);

        try {
            // Extract username from token
            username = jwtUtil.extractUsername(jwt);

            // If username is not null and no authentication is set in context
            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                // Load user details
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                // Validate token
                if (jwtUtil.isTokenValid(jwt, userDetails)) {
                    // Extract roles from claims and convert to GrantedAuthority
                    List<String> roleStrings = jwtUtil.extractRoles(jwt);
                    List<GrantedAuthority> authorities = new ArrayList<>();
                    for (String role : roleStrings) {
                        authorities.add(new SimpleGrantedAuthority(role));
                    }

                    // Create authentication token
                    Authentication authentication = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            authorities
                    );

                    // Set authentication in security context
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }
        } catch (Exception e) {
            // Token validation failed, continue without authentication
            logger.debug("JWT validation failed", e);
        }

        filterChain.doFilter(request, response);
    }
}
