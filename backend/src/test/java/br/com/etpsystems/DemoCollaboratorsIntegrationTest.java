package br.com.etpsystems;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.UUID;

import br.com.etpsystems.company.Empresa;
import br.com.etpsystems.company.EmpresaRepository;
import br.com.etpsystems.config.DemoCollaboratorsInitializer;
import br.com.etpsystems.user.Perfil;
import br.com.etpsystems.user.Usuario;
import br.com.etpsystems.user.UsuarioRepository;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.DefaultApplicationArguments;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

@SpringBootTest
@ActiveProfiles("dev")
@EnabledIfEnvironmentVariable(named = "ETP_DB_TEST", matches = "true")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class DemoCollaboratorsIntegrationTest {

    private static final String SUFFIX = UUID.randomUUID().toString();
    private static final String EMAIL_DOMAIN = SUFFIX + ".example.test";
    private static final String COMPANY_NAME = "Demo collaborators integration " + SUFFIX;
    private static final List<String> EMAILS = List.of(
            "ana.souza", "bruno.lima", "carla.mendes", "diego.alves", "fernanda.oliveira",
            "gabriel.santos", "helena.ribeiro", "joao.silva").stream()
            .map(local -> local + "@" + EMAIL_DOMAIN).toList();

    @DynamicPropertySource
    static void demoProperties(DynamicPropertyRegistry properties) {
        properties.add("etp.demo.enabled", () -> true);
        properties.add("etp.demo.company-data-enabled", () -> true);
        properties.add("etp.demo.password", () -> "integration-test-only");
        properties.add("etp.demo.colaborador-email", () -> "collaborator-" + SUFFIX + "@example.test");
        properties.add("etp.demo.empresa-email", () -> "rh-" + SUFFIX + "@example.test");
        properties.add("etp.demo.company-name", () -> COMPANY_NAME);
        properties.add("etp.demo.company-data-email-domain", () -> EMAIL_DOMAIN);
    }

    @Autowired private EmpresaRepository empresas;
    @Autowired private UsuarioRepository usuarios;
    @Autowired private DemoCollaboratorsInitializer initializer;
    @Autowired private JdbcTemplate jdbc;

    @Test
    void seedsEightDisabledCollaboratorsAndDoesNotDuplicateOnRestart() throws Exception {
        Empresa empresa = empresas.findFirstByNome(COMPANY_NAME).orElseThrow();
        Usuario ana = usuarios.findByEmailIgnoreCase(EMAILS.getFirst()).orElseThrow();
        assertThat(ana.getNome()).isEqualTo("Ana Souza");
        assertThat(ana.getPerfil()).isEqualTo(Perfil.COLABORADOR);
        assertThat(ana.getDepartamento()).isEqualTo("Tecnologia");
        assertThat(ana.isLoginHabilitado()).isFalse();
        assertThat(ana.getSenhaHash()).startsWith("$2");
        assertThat(ana.getEmpresa().getId()).isEqualTo(empresa.getId());

        assertCounts(empresa, 8, 16, 12, 2, 0);
        initializer.run(new DefaultApplicationArguments(new String[0]));
        assertCounts(empresa, 8, 16, 12, 2, 0);
        for (String email : EMAILS) {
            Usuario colaborador = usuarios.findByEmailIgnoreCase(email).orElseThrow();
            assertThat(colaborador.isLoginHabilitado()).isFalse();
            assertThat(colaborador.getEmpresa().getId()).isEqualTo(empresa.getId());
        }
    }

    private void assertCounts(Empresa empresa, int colaboradores, int inscricoes, int progressos,
            int tentativas, int certificados) {
        String companyId = empresa.getId().toString();
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM usuarios WHERE empresa_id = ? AND perfil = 'COLABORADOR' AND login_habilitado = FALSE", Integer.class, companyId))
                .isEqualTo(colaboradores);
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM inscricoes i JOIN usuarios u ON u.id = i.usuario_id WHERE u.empresa_id = ? AND u.login_habilitado = FALSE", Integer.class, companyId))
                .isEqualTo(inscricoes);
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM progresso_cursos p JOIN usuarios u ON u.id = p.usuario_id WHERE u.empresa_id = ? AND u.login_habilitado = FALSE", Integer.class, companyId))
                .isEqualTo(progressos);
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM tentativas_avaliacao t JOIN usuarios u ON u.id = t.usuario_id WHERE u.empresa_id = ? AND u.login_habilitado = FALSE", Integer.class, companyId))
                .isEqualTo(tentativas);
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM certificados c JOIN usuarios u ON u.id = c.usuario_id WHERE u.empresa_id = ? AND u.login_habilitado = FALSE", Integer.class, companyId))
                .isEqualTo(certificados);
    }

    @AfterAll
    void removeTestCompany() {
        for (String email : EMAILS) {
            usuarios.findByEmailIgnoreCase(email).filter(user ->
                    COMPANY_NAME.equals(user.getEmpresa().getNome())).ifPresent(usuarios::delete);
        }
        usuarios.findByEmailIgnoreCase("collaborator-" + SUFFIX + "@example.test").ifPresent(usuarios::delete);
        usuarios.findByEmailIgnoreCase("rh-" + SUFFIX + "@example.test").ifPresent(usuarios::delete);
        empresas.findFirstByNome(COMPANY_NAME).ifPresent(empresas::delete);
    }
}
