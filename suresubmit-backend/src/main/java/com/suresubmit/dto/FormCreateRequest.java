package com.suresubmit.dto;

import java.util.List;

public class FormCreateRequest {
    private String title;
    private String status;
    private Long userId;
    private String themeColor;
    private String description;
    private String confirmationMessage;
    private List<FieldDTO> fields;
    private List<CrossFieldRuleDTO> crossFieldRules;

    public FormCreateRequest() {}

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getThemeColor() { return themeColor; }
    public void setThemeColor(String themeColor) { this.themeColor = themeColor; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getConfirmationMessage() { return confirmationMessage; }
    public void setConfirmationMessage(String confirmationMessage) { this.confirmationMessage = confirmationMessage; }
    public List<FieldDTO> getFields() { return fields; }
    public void setFields(List<FieldDTO> fields) { this.fields = fields; }
    public List<CrossFieldRuleDTO> getCrossFieldRules() { return crossFieldRules; }
    public void setCrossFieldRules(List<CrossFieldRuleDTO> crossFieldRules) { this.crossFieldRules = crossFieldRules; }
}
