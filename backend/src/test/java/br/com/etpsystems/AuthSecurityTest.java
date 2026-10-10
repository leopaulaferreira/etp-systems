package br.com.etpsystems;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import br.com.etpsystems.company.Empresa;
import br.com.etpsystems.course.CursoService;
import br.com.etpsystems.assessment.AvaliacaoService;
import br.com.etpsystems.certificate.CertificadoService;
import br.com.etpsystems.dashboard.DashboardService;
import br.com.etpsystems.company.CompanyOverviewService;
import br.com.etpsystems.track.TrilhaService;
import br.com.etpsystems.user.Perfil;
import br.com.etpsystems.user.Usuario;
import br.com.etpsystems.user.UsuarioRepository;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import br.com.etpsystems.enrollment.InscricaoService;
import br.com.etpsystems.progress.ProgressoService;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
        "spring.autoconfigure.exclude=org.springframework.boot.jdbc.autoconfigure.DataSourceAutoConfiguration",
        "etp.demo.enabled=false",
        "DB_PASSWORD=test"
})
@Import(AuthSecurityTest.ProtectedRoutes.class)
class AuthSecurityTest {

    private static final HttpClient CLIENT = HttpClient.newHttpClient();
    private static final JsonMapper JSON = JsonMapper.builder().build();
    private static final String PASSWORD = "test-password";
    private static final UUID USER_ID = UUID.randomUUID();
    private static final UUID RH_ID = UUID.randomUUID();
    private static final UUID COMPANY_ID = UUID.randomUUID();

    @LocalServerPort
    private int port;
    @Autowired
    private PasswordEncoder passwords;
    @Autowired
    private JwtEncoder encoder;
    @MockitoBean
    private UsuarioRepository usuarios;
    @MockitoBean
    private CursoService cursos;

    @MockitoBean
    private InscricaoService inscricoes;

    @MockitoBean
    private ProgressoService progressos;

    @MockitoBean
    private AvaliacaoService avaliacoes;

    @MockitoBean
    private CertificadoService certificados;

    @MockitoBean
    private DashboardService dashboard;

    @MockitoBean
    private CompanyOverviewService companyOverview;

    @MockitoBean
    private TrilhaService trilhaService;

    @BeforeEach
    void accounts() {
        Empresa empresa = new Empresa("Empresa de teste", null);
        ReflectionTestUtils.setField(empresa, "id", COMPANY_ID);
        String hash = passwords.encode(PASSWORD);
        Usuario colaborador = new Usuario("Colaborador", "user@example.test", hash, Perfil.COLABORADOR, empresa);
        Usuario rh = new Usuario("RH", "rh@example.test", hash, Perfil.EMPRESA, empresa);
        ReflectionTestUtils.setField(colaborador, "id", USER_ID);
        ReflectionTestUtils.setField(rh, "id", RH_ID);
        when(usuarios.findByEmailIgnoreCase(anyString())).thenAnswer(invocation -> {
            String email = invocation.getArgument(0);
            return email.equalsIgnoreCase(colaborador.getEmail()) ? Optional.of(colaborador)
                    : email.equalsIgnoreCase(rh.getEmail()) ? Optional.of(rh) : Optional.empty();
        });
        when(usuarios.findById(USER_ID)).thenReturn(Optional.of(colaborador));
        when(usuarios.findById(RH_ID)).thenReturn(Optional.of(rh));
    }

    @AfterAll
    static void closeClient() {
        CLIENT.close();
    }

    @Test
    void loginReturnsTokenAndSafeAccountData() throws Exception {
        HttpResponse<String> response = login(" USER@EXAMPLE.TEST ", PASSWORD);
        assertThat(response.statusCode()).isEqualTo(200);
        JsonNode body = JSON.readTree(response.body());
        assertThat(body.path("tokenType").asText()).isEqualTo("Bearer");
        assertThat(body.path("expiresIn").asLong()).isEqualTo(3600);
        assertThat(body.path("usuario").path("perfil").asText()).isEqualTo("COLABORADOR");
        assertThat(body.path("usuario").path("empresaId").asText()).isEqualTo(COMPANY_ID.toString());
        assertThat(response.body()).doesNotContain("senha", "hash", PASSWORD);
        assertThat(response.headers().firstValue("Cache-Control").orElse("")).contains("no-store");
        HttpResponse<String> me = get("/api/auth/me", body.path("accessToken").asText());
        assertThat(me.statusCode()).isEqualTo(200);
        assertThat(JSON.readTree(me.body()).path("id").asText()).isEqualTo(USER_ID.toString());
        assertThat(response.headers().allValues("Set-Cookie")).isEmpty();
    }

    @Test
    void wrongPasswordAndMissingAccountHaveTheSameError() throws Exception {
        HttpResponse<String> wrongPassword = login("user@example.test", "wrong-password");
        HttpResponse<String> missingUser = login("absent@example.test", PASSWORD);
        assertThat(wrongPassword.statusCode()).isEqualTo(401);
        assertThat(missingUser.statusCode()).isEqualTo(401);
        assertThat(wrongPassword.body()).isEqualTo(missingUser.body());
        assertThat(wrongPassword.body()).doesNotContain("wrong-password", "user@example.test", "trace");
    }

    @Test
    void validatesInputAndRejectsMalformedJson() throws Exception {
        assertThat(login("not-an-email", PASSWORD).statusCode()).isEqualTo(400);
        assertThat(login("user@example.test", "").statusCode()).isEqualTo(400);
        assertThat(login("user@example.test", "a".repeat(73)).statusCode()).isEqualTo(400);
        assertThat(login("user@example.test", "á".repeat(40)).statusCode()).isEqualTo(401);
        assertThat(post("/api/auth/login", "{").statusCode()).isEqualTo(400);
    }

    @Test
    void requestCannotChooseOrEscalateItsRole() throws Exception {
        HttpResponse<String> response = post("/api/auth/login", JSON.writeValueAsString(Map.of(
                "email", "user@example.test", "senha", PASSWORD, "perfil", "EMPRESA")));
        assertThat(response.statusCode()).isEqualTo(200);
        assertThat(JSON.readTree(response.body()).path("usuario").path("perfil").asText()).isEqualTo("COLABORADOR");
    }

    @Test
    void validatesBothRolesAndDeniesUnconfiguredRoutes() throws Exception {
        String colaborador = token("user@example.test");
        String empresa = token("rh@example.test");
        assertThat(get("/api/empresa/security-test", colaborador).statusCode()).isEqualTo(403);
        assertThat(get("/api/empresa/security-test", empresa).statusCode()).isEqualTo(200);
        assertThat(get("/api/colaborador/security-test", colaborador).statusCode()).isEqualTo(200);
        assertThat(get("/api/colaborador/security-test", empresa).statusCode()).isEqualTo(403);
        assertThat(get("/api/auth/me", empresa).statusCode()).isEqualTo(200);
        assertThat(get("/api/unconfigured", empresa).statusCode()).isEqualTo(403);
    }

    @Test
    void rejectsMissingMalformedAndTamperedTokens() throws Exception {
        assertThat(get("/api/auth/me", null).statusCode()).isEqualTo(401);
        assertThat(get("/api/auth/me", "invalid-token").statusCode()).isEqualTo(401);
        String token = token("user@example.test");
        int start = token.lastIndexOf('.') + 1;
        String tampered = token.substring(0, start) + (token.charAt(start) == 'a' ? 'b' : 'a') + token.substring(start + 1);
        assertThat(get("/api/auth/me", tampered).statusCode()).isEqualTo(401);
    }

    @Test
    void rejectsExpiredTokensAndInvalidClaims() throws Exception {
        Instant now = Instant.now();
        assertThat(get("/api/auth/me", signed(validClaims().issuedAt(now.minusSeconds(300))
                .expiresAt(now.minusSeconds(120)))).statusCode()).isEqualTo(401);
        assertThat(get("/api/auth/me", signed(validClaims().issuer("another-issuer"))).statusCode()).isEqualTo(401);
        assertThat(get("/api/auth/me", signed(validClaims().subject("not-a-uuid"))).statusCode()).isEqualTo(401);
        assertThat(get("/api/auth/me", signed(validClaims().claim("perfil", "ADMIN"))).statusCode()).isEqualTo(401);
        assertThat(get("/api/auth/me", signed(validClaims().claim("perfil", 123))).statusCode()).isEqualTo(401);
        assertThat(get("/api/auth/me", signed(validClaims().notBefore(now.plusSeconds(120)))).statusCode()).isEqualTo(401);
        assertThat(get("/api/auth/me", signed(JwtClaimsSet.builder().issuer("etp-systems")
                .subject(USER_ID.toString()).claim("perfil", "COLABORADOR"))).statusCode()).isEqualTo(401);
    }

    @Test
    void meRejectsDeletedUsers() throws Exception {
        String token = token("user@example.test");
        when(usuarios.findById(USER_ID)).thenReturn(Optional.empty());
        assertThat(get("/api/auth/me", token).statusCode()).isEqualTo(401);
    }

    @Test
    void companyAccountRequiresCompanyAssociation() throws Exception {
        Usuario semEmpresa = new Usuario("RH", "rh@example.test", passwords.encode(PASSWORD), Perfil.EMPRESA, null);
        when(usuarios.findByEmailIgnoreCase("rh@example.test")).thenReturn(Optional.of(semEmpresa));
        assertThat(login("rh@example.test", PASSWORD).statusCode()).isEqualTo(401);
    }

    @Test
    void corsAllowsOnlyConfiguredOrigins() throws Exception {
        HttpResponse<String> allowed = preflight("http://localhost:5173");
        assertThat(allowed.statusCode()).isEqualTo(200);
        assertThat(allowed.headers().firstValue("Access-Control-Allow-Origin")).contains("http://localhost:5173");
        HttpResponse<String> blocked = preflight("https://unknown.example");
        assertThat(blocked.statusCode()).isEqualTo(403);
        assertThat(blocked.headers().firstValue("Access-Control-Allow-Origin")).isEmpty();
    }

    private HttpResponse<String> preflight(String origin) throws Exception {
        return CLIENT.send(HttpRequest.newBuilder(uri("/api/auth/login"))
                .header("Origin", origin).header("Access-Control-Request-Method", "POST")
                .header("Access-Control-Request-Headers", "Content-Type")
                .method("OPTIONS", HttpRequest.BodyPublishers.noBody()).build(), HttpResponse.BodyHandlers.ofString());
    }

    private JwtClaimsSet.Builder validClaims() {
        return JwtClaimsSet.builder().issuer("etp-systems").subject(USER_ID.toString())
                .issuedAt(Instant.now()).expiresAt(Instant.now().plusSeconds(300)).claim("perfil", "COLABORADOR");
    }

    private String signed(JwtClaimsSet.Builder claims) {
        return encoder.encode(JwtEncoderParameters.from(JwsHeader.with(MacAlgorithm.HS256).build(), claims.build())).getTokenValue();
    }

    private String token(String email) throws Exception {
        HttpResponse<String> response = login(email, PASSWORD);
        assertThat(response.statusCode()).isEqualTo(200);
        return JSON.readTree(response.body()).path("accessToken").asText();
    }

    private HttpResponse<String> login(String email, String senha) throws Exception {
        return post("/api/auth/login", JSON.writeValueAsString(Map.of("email", email, "senha", senha)));
    }

    private HttpResponse<String> post(String path, String body) throws Exception {
        return CLIENT.send(HttpRequest.newBuilder(uri(path)).header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body)).build(), HttpResponse.BodyHandlers.ofString());
    }

    private HttpResponse<String> get(String path, String token) throws Exception {
        HttpRequest.Builder request = HttpRequest.newBuilder(uri(path));
        if (token != null) request.header("Authorization", "Bearer " + token);
        return CLIENT.send(request.GET().build(), HttpResponse.BodyHandlers.ofString());
    }

    private URI uri(String path) {
        return URI.create("http://localhost:" + port + path);
    }

    // Rotas somente de teste: exercitam as regras sem criar funcionalidades de negócio.
    @TestConfiguration(proxyBeanMethods = false)
    static class ProtectedRoutes {
        @Bean
        RoleProbeController roleProbeController() {
            return new RoleProbeController();
        }
    }

    @RestController
    static class RoleProbeController {
        @GetMapping({"/api/empresa/security-test", "/api/colaborador/security-test"})
        Map<String, String> allowed() {
            return Map.of("status", "ok");
        }
    }
}
