package br.com.etpsystems;

import static org.assertj.core.api.Assertions.assertThat;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Map;
import java.util.UUID;

import br.com.etpsystems.company.EmpresaRepository;
import br.com.etpsystems.config.DemoAccountsInitializer;
import br.com.etpsystems.user.Perfil;
import br.com.etpsystems.user.Usuario;
import br.com.etpsystems.user.UsuarioRepository;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.DefaultApplicationArguments;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("dev")
@EnabledIfEnvironmentVariable(named = "ETP_DB_TEST", matches = "true")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class AuthDatabaseIntegrationTest {

    private static final String SUFFIX = UUID.randomUUID().toString();
    private static final String USER_EMAIL = "user-" + SUFFIX + "@example.test";
    private static final String RH_EMAIL = "rh-" + SUFFIX + "@example.test";
    private static final String COMPANY_NAME = "Auth integration " + SUFFIX;
    private static final String PASSWORD = "integration-test-only";
    private static final JsonMapper JSON = JsonMapper.builder().build();

    @DynamicPropertySource
    static void demoAccounts(DynamicPropertyRegistry properties) {
        properties.add("etp.demo.enabled", () -> true);
        properties.add("etp.demo.password", () -> PASSWORD);
        properties.add("etp.demo.colaborador-email", () -> USER_EMAIL);
        properties.add("etp.demo.empresa-email", () -> RH_EMAIL);
        properties.add("etp.demo.company-name", () -> COMPANY_NAME);
    }

    @LocalServerPort
    private int port;
    @Autowired
    private UsuarioRepository usuarios;
    @Autowired
    private EmpresaRepository empresas;
    @Autowired
    private PasswordEncoder passwords;
    @Autowired
    private DemoAccountsInitializer initializer;

    @Test
    void provisionsAndAuthenticatesAccountsWithoutResettingThemOnRestart() throws Exception {
        Usuario user = usuarios.findByEmailIgnoreCase(USER_EMAIL).orElseThrow();
        Usuario rh = usuarios.findByEmailIgnoreCase(RH_EMAIL).orElseThrow();
        assertThat(user.getPerfil()).isEqualTo(Perfil.COLABORADOR);
        assertThat(rh.getPerfil()).isEqualTo(Perfil.EMPRESA);
        assertThat(user.getEmpresa().getId()).isEqualTo(rh.getEmpresa().getId());
        assertThat(user.getSenhaHash()).startsWith("$2").isNotEqualTo(PASSWORD);
        assertThat(passwords.matches(PASSWORD, user.getSenhaHash())).isTrue();
        assertThat(passwords.matches(PASSWORD, rh.getSenhaHash())).isTrue();

        initializer.run(new DefaultApplicationArguments(new String[0]));
        Usuario afterRestart = usuarios.findByEmailIgnoreCase(USER_EMAIL).orElseThrow();
        assertThat(afterRestart.getId()).isEqualTo(user.getId());
        assertThat(afterRestart.getSenhaHash()).isEqualTo(user.getSenhaHash());
        assertThat(usuarios.findByEmailIgnoreCase(RH_EMAIL).orElseThrow().getId()).isEqualTo(rh.getId());

        try (HttpClient client = HttpClient.newHttpClient()) {
            for (Usuario account : new Usuario[] {user, rh}) {
                HttpResponse<String> login = client.send(HttpRequest.newBuilder(uri("/api/auth/login"))
                        .header("Content-Type", "application/json")
                        .POST(HttpRequest.BodyPublishers.ofString(JSON.writeValueAsString(
                                Map.of("email", account.getEmail(), "senha", PASSWORD)))).build(),
                        HttpResponse.BodyHandlers.ofString());
                assertThat(login.statusCode()).isEqualTo(200);
                JsonNode body = JSON.readTree(login.body());
                assertThat(body.path("usuario").path("perfil").asText()).isEqualTo(account.getPerfil().name());
                assertThat(login.body()).doesNotContain("senha", PASSWORD, account.getSenhaHash());
                HttpResponse<String> me = client.send(HttpRequest.newBuilder(uri("/api/auth/me"))
                        .header("Authorization", "Bearer " + body.path("accessToken").asText()).GET().build(),
                        HttpResponse.BodyHandlers.ofString());
                assertThat(me.statusCode()).isEqualTo(200);
                assertThat(JSON.readTree(me.body()).path("id").asText()).isEqualTo(account.getId().toString());
            }
        }
    }

    @AfterAll
    void removeTestAccounts() {
        usuarios.findByEmailIgnoreCase(USER_EMAIL).ifPresent(usuarios::delete);
        usuarios.findByEmailIgnoreCase(RH_EMAIL).ifPresent(usuarios::delete);
        empresas.findFirstByNome(COMPANY_NAME).ifPresent(empresas::delete);
    }

    private URI uri(String path) {
        return URI.create("http://localhost:" + port + path);
    }
}
