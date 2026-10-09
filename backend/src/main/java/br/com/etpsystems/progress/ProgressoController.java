package br.com.etpsystems.progress;

import java.util.UUID;

import br.com.etpsystems.enrollment.MeuCursoResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/colaborador/meus-cursos")
public class ProgressoController {

    private final ProgressoService service;

    public ProgressoController(ProgressoService service) {
        this.service = service;
    }

    @PutMapping("/{cursoId}/progresso")
    @Operation(summary = "Registrar avanço informado pelo colaborador", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<MeuCursoResponse> atualizar(@AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID cursoId, @Valid @RequestBody AtualizarProgressoRequest request) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore())
                .body(service.atualizar(UUID.fromString(jwt.getSubject()), cursoId, request));
    }
}
