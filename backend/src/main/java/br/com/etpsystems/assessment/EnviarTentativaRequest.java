package br.com.etpsystems.assessment;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public record EnviarTentativaRequest(@NotEmpty List<@Valid RespostaRequest> respostas) {
    public record RespostaRequest(@NotNull UUID questaoId, @NotNull UUID alternativaId) {}
}
