package br.com.etpsystems.track;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import java.util.List;
import java.util.UUID;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/colaborador/trilhas")
public class TrilhaController {
    private final TrilhaService service;

    public TrilhaController(TrilhaService service) { this.service = service; }

    @GetMapping
    @Operation(summary = "Listar trilhas com progresso do colaborador", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<List<TrilhaResponse>> listar(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore())
                .body(service.listar(UUID.fromString(jwt.getSubject())));
    }

    @PostMapping("/{trilhaId}/inscricao")
    @Operation(summary = "Inscrever colaborador na trilha e em seus cursos", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<TrilhaResponse> inscrever(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID trilhaId) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore())
                .body(service.inscrever(UUID.fromString(jwt.getSubject()), trilhaId));
    }
}
