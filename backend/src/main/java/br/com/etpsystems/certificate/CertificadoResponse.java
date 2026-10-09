package br.com.etpsystems.certificate;

import java.time.Instant;
import java.util.UUID;

public record CertificadoResponse(UUID id, UUID courseId, String holderName, String title, String description,
        double durationHours, String code, Instant issuedAt) {
    public static CertificadoResponse from(Certificado certificado) {
        var curso = certificado.getCurso();
        return new CertificadoResponse(certificado.getId(), curso.getId(), certificado.getUsuario().getNome(), curso.getTitulo(),
                curso.getDescricao(), curso.getDuracaoMinutos() / 60.0,
                certificado.getCodigo(), certificado.getEmitidoEm());
    }
}
