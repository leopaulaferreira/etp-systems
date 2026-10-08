package br.com.etpsystems;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.UUID;

import br.com.etpsystems.company.Empresa;
import br.com.etpsystems.course.Categoria;
import br.com.etpsystems.course.Curso;
import br.com.etpsystems.track.Trilha;
import br.com.etpsystems.user.Usuario;
import br.com.etpsystems.user.Perfil;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
@EnabledIfEnvironmentVariable(named = "ETP_DB_TEST", matches = "true")
class DomainMappingIntegrationTest {

    @Autowired
    private EntityManager entityManager;

    @Test
    @Transactional
    void persistsRelationshipsUsingTheExistingMySqlSchema() {
        Empresa empresa = new Empresa("Empresa de teste", null);
        Categoria categoria = new Categoria("Tecnologia", null);
        entityManager.persist(empresa);
        entityManager.persist(categoria);

        Usuario usuario = new Usuario("Pessoa de teste", UUID.randomUUID() + "@example.test",
                "hash-de-teste", Perfil.COLABORADOR, empresa);
        Curso curso = new Curso("Curso de teste", "Conteúdo de teste", categoria);
        entityManager.persist(usuario);
        entityManager.persist(curso);

        Trilha trilha = new Trilha("Trilha de teste", null, empresa);
        trilha.adicionarCurso(curso);
        entityManager.persist(trilha);

        UUID usuarioId = usuario.getId();
        UUID cursoId = curso.getId();
        UUID trilhaId = trilha.getId();
        entityManager.flush();
        entityManager.clear();

        Usuario carregado = entityManager.find(Usuario.class, usuarioId);
        Curso cursoCarregado = entityManager.find(Curso.class, cursoId);
        Trilha trilhaCarregada = entityManager.find(Trilha.class, trilhaId);

        assertThat(carregado.getEmpresa().getId()).isEqualTo(empresa.getId());
        assertThat(carregado.getPerfil()).isEqualTo(Perfil.COLABORADOR);
        assertThat(cursoCarregado.getCategoria().getId()).isEqualTo(categoria.getId());
        assertThat(trilhaCarregada.getEmpresa().getId()).isEqualTo(empresa.getId());
        assertThat(trilhaCarregada.getCursos()).extracting(Curso::getId).containsExactly(cursoId);
        assertThat(carregado.getCriadoEm()).isNotNull();
        assertThat(trilhaCarregada.getCriadoEm()).isNotNull();
    }
}
