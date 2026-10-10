package br.com.etpsystems.company;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import br.com.etpsystems.assessment.Tentativa;
import br.com.etpsystems.assessment.TentativaRepository;
import br.com.etpsystems.certificate.Certificado;
import br.com.etpsystems.certificate.CertificadoRepository;
import br.com.etpsystems.course.Curso;
import br.com.etpsystems.enrollment.Inscricao;
import br.com.etpsystems.enrollment.InscricaoRepository;
import br.com.etpsystems.progress.ProgressoCurso;
import br.com.etpsystems.progress.ProgressoRepository;
import br.com.etpsystems.user.Perfil;
import br.com.etpsystems.user.Usuario;
import br.com.etpsystems.user.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CompanyOverviewService {
    private final UsuarioRepository usuarios;
    private final InscricaoRepository inscricoes;
    private final ProgressoRepository progressos;
    private final TentativaRepository tentativas;
    private final CertificadoRepository certificados;

    public CompanyOverviewService(UsuarioRepository usuarios, InscricaoRepository inscricoes,
            ProgressoRepository progressos, TentativaRepository tentativas, CertificadoRepository certificados) {
        this.usuarios = usuarios;
        this.inscricoes = inscricoes;
        this.progressos = progressos;
        this.tentativas = tentativas;
        this.certificados = certificados;
    }

    @Transactional(readOnly = true)
    public CompanyOverviewResponse consultar(UUID rhId) {
        Usuario rh = usuarios.findById(rhId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Conta RH indisponível"));
        if (rh.getPerfil() != Perfil.EMPRESA || !rh.isLoginHabilitado() || rh.getEmpresa() == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Conta RH sem empresa ativa");
        }
        Empresa empresa = rh.getEmpresa();
        List<Usuario> colaboradores = usuarios.findByEmpresa_IdAndPerfilOrderByNomeAsc(
                empresa.getId(), Perfil.COLABORADOR);
        if (colaboradores.isEmpty()) {
            return new CompanyOverviewResponse(empresa.getId(), empresa.getNome(), List.of());
        }

        List<UUID> ids = colaboradores.stream().map(Usuario::getId).toList();
        Map<UUID, List<Inscricao>> inscricoesPorUsuario = new HashMap<>();
        for (Inscricao inscricao : inscricoes.findByUsuario_IdInAndCursoIsNotNull(ids)) {
            inscricoesPorUsuario.computeIfAbsent(inscricao.getUsuario().getId(), unused -> new ArrayList<>())
                    .add(inscricao);
        }
        Map<CourseKey, ProgressoCurso> progressoPorCurso = new HashMap<>();
        for (ProgressoCurso progresso : progressos.findByUsuario_IdIn(ids)) {
            progressoPorCurso.put(new CourseKey(progresso.getUsuario().getId(), progresso.getCurso().getId()), progresso);
        }
        Map<CourseKey, Tentativa> ultimaTentativaPorCurso = new HashMap<>();
        for (Tentativa tentativa : tentativas.findByUsuario_IdInOrderByConcluidoEmDesc(ids)) {
            ultimaTentativaPorCurso.putIfAbsent(new CourseKey(tentativa.getUsuario().getId(),
                    tentativa.getAvaliacao().getCurso().getId()), tentativa);
        }
        Map<CourseKey, Certificado> certificadoPorCurso = new HashMap<>();
        for (Certificado certificado : certificados.findByUsuario_IdIn(ids)) {
            certificadoPorCurso.put(new CourseKey(certificado.getUsuario().getId(),
                    certificado.getCurso().getId()), certificado);
        }

        List<CompanyOverviewResponse.Employee> employees = colaboradores.stream().map(usuario -> {
            List<CompanyOverviewResponse.Course> courses = inscricoesPorUsuario
                    .getOrDefault(usuario.getId(), List.of()).stream()
                    .sorted(Comparator.comparing(item -> item.getCurso().getTitulo()))
                    .map(inscricao -> courseResponse(usuario.getId(), inscricao, progressoPorCurso,
                            ultimaTentativaPorCurso, certificadoPorCurso))
                    .toList();
            return new CompanyOverviewResponse.Employee(usuario.getId(), empresa.getId(), usuario.getNome(),
                    usuario.getEmail(), usuario.getDepartamento(), courses);
        }).toList();
        return new CompanyOverviewResponse(empresa.getId(), empresa.getNome(), employees);
    }

    private CompanyOverviewResponse.Course courseResponse(UUID usuarioId, Inscricao inscricao,
            Map<CourseKey, ProgressoCurso> progressos, Map<CourseKey, Tentativa> tentativas,
            Map<CourseKey, Certificado> certificados) {
        Curso curso = inscricao.getCurso();
        CourseKey key = new CourseKey(usuarioId, curso.getId());
        ProgressoCurso progresso = progressos.get(key);
        Tentativa tentativa = tentativas.get(key);
        Certificado certificado = certificados.get(key);
        return new CompanyOverviewResponse.Course(curso.getId(), curso.getTitulo(),
                curso.getCategoria() == null ? "Geral" : curso.getCategoria().getNome(),
                progresso == null ? 0 : progresso.getPercentualProgresso().doubleValue(),
                progresso == null ? null : progresso.getAtualizadoEm(),
                progresso == null ? null : progresso.getConcluidoEm(),
                tentativa == null ? null : tentativa.getNota(),
                certificado == null ? null : certificado.getCodigo(),
                certificado == null ? null : certificado.getEmitidoEm());
    }

    private record CourseKey(UUID usuarioId, UUID cursoId) {}
}
