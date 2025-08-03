package in.clubwebsite.insightai.security;

import in.clubwebsite.insightai.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JWTRequestFilter extends OncePerRequestFilter {

    private final UserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        // match exactly what SecurityConfig permits:
        return path.startsWith("/register")
                || path.startsWith("/login")
                || path.startsWith("/refresh")
                || path.startsWith("/activate")
                || path.startsWith("/status")
                || path.startsWith("/health")
                || path.startsWith("/auth/forgot-password")
                || path.startsWith("/auth/reset-password");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res,
                                    FilterChain chain) throws ServletException, IOException {

        String authHeader = req.getHeader("Authorization");
        String email = null, jwt = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            jwt = authHeader.substring(7);
            try { email = jwtUtil.extractUsername(jwt); }
            catch (Exception ignored) {}
        }

        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails user = userDetailsService.loadUserByUsername(email);
            if (jwtUtil.validateToken(jwt, user)) {
                UsernamePasswordAuthenticationToken token =
                        new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
                token.setDetails(new WebAuthenticationDetailsSource().buildDetails(req));
                SecurityContextHolder.getContext().setAuthentication(token);
            }
        }

        chain.doFilter(req, res);
    }
}
