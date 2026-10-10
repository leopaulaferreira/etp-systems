package br.com.etpsystems.company;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record CompanyOverviewResponse(UUID companyId, String companyName, List<Employee> employees) {
    public record Employee(UUID id, UUID companyId, String name, String email,
            String department, List<Course> courses) {}

    public record Course(UUID id, String title, String category, double progress,
            Instant updatedAt, Instant completedAt, Integer score,
            String certificateCode, Instant certificateIssuedAt) {}
}
