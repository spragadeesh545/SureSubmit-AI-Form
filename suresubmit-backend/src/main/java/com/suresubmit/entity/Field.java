package com.suresubmit.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "fields")
public class Field {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "form_id", nullable = false)
    @JsonIgnore
    private Form form;

    @Column(nullable = false)
    private String label;

    @Column(name = "input_type", nullable = false)
    private String inputType;

    @Column(name = "is_required")
    private Boolean isRequired = false;

    // Conditional visibility: show this field only when another field matches a condition
    @Column(name = "visible_when_field_id")
    private Long visibleWhenFieldId;

    @Column(name = "visible_when_operator")
    private String visibleWhenOperator;

    @Column(name = "visible_when_value")
    private String visibleWhenValue;

    @ElementCollection
    @CollectionTable(name = "field_options", joinColumns = @JoinColumn(name = "field_id"))
    @Column(name = "option_value")
    private List<String> options = new ArrayList<>();

    public Field() {}

    public Field(String label, String inputType, Boolean isRequired) {
        this.label = label;
        this.inputType = inputType;
        this.isRequired = isRequired;
    }

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
    public List<String> getOptions() { return options; }
    public void setOptions(List<String> options) { this.options = options; }
    public Long getVisibleWhenFieldId() { return visibleWhenFieldId; }
    public void setVisibleWhenFieldId(Long visibleWhenFieldId) { this.visibleWhenFieldId = visibleWhenFieldId; }
    public String getVisibleWhenOperator() { return visibleWhenOperator; }
    public void setVisibleWhenOperator(String visibleWhenOperator) { this.visibleWhenOperator = visibleWhenOperator; }
    public String getVisibleWhenValue() { return visibleWhenValue; }
    public void setVisibleWhenValue(String visibleWhenValue) { this.visibleWhenValue = visibleWhenValue; }
}