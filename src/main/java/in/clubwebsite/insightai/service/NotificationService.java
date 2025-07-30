package in.clubwebsite.insightai.service;

import in.clubwebsite.insightai.entity.ProfileEntity;
import in.clubwebsite.insightai.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final ProfileRepository profileRepository;
    private final EmailService emailService;

    @Value("${insight.ai.frontend.url}")
    private String frontendUrl;

    @Scheduled(cron = "0 0 10 * * *", zone = "Asia/Kolkata")
    public void sendDailyReminder(){
        log.info("Job started : sendDailyReminder()");
        List<ProfileEntity> profiles = profileRepository.findAll();
        for(ProfileEntity profile:profiles){
            String body = "Hi " + profile.getFullname() + ",<br><br>"
                    + "Brain-Mind : Todays Question is <br><br>"
                    + "<a href="+frontendUrl+" style='display:inline-block;padding:10px 20px;background-color:#4CAF50;color:#fff;text-decoration:none;border-radius:5px;font-weight:bold;'>Go to Problem</a>"
                    + "<br><br>Best regards,<br>Insight AI Team";
            emailService.sendEmail(profile.getEmail(),"Daily reminder : Insight AI Club Brain-Mind Problem ",body);
        }
        log.info("Job completed : sendDailyReminder()");
    }
}
