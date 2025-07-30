package in.clubwebsite.insightai.service;

import in.clubwebsite.insightai.entity.ProfileEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
@RequiredArgsConstructor
public class DashboardService {
    private final ProfileService profileService;

    public Map<String,Object> getDashboardData(){
        ProfileEntity profile = profileService.getCurrentProfile();
        Map<String, Object> returnValue = new LinkedHashMap<>();
        return returnValue;
    }
}
