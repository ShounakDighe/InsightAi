package in.clubwebsite.insightai.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

/**
 * Utility class for creating and validating JSON Web Tokens (JWT).
 */
@Component
public class JwtUtil {
    // Secret key for signing tokens (Base64 encoded). Replace with your own secure key.
    @Value("${jwt.secret}")
    private String secret;

    private static final long TOKEN_VALIDITY = 1000 * 60 * 15;
    private static final long REFRESH_TOKEN_VALIDITY = 1000L * 60 * 60 * 24 * 7;

    private Key getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        SecretKey key = Keys.hmacShaKeyFor(keyBytes);
        return key;
    }

    /**
     * Extracts a claim using a claims resolver function.
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Extracts username (subject) from JWT.
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Extracts expiration date from JWT.
     */
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * Parses claims from the token.
     */
    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    /**
     * Checks if the token has expired.
     */
    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    /**
     * Generates a new JWT for the given subject (e.g. username).
     */
    public String generateToken(String subject) {
        return generateToken(new HashMap<>(), subject, TOKEN_VALIDITY);
    }

    /**
     * Generates a refresh token with extended validity.
     */
    public String generateRefreshToken(String subject) {
        return generateToken(new HashMap<>(), subject, REFRESH_TOKEN_VALIDITY);
    }

    /**
     * Generates a JWT with custom claims, subject, and expiration.
     */
    public String generateToken(Map<String, Object> extraClaims, String subject, long validity) {
        return Jwts.builder()
                .setClaims(extraClaims)
                .setSubject(subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + validity))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Validates the token for the given user details.
     */
    public boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }

    /**
     * Refreshes an existing token by issuing a new one if not expired.
     */
    public String refreshToken(String token) {
        final Claims claims = extractAllClaims(token);
        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + TOKEN_VALIDITY))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }
}
