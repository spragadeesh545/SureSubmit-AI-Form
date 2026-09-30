package com.suresubmit.repository;

import com.suresubmit.entity.User;
import com.suresubmit.entity.UserSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserSessionRepository extends JpaRepository<UserSession, Long> {
    Optional<UserSession> findByToken(String token);
    List<UserSession> findByUser(User user);
}