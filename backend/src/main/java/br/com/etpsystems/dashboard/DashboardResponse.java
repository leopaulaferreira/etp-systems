package br.com.etpsystems.dashboard;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record DashboardResponse(
        int enrolledCourses, int ongoingCourses, int completedCourses,
        int availableAssessments, int passedAssessments, int certificates,
        double certifiedHours, ContinueCourse continueCourse,
        List<RecommendedCourse> recommendations,
        List<RecentAssessment> recentAssessments,
        List<RecentCertificate> recentCertificates
) {
    public record ContinueCourse(UUID id, String title, String description,
            String icon, double progress, Instant lastActivity) {}
    public record RecommendedCourse(UUID id, String title, String category,
            String level, double durationHours, String icon) {}
    public record RecentAssessment(UUID courseId, String course, int score,
            boolean passed, Instant completedAt) {}
    public record RecentCertificate(UUID id, String title, Instant issuedAt) {}
}
