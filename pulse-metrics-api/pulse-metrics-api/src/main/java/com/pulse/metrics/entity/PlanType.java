package com.pulse.metrics.entity;

public enum PlanType {
    FREE(1000),         // 1,000 API calls per month
    PRO(50000),         // 50,000 API calls per month
    ENTERPRISE(1000000); // 1,000,000 API calls per month

    private final int monthlyLimit;

    PlanType(int monthlyLimit) {
        this.monthlyLimit = monthlyLimit;
    }

    public int getMonthlyLimit() {
        return monthlyLimit;
    }
}