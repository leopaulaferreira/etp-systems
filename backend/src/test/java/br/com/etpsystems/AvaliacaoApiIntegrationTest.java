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
import org.springframework.jdbc.core.JdbcTemplate;
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
    @Autowired private JdbcTemplate jdbc;

    @Test
    void eachPilotQuestionHasAtLeastFourOptions() {
        List<Integer> optionCounts = jdbc.queryForList("""
                SELECT COUNT(o.id) FROM questoes q
                JOIN avaliacoes a ON a.id = q.avaliacao_id
                JOIN cursos c ON c.id = a.curso_id
                LEFT JOIN alternativas o ON o.questao_id = q.id
                WHERE c.titulo IN ('LGPD na Prática', 'Fundamentos de Segurança da Informação',
                                   'Computação em Nuvem: Conceitos e Aplicações')
                GROUP BY q.id
                """, Integer.class);
        assertThat(optionCounts).hasSize(16).allMatch(count -> count >= 4);
    }

    @Test
    void aiAssessmentHasSixQuestionsAndGradesTheSubmittedAnswers() throws Exception {
        usuarios.save(new Usuario("Aluno IA", firstEmail, passwords.encode(PASSWORD), Perfil.COLABORADOR, null));
        UUID courseId = cursos.findAllByOrderByOrdemExibicaoAscTituloAsc().stream()
                .filter(course -> course.getTitulo().equals("Introdução à Inteligência Artificial"))
                .findFirst().orElseThrow().getId();
        try (HttpClient client = HttpClient.newHttpClient()) {
            String token = login(client, firstEmail);
            post(client, "/api/colaborador/inscricoes/cursos/" + courseId, token, null);
            JsonNode assessments = JSON.readTree(get(client, "/api/colaborador/avaliacoes", token).body());
            assertThat(assessments.size()).isEqualTo(1);
            JsonNode assessment = assessments.get(0);
            assertThat(assessment.path("courseId").asText()).isEqualTo(courseId.toString());
            assertThat(assessment.path("minimumScore").asInt()).isEqualTo(80);
            assertThat(assessment.path("maxAttempts").asInt()).isEqualTo(2);
            assertThat(assessment.path("topic").asText()).isEqualTo("ai");
            JsonNode questions = assessment.path("questions");
            assertThat(questions.size()).isEqualTo(6);
            assertThat(questions.get(0).path("prompt").asText())
                    .isEqualTo("Qual alternativa melhor define Inteligência Artificial?");
            assertThat(questions.get(5).path("prompt").asText())
                    .startsWith("Um colaborador precisa resumir um documento interno");
            for (JsonNode question : questions) {
                assertThat(question.path("options").size()).isEqualTo(4);
                assertThat(question.path("optionIds").size()).isEqualTo(4);
                assertThat(question.path("correctOption").isNull()).isTrue();
                assertThat(question.path("explanation").isNull()).isTrue();
            }

            List<Map<String, String>> wrong = new ArrayList<>();
            List<Map<String, String>> right = new ArrayList<>();
            int[] correctOptions = {1, 1, 1, 2, 2, 2};
            for (int index = 0; index < questions.size(); index++) {
                JsonNode question = questions.get(index);
                String questionId = question.path("id").asText();
                wrong.add(Map.of("questaoId", questionId,
                        "alternativaId", question.path("optionIds").get(0).asText()));
                right.add(Map.of("questaoId", questionId,
                        "alternativaId", question.path("optionIds").get(correctOptions[index]).asText()));
            }
            String path = "/api/colaborador/avaliacoes/" + assessment.path("id").asText() + "/tentativas";
            JsonNode failed = JSON.readTree(post(client, path, token,
                    JSON.writeValueAsString(Map.of("respostas", wrong))).body());
            assertThat(failed.path("attempts").get(0).path("score").asInt()).isZero();
            assertThat(failed.path("questions").get(0).path("correctOption").isNull()).isTrue();

            JsonNode passed = JSON.readTree(post(client, path, token,
                    JSON.writeValueAsString(Map.of("respostas", right))).body());
            assertThat(passed.path("attempts").get(1).path("score").asInt()).isEqualTo(100);
            assertThat(passed.path("attempts").get(1).path("passed").asBoolean()).isTrue();
            for (int index = 0; index < questions.size(); index++) {
                assertThat(passed.path("questions").get(index).path("correctOption").asInt())
                        .isEqualTo(correctOptions[index]);
                assertThat(passed.path("questions").get(index).path("explanation").asText())
                        .isNotBlank();
            }
        }
    }

    @Test
    void aiCourseHasThreeVideoLessonsInOrder() throws Exception {
        usuarios.save(new Usuario("Aluno IA", firstEmail, passwords.encode(PASSWORD), Perfil.COLABORADOR, null));
        UUID courseId = cursos.findAllByOrderByOrdemExibicaoAscTituloAsc().stream()
                .filter(course -> course.getTitulo().equals("Introdução à Inteligência Artificial"))
                .findFirst().orElseThrow().getId();
        try (HttpClient client = HttpClient.newHttpClient()) {
            String token = login(client, firstEmail);
            String path = "/api/colaborador/cursos/" + courseId + "/aulas";
            assertThat(get(client, path, token).statusCode()).isEqualTo(404);
            assertThat(post(client, "/api/colaborador/inscricoes/cursos/" + courseId, token, null).statusCode())
                    .isEqualTo(200);

            JsonNode lessons = JSON.readTree(get(client, path, token).body());
            assertThat(lessons.size()).isEqualTo(3);
            assertThat(lessons.get(0).path("order").asInt()).isEqualTo(1);
            assertThat(lessons.get(0).path("title").asText()).isEqualTo("Introdução à Inteligência Artificial");
            assertThat(lessons.get(0).path("videoUrl").asText()).isEqualTo("/videos/ia-aula-1.mp4");
            assertThat(lessons.get(1).path("order").asInt()).isEqualTo(2);
            assertThat(lessons.get(1).path("title").asText()).isEqualTo("Introdução à IA: Aula 2");
            assertThat(lessons.get(1).path("videoUrl").asText()).isEqualTo("/videos/ia-aula-2.mp4");
            assertThat(lessons.get(2).path("order").asInt()).isEqualTo(3);
            assertThat(lessons.get(2).path("title").asText())
                    .isEqualTo("Uso Responsável da Inteligência Artificial");
            assertThat(lessons.get(2).path("videoUrl").asText()).isEqualTo("/videos/ia-aula-3.mp4");
        }
    }

    @Test
    void scrumCourseHasThreeVideoLessonsInOrder() throws Exception {
        usuarios.save(new Usuario("Aluno Scrum", firstEmail, passwords.encode(PASSWORD), Perfil.COLABORADOR, null));
        UUID courseId = cursos.findAllByOrderByOrdemExibicaoAscTituloAsc().stream()
                .filter(course -> course.getTitulo().equals("Gestão de Projetos Ágeis com Scrum"))
                .findFirst().orElseThrow().getId();
        try (HttpClient client = HttpClient.newHttpClient()) {
            String token = login(client, firstEmail);
            String path = "/api/colaborador/cursos/" + courseId + "/aulas";
            assertThat(get(client, path, token).statusCode()).isEqualTo(404);
            assertThat(post(client, "/api/colaborador/inscricoes/cursos/" + courseId, token, null).statusCode())
                    .isEqualTo(200);
            JsonNode lessons = JSON.readTree(get(client, path, token).body());
            assertThat(lessons.size()).isEqualTo(3);
            String[] titles = {"Fundamentos do Scrum e Papéis do Time", "Eventos do Scrum: da Sprint ao Daily",
                    "Backlog, Priorização e Entrega de Valor"};
            for (int index = 0; index < lessons.size(); index++) {
                assertThat(lessons.get(index).path("order").asInt()).isEqualTo(index + 1);
                assertThat(lessons.get(index).path("title").asText()).isEqualTo(titles[index]);
                assertThat(lessons.get(index).path("content").asText()).isEmpty();
                assertThat(lessons.get(index).path("videoUrl").asText())
                        .isEqualTo("/videos/scrum-aula-" + (index + 1) + ".mp4");
            }
        }
    }

    @Test
    void scrumAssessmentHasEighteenQuestionsAndGradesThePassingThreshold() throws Exception {
        usuarios.save(new Usuario("Aluno Scrum", firstEmail, passwords.encode(PASSWORD), Perfil.COLABORADOR, null));
        UUID courseId = cursos.findAllByOrderByOrdemExibicaoAscTituloAsc().stream()
                .filter(course -> course.getTitulo().equals("Gestão de Projetos Ágeis com Scrum"))
                .findFirst().orElseThrow().getId();
        List<Integer> correctCounts = jdbc.queryForList("""
                SELECT SUM(o.correta) FROM questoes q
                JOIN avaliacoes a ON a.id = q.avaliacao_id
                JOIN alternativas o ON o.questao_id = q.id
                WHERE a.curso_id = ? GROUP BY q.id
                """, Integer.class, courseId.toString());
        assertThat(correctCounts).hasSize(18).allMatch(count -> count == 1);
        try (HttpClient client = HttpClient.newHttpClient()) {
            String token = login(client, firstEmail);
            assertThat(post(client, "/api/colaborador/inscricoes/cursos/" + courseId, token, null).statusCode())
                    .isEqualTo(200);
            JsonNode assessment = JSON.readTree(get(client, "/api/colaborador/avaliacoes", token).body()).get(0);
            assertThat(assessment.path("courseId").asText()).isEqualTo(courseId.toString());
            assertThat(assessment.path("topic").asText()).isEqualTo("projects");
            assertThat(assessment.path("estimatedMinutes").asInt()).isEqualTo(18);
            assertThat(assessment.path("minimumScore").asInt()).isEqualTo(80);
            assertThat(assessment.path("maxAttempts").asInt()).isEqualTo(2);
            JsonNode questions = assessment.path("questions");
            assertThat(questions.size()).isEqualTo(18);
            assertThat(questions.get(0).path("prompt").asText()).startsWith("Uma equipe entrega uma primeira versão");
            assertThat(questions.get(6).path("prompt").asText())
                    .isEqualTo("Qual alternativa relaciona corretamente uma Sprint ao Sprint Goal?");
            assertThat(questions.get(12).path("prompt").asText())
                    .isEqualTo("Qual é a diferença básica entre Product Backlog e Sprint Backlog?");

            int[] correctOptions = {1, 3, 0, 2, 1, 3, 0, 2, 3, 1, 2, 0, 3, 1, 0, 2, 3, 1};
            List<Map<String, String>> fourteenRight = new ArrayList<>();
            List<Map<String, String>> fifteenRight = new ArrayList<>();
            for (int index = 0; index < questions.size(); index++) {
                JsonNode question = questions.get(index);
                assertThat(question.path("options").size()).isEqualTo(4);
                assertThat(question.path("optionIds").size()).isEqualTo(4);
                assertThat(question.path("correctOption").isNull()).isTrue();
                assertThat(question.path("explanation").isNull()).isTrue();
                int wrongOption = (correctOptions[index] + 1) % 4;
                fourteenRight.add(Map.of("questaoId", question.path("id").asText(),
                        "alternativaId", question.path("optionIds").get(index < 14 ? correctOptions[index] : wrongOption).asText()));
                fifteenRight.add(Map.of("questaoId", question.path("id").asText(),
                        "alternativaId", question.path("optionIds").get(index < 15 ? correctOptions[index] : wrongOption).asText()));
            }
            String path = "/api/colaborador/avaliacoes/" + assessment.path("id").asText() + "/tentativas";
            assertThat(post(client, path, token, JSON.writeValueAsString(
                    Map.of("respostas", fourteenRight.subList(0, 17)))).statusCode()).isEqualTo(400);
            HttpResponse<String> first = post(client, path, token,
                    JSON.writeValueAsString(Map.of("respostas", fourteenRight)));
            assertThat(first.statusCode()).isEqualTo(200);
            JsonNode failed = JSON.readTree(first.body());
            assertThat(failed.path("attempts").size()).isEqualTo(1);
            assertThat(failed.path("attempts").get(0).path("score").asInt()).isEqualTo(78);
            assertThat(failed.path("attempts").get(0).path("passed").asBoolean()).isFalse();
            for (JsonNode question : failed.path("questions")) {
                assertThat(question.path("correctOption").isNull()).isTrue();
                assertThat(question.path("explanation").isNull()).isTrue();
            }

            HttpResponse<String> second = post(client, path, token,
                    JSON.writeValueAsString(Map.of("respostas", fifteenRight)));
            assertThat(second.statusCode()).isEqualTo(200);
            JsonNode passed = JSON.readTree(second.body());
            assertThat(passed.path("attempts").get(1).path("score").asInt()).isEqualTo(83);
            assertThat(passed.path("attempts").get(1).path("passed").asBoolean()).isTrue();
            assertThat(passed.path("attempts").get(1).path("answers").size()).isEqualTo(18);
            for (int index = 0; index < questions.size(); index++) {
                assertThat(passed.path("questions").get(index).path("correctOption").asInt())
                        .isEqualTo(correctOptions[index]);
                assertThat(passed.path("questions").get(index).path("explanation").asText()).isNotBlank();
            }
            assertThat(post(client, path, token,
                    JSON.writeValueAsString(Map.of("respostas", fifteenRight))).statusCode()).isEqualTo(409);
        }
    }

    @Test
    void cloudCourseHasThreeVideoLessonsInOrder() throws Exception {
        usuarios.save(new Usuario("Aluno Cloud", firstEmail, passwords.encode(PASSWORD), Perfil.COLABORADOR, null));
        UUID courseId = cursos.findAllByOrderByOrdemExibicaoAscTituloAsc().stream()
                .filter(course -> course.getTitulo().equals("Cloud Computing Essencial"))
                .findFirst().orElseThrow().getId();
        try (HttpClient client = HttpClient.newHttpClient()) {
            String token = login(client, firstEmail);
            String path = "/api/colaborador/cursos/" + courseId + "/aulas";
            assertThat(get(client, path, token).statusCode()).isEqualTo(404);
            assertThat(post(client, "/api/colaborador/inscricoes/cursos/" + courseId, token, null).statusCode())
                    .isEqualTo(200);
            JsonNode lessons = JSON.readTree(get(client, path, token).body());
            assertThat(lessons.size()).isEqualTo(3);
            String[] titles = {"Fundamentos de Cloud Computing", "Serviços e Modelos de Nuvem",
                    "Cloud na Prática: Benefícios, Cuidados e Casos de Uso"};
            for (int index = 0; index < lessons.size(); index++) {
                assertThat(lessons.get(index).path("order").asInt()).isEqualTo(index + 1);
                assertThat(lessons.get(index).path("title").asText()).isEqualTo(titles[index]);
                assertThat(lessons.get(index).path("content").asText()).isEmpty();
                assertThat(lessons.get(index).path("videoUrl").asText())
                        .isEqualTo("/videos/cloud-aula-" + (index + 1) + ".mp4");
            }
        }
    }

    @Test
    void cloudAssessmentHasEighteenQuestionsAndGradesThePassingThreshold() throws Exception {
        usuarios.save(new Usuario("Aluno Cloud", firstEmail, passwords.encode(PASSWORD), Perfil.COLABORADOR, null));
        UUID courseId = cursos.findAllByOrderByOrdemExibicaoAscTituloAsc().stream()
                .filter(course -> course.getTitulo().equals("Cloud Computing Essencial"))
                .findFirst().orElseThrow().getId();
        List<Integer> correctCounts = jdbc.queryForList("""
                SELECT SUM(o.correta) FROM questoes q
                JOIN avaliacoes a ON a.id = q.avaliacao_id
                JOIN alternativas o ON o.questao_id = q.id
                WHERE a.curso_id = ? GROUP BY q.id
                """, Integer.class, courseId.toString());
        assertThat(correctCounts).hasSize(18).allMatch(count -> count == 1);
        try (HttpClient client = HttpClient.newHttpClient()) {
            String token = login(client, firstEmail);
            assertThat(post(client, "/api/colaborador/inscricoes/cursos/" + courseId, token, null).statusCode())
                    .isEqualTo(200);
            JsonNode assessment = JSON.readTree(get(client, "/api/colaborador/avaliacoes", token).body()).get(0);
            assertThat(assessment.path("courseId").asText()).isEqualTo(courseId.toString());
            assertThat(assessment.path("topic").asText()).isEqualTo("cloud");
            assertThat(assessment.path("estimatedMinutes").asInt()).isEqualTo(18);
            assertThat(assessment.path("minimumScore").asInt()).isEqualTo(80);
            assertThat(assessment.path("maxAttempts").asInt()).isEqualTo(2);
            JsonNode questions = assessment.path("questions");
            assertThat(questions.size()).isEqualTo(18);
            assertThat(questions.get(0).path("prompt").asText()).isEqualTo("O que é Cloud Computing?");
            assertThat(questions.get(6).path("prompt").asText())
                    .isEqualTo("Qual modelo de serviço oferece infraestrutura como máquinas virtuais, redes e armazenamento?");
            assertThat(questions.get(12).path("prompt").asText())
                    .isEqualTo("Qual é um exemplo comum de uso de Cloud Computing?");

            int[] correctOptions = {1, 2, 2, 0, 0, 2, 1, 2, 1, 0, 0, 1, 0, 2, 1, 1, 2, 1};
            List<Map<String, String>> fourteenRight = new ArrayList<>();
            List<Map<String, String>> fifteenRight = new ArrayList<>();
            for (int index = 0; index < questions.size(); index++) {
                JsonNode question = questions.get(index);
                assertThat(question.path("options").size()).isEqualTo(4);
                assertThat(question.path("optionIds").size()).isEqualTo(4);
                assertThat(question.path("correctOption").isNull()).isTrue();
                assertThat(question.path("explanation").isNull()).isTrue();
                int wrongOption = (correctOptions[index] + 1) % 4;
                fourteenRight.add(Map.of("questaoId", question.path("id").asText(),
                        "alternativaId", question.path("optionIds").get(index < 14 ? correctOptions[index] : wrongOption).asText()));
                fifteenRight.add(Map.of("questaoId", question.path("id").asText(),
                        "alternativaId", question.path("optionIds").get(index < 15 ? correctOptions[index] : wrongOption).asText()));
            }
            String path = "/api/colaborador/avaliacoes/" + assessment.path("id").asText() + "/tentativas";
            assertThat(post(client, path, token, JSON.writeValueAsString(
                    Map.of("respostas", fourteenRight.subList(0, 17)))).statusCode()).isEqualTo(400);
            HttpResponse<String> first = post(client, path, token,
                    JSON.writeValueAsString(Map.of("respostas", fourteenRight)));
            assertThat(first.statusCode()).isEqualTo(200);
            JsonNode failed = JSON.readTree(first.body());
            assertThat(failed.path("attempts").size()).isEqualTo(1);
            assertThat(failed.path("attempts").get(0).path("score").asInt()).isEqualTo(78);
            assertThat(failed.path("attempts").get(0).path("passed").asBoolean()).isFalse();
            for (JsonNode question : failed.path("questions")) {
                assertThat(question.path("correctOption").isNull()).isTrue();
                assertThat(question.path("explanation").isNull()).isTrue();
            }

            HttpResponse<String> second = post(client, path, token,
                    JSON.writeValueAsString(Map.of("respostas", fifteenRight)));
            assertThat(second.statusCode()).isEqualTo(200);
            JsonNode passed = JSON.readTree(second.body());
            assertThat(passed.path("attempts").get(1).path("score").asInt()).isEqualTo(83);
            assertThat(passed.path("attempts").get(1).path("passed").asBoolean()).isTrue();
            assertThat(passed.path("attempts").get(1).path("answers").size()).isEqualTo(18);
            for (int index = 0; index < questions.size(); index++) {
                assertThat(passed.path("questions").get(index).path("correctOption").asInt())
                        .isEqualTo(correctOptions[index]);
                assertThat(passed.path("questions").get(index).path("explanation").asText()).isNotBlank();
            }
            assertThat(post(client, path, token,
                    JSON.writeValueAsString(Map.of("respostas", fifteenRight))).statusCode()).isEqualTo(409);
        }
    }

    @Test
    void communicationCourseHasThreeVideoLessonsInOrder() throws Exception {
        usuarios.save(new Usuario("Aluno Comunicação", firstEmail, passwords.encode(PASSWORD), Perfil.COLABORADOR, null));
        UUID courseId = cursos.findAllByOrderByOrdemExibicaoAscTituloAsc().stream()
                .filter(course -> course.getTitulo().equals("Comunicação Assertiva no Ambiente de Trabalho"))
                .findFirst().orElseThrow().getId();
        try (HttpClient client = HttpClient.newHttpClient()) {
            String token = login(client, firstEmail);
            String path = "/api/colaborador/cursos/" + courseId + "/aulas";
            assertThat(get(client, path, token).statusCode()).isEqualTo(404);
            assertThat(post(client, "/api/colaborador/inscricoes/cursos/" + courseId, token, null).statusCode())
                    .isEqualTo(200);
            JsonNode lessons = JSON.readTree(get(client, path, token).body());
            assertThat(lessons.size()).isEqualTo(3);
            String[] titles = {"Fundamentos da Comunicação Assertiva", "Feedback e Conversas Difíceis",
                    "Comunicação no Trabalho em Equipe"};
            for (int index = 0; index < lessons.size(); index++) {
                assertThat(lessons.get(index).path("order").asInt()).isEqualTo(index + 1);
                assertThat(lessons.get(index).path("title").asText()).isEqualTo(titles[index]);
                assertThat(lessons.get(index).path("content").asText()).isEmpty();
                assertThat(lessons.get(index).path("videoUrl").asText())
                        .isEqualTo("/videos/comunicacao-aula-" + (index + 1) + ".mp4");
            }
        }
    }

    @Test
    void communicationAssessmentHasEighteenQuestionsAndGradesThePassingThreshold() throws Exception {
        usuarios.save(new Usuario("Aluno Comunicação", firstEmail, passwords.encode(PASSWORD), Perfil.COLABORADOR, null));
        UUID courseId = cursos.findAllByOrderByOrdemExibicaoAscTituloAsc().stream()
                .filter(course -> course.getTitulo().equals("Comunicação Assertiva no Ambiente de Trabalho"))
                .findFirst().orElseThrow().getId();
        List<Integer> correctCounts = jdbc.queryForList("""
                SELECT SUM(o.correta) FROM questoes q
                JOIN avaliacoes a ON a.id = q.avaliacao_id
                JOIN alternativas o ON o.questao_id = q.id
                WHERE a.curso_id = ? GROUP BY q.id
                """, Integer.class, courseId.toString());
        assertThat(correctCounts).hasSize(18).allMatch(count -> count == 1);
        try (HttpClient client = HttpClient.newHttpClient()) {
            String token = login(client, firstEmail);
            assertThat(post(client, "/api/colaborador/inscricoes/cursos/" + courseId, token, null).statusCode())
                    .isEqualTo(200);
            JsonNode assessment = JSON.readTree(get(client, "/api/colaborador/avaliacoes", token).body()).get(0);
            assertThat(assessment.path("courseId").asText()).isEqualTo(courseId.toString());
            assertThat(assessment.path("topic").asText()).isEqualTo("communication");
            assertThat(assessment.path("estimatedMinutes").asInt()).isEqualTo(18);
            assertThat(assessment.path("minimumScore").asInt()).isEqualTo(80);
            assertThat(assessment.path("maxAttempts").asInt()).isEqualTo(2);
            JsonNode questions = assessment.path("questions");
            assertThat(questions.size()).isEqualTo(18);
            assertThat(questions.get(0).path("prompt").asText()).isEqualTo("O que caracteriza uma comunicação assertiva?");
            assertThat(questions.get(6).path("prompt").asText())
                    .isEqualTo("Qual é o principal objetivo de um feedback eficaz?");
            assertThat(questions.get(12).path("prompt").asText())
                    .isEqualTo("Qual prática ajuda a evitar falhas no alinhamento de tarefas?");

            int[] correctOptions = {1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 2, 2, 1, 2};
            List<Map<String, String>> fourteenRight = new ArrayList<>();
            List<Map<String, String>> fifteenRight = new ArrayList<>();
            for (int index = 0; index < questions.size(); index++) {
                JsonNode question = questions.get(index);
                assertThat(question.path("options").size()).isEqualTo(4);
                assertThat(question.path("optionIds").size()).isEqualTo(4);
                assertThat(question.path("correctOption").isNull()).isTrue();
                assertThat(question.path("explanation").isNull()).isTrue();
                int wrongOption = (correctOptions[index] + 1) % 4;
                fourteenRight.add(Map.of("questaoId", question.path("id").asText(),
                        "alternativaId", question.path("optionIds").get(index < 14 ? correctOptions[index] : wrongOption).asText()));
                fifteenRight.add(Map.of("questaoId", question.path("id").asText(),
                        "alternativaId", question.path("optionIds").get(index < 15 ? correctOptions[index] : wrongOption).asText()));
            }
            String path = "/api/colaborador/avaliacoes/" + assessment.path("id").asText() + "/tentativas";
            assertThat(post(client, path, token, JSON.writeValueAsString(
                    Map.of("respostas", fourteenRight.subList(0, 17)))).statusCode()).isEqualTo(400);
            HttpResponse<String> first = post(client, path, token,
                    JSON.writeValueAsString(Map.of("respostas", fourteenRight)));
            assertThat(first.statusCode()).isEqualTo(200);
            JsonNode failed = JSON.readTree(first.body());
            assertThat(failed.path("attempts").size()).isEqualTo(1);
            assertThat(failed.path("attempts").get(0).path("score").asInt()).isEqualTo(78);
            assertThat(failed.path("attempts").get(0).path("passed").asBoolean()).isFalse();
            for (JsonNode question : failed.path("questions")) {
                assertThat(question.path("correctOption").isNull()).isTrue();
                assertThat(question.path("explanation").isNull()).isTrue();
            }

            HttpResponse<String> second = post(client, path, token,
                    JSON.writeValueAsString(Map.of("respostas", fifteenRight)));
            assertThat(second.statusCode()).isEqualTo(200);
            JsonNode passed = JSON.readTree(second.body());
            assertThat(passed.path("attempts").get(1).path("score").asInt()).isEqualTo(83);
            assertThat(passed.path("attempts").get(1).path("passed").asBoolean()).isTrue();
            assertThat(passed.path("attempts").get(1).path("answers").size()).isEqualTo(18);
            for (int index = 0; index < questions.size(); index++) {
                assertThat(passed.path("questions").get(index).path("correctOption").asInt())
                        .isEqualTo(correctOptions[index]);
                assertThat(passed.path("questions").get(index).path("explanation").asText()).isNotBlank();
            }
            assertThat(post(client, path, token,
                    JSON.writeValueAsString(Map.of("respostas", fifteenRight))).statusCode()).isEqualTo(409);
        }
    }

    @Test
    void cryptographyCourseHasThreeVideoLessonsInOrder() throws Exception {
        usuarios.save(new Usuario("Aluno Criptografia", firstEmail, passwords.encode(PASSWORD), Perfil.COLABORADOR, null));
        UUID courseId = cursos.findAllByOrderByOrdemExibicaoAscTituloAsc().stream()
                .filter(course -> course.getTitulo().equals("Introdução à Criptografia"))
                .findFirst().orElseThrow().getId();
        try (HttpClient client = HttpClient.newHttpClient()) {
            String token = login(client, firstEmail);
            String path = "/api/colaborador/cursos/" + courseId + "/aulas";
            assertThat(get(client, path, token).statusCode()).isEqualTo(404);
            assertThat(post(client, "/api/colaborador/inscricoes/cursos/" + courseId, token, null).statusCode())
                    .isEqualTo(200);
            JsonNode lessons = JSON.readTree(get(client, path, token).body());
            assertThat(lessons.size()).isEqualTo(3);
            String[] titles = {"Fundamentos da Criptografia", "Criptografia Simétrica, Assimétrica e Hash",
                    "HTTPS, Senhas e Assinaturas Digitais"};
            for (int index = 0; index < lessons.size(); index++) {
                assertThat(lessons.get(index).path("order").asInt()).isEqualTo(index + 1);
                assertThat(lessons.get(index).path("title").asText()).isEqualTo(titles[index]);
                assertThat(lessons.get(index).path("content").asText()).isEmpty();
                assertThat(lessons.get(index).path("videoUrl").asText())
                        .isEqualTo("/videos/criptografia-aula-" + (index + 1) + ".mp4");
            }
        }
    }

    @Test
    void cryptographyAssessmentHasEighteenQuestionsAndGradesThePassingThreshold() throws Exception {
        usuarios.save(new Usuario("Aluno Criptografia", firstEmail, passwords.encode(PASSWORD), Perfil.COLABORADOR, null));
        UUID courseId = cursos.findAllByOrderByOrdemExibicaoAscTituloAsc().stream()
                .filter(course -> course.getTitulo().equals("Introdução à Criptografia"))
                .findFirst().orElseThrow().getId();
        List<Integer> correctCounts = jdbc.queryForList("""
                SELECT SUM(o.correta) FROM questoes q
                JOIN avaliacoes a ON a.id = q.avaliacao_id
                JOIN alternativas o ON o.questao_id = q.id
                WHERE a.curso_id = ? GROUP BY q.id
                """, Integer.class, courseId.toString());
        assertThat(correctCounts).hasSize(18).allMatch(count -> count == 1);
        try (HttpClient client = HttpClient.newHttpClient()) {
            String token = login(client, firstEmail);
            assertThat(post(client, "/api/colaborador/inscricoes/cursos/" + courseId, token, null).statusCode())
                    .isEqualTo(200);
            JsonNode assessment = JSON.readTree(get(client, "/api/colaborador/avaliacoes", token).body()).get(0);
            assertThat(assessment.path("courseId").asText()).isEqualTo(courseId.toString());
            assertThat(assessment.path("topic").asText()).isEqualTo("security");
            assertThat(assessment.path("estimatedMinutes").asInt()).isEqualTo(18);
            assertThat(assessment.path("minimumScore").asInt()).isEqualTo(80);
            assertThat(assessment.path("maxAttempts").asInt()).isEqualTo(2);
            JsonNode questions = assessment.path("questions");
            assertThat(questions.size()).isEqualTo(18);
            assertThat(questions.get(0).path("prompt").asText()).isEqualTo("Qual é uma das principais finalidades da criptografia?");
            assertThat(questions.get(6).path("prompt").asText())
                    .isEqualTo("Na criptografia simétrica, como as chaves são utilizadas?");
            assertThat(questions.get(12).path("prompt").asText())
                    .isEqualTo("Qual é a principal função do HTTPS apresentada na aula?");

            int[] correctOptions = {1, 0, 1, 1, 0, 2, 0, 1, 2, 1, 1, 0, 0, 1, 1, 2, 1, 0};
            List<Map<String, String>> fourteenRight = new ArrayList<>();
            List<Map<String, String>> fifteenRight = new ArrayList<>();
            for (int index = 0; index < questions.size(); index++) {
                JsonNode question = questions.get(index);
                assertThat(question.path("options").size()).isEqualTo(4);
                assertThat(question.path("optionIds").size()).isEqualTo(4);
                assertThat(question.path("correctOption").isNull()).isTrue();
                assertThat(question.path("explanation").isNull()).isTrue();
                int wrongOption = (correctOptions[index] + 1) % 4;
                fourteenRight.add(Map.of("questaoId", question.path("id").asText(),
                        "alternativaId", question.path("optionIds").get(index < 14 ? correctOptions[index] : wrongOption).asText()));
                fifteenRight.add(Map.of("questaoId", question.path("id").asText(),
                        "alternativaId", question.path("optionIds").get(index < 15 ? correctOptions[index] : wrongOption).asText()));
            }
            String path = "/api/colaborador/avaliacoes/" + assessment.path("id").asText() + "/tentativas";
            assertThat(post(client, path, token, JSON.writeValueAsString(
                    Map.of("respostas", fourteenRight.subList(0, 17)))).statusCode()).isEqualTo(400);
            HttpResponse<String> first = post(client, path, token,
                    JSON.writeValueAsString(Map.of("respostas", fourteenRight)));
            assertThat(first.statusCode()).isEqualTo(200);
            JsonNode failed = JSON.readTree(first.body());
            assertThat(failed.path("attempts").size()).isEqualTo(1);
            assertThat(failed.path("attempts").get(0).path("score").asInt()).isEqualTo(78);
            assertThat(failed.path("attempts").get(0).path("passed").asBoolean()).isFalse();
            for (JsonNode question : failed.path("questions")) {
                assertThat(question.path("correctOption").isNull()).isTrue();
                assertThat(question.path("explanation").isNull()).isTrue();
            }

            HttpResponse<String> second = post(client, path, token,
                    JSON.writeValueAsString(Map.of("respostas", fifteenRight)));
            assertThat(second.statusCode()).isEqualTo(200);
            JsonNode passed = JSON.readTree(second.body());
            assertThat(passed.path("attempts").get(1).path("score").asInt()).isEqualTo(83);
            assertThat(passed.path("attempts").get(1).path("passed").asBoolean()).isTrue();
            assertThat(passed.path("attempts").get(1).path("answers").size()).isEqualTo(18);
            for (int index = 0; index < questions.size(); index++) {
                assertThat(passed.path("questions").get(index).path("correctOption").asInt())
                        .isEqualTo(correctOptions[index]);
                assertThat(passed.path("questions").get(index).path("explanation").asText()).isNotBlank();
            }
            assertThat(post(client, path, token,
                    JSON.writeValueAsString(Map.of("respostas", fifteenRight))).statusCode()).isEqualTo(409);
        }
    }

    @Test
    void timeManagementCourseHasThreeVideoLessonsInOrder() throws Exception {
        usuarios.save(new Usuario("Aluno Gestão do Tempo", firstEmail, passwords.encode(PASSWORD), Perfil.COLABORADOR, null));
        UUID courseId = cursos.findAllByOrderByOrdemExibicaoAscTituloAsc().stream()
                .filter(course -> course.getTitulo().equals("Fundamentos da Gestão do Tempo"))
                .findFirst().orElseThrow().getId();
        try (HttpClient client = HttpClient.newHttpClient()) {
            String token = login(client, firstEmail);
            String path = "/api/colaborador/cursos/" + courseId + "/aulas";
            assertThat(get(client, path, token).statusCode()).isEqualTo(404);
            assertThat(post(client, "/api/colaborador/inscricoes/cursos/" + courseId, token, null).statusCode())
                    .isEqualTo(200);
            JsonNode lessons = JSON.readTree(get(client, path, token).body());
            assertThat(lessons.size()).isEqualTo(3);
            String[] titles = {"Fundamentos da Gestão do Tempo", "Como Definir Prioridades",
                    "Produtividade e Organização no Dia a Dia"};
            for (int index = 0; index < lessons.size(); index++) {
                assertThat(lessons.get(index).path("order").asInt()).isEqualTo(index + 1);
                assertThat(lessons.get(index).path("title").asText()).isEqualTo(titles[index]);
                assertThat(lessons.get(index).path("content").asText()).isEmpty();
                assertThat(lessons.get(index).path("videoUrl").asText())
                        .isEqualTo("/videos/gestao-tempo-aula-" + (index + 1) + ".mp4");
            }
        }
    }

    @Test
    void timeManagementAssessmentHasEighteenQuestionsAndGradesThePassingThreshold() throws Exception {
        usuarios.save(new Usuario("Aluno Gestão do Tempo", firstEmail, passwords.encode(PASSWORD), Perfil.COLABORADOR, null));
        UUID courseId = cursos.findAllByOrderByOrdemExibicaoAscTituloAsc().stream()
                .filter(course -> course.getTitulo().equals("Fundamentos da Gestão do Tempo"))
                .findFirst().orElseThrow().getId();
        List<Integer> correctCounts = jdbc.queryForList("""
                SELECT SUM(o.correta) FROM questoes q
                JOIN avaliacoes a ON a.id = q.avaliacao_id
                JOIN alternativas o ON o.questao_id = q.id
                WHERE a.curso_id = ? GROUP BY q.id
                """, Integer.class, courseId.toString());
        assertThat(correctCounts).hasSize(18).allMatch(count -> count == 1);
        try (HttpClient client = HttpClient.newHttpClient()) {
            String token = login(client, firstEmail);
            assertThat(post(client, "/api/colaborador/inscricoes/cursos/" + courseId, token, null).statusCode())
                    .isEqualTo(200);
            JsonNode assessment = JSON.readTree(get(client, "/api/colaborador/avaliacoes", token).body()).get(0);
            assertThat(assessment.path("courseId").asText()).isEqualTo(courseId.toString());
            assertThat(assessment.path("topic").asText()).isEqualTo("workspace");
            assertThat(assessment.path("estimatedMinutes").asInt()).isEqualTo(18);
            assertThat(assessment.path("minimumScore").asInt()).isEqualTo(80);
            assertThat(assessment.path("maxAttempts").asInt()).isEqualTo(2);
            JsonNode questions = assessment.path("questions");
            assertThat(questions.size()).isEqualTo(18);
            assertThat(questions.get(0).path("prompt").asText()).isEqualTo("O que significa gerir melhor o tempo?");
            assertThat(questions.get(6).path("prompt").asText())
                    .isEqualTo("Qual é a principal diferença entre uma tarefa urgente e uma tarefa importante?");
            assertThat(questions.get(12).path("prompt").asText())
                    .isEqualTo("O que significa produtividade dentro do contexto da aula?");

            int[] correctOptions = {1, 1, 1, 1, 2, 0, 1, 1, 0, 1, 1, 0, 2, 1, 0, 1, 1, 1};
            List<Map<String, String>> fourteenRight = new ArrayList<>();
            List<Map<String, String>> fifteenRight = new ArrayList<>();
            for (int index = 0; index < questions.size(); index++) {
                JsonNode question = questions.get(index);
                assertThat(question.path("options").size()).isEqualTo(4);
                assertThat(question.path("optionIds").size()).isEqualTo(4);
                assertThat(question.path("correctOption").isNull()).isTrue();
                assertThat(question.path("explanation").isNull()).isTrue();
                int wrongOption = (correctOptions[index] + 1) % 4;
                fourteenRight.add(Map.of("questaoId", question.path("id").asText(),
                        "alternativaId", question.path("optionIds").get(index < 14 ? correctOptions[index] : wrongOption).asText()));
                fifteenRight.add(Map.of("questaoId", question.path("id").asText(),
                        "alternativaId", question.path("optionIds").get(index < 15 ? correctOptions[index] : wrongOption).asText()));
            }
            String path = "/api/colaborador/avaliacoes/" + assessment.path("id").asText() + "/tentativas";
            assertThat(post(client, path, token, JSON.writeValueAsString(
                    Map.of("respostas", fourteenRight.subList(0, 17)))).statusCode()).isEqualTo(400);
            HttpResponse<String> first = post(client, path, token,
                    JSON.writeValueAsString(Map.of("respostas", fourteenRight)));
            assertThat(first.statusCode()).isEqualTo(200);
            JsonNode failed = JSON.readTree(first.body());
            assertThat(failed.path("attempts").size()).isEqualTo(1);
            assertThat(failed.path("attempts").get(0).path("score").asInt()).isEqualTo(78);
            assertThat(failed.path("attempts").get(0).path("passed").asBoolean()).isFalse();
            for (JsonNode question : failed.path("questions")) {
                assertThat(question.path("correctOption").isNull()).isTrue();
                assertThat(question.path("explanation").isNull()).isTrue();
            }

            HttpResponse<String> second = post(client, path, token,
                    JSON.writeValueAsString(Map.of("respostas", fifteenRight)));
            assertThat(second.statusCode()).isEqualTo(200);
            JsonNode passed = JSON.readTree(second.body());
            assertThat(passed.path("attempts").get(1).path("score").asInt()).isEqualTo(83);
            assertThat(passed.path("attempts").get(1).path("passed").asBoolean()).isTrue();
            assertThat(passed.path("attempts").get(1).path("answers").size()).isEqualTo(18);
            for (int index = 0; index < questions.size(); index++) {
                assertThat(passed.path("questions").get(index).path("correctOption").asInt())
                        .isEqualTo(correctOptions[index]);
                assertThat(passed.path("questions").get(index).path("explanation").asText()).isNotBlank();
            }
            assertThat(post(client, path, token,
                    JSON.writeValueAsString(Map.of("respostas", fifteenRight))).statusCode()).isEqualTo(409);
        }
    }

    @Test
    void sqlCourseHasThreeVideoLessonsInOrder() throws Exception {
        usuarios.save(new Usuario("Aluno SQL", firstEmail, passwords.encode(PASSWORD), Perfil.COLABORADOR, null));
        UUID courseId = cursos.findAllByOrderByOrdemExibicaoAscTituloAsc().stream()
                .filter(course -> course.getTitulo().equals("SQL para Iniciantes"))
                .findFirst().orElseThrow().getId();
        try (HttpClient client = HttpClient.newHttpClient()) {
            String token = login(client, firstEmail);
            String path = "/api/colaborador/cursos/" + courseId + "/aulas";
            assertThat(get(client, path, token).statusCode()).isEqualTo(404);
            assertThat(post(client, "/api/colaborador/inscricoes/cursos/" + courseId, token, null).statusCode())
                    .isEqualTo(200);
            JsonNode lessons = JSON.readTree(get(client, path, token).body());
            assertThat(lessons.size()).isEqualTo(3);
            String[] titles = {"Introdução a Bancos de Dados e SQL", "Consultando Dados com SELECT",
                    "Manipulando Dados e Trabalhando com Relacionamentos"};
            for (int index = 0; index < lessons.size(); index++) {
                assertThat(lessons.get(index).path("order").asInt()).isEqualTo(index + 1);
                assertThat(lessons.get(index).path("title").asText()).isEqualTo(titles[index]);
                assertThat(lessons.get(index).path("content").asText()).isEmpty();
                assertThat(lessons.get(index).path("videoUrl").asText())
                        .isEqualTo("/videos/sql-aula-" + (index + 1) + ".mp4");
            }
        }
    }

    @Test
    void sqlAssessmentHasEighteenQuestionsAndGradesThePassingThreshold() throws Exception {
        usuarios.save(new Usuario("Aluno SQL", firstEmail, passwords.encode(PASSWORD), Perfil.COLABORADOR, null));
        UUID courseId = cursos.findAllByOrderByOrdemExibicaoAscTituloAsc().stream()
                .filter(course -> course.getTitulo().equals("SQL para Iniciantes"))
                .findFirst().orElseThrow().getId();
        List<Integer> correctCounts = jdbc.queryForList("""
                SELECT SUM(o.correta) FROM questoes q
                JOIN avaliacoes a ON a.id = q.avaliacao_id
                JOIN alternativas o ON o.questao_id = q.id
                WHERE a.curso_id = ? GROUP BY q.id
                """, Integer.class, courseId.toString());
        assertThat(correctCounts).hasSize(18).allMatch(count -> count == 1);
        try (HttpClient client = HttpClient.newHttpClient()) {
            String token = login(client, firstEmail);
            assertThat(post(client, "/api/colaborador/inscricoes/cursos/" + courseId, token, null).statusCode())
                    .isEqualTo(200);
            JsonNode assessment = JSON.readTree(get(client, "/api/colaborador/avaliacoes", token).body()).get(0);
            assertThat(assessment.path("courseId").asText()).isEqualTo(courseId.toString());
            assertThat(assessment.path("estimatedMinutes").asInt()).isEqualTo(18);
            assertThat(assessment.path("minimumScore").asInt()).isEqualTo(80);
            assertThat(assessment.path("maxAttempts").asInt()).isEqualTo(2);
            JsonNode questions = assessment.path("questions");
            assertThat(questions.size()).isEqualTo(18);
            assertThat(questions.get(0).path("prompt").asText()).isEqualTo("Qual é a principal finalidade de um banco de dados?");
            assertThat(questions.get(6).path("prompt").asText())
                    .isEqualTo("Qual comando SQL é utilizado para consultar informações?");
            assertThat(questions.get(12).path("prompt").asText())
                    .isEqualTo("Qual comando SQL é utilizado para adicionar um novo registro?");

            assertThat(questions.get(5).path("prompt").asText())
                    .contains("SELECT * FROM clientes;");
            assertThat(questions.get(10).path("prompt").asText())
                    .contains("WHERE nivel = 'Iniciante';");

            int[] correctOptions = {1, 0, 1, 0, 1, 2, 2, 0, 1, 2, 1, 1, 1, 0, 0, 2, 1, 0};
            List<Map<String, String>> fourteenRight = new ArrayList<>();
            List<Map<String, String>> fifteenRight = new ArrayList<>();
            for (int index = 0; index < questions.size(); index++) {
                JsonNode question = questions.get(index);
                assertThat(question.path("options").size()).isEqualTo(4);
                assertThat(question.path("optionIds").size()).isEqualTo(4);
                assertThat(question.path("correctOption").isNull()).isTrue();
                assertThat(question.path("explanation").isNull()).isTrue();
                int wrongOption = (correctOptions[index] + 1) % 4;
                fourteenRight.add(Map.of("questaoId", question.path("id").asText(),
                        "alternativaId", question.path("optionIds").get(index < 14 ? correctOptions[index] : wrongOption).asText()));
                fifteenRight.add(Map.of("questaoId", question.path("id").asText(),
                        "alternativaId", question.path("optionIds").get(index < 15 ? correctOptions[index] : wrongOption).asText()));
            }
            String path = "/api/colaborador/avaliacoes/" + assessment.path("id").asText() + "/tentativas";
            assertThat(post(client, path, token, JSON.writeValueAsString(
                    Map.of("respostas", fourteenRight.subList(0, 17)))).statusCode()).isEqualTo(400);
            HttpResponse<String> first = post(client, path, token,
                    JSON.writeValueAsString(Map.of("respostas", fourteenRight)));
            assertThat(first.statusCode()).isEqualTo(200);
            JsonNode failed = JSON.readTree(first.body());
            assertThat(failed.path("attempts").size()).isEqualTo(1);
            assertThat(failed.path("attempts").get(0).path("score").asInt()).isEqualTo(78);
            assertThat(failed.path("attempts").get(0).path("passed").asBoolean()).isFalse();
            for (JsonNode question : failed.path("questions")) {
                assertThat(question.path("correctOption").isNull()).isTrue();
                assertThat(question.path("explanation").isNull()).isTrue();
            }

            assertThat(JSON.readTree(get(client, "/api/colaborador/certificados", token).body()).size()).isZero();
            HttpResponse<String> second = post(client, path, token,
                    JSON.writeValueAsString(Map.of("respostas", fifteenRight)));
            assertThat(second.statusCode()).isEqualTo(200);
            JsonNode passed = JSON.readTree(second.body());
            assertThat(passed.path("attempts").get(1).path("score").asInt()).isEqualTo(83);
            assertThat(passed.path("attempts").get(1).path("passed").asBoolean()).isTrue();
            assertThat(passed.path("attempts").get(1).path("answers").size()).isEqualTo(18);
            for (int index = 0; index < questions.size(); index++) {
                assertThat(passed.path("questions").get(index).path("correctOption").asInt())
                        .isEqualTo(correctOptions[index]);
                assertThat(passed.path("questions").get(index).path("explanation").asText()).isNotBlank();
            }
            JsonNode certificates = JSON.readTree(get(client, "/api/colaborador/certificados", token).body());
            assertThat(certificates.size()).isEqualTo(1);
            assertThat(certificates.get(0).path("courseId").asText()).isEqualTo(courseId.toString());
            assertThat(post(client, path, token,
                    JSON.writeValueAsString(Map.of("respostas", fifteenRight))).statusCode()).isEqualTo(409);
        }
    }

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
            assertThat(lesson.size()).isEqualTo(3);
            assertThat(lesson.get(0).path("title").asText()).isEqualTo("Introdução à LGPD e Proteção de Dados");
            assertThat(lesson.get(0).path("content").asText()).isEmpty();
            assertThat(lesson.get(0).path("videoUrl").asText()).isEqualTo("/videos/lgpd-aula-1.mp4");
            assertThat(lesson.get(1).path("title").asText()).isEqualTo("Boas práticas no ambiente corporativo");
            assertThat(lesson.get(1).path("content").asText()).isEmpty();
            assertThat(lesson.get(1).path("videoUrl").asText()).isEqualTo("/videos/lgpd-aula-2.mp4");
            assertThat(lesson.get(2).path("order").asInt()).isEqualTo(3);
            assertThat(lesson.get(2).path("title").asText()).isEqualTo("LGPD na Prática: Prevenção e Resposta a Incidentes");
            assertThat(lesson.get(2).path("videoUrl").asText()).isEqualTo("/videos/lgpd-aula-3.mp4");
            assertThat(get(client, "/api/colaborador/cursos/" + courseId + "/aulas", otherToken).statusCode())
                    .isEqualTo(404);

            JsonNode assessment = JSON.readTree(get(client, "/api/colaborador/avaliacoes", firstToken).body()).get(0);
            String path = "/api/colaborador/avaliacoes/" + assessment.path("id").asText() + "/tentativas";
            assertThat(assessment.path("questions").size()).isEqualTo(6);
            assertThat(assessment.path("questions").get(5).path("prompt").asText())
                    .startsWith("Um colaborador percebe que enviou por engano uma planilha");
            assertThat(assessment.path("questions").get(5).path("options").get(2).asText())
                    .isEqualTo("Interromper o compartilhamento, se possível, preservar as informações sobre o ocorrido e comunicar rapidamente a área responsável da empresa.");
            for (JsonNode question : assessment.path("questions")) {
                assertThat(question.path("options").size()).isGreaterThanOrEqualTo(4);
                assertThat(question.path("optionIds").size()).isEqualTo(question.path("options").size());
            }
            assertThat(assessment.path("questions").get(0).path("correctOption").isNull()).isTrue();
            assertThat(post(client, path, firstToken, "{\"respostas\":[]}").statusCode()).isEqualTo(400);
            assertThat(post(client, path, firstToken, "{\"respostas\":[null]}").statusCode()).isEqualTo(400);
            assertThat(JSON.readTree(get(client, "/api/colaborador/avaliacoes", firstToken).body())
                    .get(0).path("attempts").size()).isZero();

            List<Map<String, String>> wrong = new ArrayList<>();
            List<Map<String, String>> right = new ArrayList<>();
            for (JsonNode question : assessment.path("questions")) {
                String questionId = question.path("id").asText();
                int correctIndex = question.path("options").toString().contains("Nome associado ao e-mail") ? 0 :
                        question.path("options").toString().contains("Usar apenas os dados necessários") ? 1 :
                        question.path("options").toString().contains("Por canais autorizados") ? 2 :
                        question.path("options").toString().contains("Bloquear a tela") ? 0 :
                        question.path("options").toString().contains("Seguir o procedimento interno") ? 1 : 2;
                right.add(Map.of("questaoId", questionId,
                        "alternativaId", question.path("optionIds").get(correctIndex).asText()));
                wrong.add(Map.of("questaoId", questionId,
                        "alternativaId", question.path("optionIds").get((correctIndex + 1) % question.path("optionIds").size()).asText()));
            }
            String duplicate = JSON.writeValueAsString(Map.of("respostas", List.of(wrong.get(0), wrong.get(0),
                    wrong.get(1), wrong.get(2), wrong.get(3), wrong.get(4))));
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
            assertThat(passed.path("questions").get(5).path("correctOption").asInt()).isEqualTo(2);
            assertThat(passed.path("questions").get(5).path("explanation").asText())
                    .startsWith("Em um possível incidente envolvendo dados pessoais");
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
