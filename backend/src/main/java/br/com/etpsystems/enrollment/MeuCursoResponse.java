package br.com.etpsystems.enrollment;

import java.time.Instant;
import java.util.UUID;

import br.com.etpsystems.course.Curso;
import br.com.etpsystems.progress.ProgressoCurso;

public record MeuCursoResponse(
        UUID id,
        String title,
        String description,
        String icon,
        double durationHours,
        Instant enrolledAt,
        double progress,
        Instant updatedAt,
        Instant completedAt
) {
    public static MeuCursoResponse from(Inscricao inscricao, ProgressoCurso progresso) {
        Curso curso = inscricao.getCurso();
        return new MeuCursoResponse(curso.getId(), curso.getTitulo(), curso.getDescricao(),
                curso.getIcone(), curso.getDuracaoMinutos() / 60.0, inscricao.getInscritoEm(),
                progresso == null ? 0 : progresso.getPercentualProgresso().doubleValue(),
                progresso == null ? null : progresso.getAtualizadoEm(),
                progresso == null ? null : progresso.getConcluidoEm());
    }
}
