package br.com.etpsystems;

import static org.assertj.core.api.Assertions.assertThat;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
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
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = "etp.demo.enabled=false")
@EnabledIfEnvironmentVariable(named = "ETP_DB_TEST", matches = "true")
class CertificadoApiIntegrationTest {
    private static final JsonMapper JSON = JsonMapper.builder().build();
    private static final String PASSWORD = "test-only-password";
    private final String ownerEmail = "certificate-" + UUID.randomUUID() + "@example.test";
    private final String otherEmail = "certificate-" + UUID.randomUUID() + "@example.test";

    @LocalServerPort private int port;
    @Autowired private UsuarioRepository usuarios;
    @Autowired private CursoRepository cursos;
    @Autowired private PasswordEncoder passwords;
    @Autowired private JdbcTemplate jdbc;

    @Test
    void issuesOnceAfterApprovalAndOnlyOwnerCanRead() throws Exception {
        usuarios.save(new Usuario("Titular", ownerEmail, passwords.encode(PASSWORD), Perfil.COLABORADOR, null));
        usuarios.save(new Usuario("Outra pessoa", otherEmail, passwords.encode(PASSWORD), Perfil.COLABORADOR, null));
        UUID courseId = cursos.findAllByOrderByOrdemExibicaoAscTituloAsc().stream()
                .filter(course -> course.getTitulo().equals("Fundamentos de Segurança da Informação"))
                .findFirst().orElseThrow().getId();
        try (HttpClient client = HttpClient.newHttpClient()) {
            String owner = login(client, ownerEmail);
            String other = login(client, otherEmail);
            String base = "/api/colaborador/certificados";
            assertThat(get(client, base, null).statusCode()).isEqualTo(401);
            assertThat(JSON.readTree(get(client, base, owner).body()).size()).isZero();
            assertThat(post(client, "/api/colaborador/inscricoes/cursos/" + courseId, owner, null)
                    .statusCode()).isEqualTo(200);
            JsonNode assessment = JSON.readTree(get(client, "/api/colaborador/avaliacoes", owner).body()).get(0);
            String assessmentId = assessment.path("id").asText();
            List<Map<String, String>> answers = jdbc.query("""
                    SELECT q.id AS question_id, o.id AS option_id FROM questoes q
                    JOIN alternativas o ON o.questao_id = q.id
                    WHERE q.avaliacao_id = ? AND o.correta = TRUE ORDER BY q.ordem
                    """, (rs, row) -> Map.of("questaoId", rs.getString("question_id"),
                    "alternativaId", rs.getString("option_id")), assessmentId);
            assertThat(answers).hasSize(5);
            HttpResponse<String> result = post(client, "/api/colaborador/avaliacoes/" + assessmentId + "/tentativas",
                    owner, JSON.writeValueAsString(Map.of("respostas", answers)));
            assertThat(result.statusCode()).isEqualTo(200);
            assertThat(JSON.readTree(result.body()).path("attempts").get(0).path("passed").asBoolean()).isTrue();
            JsonNode issued = JSON.readTree(get(client, base, owner).body());
            assertThat(issued.size()).isEqualTo(1);
            String id = issued.get(0).path("id").asText();
            String code = issued.get(0).path("code").asText();
            assertThat(code).startsWith("ETP-").hasSize(36);
            assertThat(issued.get(0).path("title").asText()).isEqualTo("Fundamentos de Segurança da Informação");
            assertThat(issued.get(0).path("holderName").asText()).isEqualTo("Titular");
            assertThat(issued.get(0).path("courseId").asText()).isEqualTo(courseId.toString());
            assertThat(issued.get(0).path("issuedAt").asText()).isNotEmpty();
            JsonNode myCourses = JSON.readTree(get(client, "/api/colaborador/meus-cursos", owner).body());
            assertThat(myCourses.get(0).path("progress").asInt()).isEqualTo(100);
            assertThat(myCourses.get(0).path("completedAt").isNull()).isFalse();
            assertThat(put(client, "/api/colaborador/meus-cursos/" + courseId + "/progresso", owner,
                    "{\"percentual\":45}").statusCode()).isEqualTo(409);
            assertThat(JSON.readTree(get(client, base + "/" + id, owner).body()).path("code").asText())
                    .isEqualTo(code);
            assertThat(get(client, base + "/" + id, other).statusCode()).isEqualTo(404);
            assertThat(JSON.readTree(get(client, base, other).body()).size()).isZero();
            assertThat(post(client, "/api/colaborador/avaliacoes/" + assessmentId + "/tentativas",
                    owner, JSON.writeValueAsString(Map.of("respostas", answers))).statusCode()).isEqualTo(409);
            assertThat(JSON.readTree(get(client, base, owner).body()).size()).isEqualTo(1);
        }
    }

    @Test
    void lgpdRemainsPendingUntilContentIsFinished() {
        assertThat(cursos.findAllByOrderByOrdemExibicaoAscTituloAsc().stream()
                .filter(course -> course.getTitulo().equals("LGPD na Prática"))
                .findFirst().orElseThrow().isCertificacaoHabilitada()).isFalse();
    }

    @AfterEach
    void cleanUp() {
        usuarios.findByEmailIgnoreCase(ownerEmail).ifPresent(usuarios::delete);
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

    private HttpResponse<String> put(HttpClient client, String path, String token, String body) throws Exception {
        return client.send(HttpRequest.newBuilder(uri(path))
                .header("Authorization", "Bearer " + token).header("Content-Type", "application/json")
                .PUT(HttpRequest.BodyPublishers.ofString(body)).build(), HttpResponse.BodyHandlers.ofString());
    }

    private URI uri(String path) { return URI.create("http://localhost:" + port + path); }
}
