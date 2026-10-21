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

    @ParameterizedTest
    @ValueSource(strings = {"Fundamentos de Segurança da Informação", "Computação em Nuvem: Conceitos e Aplicações",
            "LGPD na Prática", "Introdução à Inteligência Artificial", "Gestão de Projetos Ágeis com Scrum",
            "Cloud Computing Essencial", "Comunicação Assertiva no Ambiente de Trabalho", "Introdução à Criptografia"})
    void issuesOnceAfterApprovalAndOnlyOwnerCanRead(String courseTitle) throws Exception {
        usuarios.save(new Usuario("Titular", ownerEmail, passwords.encode(PASSWORD), Perfil.COLABORADOR, null));
        usuarios.save(new Usuario("Outra pessoa", otherEmail, passwords.encode(PASSWORD), Perfil.COLABORADOR, null));
        UUID courseId = cursos.findAllByOrderByOrdemExibicaoAscTituloAsc().stream()
                .filter(course -> course.getTitulo().equals(courseTitle))
                .findFirst().orElseThrow().getId();
        try (HttpClient client = HttpClient.newHttpClient()) {
            String owner = login(client, ownerEmail);
            String other = login(client, otherEmail);
            String base = "/api/colaborador/certificados";
            assertThat(get(client, base, null).statusCode()).isEqualTo(401);
            assertThat(get(client, "/api/colaborador/dashboard", null).statusCode()).isEqualTo(401);
            assertThat(JSON.readTree(get(client, "/api/colaborador/dashboard", owner).body())
                    .path("enrolledCourses").asInt()).isZero();
            assertThat(JSON.readTree(get(client, base, owner).body()).size()).isZero();
            assertThat(post(client, "/api/colaborador/inscricoes/cursos/" + courseId, owner, null)
                    .statusCode()).isEqualTo(200);
            // Progresso legado: a migração preserva percentuais anteriores.
            jdbc.update("INSERT INTO progresso_cursos (id, usuario_id, curso_id, percentual_progresso, concluido) VALUES (?, ?, ?, 40, FALSE)",
                    UUID.randomUUID().toString(), usuarios.findByEmailIgnoreCase(ownerEmail).orElseThrow().getId().toString(), courseId.toString());
            JsonNode before = JSON.readTree(get(client, "/api/colaborador/dashboard", owner).body());
            assertThat(before.path("ongoingCourses").asInt()).isEqualTo(1);
            assertThat(before.path("completedCourses").asInt()).isZero();
            assertThat(before.path("continueCourse").path("id").asText()).isEqualTo(courseId.toString());
            assertThat(before.path("continueCourse").path("progress").asInt()).isEqualTo(40);
            assertThat(before.path("availableAssessments").asInt()).isEqualTo(1);
            assertThat(before.path("recommendations").toString()).doesNotContain(courseId.toString());
            JsonNode assessment = JSON.readTree(get(client, "/api/colaborador/avaliacoes", owner).body()).get(0);
            String assessmentId = assessment.path("id").asText();
            List<Map<String, String>> answers = jdbc.query("""
                    SELECT q.id AS question_id, o.id AS option_id FROM questoes q
                    JOIN alternativas o ON o.questao_id = q.id
                    WHERE q.avaliacao_id = ? AND o.correta = TRUE ORDER BY q.ordem
                    """, (rs, row) -> Map.of("questaoId", rs.getString("question_id"),
                    "alternativaId", rs.getString("option_id")), assessmentId);
            int count = assessment.path("questions").size();
            assertThat(answers).hasSize(count);
            int minimumRight = (int) Math.ceil(count * 0.8);
            var wrong = answers(assessmentId, false);
            for (int index = minimumRight; index < count; index++) answers.set(index, wrong.get(index));
            JsonNode concurrentLessons = JSON.readTree(get(client, "/api/colaborador/cursos/" + courseId + "/aulas", owner).body());
            HttpResponse<String> result;
            try (var executor = java.util.concurrent.Executors.newVirtualThreadPerTaskExecutor()) {
                var approval = executor.submit(() -> post(client, "/api/colaborador/avaliacoes/" + assessmentId + "/tentativas",
                        owner, JSON.writeValueAsString(Map.of("respostas", answers))));
                var completion = executor.submit(() -> put(client, "/api/colaborador/meus-cursos/" + courseId + "/aulas/"
                        + concurrentLessons.get(0).path("id").asText() + "/conclusao", owner, "{}"));
                result = approval.get();
                assertThat(completion.get().statusCode()).isEqualTo(200);
            }
            assertThat(result.statusCode()).isEqualTo(200);
            assertThat(JSON.readTree(result.body()).path("attempts").get(0).path("passed").asBoolean()).isTrue();
            assertThat(JSON.readTree(result.body()).path("attempts").get(0).path("score").asInt()).isEqualTo((int) Math.round(minimumRight * 100.0 / count));
            JsonNode issued = JSON.readTree(get(client, base, owner).body());
            assertThat(issued.size()).isEqualTo(1);
            String id = issued.get(0).path("id").asText();
            String code = issued.get(0).path("code").asText();
            assertThat(code).startsWith("ETP-").hasSize(36);
            assertThat(issued.get(0).path("title").asText()).isEqualTo(courseTitle);
            assertThat(issued.get(0).path("holderName").asText()).isEqualTo("Titular");
            assertThat(issued.get(0).path("courseId").asText()).isEqualTo(courseId.toString());
            assertThat(issued.get(0).path("issuedAt").asText()).isNotEmpty();
            JsonNode dashboard = JSON.readTree(get(client, "/api/colaborador/dashboard", owner).body());
            assertThat(dashboard.path("completedCourses").asInt()).isEqualTo(1);
            assertThat(dashboard.path("ongoingCourses").asInt()).isZero();
            assertThat(dashboard.path("passedAssessments").asInt()).isEqualTo(1);
            assertThat(dashboard.path("certificates").asInt()).isEqualTo(1);
            assertThat(dashboard.path("certifiedHours").asDouble()).isPositive();
            assertThat(dashboard.path("continueCourse").isNull()).isTrue();
            assertThat(dashboard.path("recentAssessments").size()).isEqualTo(1);
            assertThat(dashboard.path("recentCertificates").size()).isEqualTo(1);
            assertThat(JSON.readTree(get(client, "/api/colaborador/dashboard", other).body())
                    .path("certificates").asInt()).isZero();
            JsonNode myCourses = JSON.readTree(get(client, "/api/colaborador/meus-cursos", owner).body());
            assertThat(myCourses.get(0).path("progress").asInt()).isEqualTo(100);
            assertThat(myCourses.get(0).path("completedAt").isNull()).isFalse();
            JsonNode lessonsAfterApproval = JSON.readTree(get(client, "/api/colaborador/cursos/" + courseId + "/aulas", owner).body());
            assertThat(put(client, "/api/colaborador/meus-cursos/" + courseId + "/aulas/"
                    + lessonsAfterApproval.get(lessonsAfterApproval.size() - 1).path("id").asText() + "/conclusao", owner, "{}").statusCode()).isEqualTo(200);
            assertThat(JSON.readTree(get(client, "/api/colaborador/meus-cursos", owner).body()).get(0).path("progress").asInt()).isEqualTo(100);

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
    void lessonCompletionAndFailedAttemptsDoNotIssueCertificate() throws Exception {
        usuarios.save(new Usuario("Titular", ownerEmail, passwords.encode(PASSWORD), Perfil.COLABORADOR, null));
        UUID courseId = cursos.findAllByOrderByOrdemExibicaoAscTituloAsc().stream()
                .filter(course -> course.getTitulo().equals("Fundamentos de Segurança da Informação"))
                .findFirst().orElseThrow().getId();
        try (HttpClient client = HttpClient.newHttpClient()) {
            String token = login(client, ownerEmail);
            assertThat(post(client, "/api/colaborador/inscricoes/cursos/" + courseId, token, null)
                    .statusCode()).isEqualTo(200);
            JsonNode lessons = JSON.readTree(get(client, "/api/colaborador/cursos/" + courseId + "/aulas", token).body());
            for (JsonNode lesson : lessons) {
                assertThat(put(client, "/api/colaborador/meus-cursos/" + courseId + "/aulas/"
                        + lesson.path("id").asText() + "/conclusao", token, "{}").statusCode()).isEqualTo(200);
            }
            assertThat(JSON.readTree(get(client, "/api/colaborador/certificados", token).body()).size()).isZero();
            JsonNode assessment = JSON.readTree(get(client, "/api/colaborador/avaliacoes", token).body()).get(0);
            String id = assessment.path("id").asText();
            String path = "/api/colaborador/avaliacoes/" + id + "/tentativas";
            String wrong = JSON.writeValueAsString(Map.of("respostas", answers(id, false)));
            for (int attempt = 0; attempt < 2; attempt++) {
                var result = post(client, path, token, wrong);
                assertThat(result.statusCode()).isEqualTo(200);
                JsonNode recorded = JSON.readTree(result.body()).path("attempts").get(attempt);
                assertThat(recorded.path("passed").asBoolean()).isFalse();
                assertThat(recorded.path("score").asInt()).isZero();
            }
            assertThat(post(client, path, token, JSON.writeValueAsString(Map.of("respostas", answers(id, true))))
                    .statusCode()).isEqualTo(409);
            assertThat(JSON.readTree(get(client, "/api/colaborador/certificados", token).body()).size()).isZero();
        }
    }

    @Test
    void simultaneousPassingSubmissionsIssueOnlyOneCertificate() throws Exception {
        usuarios.save(new Usuario("Titular", ownerEmail, passwords.encode(PASSWORD), Perfil.COLABORADOR, null));
        UUID courseId = cursos.findAllByOrderByOrdemExibicaoAscTituloAsc().stream()
                .filter(course -> course.getTitulo().equals("Fundamentos de Segurança da Informação"))
                .findFirst().orElseThrow().getId();
        try (HttpClient client = HttpClient.newHttpClient()) {
            String token = login(client, ownerEmail);
            assertThat(post(client, "/api/colaborador/inscricoes/cursos/" + courseId, token, null)
                    .statusCode()).isEqualTo(200);
            JsonNode assessment = JSON.readTree(get(client, "/api/colaborador/avaliacoes", token).body()).get(0);
            String id = assessment.path("id").asText();
            var request = HttpRequest.newBuilder(uri("/api/colaborador/avaliacoes/" + id + "/tentativas"))
                    .header("Authorization", "Bearer " + token).header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(JSON.writeValueAsString(Map.of("respostas", answers(id, true)))))
                    .build();
            var first = client.sendAsync(request, HttpResponse.BodyHandlers.ofString());
            var second = client.sendAsync(request, HttpResponse.BodyHandlers.ofString());
            assertThat(List.of(first.get(20, java.util.concurrent.TimeUnit.SECONDS).statusCode(),
                    second.get(20, java.util.concurrent.TimeUnit.SECONDS).statusCode()))
                    .containsExactlyInAnyOrder(200, 409);
            assertThat(JSON.readTree(get(client, "/api/colaborador/certificados", token).body()).size()).isEqualTo(1);
            assertThat(JSON.readTree(get(client, "/api/colaborador/avaliacoes", token).body())
                    .get(0).path("attempts").size()).isEqualTo(1);
        }
    }

    private List<Map<String, String>> answers(String assessmentId, boolean correct) {
        return jdbc.query("""
                SELECT q.id AS question_id, MIN(o.id) AS option_id FROM questoes q
                JOIN alternativas o ON o.questao_id = q.id
                WHERE q.avaliacao_id = ? AND o.correta = ? GROUP BY q.id, q.ordem ORDER BY q.ordem
                """, (rs, row) -> Map.of("questaoId", rs.getString("question_id"),
                "alternativaId", rs.getString("option_id")), assessmentId, correct);
    }

    @Test
    void coursesWithoutPublishedAssessmentRemainDisabled() {
        assertThat(cursos.findAllByOrderByOrdemExibicaoAscTituloAsc().stream()
                .filter(course -> course.getTitulo().equals("Python para Análise de Dados"))
                .findFirst().orElseThrow().isCertificacaoHabilitada()).isFalse();
    }

    @Test
    @org.springframework.transaction.annotation.Transactional
    void migrationRecoversPastApprovalsAndProgressWithoutDuplicatingCertificates() {
        var owner = usuarios.saveAndFlush(new Usuario("Titular", ownerEmail, passwords.encode(PASSWORD), Perfil.COLABORADOR, null));
        var other = usuarios.saveAndFlush(new Usuario("Outro", otherEmail, passwords.encode(PASSWORD), Perfil.COLABORADOR, null));
        String ownerId = owner.getId().toString();
        String otherId = other.getId().toString();
        String lgpdId = jdbc.queryForObject("SELECT id FROM cursos WHERE titulo = 'LGPD na Prática'", String.class);
        String cloudId = jdbc.queryForObject("SELECT id FROM cursos WHERE titulo = 'Cloud Computing Essencial'", String.class);
        for (String courseId : List.of(lgpdId, cloudId)) {
            jdbc.update("""
                    INSERT INTO tentativas_avaliacao (id, avaliacao_id, usuario_id, nota, aprovado, concluido_em)
                    SELECT UUID(), id, ?, 100, TRUE, '2026-10-01 12:00:00' FROM avaliacoes WHERE curso_id = ?
                    """, ownerId, courseId);
        }
        jdbc.update("""
                INSERT INTO tentativas_avaliacao (id, avaliacao_id, usuario_id, nota, aprovado, concluido_em)
                SELECT UUID(), id, ?, 100, TRUE, '2026-10-02 12:00:00' FROM avaliacoes WHERE curso_id = ?
                """, ownerId, lgpdId);
        jdbc.update("""
                INSERT INTO tentativas_avaliacao (id, avaliacao_id, usuario_id, nota, aprovado, concluido_em)
                SELECT UUID(), id, ?, 0, FALSE, '2026-10-01 12:00:00' FROM avaliacoes WHERE curso_id = ?
                """, otherId, lgpdId);
        jdbc.update("""
                INSERT INTO progresso_cursos (id, usuario_id, curso_id, percentual_progresso, concluido)
                VALUES (UUID(), ?, ?, 40, FALSE)
                """, ownerId, lgpdId);
        var migration = new org.springframework.jdbc.datasource.init.ResourceDatabasePopulator(
                new org.springframework.core.io.ClassPathResource("db/migration/V24__enable_completed_course_certificates.sql"));
        migration.execute(java.util.Objects.requireNonNull(jdbc.getDataSource()));
        var issued = jdbc.queryForList("SELECT id, codigo, emitido_em FROM certificados WHERE usuario_id = ? ORDER BY curso_id", ownerId);
        assertThat(issued).hasSize(2);
        assertThat(jdbc.queryForList("""
                SELECT DATE_FORMAT(emitido_em, '%Y-%m-%d %H:%i:%s') FROM certificados WHERE usuario_id = ?
                """, String.class, ownerId)).containsOnly("2026-10-01 12:00:00");
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM certificados WHERE usuario_id = ?", Integer.class, otherId)).isZero();
        assertThat(jdbc.queryForList("""
                SELECT percentual_progresso FROM progresso_cursos
                WHERE usuario_id = ? AND concluido = TRUE AND concluido_em IS NOT NULL
                """, Integer.class, ownerId)).containsExactlyInAnyOrder(100, 100);
        migration.execute(jdbc.getDataSource());
        assertThat(jdbc.queryForList("SELECT id, codigo, emitido_em FROM certificados WHERE usuario_id = ? ORDER BY curso_id", ownerId))
                .isEqualTo(issued);
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
