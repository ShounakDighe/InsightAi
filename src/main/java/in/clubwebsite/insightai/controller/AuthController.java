package in.clubwebsite.insightai.controller;

import in.clubwebsite.insightai.dto.ForgotPasswordDto;
import in.clubwebsite.insightai.dto.ResetPasswordDto;
import in.clubwebsite.insightai.entity.ProfileEntity;
import in.clubwebsite.insightai.service.PasswordResetService;
import in.clubwebsite.insightai.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final PasswordResetService resetService;
    private final ProfileRepository profileRepo;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody ForgotPasswordDto dto) {
        resetService.createAndSendResetToken(dto.getEmail());
        return ResponseEntity.ok("If that email exists, a reset link has been sent.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordDto dto) {
        ProfileEntity user = resetService.validatePasswordResetToken(dto.getToken());
        user.setPassword(passwordEncoder.encode(dto.getNewPassword()));
        profileRepo.save(user);
        resetService.clearToken(dto.getToken());
        return ResponseEntity.ok("Password has been reset successfully.");
    }
}
