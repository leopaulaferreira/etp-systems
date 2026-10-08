package br.com.etpsystems.auth;

import java.nio.charset.StandardCharsets;
import java.util.UUID;

import br.com.etpsystems.security.JwtService;
import br.com.etpsystems.user.Perfil;
import br.com.etpsystems.user.Usuario;
import br.com.etpsystems.user.UsuarioRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class AuthService {

    private final UsuarioRepository usuarios;
    private final PasswordEncoder passwords;
    private final JwtService tokens;
    private final String dummyHash;

    public AuthService(UsuarioRepository usuarios, PasswordEncoder passwords, JwtService tokens) {
        this.usuarios = usuarios;
        this.passwords = passwords;
        this.tokens = tokens;
        this.dummyHash = passwords.encode(UUID.randomUUID().toString());
    }

    public LoginResponse login(LoginRequest request) {
        // BCrypt considera no máximo 72 bytes, inclusive para caracteres multibyte.
        if (request.senha().getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new BadCredentialsException("Credenciais inválidas");
        }
        Usuario usuario = usuarios.findByEmailIgnoreCase(request.email().trim()).orElse(null);
        boolean matches = passwords.matches(request.senha(), usuario == null ? dummyHash : usuario.getSenhaHash());
        if (!matches || usuario == null || !hasValidAccount(usuario)) {
            throw new BadCredentialsException("Credenciais inválidas");
        }
        return new LoginResponse(tokens.issue(usuario), "Bearer", tokens.expiresInSeconds(), UsuarioResponse.from(usuario));
    }

    public UsuarioResponse me(UUID id, String perfil) {
        Usuario usuario = usuarios.findById(id)
                .orElseThrow(() -> new BadCredentialsException("Usuário indisponível"));
        if (!hasValidAccount(usuario) || !usuario.getPerfil().name().equals(perfil)) {
            throw new BadCredentialsException("Sessão inválida");
        }
        return UsuarioResponse.from(usuario);
    }

    private boolean hasValidAccount(Usuario usuario) {
        return usuario.getPerfil() != null
                && (usuario.getPerfil() != Perfil.EMPRESA || usuario.getEmpresa() != null);
    }
}
