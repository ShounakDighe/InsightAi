package in.clubwebsite.insightai.controller;

import in.clubwebsite.insightai.dto.ProfileDto;
import in.clubwebsite.insightai.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Verification token not found or already used");
        }
    }
}
