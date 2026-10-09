package br.com.etpsystems.dashboard;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import br.com.etpsystems.assessment.AvaliacaoRepository;
import br.com.etpsystems.assessment.Tentativa;
import br.com.etpsystems.assessment.TentativaRepository;
import br.com.etpsystems.certificate.CertificadoRepository;
import br.com.etpsystems.course.Curso;
import br.com.etpsystems.course.CursoRepository;
import br.com.etpsystems.enrollment.Inscricao;
import br.com.etpsystems.enrollment.InscricaoRepository;
import br.com.etpsystems.progress.ProgressoCurso;
import br.com.etpsystems.progress.ProgressoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DashboardService {
    private final InscricaoRepository inscricoes;
    private final ProgressoRepository progressos;
    private final AvaliacaoRepository avaliacoes;
    private final TentativaRepository tentativas;
    private final CertificadoRepository certificados;
    private final CursoRepository cursos;

    public DashboardService(InscricaoRepository inscricoes, ProgressoRepository progressos,
            AvaliacaoRepository avaliacoes, TentativaRepository tentativas,
            CertificadoRepository certificados, CursoRepository cursos) {
        this.inscricoes = inscricoes;
        this.progressos = progressos;
        this.avaliacoes = avaliacoes;
        this.tentativas = tentativas;
        this.certificados = certificados;
        this.cursos = cursos;
    }

    @Transactional(readOnly = true)
    public DashboardResponse consultar(UUID usuarioId) {
        List<Inscricao> enrolled = inscricoes.findByUsuario_IdAndCursoIsNotNullOrderByInscritoEmDesc(usuarioId);
        Map<UUID, ProgressoCurso> progressByCourse = progressos.findByUsuario_Id(usuarioId).stream()
                .collect(Collectors.toMap(item -> item.getCurso().getId(), Function.identity()));
        List<UUID> courseIds = enrolled.stream().map(item -> item.getCurso().getId()).toList();
        Set<UUID> enrolledIds = Set.copyOf(courseIds);
        List<Tentativa> attempts = tentativas.findByUsuario_IdOrderByConcluidoEmDesc(usuarioId);
        int availableAssessments = courseIds.isEmpty() ? 0 : avaliacoes.findByCurso_IdIn(courseIds).size();
        int passedAssessments = (int) attempts.stream().filter(Tentativa::isAprovado)
                .map(item -> item.getAvaliacao().getId()).distinct().count();
        var issued = certificados.findByUsuario_IdOrderByEmitidoEmDesc(usuarioId);
        int completed = (int) enrolled.stream().filter(item -> {
            ProgressoCurso progress = progressByCourse.get(item.getCurso().getId());
            return progress != null && progress.getConcluidoEm() != null;
        }).count();
        int ongoing = enrolled.size() - completed;
        double certifiedHours = issued.stream().mapToInt(item -> item.getCurso().getDuracaoMinutos()).sum() / 60.0;

        DashboardResponse.ContinueCourse next = enrolled.stream()
                .filter(item -> {
                    ProgressoCurso progress = progressByCourse.get(item.getCurso().getId());
                    return progress == null || progress.getConcluidoEm() == null;
                })
                .max(Comparator.comparing(item -> {
                    ProgressoCurso progress = progressByCourse.get(item.getCurso().getId());
                    return progress != null && progress.getAtualizadoEm() != null
                            ? progress.getAtualizadoEm() : item.getInscritoEm();
                }))
                .map(item -> {
                    Curso course = item.getCurso();
                    ProgressoCurso progress = progressByCourse.get(course.getId());
                    Instant activity = progress != null && progress.getAtualizadoEm() != null
                            ? progress.getAtualizadoEm() : item.getInscritoEm();
                    return new DashboardResponse.ContinueCourse(course.getId(), course.getTitulo(),
                            course.getDescricao(), course.getIcone(),
                            progress == null ? 0 : progress.getPercentualProgresso().doubleValue(), activity);
                }).orElse(null);

        var recommended = cursos.findAllByOrderByOrdemExibicaoAscTituloAsc().stream()
                .filter(course -> !enrolledIds.contains(course.getId())).limit(3)
                .map(course -> new DashboardResponse.RecommendedCourse(course.getId(), course.getTitulo(),
                        course.getCategoria() == null ? "Geral" : course.getCategoria().getNome(),
                        course.getNivel(), course.getDuracaoMinutos() / 60.0, course.getIcone())).toList();
        var recentAttempts = attempts.stream().limit(3)
                .map(item -> new DashboardResponse.RecentAssessment(item.getAvaliacao().getCurso().getId(),
                        item.getAvaliacao().getCurso().getTitulo(), item.getNota(), item.isAprovado(),
                        item.getConcluidoEm())).toList();
        var recentCertificates = issued.stream().limit(3)
                .map(item -> new DashboardResponse.RecentCertificate(item.getId(),
                        item.getCurso().getTitulo(), item.getEmitidoEm())).toList();
        return new DashboardResponse(enrolled.size(), ongoing, completed, availableAssessments,
                passedAssessments, issued.size(), certifiedHours, next,
                recommended, recentAttempts, recentCertificates);
    }
}
