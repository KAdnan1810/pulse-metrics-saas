package com.pulse.metrics.service;

import com.pulse.metrics.entity.PlanType;
import com.pulse.metrics.entity.Subscription;
import com.pulse.metrics.repository.ApiUsageLogRepository;
import com.pulse.metrics.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class RateLimiterService {

    private final StringRedisTemplate redisTemplate;
    private final SubscriptionRepository subscriptionRepository;
    private final ApiUsageLogRepository apiUsageLogRepository;

    public boolean isAllowed(Long orgId) {
        Subscription sub = subscriptionRepository.findByOrganizationId(orgId)
                .orElseGet(() -> Subscription.builder()
                        .planType(PlanType.FREE)
                        .monthlyQuota(PlanType.FREE.getMonthlyLimit())
                        .build());

        try {
            String currentMonthKey = "usage:" + orgId + ":"
                    + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));
            Long currentUsage = redisTemplate.opsForValue().increment(currentMonthKey);

            if (currentUsage != null && currentUsage == 1) {
                redisTemplate.expire(currentMonthKey, Duration.ofDays(32));
            }

            if (currentUsage != null) {
                return currentUsage <= sub.getMonthlyQuota();
            }
        } catch (Exception e) {
            log.warn("Redis rate-limiting error, falling back to database check: {}", e.getMessage());
        }

        // Database Fallback Counter
        LocalDateTime startOfMonth = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        long dbUsage = apiUsageLogRepository.countUsageSince(orgId, startOfMonth);
        return dbUsage < sub.getMonthlyQuota();
    }

    public long getCurrentUsage(Long orgId) {
        try {
            String currentMonthKey = "usage:" + orgId + ":"
                    + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));
            String value = redisTemplate.opsForValue().get(currentMonthKey);
            if (value != null) {
                return Long.parseLong(value);
            }
        } catch (Exception e) {
            log.warn("Redis read error, reading directly from database: {}", e.getMessage());
        }

        // Exact DB Count for Current Month
        LocalDateTime startOfMonth = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        return apiUsageLogRepository.countUsageSince(orgId, startOfMonth);
    }
}