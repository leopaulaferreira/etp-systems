package br.com.etpsystems;

import static org.assertj.core.api.Assertions.assertThat;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
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
class AvaliacaoApiIntegrationTest {
    private static final JsonMapper JSON = JsonMapper.builder().build();
    private static final String PASSWORD = "test-only-password";
    private final String firstEmail = "assessment-" + UUID.randomUUID() + "@example.test";
    private final String otherEmail = "assessment-" + UUID.randomUUID() + "@example.test";

    @LocalServerPort private int port;
    @Autowired private UsuarioRepository usuarios;
    @Autowired private CursoRepository cursos;
    @Autowired private PasswordEncoder passwords;

    @Test
    void gradesOnlyEnrolledUserAndPersistsAttemptsWithoutLeakingAnswersEarly() throws Exception {
        usuarios.save(new Usuario("Primeiro", firstEmail, passwords.encode(PASSWORD), Perfil.COLABORADOR, null));
        usuarios.save(new Usuario("Segundo", otherEmail, passwords.encode(PASSWORD), Perfil.COLABORADOR, null));
        UUID courseId = cursos.findAllByOrderByOrdemExibicaoAscTituloAsc().stream()
                .filter(course -> course.getTitulo().equals("LGPD na Prática")).findFirst().orElseThrow().getId();
        try (HttpClient client = HttpClient.newHttpClient()) {
            String firstToken = login(client, firstEmail);
            String otherToken = login(client, otherEmail);
            assertThat(get(client, "/api/colaborador/avaliacoes", null).statusCode()).isEqualTo(401);
            assertThat(get(client, "/api/colaborador/cursos/" + courseId + "/aulas", firstToken).statusCode())
                    .isEqualTo(404);
            assertThat(JSON.readTree(get(client, "/api/colaborador/avaliacoes", firstToken).body()).size()).isZero();

            post(client, "/api/colaborador/inscricoes/cursos/" + courseId, firstToken, null);
            JsonNode lesson = JSON.readTree(get(client, "/api/colaborador/cursos/" + courseId + "/aulas", firstToken).body());
            assertThat(lesson.size()).isEqualTo(2);
            assertThat(lesson.get(0).path("title").asText()).isEqualTo("Introdução à LGPD e Proteção de Dados");
            assertThat(lesson.get(0).path("content").asText()).isEmpty();
            assertThat(lesson.get(0).path("videoUrl").asText()).isEqualTo("/videos/lgpd-aula-1.mp4");
            assertThat(lesson.get(1).path("title").asText()).isEqualTo("Boas práticas no ambiente corporativo");
            assertThat(lesson.get(1).path("content").asText()).isEmpty();
            assertThat(lesson.get(1).path("videoUrl").asText()).isEqualTo("/videos/lgpd-aula-2.mp4");
            assertThat(get(client, "/api/colaborador/cursos/" + courseId + "/aulas", otherToken).statusCode())
                    .isEqualTo(404);

            JsonNode assessment = JSON.readTree(get(client, "/api/colaborador/avaliacoes", firstToken).body()).get(0);
            String path = "/api/colaborador/avaliacoes/" + assessment.path("id").asText() + "/tentativas";
            assertThat(assessment.path("questions").size()).isEqualTo(5);
            assertThat(assessment.path("questions").get(0).path("correctOption").isNull()).isTrue();
            assertThat(post(client, path, firstToken, "{\"respostas\":[]}").statusCode()).isEqualTo(400);

            List<Map<String, String>> wrong = new ArrayList<>();
            List<Map<String, String>> right = new ArrayList<>();
            for (JsonNode question : assessment.path("questions")) {
                String questionId = question.path("id").asText();
                int correctIndex = question.path("options").toString().contains("Nome associado ao e-mail") ? 0 :
                        question.path("options").toString().contains("Usar apenas os dados necessários") ? 1 :
                        question.path("options").toString().contains("Por canais autorizados") ? 2 :
                        question.path("options").toString().contains("Bloquear a tela") ? 0 : 1;
                right.add(Map.of("questaoId", questionId,
                        "alternativaId", question.path("optionIds").get(correctIndex).asText()));
                wrong.add(Map.of("questaoId", questionId,
                        "alternativaId", question.path("optionIds").get((correctIndex + 1) % 3).asText()));
            }
            String duplicate = JSON.writeValueAsString(Map.of("respostas", List.of(wrong.get(0), wrong.get(0),
                    wrong.get(1), wrong.get(2), wrong.get(3))));
            assertThat(post(client, path, otherToken, JSON.writeValueAsString(Map.of("respostas", wrong)))
                    .statusCode()).isEqualTo(404);
            assertThat(post(client, path, firstToken, duplicate).statusCode()).isEqualTo(400);
            HttpResponse<String> first = post(client, path, firstToken, JSON.writeValueAsString(Map.of("respostas", wrong)));
            assertThat(first.statusCode()).isEqualTo(200);
            JsonNode failed = JSON.readTree(first.body());
            assertThat(failed.path("attempts").get(0).path("score").asInt()).isZero();
            assertThat(failed.path("questions").get(0).path("correctOption").isNull()).isTrue();

            HttpResponse<String> second = post(client, path, firstToken, JSON.writeValueAsString(Map.of("respostas", right)));
            assertThat(second.statusCode()).isEqualTo(200);
            JsonNode passed = JSON.readTree(second.body());
            assertThat(passed.path("attempts").get(1).path("score").asInt()).isEqualTo(100);
            assertThat(passed.path("attempts").get(1).path("passed").asBoolean()).isTrue();
            assertThat(passed.path("questions").get(0).path("correctOption").isNull()).isFalse();
            assertThat(post(client, path, firstToken, JSON.writeValueAsString(Map.of("respostas", right)))
                    .statusCode()).isEqualTo(409);
            assertThat(JSON.readTree(get(client, "/api/colaborador/avaliacoes", firstToken).body())
                    .get(0).path("attempts").size()).isEqualTo(2);
            assertThat(JSON.readTree(get(client, "/api/colaborador/avaliacoes", otherToken).body()).size()).isZero();
        }
    }

    @AfterEach
    void cleanUp() {
        usuarios.findByEmailIgnoreCase(firstEmail).ifPresent(usuarios::delete);
        usuarios.findByEmailIgnoreCase(otherEmail).ifPresent(usuarios::delete);
    }

    private String login(HttpClient client, String email) throws Exception {
        HttpResponse<String> response = post(client, "/api/auth/login", null,
                JSON.writeValueAsString(Map.of("email", email, "senha", PASSWORD)));
        assertThat(response.statusCode()).isEqualTo(200);
        return JSON.readTree(response.body()).path("accessToken").asText();
    }

    private HttpResponse<String> get(HttpClient client, String path, String token) throws Exception {
        HttpRequest.Builder request = HttpRequest.newBuilder(uri(path)).GET();
        if (token != null) request.header("Authorization", "Bearer " + token);
        return client.send(request.build(), HttpResponse.BodyHandlers.ofString());
    }

    private HttpResponse<String> post(HttpClient client, String path, String token, String body) throws Exception {
        HttpRequest.Builder request = HttpRequest.newBuilder(uri(path));
        if (token != null) request.header("Authorization", "Bearer " + token);
        if (body != null) request.header("Content-Type", "application/json");
        return client.send(request.POST(body == null ? HttpRequest.BodyPublishers.noBody()
                : HttpRequest.BodyPublishers.ofString(body)).build(), HttpResponse.BodyHandlers.ofString());
    }

    private URI uri(String path) { return URI.create("http://localhost:" + port + path); }
}
