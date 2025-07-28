package in.clubwebsite.insightai.repository;

import in.clubwebsite.insightai.entity.ProfileEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface ProfileRepository extends JpaRepository<ProfileEntity,Long> {

    // SELECT * from tbl_profiles where email = ?
    Optional<ProfileEntity> findByEmail(String email);
}
