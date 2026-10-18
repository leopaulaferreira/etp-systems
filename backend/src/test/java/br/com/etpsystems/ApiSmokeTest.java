package br.com.etpsystems;

import static org.assertj.core.api.Assertions.assertThat;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import br.com.etpsystems.course.CursoService;
import br.com.etpsystems.assessment.AvaliacaoService;
import br.com.etpsystems.certificate.CertificadoService;
import br.com.etpsystems.dashboard.DashboardService;
import br.com.etpsystems.company.CompanyOverviewService;
import br.com.etpsystems.track.TrilhaService;
import br.com.etpsystems.user.UsuarioRepository;
import br.com.etpsystems.enrollment.InscricaoService;
import br.com.etpsystems.progress.ProgressoService;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
        "spring.autoconfigure.exclude=org.springframework.boot.jdbc.autoconfigure.DataSourceAutoConfiguration",
        "etp.demo.enabled=false",
        "etp.security.login.max-requests=3",
        "DB_PASSWORD=test"
})
class ApiSmokeTest {

    @MockitoBean
    private CursoService cursoService;

    @MockitoBean
    private UsuarioRepository usuarioRepository;

    @MockitoBean
    private InscricaoService inscricaoService;

    @MockitoBean
    private br.com.etpsystems.progress.ProgressoAulaService progressoAulas;

    @MockitoBean
    private ProgressoService progressoService;

    @MockitoBean
    private br.com.etpsystems.assessment.TentativaExtraService tentativaExtraService;

    @MockitoBean
    private AvaliacaoService avaliacaoService;

    @MockitoBean
    private CertificadoService certificadoService;

    @MockitoBean
    private DashboardService dashboardService;

    @MockitoBean
    private CompanyOverviewService companyOverviewService;

    @MockitoBean
    private TrilhaService trilhaService;

    @LocalServerPort
    private int port;

    @Test
    void healthAndOpenApiAreAvailable() throws Exception {
        try (HttpClient client = HttpClient.newHttpClient()) {
            HttpResponse<String> health = get(client, "/actuator/health");
            assertThat(health.statusCode()).isEqualTo(200);
            assertThat(health.body()).contains("\"status\":\"UP\"");

            HttpResponse<String> docs = get(client, "/v3/api-docs");
            assertThat(docs.statusCode()).isEqualTo(200);
            assertThat(docs.body()).contains("ETP Systems API");

            HttpResponse<String> swagger = get(client, "/swagger-ui/index.html");
            assertThat(swagger.statusCode()).isEqualTo(200);
            assertThat(swagger.body()).contains("swagger-ui");
        }
    }

    @Test
    void loginLimitRunsBeforeBodyValidationAndPreservesCors() throws Exception {
        try (HttpClient client = HttpClient.newHttpClient()) {
            var request = HttpRequest.newBuilder(URI.create("http://localhost:" + port + "/api/auth/login"))
                    .header("Content-Type", "application/json")
                    .header("Origin", "http://localhost:5173")
                    .POST(HttpRequest.BodyPublishers.ofString("{}")) .build();
            for (int i = 0; i < 3; i++) {
                assertThat(client.send(request, HttpResponse.BodyHandlers.ofString()).statusCode()).isEqualTo(400);
            }
            var blocked = client.send(request, HttpResponse.BodyHandlers.ofString());
            assertThat(blocked.statusCode()).isEqualTo(429);
            assertThat(blocked.headers().firstValue("Retry-After")).isPresent();
            assertThat(blocked.headers().firstValue("Access-Control-Allow-Origin")).contains("http://localhost:5173");
            assertThat(blocked.body()).contains("Muitas tentativas");
            assertThat(get(client, "/actuator/health").statusCode()).isEqualTo(200);
        }
    }

    private HttpResponse<String> get(HttpClient client, String path) throws Exception {
        HttpRequest request = HttpRequest.newBuilder(URI.create("http://localhost:" + port + path)).GET().build();
        return client.send(request, HttpResponse.BodyHandlers.ofString());
    }
}
