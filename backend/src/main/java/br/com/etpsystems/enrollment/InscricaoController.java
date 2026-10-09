package br.com.etpsystems.enrollment;

import java.util.List;
import java.util.UUID;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
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
@RequestMapping("/api/colaborador")
public class InscricaoController {

    private final InscricaoService service;

    public InscricaoController(InscricaoService service) {
        this.service = service;
    }

    @GetMapping("/meus-cursos")
    @Operation(summary = "Listar cursos inscritos pelo colaborador", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<List<MeuCursoResponse>> meusCursos(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore())
                .body(service.meusCursos(UUID.fromString(jwt.getSubject())));
    }

    @PostMapping("/inscricoes/cursos/{cursoId}")
    @Operation(summary = "Inscrever o colaborador em um curso", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<MeuCursoResponse> inscrever(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID cursoId) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore())
                .body(service.inscrever(UUID.fromString(jwt.getSubject()), cursoId));
    }
}
