package br.com.etpsystems.course;

import java.util.UUID;

public record CursoResponse(
        UUID id,
        String title,
        String description,
        String category,
        String level,
        double durationHours,
        String icon,
        boolean featured
) {
    static CursoResponse from(Curso curso) {
        return new CursoResponse(
                curso.getId(),
                curso.getTitulo(),
                curso.getDescricao() == null ? "" : curso.getDescricao(),
                curso.getCategoria() == null ? "Sem categoria" : curso.getCategoria().getNome(),
                curso.getNivel(),
                curso.getDuracaoMinutos() / 60.0,
                curso.getIcone(),
                curso.isDestaque());
    }
}
