package com.suresubmit.repository;

import com.suresubmit.entity.Form;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FormRepository extends JpaRepository<Form, Long> {
    List<Form> findByUserIdOrderByCreatedAtDesc(Long userId);
}