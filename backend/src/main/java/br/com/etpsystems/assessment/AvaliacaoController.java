package br.com.etpsystems.assessment;

import java.util.List;
import java.util.UUID;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/colaborador")
public class AvaliacaoController {
    private final AvaliacaoService service;

    public AvaliacaoController(AvaliacaoService service) { this.service = service; }

    @GetMapping("/cursos/{cursoId}/aulas")
    @Operation(summary = "Consultar aulas de um curso inscrito", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<List<AulaResponse>> aulas(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID cursoId) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore())
                .body(service.aulas(UUID.fromString(jwt.getSubject()), cursoId));
    }

    @GetMapping("/avaliacoes")
    @Operation(summary = "Consultar avaliações dos cursos inscritos", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<List<AvaliacaoResponse>> listar(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore())
                .body(service.listar(UUID.fromString(jwt.getSubject())));
    }

    @PostMapping("/avaliacoes/{id}/tentativas")
    @Operation(summary = "Enviar respostas e registrar nota", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<AvaliacaoResponse> enviar(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id,
            @Valid @RequestBody EnviarTentativaRequest request) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore())
                .body(service.enviar(UUID.fromString(jwt.getSubject()), id, request));
    }
}
