package in.clubwebsite.insightai.controller;

import in.clubwebsite.insightai.dto.AuthDto;
import in.clubwebsite.insightai.dto.ProfileDto;
import in.clubwebsite.insightai.entity.ProfileEntity;
import in.clubwebsite.insightai.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @PostMapping("/register")
    public ResponseEntity<ProfileDto> registerProfile(@RequestBody ProfileDto profileDto){
        ProfileDto registeredProfile = profileService.registerProfile(profileDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(registeredProfile);
    }

    @GetMapping("/activate")
    public ResponseEntity<String> activateProfile(@RequestParam String token) {
        boolean isActivated = profileService.activateProfile(token);
        if(isActivated){
            return  ResponseEntity.ok("Profile verified Successfully");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Invalid or expired activation link. Please request a new verification email by joining again.");
        }
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String,Object>> login(@RequestBody AuthDto authDto) {
        try {
            if (!profileService.isAccountActive(authDto.getEmail())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                        "message", "Your email is not verified. Please check your inbox for the verification link"
                ));
            }
            Map<String, Object> response = profileService.authenticateAndGenerateToken(authDto);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "message", e.getMessage()
            ));
        }
    }
        @GetMapping("/profile")
        public ResponseEntity<ProfileDto> getPublicProfile(){
            ProfileDto profileDto = profileService.getPublicProfile(null);
            return ResponseEntity.ok(profileDto);
        }

    @PutMapping("/profile/update")
    public ResponseEntity<Map<String, Object>> updateProfileImage(@RequestBody Map<String, String> payload) {
        String imageUrl = payload.get("profileImageUrl");

        ProfileEntity currentUser = profileService.getCurrentProfile();
        currentUser.setProfileImageUrl(imageUrl);

        ProfileEntity updatedProfile = profileService.saveProfile(currentUser);

        Map<String, Object> response = Map.of(
                "user", profileService.toDto(updatedProfile)
        );

        return ResponseEntity.ok(response);
    }



}
