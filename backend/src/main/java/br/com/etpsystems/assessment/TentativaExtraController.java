package br.com.etpsystems.assessment;

import java.util.UUID;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/empresa/colaboradores/{usuarioId}/cursos/{cursoId}/tentativas")
public class TentativaExtraController {
    public record Pedido(@NotBlank @Size(max = 500) String reason) {}
    private final TentativaExtraService service;
    public TentativaExtraController(TentativaExtraService service) { this.service = service; }
    @GetMapping
    public ResponseEntity<TentativaExtraService.Resumo> consultar(@AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID usuarioId, @PathVariable UUID cursoId) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore())
                .body(service.consultar(UUID.fromString(jwt.getSubject()), usuarioId, cursoId));
    }
    @PostMapping
    public ResponseEntity<TentativaExtraService.Resumo> liberar(@AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID usuarioId, @PathVariable UUID cursoId, @Valid @RequestBody Pedido pedido) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore())
                .body(service.liberar(UUID.fromString(jwt.getSubject()), usuarioId, cursoId, pedido.reason()));
    }
}
