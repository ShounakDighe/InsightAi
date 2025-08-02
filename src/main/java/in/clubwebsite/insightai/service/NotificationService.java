package in.clubwebsite.insightai.service;

import in.clubwebsite.insightai.entity.ProfileEntity;
import in.clubwebsite.insightai.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final ProfileRepository profileRepository;
    private final EmailService emailService;

    @Value("${insight.ai.frontend.url}")
    private String frontendUrl;

    // A list of interesting AI facts
    private static final List<String> AI_FACTS = List.of(
            "The term 'Artificial Intelligence' was first coined by John McCarthy in 1956 at the Dartmouth Conference.",
            "An AI named 'Deep Blue' developed by IBM defeated world chess champion Garry Kasparov in 1997.",
            "AI can have its own creativity. In 2018, a portrait created by an AI algorithm was sold for $432,500 at Christie's auction house.",
            "The global AI market is projected to reach $190.61 billion in 2025.",
            "AI can write its own code. A tool called 'Codex' by OpenAI can translate natural language into code in over a dozen programming languages.",
            "AI is used to detect and fight cancer. AI models can analyze medical images to identify cancer signs that human radiologists might miss.",
            "Self-driving cars use a combination of AI, computer vision, and machine learning to navigate roads without human intervention.",
            "AI-powered bots account for over half of all internet traffic.",
            "The first AI-powered chatbot, ELIZA, was created in 1966 at MIT to mimic a psychotherapist.",
            "AI helps in wildlife conservation by using drones and computer vision to track endangered species and identify poachers."
    );

    /**
     * Scheduled job to send a random AI fact to all users.
     * Runs every day at 10:00 AM India Standard Time.
     */
    @Scheduled(cron = "0 0 10 * * *", zone = "Asia/Kolkata")
    public void sendAiFactNotification() {
        log.info("Job started: sendAiFactNotification()");
        List<ProfileEntity> profiles = profileRepository.findAll();

        if (profiles.isEmpty()) {
            log.info("No profiles found. Skipping AI fact notifications.");
            return;
        }

        String randomFact = AI_FACTS.get(new Random().nextInt(AI_FACTS.size()));

        for (ProfileEntity profile : profiles) {
            String subject = "💡 Your Daily AI Fact from Insight AI Club!";
            String body = createAiFactEmailBody(profile.getFullname(), randomFact);
            emailService.sendEmail(profile.getEmail(), subject, body);
        }
        log.info("Job completed: Sent AI fact to {} users.", profiles.size());
    }

    /**
     * Creates a styled HTML email body using inline CSS for maximum compatibility.
     * This approach is more robust against spam filters and inconsistent client rendering.
     * @param fullname The full name of the user.
     * @param fact The AI fact to be included.
     * @return A string containing the HTML for the email body.
     */
    private String createAiFactEmailBody(String fullname, String fact) {
        return "<!DOCTYPE html>"
                + "<html>"
                + "<head>"
                + "<meta charset='UTF-8'>"
                + "<meta name='viewport' content='width=device-width, initial-scale=1.0'>"
                + "<title>Your Daily AI Fact!</title>"
                + "</head>"
                + "<body style='margin: 0; padding: 0; background-color: #f8fafc; font-family: Arial, sans-serif;'>"
                + "<table border='0' cellpadding='0' cellspacing='0' width='100%'>"
                + "<tr>"
                + "<td style='padding: 20px 0;'>"
                + "<table align='center' border='0' cellpadding='0' cellspacing='0' width='600' style='border-collapse: collapse; background-color: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0;'>"
                // Header
                + "<tr>"
                + "<td align='center' style='padding: 30px 0; background-color: #4f46e5; border-top-left-radius: 8px; border-top-right-radius: 8px;'>"
                + "<h1 style='color: #ffffff; font-size: 24px; margin: 0;'>Your Daily AI Fact!</h1>"
                + "</td>"
                + "</tr>"
                // Content
                + "<tr>"
                + "<td style='padding: 30px 25px; color: #334155;'>"
                + "<p style='margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;'>Hi " + fullname + ",</p>"
                + "<p style='margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;'>Here's a fascinating fact to spark your curiosity:</p>"
                // Fact Box
                + "<table border='0' cellpadding='0' cellspacing='0' width='100%' style='background-color: #f1f5f9; border-left: 4px solid #8b5cf6; margin: 15px 0;'>"
                + "<tr>"
                + "<td style='padding: 20px;'>"
                + "<p style='margin: 0; font-style: italic; font-size: 16px; color: #475569; line-height: 1.6;'>\"" + fact + "\"</p>"
                + "</td>"
                + "</tr>"
                + "</table>"
                + "<p style='margin: 20px 0 0 0; font-size: 16px; line-height: 1.6;'>Best regards,<br><b>The Insight AI Team</b></p>"
                + "</td>"
                + "</tr>"
                // Footer
                + "<tr>"
                + "<td align='center' style='padding: 25px; background-color: #f8fafc; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px; color: #64748b; font-size: 12px;'>"
                + "<p style='margin: 0;'>&copy; " + java.time.Year.now().getValue() + " Insight AI Club</p>"
                + "<p style='margin: 10px 0 0 0;'><a href='" + frontendUrl + "' style='color: #6366f1; text-decoration: none;'>Visit our website</a></p>"
                + "</td>"
                + "</tr>"
                + "</table>"
                + "</td>"
                + "</tr>"
                + "</table>"
                + "</body>"
                + "</html>";
    }
}
