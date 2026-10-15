package br.com.etpsystems.progress;

import java.util.UUID;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/colaborador/meus-cursos/{cursoId}/aulas")
public class ProgressoAulaController {
    private final ProgressoAulaService service;

    public ProgressoAulaController(ProgressoAulaService service) { this.service = service; }

    @GetMapping("/progresso")
    public ResponseEntity<ProgressoAulaService.Resumo> consultar(@AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID cursoId) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore())
                .body(service.consultar(UUID.fromString(jwt.getSubject()), cursoId));
    }

    @PutMapping("/{aulaId}/conclusao")
    public ResponseEntity<ProgressoAulaService.Resumo> concluir(@AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID cursoId, @PathVariable UUID aulaId) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore())
                .body(service.concluir(UUID.fromString(jwt.getSubject()), cursoId, aulaId));
    }
}
