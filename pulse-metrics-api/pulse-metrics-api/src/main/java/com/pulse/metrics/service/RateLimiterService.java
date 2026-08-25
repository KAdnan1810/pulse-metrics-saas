package com.pulse.metrics.service;

import com.pulse.metrics.entity.PlanType;
import com.pulse.metrics.entity.Subscription;
import com.pulse.metrics.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class RateLimiterService {

    private final StringRedisTemplate redisTemplate;
    private final SubscriptionRepository subscriptionRepository;

    public boolean isAllowed(Long orgId) {
        String currentMonthKey = "usage:" + orgId + ":" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));

        // Get organization quota from DB/Cache
        Subscription sub = subscriptionRepository.findByOrganizationId(orgId)
                .orElseGet(() -> Subscription.builder()
                        .planType(PlanType.FREE)
                        .monthlyQuota(PlanType.FREE.getMonthlyLimit())
                        .build());

        Long currentUsage = redisTemplate.opsForValue().increment(currentMonthKey);

        if (currentUsage != null && currentUsage == 1) {
            redisTemplate.expire(currentMonthKey, Duration.ofDays(32));
        }

        return currentUsage != null && currentUsage <= sub.getMonthlyQuota();
    }

    public long getCurrentUsage(Long orgId) {
        String currentMonthKey = "usage:" + orgId + ":" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));
        String value = redisTemplate.opsForValue().get(currentMonthKey);
        return value != null ? Long.parseLong(value) : 0L;
    }
}