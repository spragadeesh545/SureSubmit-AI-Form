package com.suresubmit.dto;

import java.util.List;

public class FieldDTO {
    private String label;
    private String inputType;
    private Boolean isRequired;
    private List<String> options;

    public FieldDTO() {}

    public FieldDTO(String label, String inputType, Boolean isRequired) {
        this.label = label;
        this.inputType = inputType;
        this.isRequired = isRequired;
    }

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }
    public String getInputType() { return inputType; }
    public void setInputType(String inputType) { this.inputType = inputType; }
    public Boolean getIsRequired() { return isRequired; }
    public void setIsRequired(Boolean isRequired) { this.isRequired = isRequired; }
    public List<String> getOptions() { return options; }
    public void setOptions(List<String> options) { this.options = options; }
}
