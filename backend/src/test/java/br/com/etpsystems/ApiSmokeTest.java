package br.com.etpsystems;

import static org.assertj.core.api.Assertions.assertThat;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import br.com.etpsystems.course.CursoService;
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
    private ProgressoService progressoService;

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

    private HttpResponse<String> get(HttpClient client, String path) throws Exception {
        HttpRequest request = HttpRequest.newBuilder(URI.create("http://localhost:" + port + path)).GET().build();
        return client.send(request, HttpResponse.BodyHandlers.ofString());
    }
}
