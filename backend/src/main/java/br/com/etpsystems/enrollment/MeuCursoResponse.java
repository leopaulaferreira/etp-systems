package br.com.etpsystems.enrollment;

import java.time.Instant;
import java.util.UUID;

import br.com.etpsystems.course.Curso;

public record MeuCursoResponse(
        UUID id,
        String title,
        String description,
        String icon,
        double durationHours,
        Instant enrolledAt
) {
    static MeuCursoResponse from(Inscricao inscricao) {
        Curso curso = inscricao.getCurso();
        return new MeuCursoResponse(curso.getId(), curso.getTitulo(), curso.getDescricao(),
                curso.getIcone(), curso.getDuracaoMinutos() / 60.0, inscricao.getInscritoEm());
    }
}
