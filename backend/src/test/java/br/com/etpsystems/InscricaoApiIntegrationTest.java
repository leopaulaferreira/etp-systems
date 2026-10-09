package br.com.etpsystems;

import static org.assertj.core.api.Assertions.assertThat;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.UUID;

import br.com.etpsystems.course.CursoRepository;
import br.com.etpsystems.user.Perfil;
import br.com.etpsystems.user.Usuario;
import br.com.etpsystems.user.UsuarioRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.security.crypto.password.PasswordEncoder;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = "etp.demo.enabled=false")
@EnabledIfEnvironmentVariable(named = "ETP_DB_TEST", matches = "true")
class InscricaoApiIntegrationTest {

    private static final JsonMapper JSON = JsonMapper.builder().build();
    private static final String PASSWORD = "test-only-password";
    private final String firstEmail = "enrollment-" + UUID.randomUUID() + "@example.test";
    private final String otherEmail = "enrollment-" + UUID.randomUUID() + "@example.test";

    @LocalServerPort
    private int port;
    @Autowired
    private UsuarioRepository usuarios;
    @Autowired
    private CursoRepository cursos;
    @Autowired
    private PasswordEncoder passwords;

    @Test
    void enrollsOnlyTheAuthenticatedCollaboratorAndKeepsDuplicatesIdempotent() throws Exception {
        usuarios.save(new Usuario("Primeiro", firstEmail, passwords.encode(PASSWORD), Perfil.COLABORADOR, null));
        usuarios.save(new Usuario("Segundo", otherEmail, passwords.encode(PASSWORD), Perfil.COLABORADOR, null));
        UUID cursoId = cursos.findAllByOrderByOrdemExibicaoAscTituloAsc().getFirst().getId();

        try (HttpClient client = HttpClient.newHttpClient()) {
            assertThat(get(client, "/api/colaborador/meus-cursos", null).statusCode()).isEqualTo(401);
            String firstToken = login(client, firstEmail);
            String otherToken = login(client, otherEmail);

            HttpResponse<String> first = post(client, "/api/colaborador/inscricoes/cursos/" + cursoId, firstToken);
            assertThat(first.statusCode()).isEqualTo(200);
            assertThat(JSON.readTree(first.body()).path("id").asText()).isEqualTo(cursoId.toString());
            assertThat(post(client, "/api/colaborador/inscricoes/cursos/" + cursoId, firstToken).statusCode())
                    .isEqualTo(200);

            JsonNode mine = JSON.readTree(get(client, "/api/colaborador/meus-cursos", firstToken).body());
            assertThat(mine.size()).isEqualTo(1);
            assertThat(mine.get(0).path("id").asText()).isEqualTo(cursoId.toString());
            assertThat(mine.get(0).path("enrolledAt").asText()).isNotBlank();
            assertThat(mine.get(0).path("progress").asDouble()).isZero();
            assertThat(JSON.readTree(get(client, "/api/colaborador/meus-cursos", otherToken).body()).size())
                    .isZero();
            String progressPath = "/api/colaborador/meus-cursos/" + cursoId + "/progresso";
            assertThat(put(client, progressPath, otherToken, 50).statusCode()).isEqualTo(404);
            assertThat(put(client, progressPath, firstToken, -1).statusCode()).isEqualTo(400);
            assertThat(put(client, progressPath, firstToken, 101).statusCode()).isEqualTo(400);
            JsonNode partial = JSON.readTree(put(client, progressPath, firstToken, 45).body());
            assertThat(partial.path("progress").asDouble()).isEqualTo(45);
            assertThat(partial.path("completedAt").isNull()).isTrue();
            JsonNode completed = JSON.readTree(put(client, progressPath, firstToken, 100).body());
            assertThat(completed.path("progress").asDouble()).isEqualTo(100);
            assertThat(completed.path("completedAt").asText()).isNotBlank();
            assertThat(JSON.readTree(get(client, "/api/colaborador/meus-cursos", firstToken).body())
                    .get(0).path("completedAt").asText()).isEqualTo(completed.path("completedAt").asText());
            assertThat(JSON.readTree(put(client, progressPath, firstToken, 100).body())
                    .path("completedAt").asText()).isEqualTo(completed.path("completedAt").asText());
            assertThat(JSON.readTree(put(client, progressPath, firstToken, 30).body())
                    .path("completedAt").isNull()).isTrue();
            assertThat(post(client, "/api/colaborador/inscricoes/cursos/" + UUID.randomUUID(), firstToken)
                    .statusCode()).isEqualTo(404);
        }
    }

    @AfterEach
    void removeUsers() {
        usuarios.findByEmailIgnoreCase(firstEmail).ifPresent(usuarios::delete);
        usuarios.findByEmailIgnoreCase(otherEmail).ifPresent(usuarios::delete);
    }

    private String login(HttpClient client, String email) throws Exception {
        HttpRequest request = HttpRequest.newBuilder(uri("/api/auth/login"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(JSON.writeValueAsString(
                        java.util.Map.of("email", email, "senha", PASSWORD))))
                .build();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        assertThat(response.statusCode()).isEqualTo(200);
        return JSON.readTree(response.body()).path("accessToken").asText();
    }

    private HttpResponse<String> get(HttpClient client, String path, String token) throws Exception {
        HttpRequest.Builder request = HttpRequest.newBuilder(uri(path)).GET();
        if (token != null) request.header("Authorization", "Bearer " + token);
        return client.send(request.build(), HttpResponse.BodyHandlers.ofString());
    }

    private HttpResponse<String> post(HttpClient client, String path, String token) throws Exception {
        return client.send(HttpRequest.newBuilder(uri(path)).header("Authorization", "Bearer " + token)
                .POST(HttpRequest.BodyPublishers.noBody()).build(), HttpResponse.BodyHandlers.ofString());
    }

    private HttpResponse<String> put(HttpClient client, String path, String token, int percentual) throws Exception {
        return client.send(HttpRequest.newBuilder(uri(path))
                .header("Authorization", "Bearer " + token)
                .header("Content-Type", "application/json")
                .PUT(HttpRequest.BodyPublishers.ofString("{\"percentual\":" + percentual + "}"))
                .build(), HttpResponse.BodyHandlers.ofString());
    }

    private URI uri(String path) {
        return URI.create("http://localhost:" + port + path);
    }
}
