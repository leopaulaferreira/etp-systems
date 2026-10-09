package br.com.etpsystems.certificate;

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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/colaborador/certificados")
public class CertificadoController {
    private final CertificadoService service;

    public CertificadoController(CertificadoService service) { this.service = service; }

    @GetMapping
    @Operation(summary = "Listar meus certificados", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<List<CertificadoResponse>> listar(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore())
                .body(service.listar(UUID.fromString(jwt.getSubject())));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Consultar um certificado próprio", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<CertificadoResponse> consultar(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore())
                .body(service.consultar(UUID.fromString(jwt.getSubject()), id));
    }
}
