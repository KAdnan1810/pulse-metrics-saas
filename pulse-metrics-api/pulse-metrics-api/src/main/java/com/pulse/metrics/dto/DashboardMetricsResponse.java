package com.pulse.metrics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DashboardMetricsResponse {
    private String planName;
    private int monthlyQuota;
    private long usedQuota;
    private double quotaUsagePercentage;
    private LocalDateTime renewalDate;
    private List<LogDto> recentLogs;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class LogDto {
        private String endpoint;
        private int statusCode;
        private long responseTimeMs;
        private LocalDateTime timestamp;
    }
}