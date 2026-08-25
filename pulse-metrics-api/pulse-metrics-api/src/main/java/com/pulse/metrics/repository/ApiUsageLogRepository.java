package com.pulse.metrics.repository;

import com.pulse.metrics.entity.ApiUsageLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ApiUsageLogRepository extends JpaRepository<ApiUsageLog, Long> {

    @Query("SELECT COUNT(l) FROM ApiUsageLog l WHERE l.organization.id = :orgId AND l.createdAt >= :startDate")
    long countUsageSince(@Param("orgId") Long orgId, @Param("startDate") LocalDateTime startDate);

    List<ApiUsageLog> findTop50ByOrganizationIdOrderByCreatedAtDesc(Long orgId);
}