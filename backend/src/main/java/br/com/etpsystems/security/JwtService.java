package br.com.etpsystems.security;

import java.time.Instant;

import br.com.etpsystems.user.Usuario;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    private final JwtEncoder encoder;
    private final String issuer;
    private final long expirationMinutes;

    public JwtService(JwtEncoder encoder, @Value("${etp.security.jwt.issuer}") String issuer,
            @Value("${etp.security.jwt.expiration-minutes}") long expirationMinutes) {
        if (expirationMinutes < 1 || expirationMinutes > 1440) {
            throw new IllegalArgumentException("JWT_EXPIRATION_MINUTES deve estar entre 1 e 1440.");
        }
        this.encoder = encoder;
        this.issuer = issuer;
        this.expirationMinutes = expirationMinutes;
    }

    public String issue(Usuario usuario) {
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(issuer).subject(usuario.getId().toString())
                .issuedAt(now).expiresAt(now.plusSeconds(expiresInSeconds()))
                .claim("perfil", usuario.getPerfil().name()).build();
        return encoder.encode(JwtEncoderParameters.from(JwsHeader.with(MacAlgorithm.HS256).build(), claims))
                .getTokenValue();
    }

    public long expiresInSeconds() {
        return expirationMinutes * 60;
    }
}
