package com.suresubmit.dto;

public class CrossFieldRuleDTO {
    private String primaryFieldLabel;
    private String operator;
    private String secondaryFieldLabel;
    private String staticValue;
    private String errorMessage;
    private String description;
    private Boolean isApproved;

    public CrossFieldRuleDTO() {}

    public String getPrimaryFieldLabel() { return primaryFieldLabel; }
    public void setPrimaryFieldLabel(String primaryFieldLabel) { this.primaryFieldLabel = primaryFieldLabel; }
    public String getOperator() { return operator; }
    public void setOperator(String operator) { this.operator = operator; }
    public String getSecondaryFieldLabel() { return secondaryFieldLabel; }
    public void setSecondaryFieldLabel(String secondaryFieldLabel) { this.secondaryFieldLabel = secondaryFieldLabel; }
    public String getStaticValue() { return staticValue; }
    public void setStaticValue(String staticValue) { this.staticValue = staticValue; }
    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Boolean getIsApproved() { return isApproved; }
    public void setIsApproved(Boolean isApproved) { this.isApproved = isApproved; }
}
