package in.clubwebsite.insightai.service;

import in.clubwebsite.insightai.dto.AuthDto;
import in.clubwebsite.insightai.dto.ProfileDto;
import in.clubwebsite.insightai.entity.ProfileEntity;
import in.clubwebsite.insightai.repository.ProfileRepository;
import in.clubwebsite.insightai.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final ProfileRepository profileRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    @Value("${app.activation.url}")
    private String activationUrl;

    public ProfileDto registerProfile(ProfileDto profileDto){
        ProfileEntity newProfile = toEntity(profileDto);
        newProfile.setActivationToken(UUID.randomUUID().toString());
        newProfile = profileRepository.save(newProfile);

        // Send Activation mail with the new styled template
        String activationLink = activationUrl + "/api/v1.0/activate?token=" + newProfile.getActivationToken();
        String subject = "Please Verify Your Email for Insight AI Club";
        String body = createActivationEmailBody(newProfile.getFullname(), activationLink);
        emailService.sendEmail(newProfile.getEmail(), subject, body);
        return toDto(newProfile);
    }

    /**
     * Creates a very simple HTML email body for account activation to maximize deliverability and avoid spam filters.
     * @param fullname The full name of the new user.
     * @param activationLink The unique URL to activate the user's account.
     * @return A string containing the HTML for the email body.
     */
    private String createActivationEmailBody(String fullname, String activationLink) {
        return "<!DOCTYPE html>"
                + "<html>"
                + "<head>"
                + "<title>Welcome to Insight AI Club!</title>"
                + "</head>"
                + "<body style='font-family: Arial, sans-serif; line-height: 1.6;'>"
                + "<h2>Welcome to the Insight AI Club!</h2>"
                + "<p>Hi " + fullname + ",</p>"
                + "<p>Thank you for joining. Please click the link below to activate your account:</p>"
                + "<p><a href='" + activationLink + "'>Activate Your Account</a></p>"
                + "<p>If the link above does not work, please copy and paste this URL into your browser:</p>"
                + "<p>" + activationLink + "</p>"
                + "<br>"
                + "<p>If you did not sign up for an account, you can safely ignore this email.</p>"
                + "<br>"
                + "<p>Best regards,<br><b>The Insight AI Team</b></p>"
                + "</body>"
                + "</html>";
    }


    public ProfileEntity toEntity(ProfileDto profileDto){
        return  ProfileEntity.builder()
                .id(profileDto.getId())
                .fullname(profileDto.getFullname())
                .email(profileDto.getEmail())
                .password(passwordEncoder.encode(profileDto.getPassword()))
                .profileImageUrl(profileDto.getProfileImageUrl())
                .createdAt(profileDto.getCreatedAt())
                .updatedAt(profileDto.getUpdatedAt())
                .build();
    }

    public ProfileDto toDto(ProfileEntity profileDto){
        return  ProfileDto.builder()
                .id(profileDto.getId())
                .fullname(profileDto.getFullname())
                .email(profileDto.getEmail())
                .profileImageUrl(profileDto.getProfileImageUrl())
                .createdAt(profileDto.getCreatedAt())
                .updatedAt(profileDto.getUpdatedAt())
                .build();
    }

    public boolean activateProfile(String activationToken){
        return profileRepository.findByActivationToken(activationToken)
                .map(profile->{
                    profile.setIsActive(true);
                    profileRepository.save(profile);
                    return true;
                })
                .orElse(false);
    }

    public boolean isAccountActive(String email){
        return  profileRepository.findByEmail(email)
                .map(ProfileEntity::getIsActive)
                .orElse(false);
    }

    public ProfileEntity getCurrentProfile(){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return profileRepository.findByEmail(authentication.getName())
                .orElseThrow(()-> new UsernameNotFoundException("Profile not found with email: "+authentication.getName()));
    }

    public  ProfileDto getPublicProfile(String email) {
        ProfileEntity currentUser = null;
        if(email == null) {
            currentUser = getCurrentProfile();
        } else {
            currentUser = profileRepository.findByEmail(email)
                    .orElseThrow(() -> new UsernameNotFoundException("Profile not found with email: " + email));
        }

        return ProfileDto.builder()
                .id(currentUser.getId())
                .fullname(currentUser.getFullname())
                .email(currentUser.getEmail())
                .profileImageUrl(currentUser.getProfileImageUrl())
                .createdAt(currentUser.getCreatedAt())
                .updatedAt(currentUser.getUpdatedAt())
                .build();
    }

    public Map<String, Object> authenticateAndGenerateToken(AuthDto authDto) {
        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(authDto.getEmail(),authDto.getPassword()));
            //Generate JWT token
            String token = jwtUtil.generateToken(authDto.getEmail());
            return Map.of(
                    "token",token,
                    "user",getPublicProfile(authDto.getEmail())
            );
        } catch (Exception e){
            throw  new RuntimeException("Invalid email or password");
        }
    }
}
