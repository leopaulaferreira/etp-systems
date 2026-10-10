package br.com.etpsystems.track;

import java.util.List;
import java.util.UUID;

public record TrilhaResponse(UUID id, String title, String description, String category, String level,
        String icon, boolean featured, int courseCount, double durationHours, boolean enrolled,
        int progress, List<Course> courses) {
    public record Course(UUID id, String title) {}
}
