package com.suresubmit.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "cross_field_rules")
public class CrossFieldRule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "form_id", nullable = false)
    @JsonIgnore
    private Form form;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "primary_field_id", nullable = false)
    private Field primaryField;

    @Column(nullable = false)
    private String operator;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "secondary_field_id")
    private Field secondaryField;

    @Column(name = "static_value")
    private String staticValue;

    @Column(name = "error_message", nullable = false, columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "is_approved")
    private Boolean isApproved = false;

    @Column(name = "description")
    private String description;

    public CrossFieldRule() {}

    public CrossFieldRule(String operator, String staticValue, String errorMessage, String description, Boolean isApproved) {
        this.operator = operator;
        this.staticValue = staticValue;
        this.errorMessage = errorMessage;
        this.description = description;
        this.isApproved = isApproved;
    }

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
    public String getStaticValue() { return staticValue; }
    public void setStaticValue(String staticValue) { this.staticValue = staticValue; }
    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
    public Boolean getIsApproved() { return isApproved; }
    public void setIsApproved(Boolean isApproved) { this.isApproved = isApproved; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}