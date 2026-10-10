package br.com.etpsystems;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import br.com.etpsystems.assessment.AvaliacaoRepository;
import br.com.etpsystems.assessment.AvaliacaoService;
import br.com.etpsystems.assessment.EnviarTentativaRequest;
import br.com.etpsystems.company.Empresa;
import br.com.etpsystems.company.EmpresaRepository;
import br.com.etpsystems.course.CursoRepository;
import br.com.etpsystems.enrollment.InscricaoService;
import br.com.etpsystems.progress.AtualizarProgressoRequest;
import br.com.etpsystems.progress.ProgressoService;
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
class CompanyOverviewApiIntegrationTest {
    private static final String PASSWORD = "test-only-password";
    private static final JsonMapper JSON = JsonMapper.builder().build();
    private final String suffix = UUID.randomUUID().toString();
    private final String rhEmail = "company-rh-" + suffix + "@example.test";
    private final String otherRhEmail = "company-other-rh-" + suffix + "@example.test";
    private final String employeeEmail = "company-employee-" + suffix + "@example.test";
    private final String otherEmployeeEmail = "company-other-employee-" + suffix + "@example.test";
    private Empresa company;
    private Empresa otherCompany;

    @LocalServerPort private int port;
    @Autowired private EmpresaRepository empresas;
    @Autowired private UsuarioRepository usuarios;
    @Autowired private CursoRepository cursos;
    @Autowired private AvaliacaoRepository avaliacoes;
    @Autowired private InscricaoService inscricoes;
    @Autowired private ProgressoService progressos;
    @Autowired private AvaliacaoService avaliacaoService;
    @Autowired private PasswordEncoder passwords;
    @Autowired private JdbcTemplate jdbc;

    @Test
    void scopesTeamAndResultsToAuthenticatedCompany() throws Exception {
        company = empresas.save(new Empresa("Empresa A " + suffix, null));
        otherCompany = empresas.save(new Empresa("Empresa B " + suffix, null));
        usuarios.save(new Usuario("RH A", rhEmail, passwords.encode(PASSWORD), Perfil.EMPRESA, company));
        usuarios.save(new Usuario("RH B", otherRhEmail, passwords.encode(PASSWORD), Perfil.EMPRESA, otherCompany));
        Usuario employee = usuarios.save(new Usuario("Pessoa A", employeeEmail,
                passwords.encode(UUID.randomUUID().toString()), Perfil.COLABORADOR, company, "Tecnologia", false));
        Usuario otherEmployee = usuarios.save(new Usuario("Pessoa B", otherEmployeeEmail,
                passwords.encode(PASSWORD), Perfil.COLABORADOR, otherCompany, "Financeiro", true));

        var security = cursos.findAllByOrderByOrdemExibicaoAscTituloAsc().stream()
                .filter(course -> course.getTitulo().equals("Fundamentos de Segurança da Informação"))
                .findFirst().orElseThrow();
        var lgpd = cursos.findAllByOrderByOrdemExibicaoAscTituloAsc().stream()
                .filter(course -> course.getTitulo().equals("LGPD na Prática"))
                .findFirst().orElseThrow();
        inscricoes.inscrever(employee.getId(), security.getId());
        inscricoes.inscrever(otherEmployee.getId(), lgpd.getId());
        progressos.atualizar(otherEmployee.getId(), lgpd.getId(),
                new AtualizarProgressoRequest(BigDecimal.valueOf(40)));
        var assessment = avaliacoes.findByCurso_IdIn(List.of(security.getId())).getFirst();
        var answers = jdbc.query("""
                SELECT q.id AS question_id, o.id AS option_id FROM questoes q
                JOIN alternativas o ON o.questao_id = q.id
                WHERE q.avaliacao_id = ? AND o.correta = TRUE ORDER BY q.ordem
                """, (rs, row) -> new EnviarTentativaRequest.RespostaRequest(
                UUID.fromString(rs.getString("question_id")), UUID.fromString(rs.getString("option_id"))),
                assessment.getId().toString());
        avaliacaoService.enviar(employee.getId(), assessment.getId(), new EnviarTentativaRequest(answers));

        try (HttpClient client = HttpClient.newHttpClient()) {
            String rhToken = login(client, rhEmail);
            String otherRhToken = login(client, otherRhEmail);
            String employeeToken = login(client, otherEmployeeEmail);
            assertThat(get(client, "/api/empresa/painel", null).statusCode()).isEqualTo(401);
            assertThat(get(client, "/api/empresa/painel", employeeToken).statusCode()).isEqualTo(403);

            HttpResponse<String> response = get(client,
                    "/api/empresa/painel?empresaId=" + otherCompany.getId(), rhToken);
            assertThat(response.statusCode()).isEqualTo(200);
            assertThat(response.headers().firstValue("Cache-Control").orElse("")).contains("no-store");
            JsonNode result = JSON.readTree(response.body());
            assertThat(result.path("companyId").asText()).isEqualTo(company.getId().toString());
            assertThat(result.path("employees").size()).isEqualTo(1);
            JsonNode person = result.path("employees").get(0);
            assertThat(person.path("id").asText()).isEqualTo(employee.getId().toString());
            assertThat(person.path("department").asText()).isEqualTo("Tecnologia");
            JsonNode course = person.path("courses").get(0);
            assertThat(course.path("progress").asInt()).isEqualTo(100);
            assertThat(course.path("score").asInt()).isEqualTo(100);
            assertThat(course.path("certificateCode").asText()).startsWith("ETP-");
            assertThat(course.path("certificateIssuedAt").asText()).isNotEmpty();
            assertThat(response.body()).doesNotContain(otherEmployeeEmail, "senha", "senhaHash");

            JsonNode other = JSON.readTree(get(client, "/api/empresa/painel", otherRhToken).body());
            assertThat(other.path("companyId").asText()).isEqualTo(otherCompany.getId().toString());
            assertThat(other.path("employees").size()).isEqualTo(1);
            assertThat(other.path("employees").get(0).path("email").asText()).isEqualTo(otherEmployeeEmail);
            assertThat(other.path("employees").get(0).path("courses").get(0).path("progress").asInt())
                    .isEqualTo(40);
            assertThat(other.toString()).doesNotContain(employeeEmail);
        }
    }

    @AfterEach
    void cleanUp() {
        for (String email : List.of(employeeEmail, otherEmployeeEmail, rhEmail, otherRhEmail)) {
            usuarios.findByEmailIgnoreCase(email).ifPresent(usuarios::delete);
        }
        if (company != null) empresas.delete(company);
        if (otherCompany != null) empresas.delete(otherCompany);
    }

    private String login(HttpClient client, String email) throws Exception {
        HttpResponse<String> response = client.send(HttpRequest.newBuilder(uri("/api/auth/login"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(JSON.writeValueAsString(
                        Map.of("email", email, "senha", PASSWORD)))).build(),
                HttpResponse.BodyHandlers.ofString());
        assertThat(response.statusCode()).isEqualTo(200);
        return JSON.readTree(response.body()).path("accessToken").asText();
    }

    private HttpResponse<String> get(HttpClient client, String path, String token) throws Exception {
        HttpRequest.Builder request = HttpRequest.newBuilder(uri(path)).GET();
        if (token != null) request.header("Authorization", "Bearer " + token);
        return client.send(request.build(), HttpResponse.BodyHandlers.ofString());
    }

    private URI uri(String path) {
        return URI.create("http://localhost:" + port + path);
    }
}
