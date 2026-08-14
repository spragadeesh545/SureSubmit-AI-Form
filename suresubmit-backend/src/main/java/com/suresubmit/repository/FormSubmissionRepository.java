package com.suresubmit.repository;

import com.suresubmit.entity.FormSubmission;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FormSubmissionRepository extends JpaRepository<FormSubmission, Long> {
}