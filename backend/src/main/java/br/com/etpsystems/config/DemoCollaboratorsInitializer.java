package br.com.etpsystems.config;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import br.com.etpsystems.assessment.Alternativa;
import br.com.etpsystems.assessment.Avaliacao;
import br.com.etpsystems.assessment.AvaliacaoRepository;
import br.com.etpsystems.assessment.AvaliacaoService;
import br.com.etpsystems.assessment.EnviarTentativaRequest;
import br.com.etpsystems.assessment.Questao;
import br.com.etpsystems.company.Empresa;
import br.com.etpsystems.company.EmpresaRepository;
import br.com.etpsystems.course.Curso;
import br.com.etpsystems.course.CursoRepository;
import br.com.etpsystems.enrollment.InscricaoService;
import br.com.etpsystems.progress.AtualizarProgressoRequest;
import br.com.etpsystems.progress.ProgressoService;
import br.com.etpsystems.user.Perfil;
import br.com.etpsystems.user.Usuario;
import br.com.etpsystems.user.UsuarioRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Profile("dev")
@ConditionalOnProperty(name = {"etp.demo.enabled", "etp.demo.company-data-enabled"}, havingValue = "true")
@Order(20)
public class DemoCollaboratorsInitializer implements ApplicationRunner {

    private static final String SEGURANCA = "Fundamentos de Cibersegurança";
    private static final String LGPD = "LGPD na Prática";
    private static final String PYTHON = "Python para Análise de Dados";
    private static final String COMUNICACAO = "Comunicação Assertiva";

    private static final List<ColaboradorDemo> COLABORADORES = List.of(
            new ColaboradorDemo("Ana Souza", "ana.souza", "Tecnologia", List.of(
                    new CursoDemo(SEGURANCA, 100, null), new CursoDemo(LGPD, 65, null),
                    new CursoDemo(PYTHON, 40, null))),
            new ColaboradorDemo("Bruno Lima", "bruno.lima", "Operações", List.of(
                    new CursoDemo(SEGURANCA, 60, null), new CursoDemo(COMUNICACAO, 0, null))),
            new ColaboradorDemo("Carla Mendes", "carla.mendes", "Recursos Humanos", List.of(
                    new CursoDemo(LGPD, 100, 100), new CursoDemo(COMUNICACAO, 100, null))),
            new ColaboradorDemo("Diego Alves", "diego.alves", "Tecnologia", List.of(
                    new CursoDemo(PYTHON, 0, null), new CursoDemo(SEGURANCA, 0, null))),
            new ColaboradorDemo("Fernanda Oliveira", "fernanda.oliveira", "Financeiro", List.of(
                    new CursoDemo(LGPD, 100, 80), new CursoDemo(COMUNICACAO, 35, null))),
            new ColaboradorDemo("Gabriel Santos", "gabriel.santos", "Operações", List.of(
                    new CursoDemo(SEGURANCA, 100, null))),
            new ColaboradorDemo("Helena Ribeiro", "helena.ribeiro", "Financeiro", List.of(
                    new CursoDemo(PYTHON, 25, null), new CursoDemo(LGPD, 0, null))),
            new ColaboradorDemo("João Silva", "joao.silva", "Tecnologia", List.of(
                    new CursoDemo(SEGURANCA, 75, null), new CursoDemo(PYTHON, 15, null))));

    private final EmpresaRepository empresas;
    private final UsuarioRepository usuarios;
    private final CursoRepository cursos;
    private final AvaliacaoRepository avaliacoes;
    private final InscricaoService inscricoes;
    private final ProgressoService progressos;
    private final AvaliacaoService avaliacaoService;
    private final PasswordEncoder encoder;
    private final String companyName;
    private final String emailDomain;

    public DemoCollaboratorsInitializer(EmpresaRepository empresas, UsuarioRepository usuarios,
            CursoRepository cursos, AvaliacaoRepository avaliacoes, InscricaoService inscricoes,
            ProgressoService progressos, AvaliacaoService avaliacaoService, PasswordEncoder encoder,
            @Value("${etp.demo.company-name}") String companyName,
            @Value("${etp.demo.company-data-email-domain:etp.example}") String emailDomain) {
        this.empresas = empresas;
        this.usuarios = usuarios;
        this.cursos = cursos;
        this.avaliacoes = avaliacoes;
        this.inscricoes = inscricoes;
        this.progressos = progressos;
        this.avaliacaoService = avaliacaoService;
        this.encoder = encoder;
        this.companyName = companyName;
        this.emailDomain = emailDomain;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        Empresa empresa = empresas.findFirstByNome(companyName)
                .orElseThrow(() -> new IllegalStateException("Empresa local de demonstração não encontrada"));
        Map<String, Curso> cursosPorTitulo = cursos.findAllByOrderByOrdemExibicaoAscTituloAsc().stream()
                .collect(Collectors.toMap(Curso::getTitulo, Function.identity()));
        for (ColaboradorDemo colaborador : COLABORADORES) {
            for (CursoDemo curso : colaborador.cursos()) {
                if (!cursosPorTitulo.containsKey(curso.titulo())) {
                    throw new IllegalStateException("Curso local de demonstração não encontrado: " + curso.titulo());
                }
            }
        }
        Map<UUID, Avaliacao> avaliacoesPorCurso = avaliacoes.findByCurso_IdIn(
                cursosPorTitulo.values().stream().map(Curso::getId).toList()).stream()
                .collect(Collectors.toMap(avaliacao -> avaliacao.getCurso().getId(), Function.identity()));

        for (ColaboradorDemo colaborador : COLABORADORES) {
            String email = colaborador.emailLocal() + "@" + emailDomain;
            Usuario existente = usuarios.findByEmailIgnoreCase(email).orElse(null);
            if (existente != null) {
                if (existente.getPerfil() != Perfil.COLABORADOR || existente.isLoginHabilitado()
                        || existente.getEmpresa() == null || !existente.getEmpresa().getId().equals(empresa.getId())) {
                    throw new IllegalStateException("E-mail de demonstração já pertence a outra conta: " + email);
                }
                continue; // Não sobrescreve progresso ou avaliações após a primeira carga.
            }
            Usuario usuario = usuarios.save(new Usuario(colaborador.nome(), email,
                    encoder.encode(UUID.randomUUID().toString()), Perfil.COLABORADOR, empresa,
                    colaborador.departamento(), false));
            for (CursoDemo cursoDemo : colaborador.cursos()) {
                Curso curso = cursosPorTitulo.get(cursoDemo.titulo());
                inscricoes.inscrever(usuario.getId(), curso.getId());
                if (cursoDemo.percentual() > 0) {
                    progressos.atualizar(usuario.getId(), curso.getId(),
                            new AtualizarProgressoRequest(BigDecimal.valueOf(cursoDemo.percentual())));
                }
                if (cursoDemo.nota() != null) {
                    Avaliacao avaliacao = avaliacoesPorCurso.get(curso.getId());
                    if (avaliacao == null) {
                        throw new IllegalStateException("Avaliação não encontrada para: " + curso.getTitulo());
                    }
                    avaliacaoService.enviar(usuario.getId(), avaliacao.getId(), respostasParaNota(avaliacao, cursoDemo.nota()));
                }
            }
        }
    }

    private EnviarTentativaRequest respostasParaNota(Avaliacao avaliacao, int nota) {
        List<Questao> questoes = avaliacao.getQuestoes();
        if (questoes.isEmpty() || nota < 0 || nota > 100 || nota * questoes.size() % 100 != 0) {
            throw new IllegalStateException("Nota de demonstração incompatível com a avaliação");
        }
        int acertos = nota * questoes.size() / 100;
        List<EnviarTentativaRequest.RespostaRequest> respostas = new ArrayList<>();
        for (int indice = 0; indice < questoes.size(); indice++) {
            var questao = questoes.get(indice);
            boolean correta = indice < acertos;
            Alternativa alternativa = questao.getAlternativas().stream()
                    .filter(opcao -> opcao.isCorreta() == correta).findFirst()
                    .orElseThrow(() -> new IllegalStateException("Alternativa de demonstração não encontrada"));
            respostas.add(new EnviarTentativaRequest.RespostaRequest(questao.getId(), alternativa.getId()));
        }
        return new EnviarTentativaRequest(respostas);
    }

    private record ColaboradorDemo(String nome, String emailLocal, String departamento, List<CursoDemo> cursos) {}
    private record CursoDemo(String titulo, int percentual, Integer nota) {}
}
