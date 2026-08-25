package com.pulse.metrics.controller;

import com.pulse.metrics.dto.DashboardMetricsResponse;
import com.pulse.metrics.entity.ApiUsageLog;
import com.pulse.metrics.entity.PlanType;
import com.pulse.metrics.entity.Subscription;
import com.pulse.metrics.repository.ApiUsageLogRepository;
import com.pulse.metrics.repository.SubscriptionRepository;
import com.pulse.metrics.security.JwtService;
import com.pulse.metrics.service.RateLimiterService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/metrics")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:5173", "https://pulse-metrics-saas.vercel.app",
                "https://*.vercel.app" }, allowedHeaders = "*")
public class MetricsController {

        private final SubscriptionRepository subscriptionRepository;
        private final ApiUsageLogRepository apiUsageLogRepository;
        private final RateLimiterService rateLimiterService;
        private final JwtService jwtService;

        private Long getOrgIdFromRequest(HttpServletRequest request) {
                String authHeader = request.getHeader("Authorization");
                if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                        throw new RuntimeException("Missing or invalid Authorization header");
                }
                String token = authHeader.substring(7);
                Object orgIdClaim = jwtService.extractClaim(token, claims -> claims.get("orgId"));
                if (orgIdClaim instanceof Number) {
                        return ((Number) orgIdClaim).longValue();
                }
                return Long.parseLong(orgIdClaim.toString());
        }

        @GetMapping("/dashboard")
        public ResponseEntity<DashboardMetricsResponse> getDashboardMetrics(HttpServletRequest request) {
                Long orgId = getOrgIdFromRequest(request);

                Subscription sub = subscriptionRepository.findByOrganizationId(orgId)
                                .orElseGet(() -> Subscription.builder()
                                                .planType(PlanType.FREE)
                                                .monthlyQuota(PlanType.FREE.getMonthlyLimit())
                                                .currentPeriodEnd(LocalDateTime.now().plusDays(30))
                                                .build());

                long currentUsage = rateLimiterService.getCurrentUsage(orgId);
                double usagePercentage = ((double) currentUsage / sub.getMonthlyQuota()) * 100.0;

                List<ApiUsageLog> logs = apiUsageLogRepository.findTop50ByOrganizationIdOrderByCreatedAtDesc(orgId);
                List<DashboardMetricsResponse.LogDto> logDtos = logs.stream()
                                .map(log -> DashboardMetricsResponse.LogDto.builder()
                                                .endpoint(log.getEndpoint())
                                                .statusCode(log.getStatusCode())
                                                .responseTimeMs(log.getResponseTimeMs())
                                                .timestamp(log.getCreatedAt())
                                                .build())
                                .collect(Collectors.toList());

                DashboardMetricsResponse response = DashboardMetricsResponse.builder()
                                .planName(sub.getPlanType() != null ? sub.getPlanType().name() : "FREE")
                                .monthlyQuota(sub.getMonthlyQuota())
                                .usedQuota(currentUsage)
                                .quotaUsagePercentage(Math.round(usagePercentage * 100.0) / 100.0)
                                .renewalDate(sub.getCurrentPeriodEnd())
                                .recentLogs(logDtos)
                                .build();

                return ResponseEntity.ok(response);
        }

        @PostMapping("/ping")
        public ResponseEntity<String> pingService(HttpServletRequest request) {
                long startTime = System.currentTimeMillis();
                Long orgId = getOrgIdFromRequest(request);

                boolean allowed = rateLimiterService.isAllowed(orgId);
                long responseTime = System.currentTimeMillis() - startTime;

                Subscription sub = subscriptionRepository.findByOrganizationId(orgId).orElse(null);

                if (sub != null && sub.getOrganization() != null) {
                        apiUsageLogRepository.save(ApiUsageLog.builder()
                                        .organization(sub.getOrganization())
                                        .endpoint("/api/v1/metrics/ping")
                                        .statusCode(allowed ? 200 : 429)
                                        .responseTimeMs(responseTime)
                                        .build());
                }

                if (!allowed) {
                        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                                        .body("Monthly API Quota Exceeded for your organization. Please upgrade your plan.");
                }

                return ResponseEntity.ok("Ping successful! Tracked with Redis.");
        }
}