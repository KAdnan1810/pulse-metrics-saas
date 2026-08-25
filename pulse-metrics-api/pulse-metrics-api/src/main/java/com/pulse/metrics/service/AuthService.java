package com.pulse.metrics.service;

import com.pulse.metrics.dto.AuthResponse;
import com.pulse.metrics.dto.LoginRequest;
import com.pulse.metrics.dto.RegisterRequest;
import com.pulse.metrics.entity.*;
import com.pulse.metrics.repository.OrganizationRepository;
import com.pulse.metrics.repository.SubscriptionRepository;
import com.pulse.metrics.repository.UserRepository;
import com.pulse.metrics.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final SubscriptionRepository subscriptionRepository;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        String slug = request.getOrganizationName().toLowerCase().replaceAll("[^a-z0-9]", "-");
        if (organizationRepository.existsBySlug(slug)) {
            slug = slug + "-" + System.currentTimeMillis() % 10000;
        }

        Organization org = Organization.builder()
                .name(request.getOrganizationName())
                .slug(slug)
                .build();
        org = organizationRepository.save(org);

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.ROLE_ORG_OWNER)
                .organization(org)
                .isActive(true)
                .build();
        user = userRepository.save(user);

        // Create Default Free Subscription
        Subscription subscription = Subscription.builder()
                .organization(org)
                .planType(PlanType.FREE)
                .monthlyQuota(PlanType.FREE.getMonthlyLimit())
                .status("ACTIVE")
                .currentPeriodEnd(java.time.LocalDateTime.now().plusMonths(1))
                .build();
        subscriptionRepository.save(subscription);

        String jwtToken = jwtService.generateToken(user, org.getId(), user.getRole().name());

        return AuthResponse.builder()
                .token(jwtToken)
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .organizationId(org.getId())
                .organizationName(org.getName())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String jwtToken = jwtService.generateToken(user, user.getOrganization().getId(), user.getRole().name());

        return AuthResponse.builder()
                .token(jwtToken)
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .organizationId(user.getOrganization().getId())
                .organizationName(user.getOrganization().getName())
                .build();
    }
}