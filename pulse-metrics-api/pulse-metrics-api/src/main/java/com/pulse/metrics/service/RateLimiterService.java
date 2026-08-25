package com.pulse.metrics.service;

import com.pulse.metrics.entity.PlanType;
import com.pulse.metrics.entity.Subscription;
import com.pulse.metrics.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class RateLimiterService {

    private final StringRedisTemplate redisTemplate;
    private final SubscriptionRepository subscriptionRepository;

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

            return currentUsage != null && currentUsage <= sub.getMonthlyQuota();
        } catch (Exception e) {
            log.error("Redis connection error, falling back to permissive mode: {}", e.getMessage());
            return true;
        }
    }

    public long getCurrentUsage(Long orgId) {
        try {
            String currentMonthKey = "usage:" + orgId + ":"
                    + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));
            String value = redisTemplate.opsForValue().get(currentMonthKey);
            return value != null ? Long.parseLong(value) : 0L;
        } catch (Exception e) {
            log.error("Redis read error: {}", e.getMessage());
            return 0L;
        }
    }
}