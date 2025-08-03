package in.clubwebsite.insightai.service;

import in.clubwebsite.insightai.entity.PasswordResetToken;
import in.clubwebsite.insightai.entity.ProfileEntity;
import in.clubwebsite.insightai.repository.PasswordResetTokenRepository;
import in.clubwebsite.insightai.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PasswordResetService {
    private final PasswordResetTokenRepository tokenRepo;
    private final ProfileRepository profileRepo;
    private final EmailService emailService;

    @Value("${insight.ai.frontend.url}")
    private String frontendUrl;

    public void createAndSendResetToken(String email) {
        ProfileEntity user = profileRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("No account found for email: " + email));

        String token = UUID.randomUUID().toString();
        PasswordResetToken prt = new PasswordResetToken();
        prt.setToken(token);
        prt.setUser(user);
        prt.setExpiryDate(LocalDateTime.now().plusMinutes(30));
        tokenRepo.save(prt);

        String resetLink = frontendUrl + "/reset-password?token=" + token;
        String subject = "Insight AI Club — Reset Your Password";
        String body = "Hi " + user.getFullname() + ",\n\n"
                + "You (or someone else) requested a password reset. Click here to reset:\n"
                + resetLink + "\n\n"
                + "If you didn’t request this, just ignore.\n\n"
                + "— Insight AI Team";
        emailService.sendEmail(user.getEmail(), subject, body);
    }

    public ProfileEntity validatePasswordResetToken(String token) {
        PasswordResetToken prt = tokenRepo.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid token"));

        if (prt.isExpired()) {
            tokenRepo.delete(prt);
            throw new RuntimeException("Token expired");
        }
        return prt.getUser();
    }

    public void clearToken(String token) {
        tokenRepo.findByToken(token).ifPresent(tokenRepo::delete);
    }
}
