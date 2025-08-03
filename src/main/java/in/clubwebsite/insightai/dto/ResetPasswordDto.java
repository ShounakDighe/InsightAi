package in.clubwebsite.insightai.dto;

import lombok.Data;

@Data
public class ResetPasswordDto {
    private String token;
    private String newPassword;
}