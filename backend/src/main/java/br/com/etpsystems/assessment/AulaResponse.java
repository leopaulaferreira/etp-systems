package br.com.etpsystems.assessment;

import java.util.UUID;

public record AulaResponse(UUID id, String title, String content, String videoUrl, int order) {
    static AulaResponse from(Aula aula) {
        return new AulaResponse(aula.getId(), aula.getTitulo(), aula.getConteudo(), aula.getVideoUrl(), aula.getOrdem());
    }
}
