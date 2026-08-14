package com.suresubmit.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "cross_field_rules")
public class CrossFieldRule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "form_id", nullable = false)
    private Form form;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "primary_field_id", nullable = false)
    private Field primaryField;

    @Column(nullable = false)
    private String operator;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "secondary_field_id")
    private Field secondaryField;

    @Column(name = "error_message", nullable = false, columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "is_approved")
    private Boolean isApproved = false;

    public CrossFieldRule() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Form getForm() { return form; }
    public void setForm(Form form) { this.form = form; }
    public Field getPrimaryField() { return primaryField; }
    public void setPrimaryField(Field primaryField) { this.primaryField = primaryField; }
    public String getOperator() { return operator; }
    public void setOperator(String operator) { this.operator = operator; }
    public Field getSecondaryField() { return secondaryField; }
    public void setSecondaryField(Field secondaryField) { this.secondaryField = secondaryField; }
    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
    public Boolean getIsApproved() { return isApproved; }
    public void setIsApproved(Boolean isApproved) { this.isApproved = isApproved; }
}