package br.com.etpsystems.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PerfilRequest(
        @NotBlank @Size(max = 150) String name,
        @Size(max = 40) String phone,
        @Size(max = 120) String location,
        @Size(max = 120) String position,
        @Size(max = 120) String learningFocus,
        @Size(max = 30) String experienceLevel,
        boolean notificationsEnabled) {}
