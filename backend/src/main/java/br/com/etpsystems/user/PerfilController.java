package br.com.etpsystems.user;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/colaborador/perfil")
public class PerfilController {
    private final UsuarioRepository usuarios;

    public PerfilController(UsuarioRepository usuarios) { this.usuarios = usuarios; }

    @GetMapping
    @Transactional(readOnly = true)
    @Operation(summary = "Consultar perfil do colaborador", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<PerfilResponse> consultar(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(PerfilResponse.from(colaborador(jwt)));
    }

    @PutMapping
    @Transactional
    @Operation(summary = "Atualizar perfil do colaborador", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<PerfilResponse> atualizar(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody PerfilRequest request) {
        Usuario user = colaborador(jwt);
        user.atualizarPerfil(request.name().trim(), clean(request.phone()), clean(request.location()),
                clean(request.position()), clean(request.learningFocus()), clean(request.experienceLevel()),
                request.notificationsEnabled());
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(PerfilResponse.from(user));
    }

    private Usuario colaborador(Jwt jwt) {
        Usuario user = usuarios.findById(UUID.fromString(jwt.getSubject()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário indisponível"));
        if (user.getPerfil() != Perfil.COLABORADOR || !user.isLoginHabilitado()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso permitido apenas a colaboradores");
        }
        return user;
    }

    private String clean(String value) { return value == null ? null : value.trim(); }
}
