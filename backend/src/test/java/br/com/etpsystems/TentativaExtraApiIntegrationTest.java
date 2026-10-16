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
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
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
class TentativaExtraApiIntegrationTest {
    private static final JsonMapper JSON = JsonMapper.builder().build();
    private static final String PASSWORD = "test-only-password";
    private final String ownerEmail = "certificate-" + UUID.randomUUID() + "@example.test";
    private final String otherEmail = "certificate-" + UUID.randomUUID() + "@example.test";

    private final String rhEmail = "rh-" + UUID.randomUUID() + "@example.test";
    private final String foreignEmail = "rh-other-" + UUID.randomUUID() + "@example.test";
    private br.com.etpsystems.company.Empresa company;
    private br.com.etpsystems.company.Empresa foreignCompany;
    @Autowired private br.com.etpsystems.company.EmpresaRepository empresas;
    @LocalServerPort private int port;
    @Autowired private UsuarioRepository usuarios;
    @Autowired private CursoRepository cursos;
    @Autowired private PasswordEncoder passwords;
    @Autowired private JdbcTemplate jdbc;

    @Test
    void authorizesOnlyOwnEmployeePreservesAuditAndIssuesCertificateAfterExtraAttempt() throws Exception {
        company = empresas.save(new br.com.etpsystems.company.Empresa("Tentativas " + UUID.randomUUID(), null));
        foreignCompany = empresas.save(new br.com.etpsystems.company.Empresa("Outra " + UUID.randomUUID(), null));
        Usuario owner = usuarios.save(new Usuario("Aluno", ownerEmail, passwords.encode(PASSWORD), Perfil.COLABORADOR, company));
        usuarios.save(new Usuario("Colega", otherEmail, passwords.encode(PASSWORD), Perfil.COLABORADOR, company));
        usuarios.save(new Usuario("RH Responsável", rhEmail, passwords.encode(PASSWORD), Perfil.EMPRESA, company));
        usuarios.save(new Usuario("RH Externo", foreignEmail, passwords.encode(PASSWORD), Perfil.EMPRESA, foreignCompany));
        String courseId = jdbc.queryForObject("SELECT id FROM cursos WHERE titulo = 'Cloud Computing Essencial'", String.class);
        String endpoint = "/api/empresa/colaboradores/" + owner.getId() + "/cursos/" + courseId + "/tentativas";
        String reason = "{\"reason\":\"Revisão acompanhada pelo RH\"}";
        try (HttpClient client = HttpClient.newHttpClient()) {
            String token = login(client, ownerEmail), rh = login(client, rhEmail), foreign = login(client, foreignEmail);
            String other = login(client, otherEmail);
            assertThat(get(client, endpoint, null).statusCode()).isEqualTo(401);
            assertThat(get(client, endpoint, token).statusCode()).isEqualTo(403);
            assertThat(post(client, endpoint, rh, reason).statusCode()).isEqualTo(404);
            for (String person : List.of(token, other)) {
                assertThat(post(client, "/api/colaborador/inscricoes/cursos/" + courseId, person, null).statusCode()).isEqualTo(200);
            }
            assertThat(get(client, endpoint, foreign).statusCode()).isEqualTo(404);
            assertThat(post(client, endpoint, foreign, reason).statusCode()).isEqualTo(404);
            assertThat(post(client, endpoint, rh, reason).statusCode()).isEqualTo(409);
            String assessmentId = JSON.readTree(get(client, "/api/colaborador/avaliacoes", token).body()).get(0).path("id").asText();
            String submit = "/api/colaborador/avaliacoes/" + assessmentId + "/tentativas";
            String wrong = JSON.writeValueAsString(Map.of("respostas", answers(assessmentId, false)));
            for (int i = 0; i < 2; i++) assertThat(post(client, submit, token, wrong).statusCode()).isEqualTo(200);
            assertThat(post(client, submit, token, wrong).statusCode()).isEqualTo(409);
            assertThat(post(client, endpoint, rh, "{\"reason\":\"   \"}").statusCode()).isEqualTo(400);
            assertThat(post(client, endpoint, rh, JSON.writeValueAsString(Map.of("reason", "x".repeat(501)))).statusCode()).isEqualTo(400);
            try (var executor = java.util.concurrent.Executors.newVirtualThreadPerTaskExecutor()) {
                var first = executor.submit(() -> post(client, endpoint, rh, reason));
                var second = executor.submit(() -> post(client, endpoint, rh, reason));
                assertThat(List.of(first.get().statusCode(), second.get().statusCode())).containsExactlyInAnyOrder(200, 409);
            }
            JsonNode audit = JSON.readTree(get(client, endpoint, rh).body());
            assertThat(audit.path("maxAttempts").asInt()).isEqualTo(3);
            assertThat(audit.path("usedAttempts").asInt()).isEqualTo(2);
            assertThat(audit.path("grants").size()).isEqualTo(1);
            assertThat(audit.path("grants").get(0).path("authorizedBy").asText()).isEqualTo("RH Responsável");
            assertThat(audit.path("grants").get(0).path("reason").asText()).isEqualTo("Revisão acompanhada pelo RH");
            JsonNode available = JSON.readTree(get(client, "/api/colaborador/avaliacoes", token).body()).get(0);
            assertThat(available.path("maxAttempts").asInt()).isEqualTo(3);
            assertThat(available.path("questions").get(0).path("correctOption").isNull()).isTrue();
            assertThat(JSON.readTree(get(client, "/api/colaborador/avaliacoes", other).body()).get(0).path("maxAttempts").asInt()).isEqualTo(2);
            String correct = JSON.writeValueAsString(Map.of("respostas", answers(assessmentId, true)));
            JsonNode result = JSON.readTree(post(client, submit, token, correct).body());
            assertThat(result.path("attempts").size()).isEqualTo(3);
            assertThat(result.path("attempts").get(0).path("score").asInt()).isZero();
            assertThat(result.path("attempts").get(2).path("passed").asBoolean()).isTrue();
            assertThat(JSON.readTree(get(client, "/api/colaborador/certificados", token).body()).size()).isEqualTo(1);
            assertThat(post(client, endpoint, rh, reason).statusCode()).isEqualTo(409);
            assertThat(post(client, submit, token, correct).statusCode()).isEqualTo(409);
        }
    }

    @AfterEach
    void cleanUp() {
        for (String email : List.of(ownerEmail, otherEmail, rhEmail, foreignEmail)) usuarios.findByEmailIgnoreCase(email).ifPresent(usuarios::delete);
        if (company != null) empresas.delete(company);
        if (foreignCompany != null) empresas.delete(foreignCompany);
    }

    private List<Map<String, String>> answers(String assessmentId, boolean correct) {
        return jdbc.query("""
                SELECT q.id AS question_id, MIN(o.id) AS option_id FROM questoes q
                JOIN alternativas o ON o.questao_id = q.id
                WHERE q.avaliacao_id = ? AND o.correta = ? GROUP BY q.id, q.ordem ORDER BY q.ordem
                """, (rs, row) -> Map.of("questaoId", rs.getString("question_id"),
                "alternativaId", rs.getString("option_id")), assessmentId, correct);
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
