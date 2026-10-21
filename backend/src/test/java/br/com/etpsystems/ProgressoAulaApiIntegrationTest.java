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
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.security.crypto.password.PasswordEncoder;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = "etp.demo.enabled=false")
@EnabledIfEnvironmentVariable(named = "ETP_DB_TEST", matches = "true")
class ProgressoAulaApiIntegrationTest {

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
    @Autowired
    private br.com.etpsystems.assessment.AulaRepository aulas;

    @ParameterizedTest
    @ValueSource(strings = {"Cloud Computing Essencial", "Introdução à Criptografia"})
    void countsLessonsOncePersistsAndRejectsOtherUsersAndCourses(String courseTitle) throws Exception {
        usuarios.save(new Usuario("Primeiro", firstEmail, passwords.encode(PASSWORD), Perfil.COLABORADOR, null));
        usuarios.save(new Usuario("Segundo", otherEmail, passwords.encode(PASSWORD), Perfil.COLABORADOR, null));
        UUID cursoId = cursos.findAllByOrderByOrdemExibicaoAscTituloAsc().stream()
                .filter(curso -> curso.getTitulo().equals(courseTitle)).findFirst().orElseThrow().getId();
        var lessons = aulas.findByCurso_IdOrderByOrdem(cursoId);
        assertThat(lessons).hasSize(3);
        String base = "/api/colaborador/meus-cursos/" + cursoId + "/aulas";
        try (HttpClient client = HttpClient.newHttpClient()) {
            String token = login(client, firstEmail);
            String other = login(client, otherEmail);
            assertThat(get(client, base + "/progresso", null).statusCode()).isEqualTo(401);
            assertThat(get(client, base + "/progresso", token).statusCode()).isEqualTo(404);
            assertThat(post(client, "/api/colaborador/inscricoes/cursos/" + cursoId, token).statusCode()).isEqualTo(200);
            assertThat(put(client, "/api/colaborador/meus-cursos/" + cursoId + "/progresso", token, 100).statusCode()).isEqualTo(409);
            String first = base + "/" + lessons.get(0).getId() + "/conclusao";
            assertThat(put(client, first, other, 0).statusCode()).isEqualTo(404);
            UUID foreignLesson = aulas.findAll().stream().filter(aula -> lessons.stream()
                    .noneMatch(lesson -> lesson.getId().equals(aula.getId()))).findFirst().orElseThrow().getId();
            assertThat(put(client, base + "/" + foreignLesson + "/conclusao", token, 0).statusCode()).isEqualTo(404);
            var firstResult = put(client, first, token, 0);
            assertThat(firstResult.statusCode()).isEqualTo(200);
            assertThat(JSON.readTree(firstResult.body()).path("progress").asDouble()).isEqualTo(33.33);
            assertThat(JSON.readTree(put(client, first, token, 0).body()).path("completedLessonIds").size()).isEqualTo(1);
            assertThat(JSON.readTree(get(client, "/api/colaborador/meus-cursos", token).body()).get(0).path("progress").asDouble()).isEqualTo(33.33);
            // Duas abas concluem aulas diferentes ao mesmo tempo.
            try (var executor = java.util.concurrent.Executors.newVirtualThreadPerTaskExecutor()) {
                var second = executor.submit(() -> put(client, base + "/" + lessons.get(1).getId() + "/conclusao", token, 0));
                var third = executor.submit(() -> put(client, base + "/" + lessons.get(2).getId() + "/conclusao", token, 0));
                assertThat(second.get().statusCode()).isEqualTo(200);
                assertThat(third.get().statusCode()).isEqualTo(200);
            }
            JsonNode persisted = JSON.readTree(get(client, base + "/progresso", token).body());
            assertThat(persisted.path("completedLessonIds").size()).isEqualTo(3);
            assertThat(persisted.path("progress").asDouble()).isEqualTo(100);
            assertThat(JSON.readTree(get(client, "/api/colaborador/meus-cursos", token).body()).get(0).path("completedAt").isNull()).isFalse();
            assertThat(JSON.readTree(get(client, "/api/colaborador/certificados", token).body()).size()).isZero();
            assertThat(post(client, "/api/colaborador/inscricoes/cursos/" + cursoId, other).statusCode()).isEqualTo(200);
            assertThat(JSON.readTree(get(client, base + "/progresso", other).body()).path("completedLessonIds").size()).isZero();
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
