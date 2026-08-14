package com.suresubmit.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "form_submissions")
public class FormSubmission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "form_id", nullable = false)
    private Form form;

    @Column(name = "payload_json", nullable = false, columnDefinition = "JSON")
    private String payloadJson;

    @Column(name = "submitted_at", insertable = false, updatable = false)
    private LocalDateTime submittedAt;

    public FormSubmission() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Form getForm() { return form; }
    public void setForm(Form form) { this.form = form; }
    public String getPayloadJson() { return payloadJson; }
    public void setPayloadJson(String payloadJson) { this.payloadJson = payloadJson; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
}