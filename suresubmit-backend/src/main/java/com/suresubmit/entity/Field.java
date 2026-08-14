package com.suresubmit.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "fields")
public class Field {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "form_id", nullable = false)
    private Form form;

    @Column(nullable = false)
    private String label;

    @Column(name = "input_type", nullable = false)
    private String inputType;

    @Column(name = "is_required")
    private Boolean isRequired = false;

    public Field() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Form getForm() { return form; }
    public void setForm(Form form) { this.form = form; }
    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }
    public String getInputType() { return inputType; }
    public void setInputType(String inputType) { this.inputType = inputType; }
    public Boolean getIsRequired() { return isRequired; }
    public void setIsRequired(Boolean isRequired) { this.isRequired = isRequired; }
}